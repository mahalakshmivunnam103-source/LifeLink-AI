// Medical RBC Transfusion Compatibility Rules
export const RBC_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MEDICAL_DISCLAIMER =
  'Notice: Donation interval is an initial screening filter only, not a guarantee of medical eligibility. Final donor eligibility and blood compatibility must be confirmed by qualified blood bank staff.';

export const isBloodCompatible = (recipientGroup, donorGroup) => {
  const allowed = RBC_COMPATIBILITY[recipientGroup] || [];
  return allowed.includes(donorGroup);
};

export const getCompatibleDonorsList = (recipientGroup) => {
  return RBC_COMPATIBILITY[recipientGroup] || [recipientGroup];
};
