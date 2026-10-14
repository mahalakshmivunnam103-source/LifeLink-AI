const mongoose = require('mongoose');
const { ROLES, VERIFICATION_STATUS } = require('../config/constants');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: function () {
        // Donors and Admins are auto-verified, Hospitals and Blood Banks require admin review
        return this.role === ROLES.DONOR || this.role === ROLES.ADMIN
          ? VERIFICATION_STATUS.VERIFIED
          : VERIFICATION_STATUS.PENDING;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
