const { VERIFICATION_STATUS, ROLES } = require('../config/constants');

/**
 * Check if the authenticated user has one of the allowed roles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles.`,
      });
    }

    next();
  };
};

/**
 * Enforce administrator verification for sensitive clinical roles (Hospital, Blood Bank)
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // Admins and Donors do not have license verification gate
  if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.DONOR) {
    return next();
  }

  if (req.user.verificationStatus === VERIFICATION_STATUS.PENDING) {
    return res.status(403).json({
      success: false,
      code: 'VERIFICATION_PENDING',
      message:
        'Your medical facility credentials are currently under review by platform administrators. Full access will be granted upon verification.',
    });
  }

  if (req.user.verificationStatus === VERIFICATION_STATUS.REJECTED) {
    return res.status(403).json({
      success: false,
      code: 'VERIFICATION_REJECTED',
      message: `Your facility registration was rejected. Reason: ${req.user.rejectionReason || 'Invalid license details.'}`,
    });
  }

  next();
};

module.exports = { authorizeRoles, requireVerified };
