const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../services/dataStore');
const { ROLES, VERIFICATION_STATUS } = require('../config/constants');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'lifelink_ai_dev_secret_jwt_key_replace_me_123456789';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Donor, Hospital, or Blood Bank)
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, profileData } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required fields.',
      });
    }

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Supported: ${Object.values(ROLES).join(', ')}`,
      });
    }

    // Check if user already exists
    const existing = await dataStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Initial verification status
    const initialStatus =
      role === ROLES.DONOR || role === ROLES.ADMIN
        ? VERIFICATION_STATUS.VERIFIED
        : VERIFICATION_STATUS.PENDING;

    // Create User record
    const newUser = await dataStore.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      phone: phone ? phone.trim() : '',
      verificationStatus: initialStatus,
      isActive: true,
    });

    let createdProfile = null;

    // Create role-specific profile
    if (role === ROLES.DONOR) {
      const p = profileData || {};
      createdProfile = await dataStore.createDonorProfile({
        userId: newUser._id,
        bloodGroup: p.bloodGroup || 'O+',
        gender: p.gender || 'Male',
        age: Number(p.age) || 25,
        currentArea: p.currentArea || 'Metro City Center',
        location: {
          latitude: Number(p.latitude) || 28.6139,
          longitude: Number(p.longitude) || 77.209,
        },
        lastDonationDate: p.lastDonationDate ? new Date(p.lastDonationDate) : null,
        availabilityStatus: p.availabilityStatus !== false,
        receiveRequests: p.receiveRequests !== false,
        consentShareContact: Boolean(p.consentShareContact),
        donationCount: Number(p.donationCount) || 0,
      });
    } else if (role === ROLES.HOSPITAL) {
      const p = profileData || {};
      createdProfile = await dataStore.createHospitalProfile({
        userId: newUser._id,
        hospitalName: p.hospitalName || name,
        licenseNumber: p.licenseNumber || 'PENDING-LIC-REG',
        address: p.address || 'Medical Enclave',
        city: p.city || 'Metro City',
        contactPerson: p.contactPerson || name,
        emergencyContact: p.emergencyContact || phone || '+91 99999 00000',
        location: {
          latitude: Number(p.latitude) || 28.6139,
          longitude: Number(p.longitude) || 77.209,
        },
      });
    } else if (role === ROLES.BLOOD_BANK) {
      const p = profileData || {};
      const defaultInventory = [
        { bloodGroup: 'O+', unitsAvailable: 10, componentType: 'Whole Blood' },
        { bloodGroup: 'O-', unitsAvailable: 2, componentType: 'Whole Blood' },
        { bloodGroup: 'A+', unitsAvailable: 8, componentType: 'Whole Blood' },
        { bloodGroup: 'A-', unitsAvailable: 2, componentType: 'Whole Blood' },
        { bloodGroup: 'B+', unitsAvailable: 8, componentType: 'Whole Blood' },
        { bloodGroup: 'B-', unitsAvailable: 1, componentType: 'Whole Blood' },
        { bloodGroup: 'AB+', unitsAvailable: 4, componentType: 'Whole Blood' },
        { bloodGroup: 'AB-', unitsAvailable: 1, componentType: 'Whole Blood' },
      ];

      createdProfile = await dataStore.createBloodBankProfile({
        userId: newUser._id,
        bloodBankName: p.bloodBankName || name,
        licenseNumber: p.licenseNumber || 'PENDING-BB-LIC',
        address: p.address || 'Healthcare Circle',
        city: p.city || 'Metro City',
        contactPhone: p.contactPhone || phone || '+91 99999 00000',
        contactEmail: p.contactEmail || email,
        operatingHours: p.operatingHours || '24/7 Emergency Service',
        location: {
          latitude: Number(p.latitude) || 28.6295,
          longitude: Number(p.longitude) || 77.218,
        },
        inventory: p.inventory && p.inventory.length ? p.inventory : defaultInventory,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    dataStore.addAuditLog(
      'USER_REGISTERED',
      `New ${role.toUpperCase()} registered: ${newUser.email} (Status: ${initialStatus}).`
    );

    const safeUser = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      verificationStatus: newUser.verificationStatus,
    };

    return res.status(201).json({
      success: true,
      message:
        initialStatus === VERIFICATION_STATUS.PENDING
          ? 'Registration submitted! Your account is pending review by platform administrators.'
          : 'Registration successful! Welcome to LifeLink AI.',
      token,
      user: safeUser,
      profile: createdProfile,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during registration: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await dataStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    // Role check if user selected a specific login tab
    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({
        success: false,
        message: `Account is registered as "${user.role.toUpperCase()}", not "${requestedRole.toUpperCase()}". Please switch tabs or use the correct role.`,
      });
    }

    // Password verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Fetch corresponding profile
    let profile = null;
    if (user.role === ROLES.DONOR) {
      profile = await dataStore.findDonorByUserId(user._id);
    } else if (user.role === ROLES.HOSPITAL) {
      profile = await dataStore.findHospitalByUserId(user._id);
    } else if (user.role === ROLES.BLOOD_BANK) {
      profile = await dataStore.findBloodBankByUserId(user._id);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      verificationStatus: user.verificationStatus,
      rejectionReason: user.rejectionReason,
    };

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
      profile,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile and session info
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === ROLES.DONOR) {
      profile = await dataStore.findDonorByUserId(user._id);
    } else if (user.role === ROLES.HOSPITAL) {
      profile = await dataStore.findHospitalByUserId(user._id);
    } else if (user.role === ROLES.BLOOD_BANK) {
      profile = await dataStore.findBloodBankByUserId(user._id);
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      verificationStatus: user.verificationStatus,
      rejectionReason: user.rejectionReason,
    };

    return res.json({
      success: true,
      user: safeUser,
      profile,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile: ' + err.message,
    });
  }
});

module.exports = router;
