const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');
const dataStore = require('../services/dataStore');
const notificationService = require('../services/notificationService');
const { evaluateScreeningInterval } = require('../services/donorMatchingService');

router.use(authenticateToken);
router.use(authorizeRoles(ROLES.DONOR, ROLES.ADMIN));

/**
 * @route   GET /api/donor/profile
 * @desc    Get donor profile with calculated screening eligibility review date
 */
router.get('/profile', async (req, res) => {
  try {
    const profile = await dataStore.findDonorByUserId(req.user._id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found.',
      });
    }

    const screening = evaluateScreeningInterval(
      profile.gender,
      profile.lastDonationDate
    );

    return res.json({
      success: true,
      profile,
      screening,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch donor profile: ' + err.message,
    });
  }
});

/**
 * @route   PUT /api/donor/profile
 * @desc    Update donor location, availability toggle, consent toggle, or donation date
 */
router.put('/profile', async (req, res) => {
  try {
    const {
      currentArea,
      latitude,
      longitude,
      availabilityStatus,
      receiveRequests,
      consentShareContact,
      lastDonationDate,
      bloodGroup,
      age,
      gender,
    } = req.body;

    const currentProfile = await dataStore.findDonorByUserId(req.user._id);
    if (!currentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    const updateFields = {};

    if (currentArea !== undefined) updateFields.currentArea = currentArea;
    if (availabilityStatus !== undefined)
      updateFields.availabilityStatus = Boolean(availabilityStatus);
    if (receiveRequests !== undefined)
      updateFields.receiveRequests = Boolean(receiveRequests);
    if (consentShareContact !== undefined)
      updateFields.consentShareContact = Boolean(consentShareContact);
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;
    if (age !== undefined) updateFields.age = Number(age);
    if (gender !== undefined) updateFields.gender = gender;

    if (lastDonationDate !== undefined) {
      updateFields.lastDonationDate = lastDonationDate
        ? new Date(lastDonationDate)
        : null;
    }

    if (latitude !== undefined && longitude !== undefined) {
      updateFields.location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    }

    const updated = await dataStore.updateDonorProfile(
      req.user._id,
      updateFields
    );

    dataStore.addAuditLog(
      'DONOR_PROFILE_UPDATED',
      `Donor ${req.user.name} updated profile preferences.`
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Update failed: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/donor/notifications
 * @desc    Get donor's blood request notifications and alerts
 */
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await dataStore.getNotificationsForUser(req.user._id);
    return res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/donor/respond
 * @desc    Accept or decline a blood donation request
 */
router.post('/respond', async (req, res) => {
  try {
    const { notificationId, response } = req.body;

    if (!notificationId || !['Accepted', 'Declined'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'notificationId and valid response (Accepted/Declined) required.',
      });
    }

    const result = await notificationService.processDonorResponse({
      notificationId,
      donorUserId: req.user._id,
      responseStatus: response,
    });

    return res.json({
      success: true,
      message: `You have successfully ${response.toLowerCase()} the donation request. Thank you for your support!`,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error processing response: ' + err.message,
    });
  }
});

module.exports = router;
