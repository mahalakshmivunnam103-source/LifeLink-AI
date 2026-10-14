const mongoose = require('mongoose');
const { BLOOD_GROUPS, REQUEST_STATUS, URGENCY_LEVELS } = require('../config/constants');

const BloodRequestSchema = new mongoose.Schema(
  {
    hospitalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
      default: 1,
    },
    urgency: {
      type: String,
      enum: Object.values(URGENCY_LEVELS),
      default: URGENCY_LEVELS.HIGH,
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    patientNotes: {
      type: String,
      trim: true,
      default: 'Emergency clinical requirement',
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String, required: true },
      city: { type: String, default: '' },
    },
    contactPhone: {
      type: String,
      required: true,
    },
    searchRadiusKm: {
      type: Number,
      default: 25,
      min: 1,
      max: 150,
    },
    notifiedDonors: [
      {
        donorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        donorName: String,
        status: {
          type: String,
          enum: ['Pending', 'Accepted', 'Declined'],
          default: 'Pending',
        },
        sentAt: { type: Date, default: Date.now },
        respondedAt: { type: Date, default: null },
      },
    ],
    contactedBloodBanks: [
      {
        bloodBankId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBankProfile' },
        bloodBankName: String,
        status: {
          type: String,
          enum: ['Inquired', 'Confirmed', 'Unavailable'],
          default: 'Inquired',
        },
        unitsRequested: Number,
        sentAt: { type: Date, default: Date.now },
        responseNote: String,
      },
    ],
    aiTriage: {
      urgencyScore: { type: Number, default: 75 },
      scarcityFactor: { type: String, default: 'Standard' },
      suggestedAction: { type: String, default: 'Contact top 3 nearest compatible donors immediately.' },
    },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
    suspicionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.BloodRequest ||
  mongoose.model('BloodRequest', BloodRequestSchema);
