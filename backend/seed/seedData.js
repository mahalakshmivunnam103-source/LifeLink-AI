require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const BloodBankProfile = require('../models/BloodBankProfile');
const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const {
  ROLES,
  VERIFICATION_STATUS,
  REQUEST_STATUS,
  URGENCY_LEVELS,
} = require('../config/constants');

const seedDatabase = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.log(
        '[LifeLink AI Seed] MongoDB is not accessible. Built-in smart dataStore is ready and pre-seeded automatically in memory.'
      );
      process.exit(0);
    }

    console.log('[LifeLink AI Seed] Clearing existing collections...');
    await User.deleteMany({});
    await DonorProfile.deleteMany({});
    await HospitalProfile.deleteMany({});
    await BloodBankProfile.deleteMany({});
    await BloodRequest.deleteMany({});
    await Notification.deleteMany({});

    console.log('[LifeLink AI Seed] Inserting baseline users and profiles...');
    const hash = (pwd) => bcrypt.hashSync(pwd, 10);

    // 1. Admin
    const admin = await User.create({
      name: 'Dr. Vikram Malhotra (Lead Administrator)',
      email: 'admin@lifelink.org',
      password: hash('Admin123!'),
      role: ROLES.ADMIN,
      phone: '+91 98110 01100',
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isActive: true,
    });

    // 2. Verified Hospital
    const hospUser = await User.create({
      name: 'Dr. Rajesh Sen (Trauma Incharge)',
      email: 'hospital@citymed.org',
      password: hash('Hospital123!'),
      role: ROLES.HOSPITAL,
      phone: '+91 98111 22201',
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isActive: true,
    });

    const hospitalProfile = await HospitalProfile.create({
      userId: hospUser._id,
      hospitalName: 'City General Hospital & Trauma Centre',
      licenseNumber: 'MED-DEL-2024-8841',
      address: 'Plot 42, Health City Avenue, Connaught District',
      city: 'New Delhi',
      contactPerson: 'Dr. Rajesh Sen',
      emergencyContact: '+91 98111 22201',
      location: { latitude: 28.6139, longitude: 77.209 },
      verifiedAt: new Date(),
      verifiedBy: admin._id,
    });

    // 3. Pending Hospital
    const pendingHosp = await User.create({
      name: 'Dr. Meera Nambiar',
      email: 'pending.hospital@apexcare.org',
      password: hash('Hospital123!'),
      role: ROLES.HOSPITAL,
      phone: '+91 98222 33301',
      verificationStatus: VERIFICATION_STATUS.PENDING,
      isActive: true,
    });

    await HospitalProfile.create({
      userId: pendingHosp._id,
      hospitalName: 'Apex Multispeciality Hospital',
      licenseNumber: 'MED-APEX-2026-9932',
      address: 'Sector 14, Health Park, South District',
      city: 'New Delhi',
      contactPerson: 'Dr. Meera Nambiar',
      emergencyContact: '+91 98222 33301',
      location: { latitude: 28.545, longitude: 77.192 },
    });

    // 4. Verified Blood Bank 1 (Red Cross)
    const bankUser1 = await User.create({
      name: 'Red Cross Regional Blood Center Staff',
      email: 'staff@redcross-central.org',
      password: hash('Bank123!'),
      role: ROLES.BLOOD_BANK,
      phone: '+91 11 2371 6441',
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isActive: true,
    });

    const bankProfile1 = await BloodBankProfile.create({
      userId: bankUser1._id,
      bloodBankName: 'Red Cross Regional Blood Center',
      licenseNumber: 'BB-DEL-2023-4011',
      address: '1 Red Cross Road, Connaught Place',
      city: 'New Delhi',
      contactPhone: '+91 11 2371 6441',
      contactEmail: 'emergency@redcross-central.org',
      operatingHours: '24/7 Emergency Blood Bank Service',
      location: { latitude: 28.6295, longitude: 77.218 },
      inventory: [
        { bloodGroup: 'O-', unitsAvailable: 5, componentType: 'Whole Blood', lastUpdated: new Date() },
        { bloodGroup: 'O+', unitsAvailable: 19, componentType: 'Whole Blood', lastUpdated: new Date() },
        { bloodGroup: 'A+', unitsAvailable: 14, componentType: 'Whole Blood', lastUpdated: new Date() },
        { bloodGroup: 'A-', unitsAvailable: 4, componentType: 'Whole Blood', lastUpdated: new Date() },
        { bloodGroup: 'B+', unitsAvailable: 16, componentType: 'Whole Blood', lastUpdated: new Date() },
        { bloodGroup: 'B-', unitsAvailable: 3, componentType: 'Whole Blood', lastUpdated: new Date() },
        { bloodGroup: 'AB+', unitsAvailable: 8, componentType: 'Whole Blood', lastUpdated: new Date() },
        { bloodGroup: 'AB-', unitsAvailable: 2, componentType: 'Whole Blood', lastUpdated: new Date() },
      ],
    });

    // 5. Donors
    const donor1User = await User.create({
      name: 'Rahul Sharma',
      email: 'donor.rahul@gmail.com',
      password: hash('Donor123!'),
      role: ROLES.DONOR,
      phone: '+91 98765 43210',
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isActive: true,
    });

    const lastDonationRahul = new Date(Date.now() - 115 * 24 * 60 * 60 * 1000);
    await DonorProfile.create({
      userId: donor1User._id,
      bloodGroup: 'O-',
      gender: 'Male',
      age: 28,
      currentArea: 'Barakhamba Road, Connaught Place',
      location: { latitude: 28.628, longitude: 77.221 },
      lastDonationDate: lastDonationRahul,
      availabilityStatus: true,
      receiveRequests: true,
      consentShareContact: true,
      donationCount: 4,
      donationHistory: [
        {
          donationDate: lastDonationRahul,
          facilityName: 'City General Hospital Blood Camp',
          units: 1,
          bloodBankVerified: true,
          notes: 'Regular voluntary whole-blood donation',
        },
      ],
    });

    // Blood Request
    const req1 = await BloodRequest.create({
      hospitalUserId: hospUser._id,
      hospitalName: hospitalProfile.hospitalName,
      bloodGroup: 'O-',
      unitsRequired: 2,
      urgency: URGENCY_LEVELS.CRITICAL,
      status: REQUEST_STATUS.PENDING,
      patientNotes: 'Trauma ICU patient with heavy hemorrhaging. Immediate transfusion needed.',
      location: hospitalProfile.location,
      contactPhone: hospitalProfile.emergencyContact,
      searchRadiusKm: 25,
      notifiedDonors: [
        {
          donorUserId: donor1User._id,
          donorName: donor1User.name,
          status: 'Pending',
          sentAt: new Date(),
        },
      ],
      aiTriage: {
        urgencyScore: 95,
        scarcityFactor: 'Extremely Scarce (Universal Donor O-)',
        suggestedAction:
          'Contact top 3 nearest compatible donors immediately; check Red Cross Regional Blood Center as fallback.',
      },
    });

    await Notification.create({
      recipientUserId: donor1User._id,
      senderUserId: hospUser._id,
      requestId: req1._id,
      title: 'CRITICAL: Urgent O- Blood Request',
      message: `${hospitalProfile.hospitalName} requires 2 units of O- blood. Distance ~1.9 km. Can you donate?`,
      type: 'DONOR_REQUEST',
      responseStatus: 'Pending',
      actionPayload: {
        bloodGroup: 'O-',
        unitsRequired: 2,
        hospitalName: hospitalProfile.hospitalName,
      },
    });

    console.log('[LifeLink AI Seed] Successfully seeded MongoDB database!');
    process.exit(0);
  } catch (err) {
    console.error('[LifeLink AI Seed] Error:', err);
    process.exit(1);
  }
};

seedDatabase();
