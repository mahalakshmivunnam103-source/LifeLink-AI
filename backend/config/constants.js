// LifeLink AI — System Constants & Medical Screening Guidelines

const ROLES = {
  ADMIN: 'admin',
  HOSPITAL: 'hospital',
  DONOR: 'donor',
  BLOOD_BANK: 'bloodbank',
};

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

const REQUEST_STATUS = {
  PENDING: 'Pending',
  CONTACTED: 'Contacted',
  FULFILLED: 'Fulfilled',
  CANCELLED: 'Cancelled',
};

const URGENCY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// RBC Compatibility Matrix: Recipient Group -> Array of compatible Donor Groups
const RBC_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

// Configurable reference intervals (in days) for whole-blood donation
const SCREENING_INTERVALS_DAYS = {
  MALE: 90,
  FEMALE: 120,
  DEFAULT: 90,
};

const MEDICAL_DISCLAIMER =
  'Notice: Donation interval is an initial screening filter only, not a guarantee of medical eligibility. Final donor eligibility, health evaluation, and blood compatibility must be strictly confirmed by qualified blood bank staff.';

module.exports = {
  ROLES,
  VERIFICATION_STATUS,
  REQUEST_STATUS,
  URGENCY_LEVELS,
  BLOOD_GROUPS,
  RBC_COMPATIBILITY,
  SCREENING_INTERVALS_DAYS,
  MEDICAL_DISCLAIMER,
};
