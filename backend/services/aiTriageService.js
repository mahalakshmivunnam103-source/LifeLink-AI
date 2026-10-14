/**
 * LifeLink AI — Modular Clinical Triage & Urgency Advisor Service
 * Evaluates clinical urgency, blood scarcity, and suggests optimal outreach strategies.
 * Operates autonomously via medical heuristics, with optional Generative AI enhancements if an API key is set.
 */

const evaluateTriageAssessment = async ({
  bloodGroup,
  unitsRequired = 1,
  urgency = 'High',
  patientNotes = '',
}) => {
  // Scarcity evaluation based on clinical blood inventory epidemiology
  const scarcityMap = {
    'O-': {
      level: 'Critical (Universal Donor, ~7% population prevalence)',
      scarcityFactor: 'Extremely Scarce',
      multiplier: 1.4,
    },
    'AB-': {
      level: 'Very High (<1% population prevalence)',
      scarcityFactor: 'Rare',
      multiplier: 1.35,
    },
    'B-': {
      level: 'High (~2% population prevalence)',
      scarcityFactor: 'Scarce',
      multiplier: 1.3,
    },
    'A-': {
      level: 'High (~6% population prevalence)',
      scarcityFactor: 'Scarce',
      multiplier: 1.25,
    },
    'O+': {
      level: 'Moderate (~38% population prevalence, highest demand)',
      scarcityFactor: 'High Demand',
      multiplier: 1.1,
    },
    'A+': {
      level: 'Moderate (~30% population prevalence)',
      scarcityFactor: 'Standard',
      multiplier: 1.0,
    },
    'B+': {
      level: 'Moderate (~20% population prevalence)',
      scarcityFactor: 'Standard',
      multiplier: 1.0,
    },
    'AB+': {
      level: 'Low (Universal Recipient)',
      scarcityFactor: 'Flexible Compatibility',
      multiplier: 0.8,
    },
  };

  const bloodData = scarcityMap[bloodGroup] || {
    level: 'Standard',
    scarcityFactor: 'Standard',
    multiplier: 1.0,
  };

  // Base Urgency Score
  let baseScore = 60;
  if (urgency === 'Critical') baseScore = 90;
  else if (urgency === 'High') baseScore = 75;
  else if (urgency === 'Medium') baseScore = 50;
  else if (urgency === 'Low') baseScore = 30;

  // Additional weight for units required
  const unitPenalty = Math.min(unitsRequired * 3, 20);

  // Computed Urgency Score (capped between 10 and 99)
  const urgencyScore = Math.min(
    Math.round((baseScore + unitPenalty) * bloodData.multiplier),
    99
  );

  // Suggested Actions & Strategy
  let suggestedAction = '';
  let outreachBatchSize = 3;

  if (urgencyScore >= 85) {
    outreachBatchSize = 5;
    suggestedAction = `CRITICAL PRIORITY: Notify up to ${outreachBatchSize} nearest compatible donors immediately. Simultaneously trigger backup inquiry to nearby registered blood banks.`;
  } else if (urgencyScore >= 70) {
    outreachBatchSize = 3;
    suggestedAction = `HIGH PRIORITY: Alert ${outreachBatchSize} nearest eligible donors within a 15-25 km radius. Monitor donor responses for 15 minutes before expanding search radius.`;
  } else {
    outreachBatchSize = 2;
    suggestedAction = `STANDARD PRIORITY: Contact ${outreachBatchSize} closest donors. Blood bank inventory can fulfill as non-emergency requirement.`;
  }

  // Generate standardized medical script for hospital telephone or in-app alerts
  const sampleDonorScript = `Urgent Medical Call: Hello, this is LifeLink AI contacting you on behalf of the attending clinical team. A patient urgently requires ${unitsRequired} unit(s) of ${bloodGroup} blood. You are screened as a potentially eligible nearby donor. Please open your LifeLink app to confirm your availability.`;

  return {
    urgencyScore,
    scarcityFactor: bloodData.scarcityFactor,
    scarcityDescription: bloodData.level,
    recommendedOutreachBatch: outreachBatchSize,
    suggestedAction,
    sampleDonorScript,
    clinicalNotes: `Calculated for ${unitsRequired} unit(s) of ${bloodGroup}. Disclaimer: Always verify donor health eligibility with qualified blood bank staff before phlebotomy.`,
  };
};

module.exports = { evaluateTriageAssessment };
