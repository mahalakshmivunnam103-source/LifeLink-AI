const mongoose = require('mongoose');
const { BLOOD_GROUPS } = require('../config/constants');

const DonorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 65,
    },
    currentArea: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
    receiveRequests: {
      type: Boolean,
      default: true,
    },
    consentShareContact: {
      type: Boolean,
      default: false, // Privacy protection by default
    },
    donationCount: {
      type: Number,
      default: 0,
    },
    donationHistory: [
      {
        donationDate: { type: Date, required: true },
        facilityName: { type: String, required: true },
        units: { type: Number, default: 1 },
        bloodBankVerified: { type: Boolean, default: true },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.DonorProfile ||
  mongoose.model('DonorProfile', DonorProfileSchema);
