const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles, requireVerified } = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');
const dataStore = require('../services/dataStore');

router.use(authenticateToken);
router.use(authorizeRoles(ROLES.BLOOD_BANK, ROLES.ADMIN));
router.use(requireVerified);

/**
 * @route   GET /api/bloodbank/profile
 * @desc    Get blood bank profile, current inventory, and update timestamps
 */
router.get('/profile', async (req, res) => {
  try {
    const profile = await dataStore.findBloodBankByUserId(req.user._id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Blood Bank profile not found.',
      });
    }

    return res.json({
      success: true,
      profile,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blood bank profile: ' + err.message,
    });
  }
});

/**
 * @route   PUT /api/bloodbank/inventory
 * @desc    Update blood group inventory counts and timestamp
 */
router.put('/inventory', async (req, res) => {
  try {
    const { inventory } = req.body;

    if (!Array.isArray(inventory)) {
      return res.status(400).json({
        success: false,
        message: 'Inventory must be an array of blood group objects.',
      });
    }

    // Validate and sanitize inventory items
    const now = new Date();
    const sanitized = inventory.map((item) => ({
      bloodGroup: item.bloodGroup,
      unitsAvailable: Math.max(0, parseInt(item.unitsAvailable, 10) || 0),
      componentType: item.componentType || 'Whole Blood',
      lastUpdated: now,
    }));

    const updated = await dataStore.updateBloodBankInventory(
      req.user._id,
      sanitized
    );

    dataStore.addAuditLog(
      'INVENTORY_UPDATED',
      `Blood Bank ${req.user.name} updated stock inventory counts.`
    );

    return res.json({
      success: true,
      message: 'Blood inventory and timestamps updated successfully.',
      inventory: updated ? updated.inventory : sanitized,
      lastInventoryUpdate: now,
    });
  } catch (err) {
    console.error('Inventory update error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inventory: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/bloodbank/inquiries
 * @desc    Get hospital reservation requests sent to this blood bank
 */
router.get('/inquiries', async (req, res) => {
  try {
    const notifications = await dataStore.getNotificationsForUser(req.user._id);
    const inquiries = notifications.filter(
      (n) => n.type === 'BLOODBANK_INQUIRY'
    );

    return res.json({
      success: true,
      data: inquiries,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching inquiries: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/bloodbank/respond-inquiry
 * @desc    Confirm availability or respond to hospital reservation
 */
router.post('/respond-inquiry', async (req, res) => {
  try {
    const { notificationId, status, responseNote } = req.body;

    if (!notificationId || !['Confirmed', 'Unavailable'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'notificationId and valid status (Confirmed/Unavailable) required.',
      });
    }

    const notif = await dataStore.updateNotificationResponse(
      notificationId,
      status
    );

    if (notif && notif.requestId) {
      const request = await dataStore.findBloodRequestById(notif.requestId);
      if (request) {
        // Notify the hospital
        await dataStore.createNotification({
          recipientUserId: request.hospitalUserId,
          senderUserId: req.user._id,
          requestId: request._id,
          title: `Blood Bank Response: ${status.toUpperCase()}`,
          message:
            status === 'Confirmed'
              ? `Blood Bank staff has CONFIRMED unit availability for your request (${request.bloodGroup}). ${responseNote || 'Dispatch is prepared.'}`
              : `Blood Bank staff reports units are currently UNAVAILABLE. ${responseNote || 'Depleted emergency buffer.'}`,
          type: 'BLOODBANK_CONFIRMED',
          actionPayload: {
            status,
            requestId: request._id,
            bankName: req.user.name,
            responseNote,
          },
        });
      }
    }

    dataStore.addAuditLog(
      'BLOOD_BANK_RESPONSE',
      `Blood Bank ${req.user.name} responded ${status} to inquiry.`
    );

    return res.json({
      success: true,
      message: `Inquiry status updated to ${status}. Hospital notified.`,
      data: notif,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to respond to inquiry: ' + err.message,
    });
  }
});

module.exports = router;
