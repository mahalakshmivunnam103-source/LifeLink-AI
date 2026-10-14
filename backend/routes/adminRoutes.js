const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { ROLES, VERIFICATION_STATUS } = require('../config/constants');
const dataStore = require('../services/dataStore');

router.use(authenticateToken);
router.use(authorizeRoles(ROLES.ADMIN));

/**
 * @route   GET /api/admin/overview
 * @desc    Get high-level platform analytics, activity logs, and counts
 */
router.get('/overview', async (req, res) => {
  try {
    const users = await dataStore.getAllUsers();
    const requests = await dataStore.getAllBloodRequests();
    const donors = await dataStore.getAllDonors();
    const hospitals = await dataStore.getAllHospitals();
    const bloodBanks = await dataStore.getAllBloodBanks();
    const auditLogs = dataStore.getAuditLogs();

    const pendingHospitals = hospitals.filter(
      (h) => h.userId && h.userId.verificationStatus === VERIFICATION_STATUS.PENDING
    ).length;

    const pendingBloodBanks = bloodBanks.filter(
      (b) => b.userId && b.userId.verificationStatus === VERIFICATION_STATUS.PENDING
    ).length;

    const suspiciousRequests = requests.filter((r) => r.isSuspicious).length;
    const fulfilledRequests = requests.filter(
      (r) => r.status === 'Fulfilled'
    ).length;

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalDonors: donors.length,
        totalHospitals: hospitals.length,
        totalBloodBanks: bloodBanks.length,
        pendingVerifications: pendingHospitals + pendingBloodBanks,
        totalRequests: requests.length,
        fulfilledRequests,
        suspiciousRequests,
      },
      auditLogs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate overview: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/admin/pending-verifications
 * @desc    Get all hospital and blood bank facilities awaiting admin review
 */
router.get('/pending-verifications', async (req, res) => {
  try {
    const hospitals = await dataStore.getAllHospitals();
    const bloodBanks = await dataStore.getAllBloodBanks();

    const pendingHospitals = hospitals.filter(
      (h) => h.userId && h.userId.verificationStatus === VERIFICATION_STATUS.PENDING
    );

    const pendingBloodBanks = bloodBanks.filter(
      (b) => b.userId && b.userId.verificationStatus === VERIFICATION_STATUS.PENDING
    );

    return res.json({
      success: true,
      data: {
        hospitals: pendingHospitals,
        bloodBanks: pendingBloodBanks,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending verifications: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/admin/verify-facility
 * @desc    Approve or reject a medical facility (Hospital or Blood Bank)
 */
router.post('/verify-facility', async (req, res) => {
  try {
    const { userId, decision, reason } = req.body;

    if (!userId || !['verified', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'userId and decision (verified/rejected) are required.',
      });
    }

    const updatedUser = await dataStore.updateUserVerification(
      userId,
      decision,
      reason || ''
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Send notification to the facility user
    await dataStore.createNotification({
      recipientUserId: userId,
      senderUserId: req.user._id,
      title: `Registration Status: ${decision.toUpperCase()}`,
      message:
        decision === 'verified'
          ? 'Congratulations! Your medical facility registration has been approved. You now have full platform access.'
          : `Your registration was not approved. Reason: ${reason || 'Incomplete credential verification.'}`,
      type: 'VERIFICATION_UPDATE',
      responseStatus: decision === 'verified' ? 'Accepted' : 'Declined',
    });

    dataStore.addAuditLog(
      'FACILITY_VERIFICATION',
      `Admin ${req.user.name} set status of ${updatedUser.name} (${updatedUser.email}) to ${decision.toUpperCase()}.`
    );

    return res.json({
      success: true,
      message: `Facility registration marked as ${decision}.`,
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Verification action failed: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/admin/suspicious-requests
 * @desc    Review blood requests flagged by screening filters or excessive volumes
 */
router.get('/suspicious-requests', async (req, res) => {
  try {
    const requests = await dataStore.getAllBloodRequests();
    const flagged = requests.filter((r) => r.isSuspicious);

    return res.json({
      success: true,
      data: flagged,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suspicious requests: ' + err.message,
    });
  }
});

/**
 * @route   PATCH /api/admin/resolve-suspicion/:id
 * @desc    Clear or confirm a suspicious request flag
 */
router.patch('/resolve-suspicion/:id', async (req, res) => {
  try {
    const { action } = req.body; // 'clear' or 'cancel'

    const request = await dataStore.findBloodRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
      });
    }

    let updateData = {};
    if (action === 'clear') {
      updateData = { isSuspicious: false, suspicionReason: 'Cleared by administrator.' };
    } else {
      updateData = {
        isSuspicious: true,
        status: 'Cancelled',
        suspicionReason: 'Terminated by administrator due to policy compliance.',
      };
    }

    const updated = await dataStore.updateBloodRequest(req.params.id, updateData);

    dataStore.addAuditLog(
      'SUSPICION_RESOLVED',
      `Admin ${req.user.name} resolved request ${req.params.id} with action: ${action}.`
    );

    return res.json({
      success: true,
      message: `Request suspicion resolved (${action}).`,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Resolution error: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    List all platform users with filter
 */
router.get('/users', async (req, res) => {
  try {
    const users = await dataStore.getAllUsers();
    return res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users: ' + err.message,
    });
  }
});

module.exports = router;
