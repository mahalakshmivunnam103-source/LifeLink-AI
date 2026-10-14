const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'DONOR_REQUEST',
        'DONOR_ACCEPTED',
        'DONOR_DECLINED',
        'BLOODBANK_INQUIRY',
        'BLOODBANK_CONFIRMED',
        'ADMIN_ALERT',
        'VERIFICATION_UPDATE',
      ],
      default: 'DONOR_REQUEST',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    responseStatus: {
      type: String,
      enum: ['None', 'Pending', 'Accepted', 'Declined'],
      default: 'None',
    },
    actionPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);
