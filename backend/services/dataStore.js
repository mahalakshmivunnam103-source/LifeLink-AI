const bcrypt = require('bcryptjs');
const {
  ROLES,
  VERIFICATION_STATUS,
  REQUEST_STATUS,
  URGENCY_LEVELS,
} = require('../config/constants');
const { getIsConnected } = require('../config/db');

// Models
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const HospitalProfile = require('../models/HospitalProfile');
const BloodBankProfile = require('../models/BloodBankProfile');
const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');

// In-Memory store holding records when MongoDB is offline
const memoryStore = {
  users: [],
  donorProfiles: [],
  hospitalProfiles: [],
  bloodBankProfiles: [],
  bloodRequests: [],
  notifications: [],
  auditLogs: [],
};

// Realistic Seed Initializer
const initializeMemoryStore = () => {
  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  // 1. Admin
  const adminId = '650000000000000000000001';
  memoryStore.users.push({
    _id: adminId,
    name: 'Dr. Vikram Malhotra (Lead Administrator)',
    email: 'admin@lifelink.org',
    password: hash('Admin123!'),
    role: ROLES.ADMIN,
    phone: '+91 98110 01100',
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
  });

  // 2. Verified Hospital
  const hospital1Id = '650000000000000000000002';
  memoryStore.users.push({
    _id: hospital1Id,
    name: 'Dr. Rajesh Sen (Trauma Incharge)',
    email: 'hospital@citymed.org',
    password: hash('Hospital123!'),
    role: ROLES.HOSPITAL,
    phone: '+91 98111 22201',
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    isActive: true,
    createdAt: new Date('2025-01-10T00:00:00Z'),
  });

  memoryStore.hospitalProfiles.push({
    _id: '651000000000000000000002',
    userId: hospital1Id,
    hospitalName: 'City General Hospital & Trauma Centre',
    licenseNumber: 'MED-DEL-2024-8841',
    address: 'Plot 42, Health City Avenue, Connaught District',
    city: 'New Delhi',
    contactPerson: 'Dr. Rajesh Sen',
    emergencyContact: '+91 98111 22201',
    location: { latitude: 28.6139, longitude: 77.209 },
    verifiedAt: new Date('2025-01-11T10:00:00Z'),
    verifiedBy: adminId,
    createdAt: new Date('2025-01-10T00:00:00Z'),
  });

  // 3. Pending Hospital (for Admin verification testing)
  const hospital2Id = '650000000000000000000003';
  memoryStore.users.push({
    _id: hospital2Id,
    name: 'Dr. Meera Nambiar',
    email: 'pending.hospital@apexcare.org',
    password: hash('Hospital123!'),
    role: ROLES.HOSPITAL,
    phone: '+91 98222 33301',
    verificationStatus: VERIFICATION_STATUS.PENDING,
    isActive: true,
    createdAt: new Date('2026-10-10T00:00:00Z'),
  });

  memoryStore.hospitalProfiles.push({
    _id: '651000000000000000000003',
    userId: hospital2Id,
    hospitalName: 'Apex Multispeciality Hospital',
    licenseNumber: 'MED-APEX-2026-9932',
    address: 'Sector 14, Health Park, South District',
    city: 'New Delhi',
    contactPerson: 'Dr. Meera Nambiar',
    emergencyContact: '+91 98222 33301',
    location: { latitude: 28.545, longitude: 77.192 },
    verifiedAt: null,
    verifiedBy: null,
    createdAt: new Date('2026-10-10T00:00:00Z'),
  });

  // 4. Verified Blood Bank 1 (Red Cross)
  const bank1Id = '650000000000000000000004';
  memoryStore.users.push({
    _id: bank1Id,
    name: 'Red Cross Regional Blood Center Staff',
    email: 'staff@redcross-central.org',
    password: hash('Bank123!'),
    role: ROLES.BLOOD_BANK,
    phone: '+91 11 2371 6441',
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    isActive: true,
    createdAt: new Date('2025-01-05T00:00:00Z'),
  });

  memoryStore.bloodBankProfiles.push({
    _id: '652000000000000000000004',
    userId: bank1Id,
    bloodBankName: 'Red Cross Regional Blood Center',
    licenseNumber: 'BB-DEL-2023-4011',
    address: '1 Red Cross Road, Connaught Place',
    city: 'New Delhi',
    contactPhone: '+91 11 2371 6441',
    contactEmail: 'emergency@redcross-central.org',
    operatingHours: '24/7 Emergency Blood Bank Service',
    location: { latitude: 28.6295, longitude: 77.218 },
    lastInventoryUpdate: new Date(),
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
    createdAt: new Date('2025-01-05T00:00:00Z'),
  });

  // 5. Verified Blood Bank 2 (LifeLine)
  const bank2Id = '650000000000000000000005';
  memoryStore.users.push({
    _id: bank2Id,
    name: 'LifeLine Charitable Blood Bank Staff',
    email: 'staff@lifeline-bloodbank.org',
    password: hash('Bank123!'),
    role: ROLES.BLOOD_BANK,
    phone: '+91 11 2685 1010',
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    isActive: true,
    createdAt: new Date('2025-02-01T00:00:00Z'),
  });

  memoryStore.bloodBankProfiles.push({
    _id: '652000000000000000000005',
    userId: bank2Id,
    bloodBankName: 'LifeLine Charitable Blood Bank',
    licenseNumber: 'BB-DEL-2022-1922',
    address: 'B-12 Ring Road, South Extension',
    city: 'New Delhi',
    contactPhone: '+91 11 2685 1010',
    contactEmail: 'dispatch@lifeline-bloodbank.org',
    operatingHours: '24/7 Emergency Service',
    location: { latitude: 28.572, longitude: 77.221 },
    lastInventoryUpdate: new Date(),
    inventory: [
      { bloodGroup: 'O-', unitsAvailable: 2, componentType: 'Whole Blood', lastUpdated: new Date() },
      { bloodGroup: 'O+', unitsAvailable: 11, componentType: 'Whole Blood', lastUpdated: new Date() },
      { bloodGroup: 'A+', unitsAvailable: 9, componentType: 'Whole Blood', lastUpdated: new Date() },
      { bloodGroup: 'B+', unitsAvailable: 12, componentType: 'Whole Blood', lastUpdated: new Date() },
      { bloodGroup: 'AB+', unitsAvailable: 5, componentType: 'Whole Blood', lastUpdated: new Date() },
      { bloodGroup: 'AB-', unitsAvailable: 1, componentType: 'Whole Blood', lastUpdated: new Date() },
    ],
    createdAt: new Date('2025-02-01T00:00:00Z'),
  });

  // 6. Pending Blood Bank (for Admin approval demo)
  const bank3Id = '650000000000000000000006';
  memoryStore.users.push({
    _id: bank3Id,
    name: 'Metro City Blood Reserve Staff',
    email: 'pending.bank@metroblood.org',
    password: hash('Bank123!'),
    role: ROLES.BLOOD_BANK,
    phone: '+91 11 2999 5555',
    verificationStatus: VERIFICATION_STATUS.PENDING,
    isActive: true,
    createdAt: new Date('2026-10-12T00:00:00Z'),
  });

  memoryStore.bloodBankProfiles.push({
    _id: '652000000000000000000006',
    userId: bank3Id,
    bloodBankName: 'Metro City Blood Reserve',
    licenseNumber: 'BB-LIC-PENDING-9901',
    address: 'East Enclave Medical Hub',
    city: 'New Delhi',
    contactPhone: '+91 11 2999 5555',
    contactEmail: 'info@metroblood.org',
    operatingHours: '8 AM - 10 PM',
    location: { latitude: 28.63, longitude: 77.28 },
    lastInventoryUpdate: new Date(),
    inventory: [
      { bloodGroup: 'A+', unitsAvailable: 6, componentType: 'Whole Blood', lastUpdated: new Date() },
      { bloodGroup: 'B+', unitsAvailable: 4, componentType: 'Whole Blood', lastUpdated: new Date() },
    ],
    createdAt: new Date('2026-10-12T00:00:00Z'),
  });

  // 7. Donors with diverse blood groups, distances, genders, and screening intervals
  const rawDonors = [
    {
      id: '650000000000000000000010',
      name: 'Rahul Sharma',
      email: 'donor.rahul@gmail.com',
      phone: '+91 98765 43210',
      bloodGroup: 'O-',
      gender: 'Male',
      age: 28,
      currentArea: 'Barakhamba Road, Connaught Place',
      location: { latitude: 28.628, longitude: 77.221 }, // ~1.9 km from Hospital
      daysAgoDonated: 115, // Screen eligible (115 >= 90)
      availabilityStatus: true,
      receiveRequests: true,
      consentShareContact: true,
      donationCount: 4,
    },
    {
      id: '650000000000000000000011',
      name: 'Ananya Iyer',
      email: 'donor.ananya@gmail.com',
      phone: '+91 98765 11223',
      bloodGroup: 'A+',
      gender: 'Female',
      age: 26,
      currentArea: 'Tilak Marg, Central Delhi',
      location: { latitude: 28.618, longitude: 77.234 }, // ~2.5 km
      daysAgoDonated: 140, // Screen eligible (140 >= 120 for female)
      availabilityStatus: true,
      receiveRequests: true,
      consentShareContact: false, // Phone masked
      donationCount: 2,
    },
    {
      id: '650000000000000000000012',
      name: 'Amit Patel',
      email: 'donor.amit@gmail.com',
      phone: '+91 98765 22334',
      bloodGroup: 'B+',
      gender: 'Male',
      age: 35,
      currentArea: 'Karol Bagh, West Central',
      location: { latitude: 28.648, longitude: 77.19 }, // ~4.2 km
      daysAgoDonated: 40, // NOT yet screening eligible (40 < 90)
      availabilityStatus: true,
      receiveRequests: true,
      consentShareContact: true,
      donationCount: 7,
    },
    {
      id: '650000000000000000000013',
      name: 'Priya Verma',
      email: 'donor.priya@gmail.com',
      phone: '+91 98765 33445',
      bloodGroup: 'O+',
      gender: 'Female',
      age: 31,
      currentArea: 'Lodhi Colony, South Delhi',
      location: { latitude: 28.588, longitude: 77.218 }, // ~3.0 km
      daysAgoDonated: 130, // Screen eligible (130 >= 120)
      availabilityStatus: true,
      receiveRequests: true,
      consentShareContact: true,
      donationCount: 3,
    },
    {
      id: '650000000000000000000014',
      name: 'Karan Malhotra',
      email: 'donor.karan@gmail.com',
      phone: '+91 98765 55667',
      bloodGroup: 'AB+',
      gender: 'Male',
      age: 23,
      currentArea: 'Pahar Ganj, North Central',
      location: { latitude: 28.641, longitude: 77.211 }, // ~3.1 km
      daysAgoDonated: null, // First-time donor! Eligible
      availabilityStatus: true,
      receiveRequests: true,
      consentShareContact: false,
      donationCount: 0,
    },
    {
      id: '650000000000000000000015',
      name: 'Sneha Das',
      email: 'donor.sneha@gmail.com',
      phone: '+91 98765 77889',
      bloodGroup: 'O-',
      gender: 'Female',
      age: 29,
      currentArea: 'Civil Lines, North Delhi',
      location: { latitude: 28.682, longitude: 77.224 }, // ~7.6 km
      daysAgoDonated: 160,
      availabilityStatus: false, // Donor has paused availability
      receiveRequests: false,
      consentShareContact: false,
      donationCount: 5,
    },
  ];

  const now = new Date();

  rawDonors.forEach((d) => {
    memoryStore.users.push({
      _id: d.id,
      name: d.name,
      email: d.email,
      password: hash('Donor123!'),
      role: ROLES.DONOR,
      phone: d.phone,
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isActive: true,
      createdAt: new Date('2025-03-01T00:00:00Z'),
    });

    const lastDonationDate = d.daysAgoDonated
      ? new Date(now.getTime() - d.daysAgoDonated * 24 * 60 * 60 * 1000)
      : null;

    memoryStore.donorProfiles.push({
      _id: '653' + d.id.slice(3),
      userId: d.id,
      bloodGroup: d.bloodGroup,
      gender: d.gender,
      age: d.age,
      currentArea: d.currentArea,
      location: d.location,
      lastDonationDate: lastDonationDate,
      availabilityStatus: d.availabilityStatus,
      receiveRequests: d.receiveRequests,
      consentShareContact: d.consentShareContact,
      donationCount: d.donationCount,
      donationHistory: lastDonationDate
        ? [
            {
              donationDate: lastDonationDate,
              facilityName: 'City General Hospital Blood Camp',
              units: 1,
              bloodBankVerified: true,
              notes: 'Routine whole-blood voluntary donation',
            },
          ]
        : [],
      createdAt: new Date('2025-03-01T00:00:00Z'),
    });
  });

  // 8. Pre-existing Blood Requests
  const req1Id = '654000000000000000000001';
  memoryStore.bloodRequests.push({
    _id: req1Id,
    hospitalUserId: hospital1Id,
    hospitalName: 'City General Hospital & Trauma Centre',
    bloodGroup: 'O-',
    unitsRequired: 2,
    urgency: URGENCY_LEVELS.CRITICAL,
    status: REQUEST_STATUS.PENDING,
    patientNotes: 'Trauma ICU patient with heavy hemorrhaging. Immediate transfusion needed.',
    location: {
      latitude: 28.6139,
      longitude: 77.209,
      address: 'Plot 42, Health City Avenue, Connaught District',
      city: 'New Delhi',
    },
    contactPhone: '+91 98111 22201',
    searchRadiusKm: 25,
    notifiedDonors: [
      {
        donorUserId: '650000000000000000000010', // Rahul Sharma
        donorName: 'Rahul Sharma',
        status: 'Pending',
        sentAt: new Date(),
        respondedAt: null,
      },
    ],
    contactedBloodBanks: [],
    aiTriage: {
      urgencyScore: 95,
      scarcityFactor: 'Extremely Scarce (Universal Donor O-)',
      suggestedAction:
        'Dispatch urgent notifications to all available O- donors within 15 km; simultaneously place inquiry with Red Cross Regional Blood Center.',
    },
    isSuspicious: false,
    suspicionReason: '',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  });

  // Notification for Rahul Sharma for Request 1
  memoryStore.notifications.push({
    _id: '655000000000000000000001',
    recipientUserId: '650000000000000000000010', // Rahul Sharma
    senderUserId: hospital1Id,
    requestId: req1Id,
    title: 'CRITICAL: Urgent O- Blood Request',
    message:
      'City General Hospital & Trauma Centre requires 2 units of O- blood for an emergency patient. Distance is ~1.9 km. Are you available to donate?',
    type: 'DONOR_REQUEST',
    isRead: false,
    responseStatus: 'Pending',
    actionPayload: {
      bloodGroup: 'O-',
      unitsRequired: 2,
      hospitalName: 'City General Hospital & Trauma Centre',
      hospitalContact: '+91 98111 22201',
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  });

  // Request 2 (Suspicious Flag Example for Admin Dashboard review)
  const req2Id = '654000000000000000000002';
  memoryStore.bloodRequests.push({
    _id: req2Id,
    hospitalUserId: hospital1Id,
    hospitalName: 'City General Hospital & Trauma Centre',
    bloodGroup: 'AB+',
    unitsRequired: 45, // Abnormally high quantity for single hospital request
    urgency: URGENCY_LEVELS.HIGH,
    status: REQUEST_STATUS.PENDING,
    patientNotes: 'Mass inventory restock inquiry',
    location: {
      latitude: 28.6139,
      longitude: 77.209,
      address: 'Plot 42, Health City Avenue',
      city: 'New Delhi',
    },
    contactPhone: '+91 98111 22201',
    searchRadiusKm: 50,
    notifiedDonors: [],
    contactedBloodBanks: [],
    aiTriage: {
      urgencyScore: 40,
      scarcityFactor: 'Surplus',
      suggestedAction:
        'Flagged for administrative review: requested units (45) exceed standard single patient protocol.',
    },
    isSuspicious: true,
    suspicionReason:
      'Unusually large single request (45 units). Protocol recommends verifying patient admission records.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });

  // System Audit Logs
  memoryStore.auditLogs.push(
    {
      id: 1,
      action: 'SYSTEM_BOOT',
      details: 'LifeLink AI platform core initialized with medical screening compliance.',
      timestamp: new Date('2026-10-14T06:00:00Z'),
    },
    {
      id: 2,
      action: 'HOSPITAL_VERIFIED',
      details: 'City General Hospital verified by Dr. Vikram Malhotra.',
      timestamp: new Date('2026-10-14T06:05:00Z'),
    },
    {
      id: 3,
      action: 'SUSPICIOUS_REQUEST_FLAGGED',
      details: 'Request 654...0002 flagged by automated screening filter (45 units).',
      timestamp: new Date('2026-10-14T08:00:00Z'),
    }
  );

  console.log('[LifeLink AI] Pre-seeded smart memory store populated successfully.');
};

// Auto initialize once on load
initializeMemoryStore();

// ================= Data Store Abstraction API =================

const dataStore = {
  // Users
  async findUserByEmail(email) {
    if (getIsConnected()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return (
      memoryStore.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      ) || null
    );
  },

  async findUserById(id) {
    const idStr = String(id);
    if (getIsConnected()) {
      return await User.findById(idStr);
    }
    return memoryStore.users.find((u) => String(u._id) === idStr) || null;
  },

  async getAllUsers() {
    if (getIsConnected()) {
      return await User.find().select('-password');
    }
    return memoryStore.users.map(({ password, ...u }) => u);
  },

  async createUser(userData) {
    const id = getIsConnected()
      ? undefined
      : '650' + Math.random().toString(16).slice(2, 23);

    if (getIsConnected()) {
      return await User.create(userData);
    }
    const newUser = {
      _id: id,
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  async updateUserVerification(userId, status, reason = '') {
    const idStr = String(userId);
    if (getIsConnected()) {
      return await User.findByIdAndUpdate(
        idStr,
        { verificationStatus: status, rejectionReason: reason },
        { new: true }
      );
    }
    const user = memoryStore.users.find((u) => String(u._id) === idStr);
    if (user) {
      user.verificationStatus = status;
      user.rejectionReason = reason;
      user.updatedAt = new Date();
    }
    return user;
  },

  // Donor Profiles
  async findDonorByUserId(userId) {
    const idStr = String(userId);
    if (getIsConnected()) {
      return await DonorProfile.findOne({ userId: idStr }).populate(
        'userId',
        'name email phone verificationStatus'
      );
    }
    const profile = memoryStore.donorProfiles.find(
      (p) => String(p.userId) === idStr
    );
    if (!profile) return null;
    const user = memoryStore.users.find((u) => String(u._id) === idStr);
    return {
      ...profile,
      userId: user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            verificationStatus: user.verificationStatus,
          }
        : null,
    };
  },

  async createDonorProfile(profileData) {
    if (getIsConnected()) {
      return await DonorProfile.create(profileData);
    }
    const newProfile = {
      _id: '653' + Math.random().toString(16).slice(2, 23),
      ...profileData,
      donationCount: profileData.donationCount || 0,
      donationHistory: profileData.donationHistory || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.donorProfiles.push(newProfile);
    return newProfile;
  },

  async updateDonorProfile(userId, updateData) {
    const idStr = String(userId);
    if (getIsConnected()) {
      return await DonorProfile.findOneAndUpdate(
        { userId: idStr },
        updateData,
        { new: true }
      );
    }
    const idx = memoryStore.donorProfiles.findIndex(
      (p) => String(p.userId) === idStr
    );
    if (idx !== -1) {
      memoryStore.donorProfiles[idx] = {
        ...memoryStore.donorProfiles[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      return memoryStore.donorProfiles[idx];
    }
    return null;
  },

  async getAllDonors() {
    if (getIsConnected()) {
      return await DonorProfile.find().populate(
        'userId',
        'name email phone verificationStatus isActive'
      );
    }
    return memoryStore.donorProfiles.map((p) => {
      const u = memoryStore.users.find((u) => String(u._id) === String(p.userId));
      return {
        ...p,
        userId: u
          ? {
              _id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              verificationStatus: u.verificationStatus,
              isActive: u.isActive,
            }
          : null,
      };
    });
  },

  // Hospital Profiles
  async findHospitalByUserId(userId) {
    const idStr = String(userId);
    if (getIsConnected()) {
      return await HospitalProfile.findOne({ userId: idStr });
    }
    return (
      memoryStore.hospitalProfiles.find((h) => String(h.userId) === idStr) || null
    );
  },

  async createHospitalProfile(hospitalData) {
    if (getIsConnected()) {
      return await HospitalProfile.create(hospitalData);
    }
    const newHosp = {
      _id: '651' + Math.random().toString(16).slice(2, 23),
      ...hospitalData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.hospitalProfiles.push(newHosp);
    return newHosp;
  },

  async getAllHospitals() {
    if (getIsConnected()) {
      return await HospitalProfile.find().populate(
        'userId',
        'name email phone verificationStatus'
      );
    }
    return memoryStore.hospitalProfiles.map((h) => {
      const u = memoryStore.users.find((u) => String(u._id) === String(h.userId));
      return {
        ...h,
        userId: u
          ? {
              _id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              verificationStatus: u.verificationStatus,
              isActive: u.isActive,
            }
          : null,
      };
    });
  },

  // Blood Bank Profiles
  async findBloodBankByUserId(userId) {
    const idStr = String(userId);
    if (getIsConnected()) {
      return await BloodBankProfile.findOne({ userId: idStr });
    }
    return (
      memoryStore.bloodBankProfiles.find((b) => String(b.userId) === idStr) || null
    );
  },

  async createBloodBankProfile(data) {
    if (getIsConnected()) {
      return await BloodBankProfile.create(data);
    }
    const newBank = {
      _id: '652' + Math.random().toString(16).slice(2, 23),
      ...data,
      lastInventoryUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.bloodBankProfiles.push(newBank);
    return newBank;
  },

  async getAllBloodBanks() {
    if (getIsConnected()) {
      return await BloodBankProfile.find().populate(
        'userId',
        'name email phone verificationStatus isActive'
      );
    }
    return memoryStore.bloodBankProfiles.map((b) => {
      const u = memoryStore.users.find((u) => String(u._id) === String(b.userId));
      return {
        ...b,
        userId: u
          ? {
              _id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              verificationStatus: u.verificationStatus,
              isActive: u.isActive,
            }
          : null,
      };
    });
  },

  async updateBloodBankInventory(userId, inventoryArray) {
    const idStr = String(userId);
    const now = new Date();
    if (getIsConnected()) {
      return await BloodBankProfile.findOneAndUpdate(
        { userId: idStr },
        { inventory: inventoryArray, lastInventoryUpdate: now },
        { new: true }
      );
    }
    const idx = memoryStore.bloodBankProfiles.findIndex(
      (b) => String(b.userId) === idStr
    );
    if (idx !== -1) {
      memoryStore.bloodBankProfiles[idx].inventory = inventoryArray;
      memoryStore.bloodBankProfiles[idx].lastInventoryUpdate = now;
      memoryStore.bloodBankProfiles[idx].updatedAt = now;
      return memoryStore.bloodBankProfiles[idx];
    }
    return null;
  },

  // Blood Requests
  async getAllBloodRequests() {
    if (getIsConnected()) {
      return await BloodRequest.find().sort({ createdAt: -1 });
    }
    return [...memoryStore.bloodRequests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  async findBloodRequestById(id) {
    const idStr = String(id);
    if (getIsConnected()) {
      return await BloodRequest.findById(idStr);
    }
    return (
      memoryStore.bloodRequests.find((r) => String(r._id) === idStr) || null
    );
  },

  async createBloodRequest(requestData) {
    if (getIsConnected()) {
      return await BloodRequest.create(requestData);
    }
    const newReq = {
      _id: '654' + Math.random().toString(16).slice(2, 23),
      ...requestData,
      notifiedDonors: requestData.notifiedDonors || [],
      contactedBloodBanks: requestData.contactedBloodBanks || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.bloodRequests.unshift(newReq);
    return newReq;
  },

  async updateBloodRequest(id, updateData) {
    const idStr = String(id);
    if (getIsConnected()) {
      return await BloodRequest.findByIdAndUpdate(idStr, updateData, {
        new: true,
      });
    }
    const idx = memoryStore.bloodRequests.findIndex(
      (r) => String(r._id) === idStr
    );
    if (idx !== -1) {
      memoryStore.bloodRequests[idx] = {
        ...memoryStore.bloodRequests[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      return memoryStore.bloodRequests[idx];
    }
    return null;
  },

  // Notifications
  async getNotificationsForUser(userId) {
    const idStr = String(userId);
    if (getIsConnected()) {
      return await Notification.find({ recipientUserId: idStr }).sort({
        createdAt: -1,
      });
    }
    return memoryStore.notifications
      .filter((n) => String(n.recipientUserId) === idStr)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async createNotification(notifData) {
    if (getIsConnected()) {
      return await Notification.create(notifData);
    }
    const newNotif = {
      _id: '655' + Math.random().toString(16).slice(2, 23),
      ...notifData,
      isRead: false,
      responseStatus: notifData.responseStatus || 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.notifications.unshift(newNotif);
    return newNotif;
  },

  async updateNotificationResponse(notifId, responseStatus) {
    const idStr = String(notifId);
    if (getIsConnected()) {
      return await Notification.findByIdAndUpdate(
        idStr,
        { responseStatus, isRead: true },
        { new: true }
      );
    }
    const notif = memoryStore.notifications.find((n) => String(n._id) === idStr);
    if (notif) {
      notif.responseStatus = responseStatus;
      notif.isRead = true;
      notif.updatedAt = new Date();
    }
    return notif;
  },

  // Audit Logs & Stats
  addAuditLog(action, details) {
    const log = {
      id: memoryStore.auditLogs.length + 1,
      action,
      details,
      timestamp: new Date(),
    };
    memoryStore.auditLogs.unshift(log);
    return log;
  },

  getAuditLogs() {
    return memoryStore.auditLogs.slice(0, 50);
  },
};

module.exports = dataStore;
