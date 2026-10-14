const express = require('express');
const router = express.Router();
const { evaluateTriageAssessment } = require('../services/aiTriageService');
const {
  RBC_COMPATIBILITY,
  SCREENING_INTERVALS_DAYS,
  MEDICAL_DISCLAIMER,
} = require('../config/constants');

/**
 * @route   POST /api/ai/triage
 * @desc    Get modular AI triage assessment, urgency rating & clinical outreach advice
 */
router.post('/triage', async (req, res) => {
  try {
    const { bloodGroup, unitsRequired, urgency, patientNotes } = req.body;

    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'bloodGroup is required for clinical triage calculation.',
      });
    }

    const assessment = await evaluateTriageAssessment({
      bloodGroup,
      unitsRequired: Number(unitsRequired) || 1,
      urgency: urgency || 'High',
      patientNotes: patientNotes || '',
    });

    return res.json({
      success: true,
      data: assessment,
      disclaimer: MEDICAL_DISCLAIMER,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'AI Triage evaluation error: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/ai/compatibility-guide
 * @desc    Get medical compatibility matrix and screening rule reference
 */
router.get('/compatibility-guide', (req, res) => {
  return res.json({
    success: true,
    compatibilityMatrix: RBC_COMPATIBILITY,
    screeningRules: {
      maleReferenceDays: SCREENING_INTERVALS_DAYS.MALE,
      femaleReferenceDays: SCREENING_INTERVALS_DAYS.FEMALE,
      note: 'Reference interval for whole-blood donation.',
    },
    disclaimer: MEDICAL_DISCLAIMER,
  });
});

module.exports = router;
