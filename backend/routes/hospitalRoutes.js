const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles, requireVerified } = require('../middleware/roleCheck');
const { ROLES, REQUEST_STATUS, URGENCY_LEVELS } = require('../config/constants');
const dataStore = require('../services/dataStore');
const { matchDonorsAndBloodBanks } = require('../services/donorMatchingService');
const notificationService = require('../services/notificationService');
const { evaluateTriageAssessment } = require('../services/aiTriageService');

// All hospital routes require authenticateToken, HOSPITAL role, and VERIFIED status
router.use(authenticateToken);
router.use(authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN));
router.use(requireVerified);

/**
 * @route   GET /api/hospital/matching-donors
 * @desc    Find matching donors within configurable radius with medical compatibility and fallback
 */
router.get('/matching-donors', async (req, res) => {
  try {
    const {
      bloodGroup = 'O-',
      unitsRequired = 1,
      radius = 30,
      latitude,
      longitude,
      onlyEligible = 'false',
      onlyAvailable = 'true',
    } = req.query;

    // Use query coordinates or fallback to hospital's registered profile location
    let lat = Number(latitude);
    let lon = Number(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      const hospProfile = await dataStore.findHospitalByUserId(req.user._id);
      if (hospProfile && hospProfile.location) {
        lat = hospProfile.location.latitude;
        lon = hospProfile.location.longitude;
      } else {
        lat = 28.6139; // Central fallback
        lon = 77.209;
      }
    }

    const results = await matchDonorsAndBloodBanks({
      requestedBloodGroup: bloodGroup,
      unitsRequired: Number(unitsRequired),
      hospitalLatitude: lat,
      hospitalLongitude: lon,
      searchRadiusKm: Number(radius),
      filterOnlyEligible: onlyEligible === 'true',
      filterOnlyAvailable: onlyAvailable === 'true',
    });

    return res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    console.error('Matching error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to search matching donors: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/hospital/requests
 * @desc    Create a new blood request with AI triage urgency calculation
 */
router.post('/requests', async (req, res) => {
  try {
    const {
      bloodGroup,
      unitsRequired = 1,
      urgency = URGENCY_LEVELS.HIGH,
      patientNotes = '',
      searchRadiusKm = 30,
      customLocation,
    } = req.body;

    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Blood group is required.',
      });
    }

    const hospProfile = await dataStore.findHospitalByUserId(req.user._id);
    const location =
      customLocation ||
      (hospProfile && hospProfile.location) || {
        latitude: 28.6139,
        longitude: 77.209,
        address: hospProfile ? hospProfile.address : 'Hospital Medical Ward',
        city: hospProfile ? hospProfile.city : 'Metro City',
      };

    const contactPhone =
      (hospProfile && hospProfile.emergencyContact) || req.user.phone || '+91 99999 00000';
    const hospitalName =
      (hospProfile && hospProfile.hospitalName) || req.user.name;

    // Modular AI Triage Assessment
    const aiTriage = await evaluateTriageAssessment({
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      urgency,
      patientNotes,
    });

    // Check for suspicious excess request (>30 units in single request)
    const isSuspicious = Number(unitsRequired) > 30;
    const suspicionReason = isSuspicious
      ? `Excessive units requested (${unitsRequired} units) exceeds clinical emergency average for a single admission.`
      : '';

    const newRequest = await dataStore.createBloodRequest({
      hospitalUserId: req.user._id,
      hospitalName,
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      urgency,
      status: REQUEST_STATUS.PENDING,
      patientNotes,
      location,
      contactPhone,
      searchRadiusKm: Number(searchRadiusKm),
      aiTriage,
      isSuspicious,
      suspicionReason,
    });

    dataStore.addAuditLog(
      'REQUEST_CREATED',
      `Hospital ${hospitalName} requested ${unitsRequired} units of ${bloodGroup} (Urgency: ${urgency}).`
    );

    return res.status(201).json({
      success: true,
      message: 'Blood request published successfully.',
      data: newRequest,
    });
  } catch (err) {
    console.error('Request creation error:', err);
    return res.status(500).json({
      success: false,
      message: 'Could not create blood request: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/hospital/requests
 * @desc    Get all blood requests created by this hospital
 */
router.get('/requests', async (req, res) => {
  try {
    const all = await dataStore.getAllBloodRequests();
    // Hospital staff see their own requests; Admin sees all
    const filtered =
      req.user.role === ROLES.ADMIN
        ? all
        : all.filter((r) => String(r.hospitalUserId) === String(req.user._id));

    return res.json({
      success: true,
      data: filtered,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching requests: ' + err.message,
    });
  }
});

/**
 * @route   PATCH /api/hospital/requests/:id/status
 * @desc    Update request status (Pending, Contacted, Fulfilled, Cancelled)
 */
router.patch('/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!Object.values(REQUEST_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(REQUEST_STATUS).join(', ')}`,
      });
    }

    const request = await dataStore.findBloodRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
      });
    }

    // Ensure hospital owns this request
    if (
      req.user.role !== ROLES.ADMIN &&
      String(request.hospitalUserId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this request.',
      });
    }

    const updated = await dataStore.updateBloodRequest(req.params.id, {
      status,
    });

    dataStore.addAuditLog(
      'REQUEST_STATUS_UPDATED',
      `Request ${req.params.id} marked as ${status} by ${req.user.name}.`
    );

    return res.json({
      success: true,
      message: `Request status updated to ${status}.`,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Status update failed: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/hospital/notify-donor
 * @desc    Send in-app notification to a specific matched donor
 */
router.post('/notify-donor', async (req, res) => {
  try {
    const { donorUserId, requestId } = req.body;

    if (!donorUserId || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'donorUserId and requestId are required.',
      });
    }

    const bloodRequest = await dataStore.findBloodRequestById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    const notif = await notificationService.notifyDonor({
      donorUserId,
      hospitalUserId: req.user._id,
      bloodRequest,
    });

    return res.json({
      success: true,
      message: 'Notification successfully dispatched to donor.',
      data: notif,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to notify donor: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/hospital/contact-bloodbank
 * @desc    Send reservation inquiry to a registered blood bank
 */
router.post('/contact-bloodbank', async (req, res) => {
  try {
    const { bloodBankUserId, requestId, units = 1 } = req.body;

    if (!bloodBankUserId || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'bloodBankUserId and requestId are required.',
      });
    }

    const bloodRequest = await dataStore.findBloodRequestById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    const notif = await notificationService.inquireBloodBank({
      bloodBankUserId,
      hospitalUserId: req.user._id,
      bloodRequest,
      units: Number(units),
    });

    return res.json({
      success: true,
      message: 'Priority inquiry sent to Blood Bank successfully.',
      data: notif,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to contact blood bank: ' + err.message,
    });
  }
});

module.exports = router;
