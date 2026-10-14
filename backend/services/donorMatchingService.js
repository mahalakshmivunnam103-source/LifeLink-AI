const {
  RBC_COMPATIBILITY,
  SCREENING_INTERVALS_DAYS,
  MEDICAL_DISCLAIMER,
} = require('../config/constants');
const dataStore = require('./dataStore');

/**
 * Calculates distance in kilometers between two geographic coordinates using Haversine formula.
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return 9999;
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

/**
 * Evaluates donation interval screening.
 * Note: Donation interval is an initial screening filter only, not a guarantee of medical eligibility.
 */
const evaluateScreeningInterval = (gender, lastDonationDate) => {
  if (!lastDonationDate) {
    return {
      isScreeningEligible: true,
      daysElapsed: null,
      requiredIntervalDays:
        gender === 'Female'
          ? SCREENING_INTERVALS_DAYS.FEMALE
          : SCREENING_INTERVALS_DAYS.MALE,
      nextEligibleDate: null,
      daysRemaining: 0,
      screeningNote: 'First-time donor (No previous donation recorded on platform)',
    };
  }

  const last = new Date(lastDonationDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const requiredDays =
    gender === 'Female'
      ? SCREENING_INTERVALS_DAYS.FEMALE
      : SCREENING_INTERVALS_DAYS.MALE;

  const isEligible = daysElapsed >= requiredDays;
  const daysRemaining = isEligible ? 0 : requiredDays - daysElapsed;
  const nextEligibleDate = new Date(
    last.getTime() + requiredDays * 24 * 60 * 60 * 1000
  );

  return {
    isScreeningEligible: isEligible,
    daysElapsed,
    requiredIntervalDays: requiredDays,
    nextEligibleDate,
    daysRemaining,
    screeningNote: isEligible
      ? `Interval filter passed (${daysElapsed} days since last donation; minimum ${requiredDays} days required for ${gender || 'donor'})`
      : `Temporary screening hold: ${daysRemaining} days remaining before reference interval (${requiredDays} days for ${gender || 'donor'}) is met.`,
  };
};

/**
 * Mask phone number to protect donor privacy when consent is withheld
 */
const maskPhoneNumber = (phone) => {
  if (!phone) return 'Confidential';
  const clean = phone.trim();
  if (clean.length < 8) return 'Protected';
  const prefix = clean.slice(0, 5);
  const suffix = clean.slice(-2);
  return `${prefix}*****${suffix}`;
};

/**
 * Main Donor Matching and Blood Bank Fallback service
 */
const matchDonorsAndBloodBanks = async ({
  requestedBloodGroup,
  unitsRequired = 1,
  hospitalLatitude,
  hospitalLongitude,
  searchRadiusKm = 30,
  filterOnlyEligible = false,
  filterOnlyAvailable = true,
}) => {
  // 1. Get compatible donor blood groups
  const compatibleGroups =
    RBC_COMPATIBILITY[requestedBloodGroup] || [requestedBloodGroup];

  // 2. Query all donors
  const allDonors = await dataStore.getAllDonors();

  // 3. Score and evaluate each donor
  const matchedDonors = [];

  for (const donor of allDonors) {
    // Basic verification and active check
    if (!donor.userId || !donor.userId.isActive) continue;

    // Must be compatible blood group
    const isCompatible = compatibleGroups.includes(donor.bloodGroup);
    if (!isCompatible) continue;

    // Check availability filter
    if (filterOnlyAvailable && !donor.availabilityStatus) continue;

    // Check if donor opted in to receive requests
    if (donor.receiveRequests === false) continue;

    // Distance calculation
    const distanceKm = calculateDistanceKm(
      hospitalLatitude,
      hospitalLongitude,
      donor.location?.latitude,
      donor.location?.longitude
    );

    // Search radius filter
    if (distanceKm > searchRadiusKm) continue;

    // Screening interval check
    const screening = evaluateScreeningInterval(
      donor.gender,
      donor.lastDonationDate
    );

    // Apply strict screening filter if requested
    if (filterOnlyEligible && !screening.isScreeningEligible) continue;

    // Privacy masking
    const phoneDisplay = donor.consentShareContact
      ? donor.userId.phone || 'Available on request'
      : maskPhoneNumber(donor.userId.phone);

    matchedDonors.push({
      donorId: donor._id,
      userId: donor.userId._id,
      name: donor.userId.name,
      bloodGroup: donor.bloodGroup,
      isExactMatch: donor.bloodGroup === requestedBloodGroup,
      gender: donor.gender,
      age: donor.age,
      currentArea: donor.currentArea,
      // Approximate coords for map visualization to protect exact home location
      displayCoords: {
        latitude: donor.location.latitude + (Math.random() - 0.5) * 0.003,
        longitude: donor.location.longitude + (Math.random() - 0.5) * 0.003,
      },
      distanceKm,
      lastDonationDate: donor.lastDonationDate,
      availabilityStatus: donor.availabilityStatus,
      consentShareContact: donor.consentShareContact,
      phoneDisplay,
      donationCount: donor.donationCount || 0,
      screening,
    });
  }

  // Sort by: Exact match first, then screening eligibility, then distance ascending
  matchedDonors.sort((a, b) => {
    if (a.isExactMatch !== b.isExactMatch) {
      return a.isExactMatch ? -1 : 1;
    }
    if (a.screening.isScreeningEligible !== b.screening.isScreeningEligible) {
      return a.screening.isScreeningEligible ? -1 : 1;
    }
    return a.distanceKm - b.distanceKm;
  });

  // 4. Retrieve Nearby Verified Blood Banks (as fallback or complementary source)
  const allBloodBanks = await dataStore.getAllBloodBanks();
  const nearbyBloodBanks = [];

  for (const bank of allBloodBanks) {
    if (
      !bank.userId ||
      bank.userId.verificationStatus !== 'verified' ||
      !bank.userId.isActive
    ) {
      continue;
    }

    const distanceKm = calculateDistanceKm(
      hospitalLatitude,
      hospitalLongitude,
      bank.location?.latitude,
      bank.location?.longitude
    );

    // Calculate total compatible units in this blood bank
    let totalCompatibleUnits = 0;
    const inventoryBreakdown = [];

    (bank.inventory || []).forEach((item) => {
      const isCompat = compatibleGroups.includes(item.bloodGroup);
      if (isCompat) {
        totalCompatibleUnits += item.unitsAvailable;
      }
      inventoryBreakdown.push({
        bloodGroup: item.bloodGroup,
        unitsAvailable: item.unitsAvailable,
        componentType: item.componentType,
        isCompatible: isCompat,
        isExact: item.bloodGroup === requestedBloodGroup,
        lastUpdated: item.lastUpdated,
      });
    });

    nearbyBloodBanks.push({
      bloodBankId: bank._id,
      userId: bank.userId._id,
      bloodBankName: bank.bloodBankName,
      licenseNumber: bank.licenseNumber,
      address: bank.address,
      city: bank.city,
      contactPhone: bank.contactPhone,
      contactEmail: bank.contactEmail,
      operatingHours: bank.operatingHours,
      location: bank.location,
      distanceKm,
      lastInventoryUpdate: bank.lastInventoryUpdate,
      totalCompatibleUnits,
      inventory: inventoryBreakdown,
    });
  }

  // Sort blood banks by distance ascending
  nearbyBloodBanks.sort((a, b) => a.distanceKm - b.distanceKm);

  // Fallback trigger condition
  const fallbackActive = matchedDonors.length === 0;

  return {
    query: {
      requestedBloodGroup,
      unitsRequired,
      searchRadiusKm,
      compatibleBloodGroups: compatibleGroups,
    },
    matchedDonors,
    totalDonorsFound: matchedDonors.length,
    fallbackActive,
    nearbyBloodBanks,
    totalBloodBanksFound: nearbyBloodBanks.length,
    disclaimer: MEDICAL_DISCLAIMER,
  };
};

module.exports = {
  calculateDistanceKm,
  evaluateScreeningInterval,
  maskPhoneNumber,
  matchDonorsAndBloodBanks,
};
