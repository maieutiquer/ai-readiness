// Scoring weights and calculations for AI readiness assessment

// Define weights for each category (adjust these based on importance)
export const CATEGORY_WEIGHTS = {
  companySize: 0.05,
  industry: 0.05,
  techStackMaturity: 0.15,
  dataAvailability: 0.2,
  budgetRange: 0.1,
  timelineExpectations: 0.05,
  technicalExpertiseLevel: 0.15,
  previousAiExperience: 0.1,
  mainBusinessChallenge: 0.05,
  priorityArea: 0.1,
};

// Scoring maps for each field
export const SCORE_MAPS = {
  // Company size - larger companies might have more resources
  companySize: {
    "1-10": 1,
    "11-50": 2,
    "51-200": 3,
    "201-500": 4,
    "501-1000": 5,
    "1000+": 5,
  },

  // Tech stack maturity - higher is better for AI adoption
  techStackMaturity: {
    "1 - Basic": 1,
    "2 - Developing": 2,
    "3 - Established": 3,
    "4 - Advanced": 4,
    "5 - Cutting-edge": 5,
  },

  // Data availability - more data options selected means higher score
  // This will be calculated based on number of selections

  // Budget range - higher budget enables more AI capabilities
  budgetRange: {
    "Under $10,000": 1,
    "$10,000 - $50,000": 2,
    "$50,000 - $100,000": 3,
    "$100,000 - $500,000": 4,
    "$500,000+": 5,
  },

  // Timeline - longer timelines allow for better implementation
  timelineExpectations: {
    "1-3 months": 2,
    "3-6 months": 3,
    "6-12 months": 4,
    "12+ months": 5,
    "Immediate results needed": 1,
  },

  // Technical expertise - higher is better
  technicalExpertiseLevel: {
    "1 - Minimal": 1,
    "2 - Basic": 2,
    "3 - Intermediate": 3,
    "4 - Advanced": 4,
    "5 - Expert": 5,
  },

  // Previous AI experience - boolean value
  previousAiExperience: {
    true: 5,
    false: 2,
  },

  // Industry scores - some industries have more AI adoption
  industry: {
    Technology: 5,
    Healthcare: 4,
    Finance: 4,
    Retail: 3,
    Manufacturing: 3,
    Education: 3,
    Government: 2,
    "Non-profit": 2,
    Other: 3,
  },
};

// Readiness level interpretations
export const READINESS_LEVELS = [
  {
    min: 0,
    max: 20,
    level: "Early Stage",
    description: "Your organization is in the early stages of AI readiness.",
  },
  {
    min: 21,
    max: 40,
    level: "Developing",
    description:
      "You're developing AI capabilities but have significant gaps to address before implementation.",
  },
  {
    min: 41,
    max: 60,
    level: "Prepared",
    description:
      "Your organization has the basic requirements for AI adoption but may need targeted improvements in specific areas.",
  },
  {
    min: 61,
    max: 80,
    level: "Advanced",
    description:
      "You have strong AI readiness with good technical expertise and data availability.",
  },
  {
    min: 81,
    max: 100,
    level: "Optimal",
    description:
      "Your organization is optimally positioned for AI implementation.",
  },
];

// Calculate score for array-type fields (checkboxes)
const calculateArrayFieldScore = (
  selectedItems: string[],
  totalPossibleItems: number,
): number => {
  if (totalPossibleItems === 0) return 0;
  // Scale from 1-5 based on percentage of items selected
  return Math.max(
    1,
    Math.min(5, Math.ceil((selectedItems.length / totalPossibleItems) * 5)),
  );
};

// Main scoring function
import { type FormValues } from "./formDefinitions";

export const calculateAiReadinessScore = (formData: FormValues) => {
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Calculate scores for each dimension
  const dimensionScores: Record<string, number> = {};

  // Score single-select fields
  for (const [field, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    if (
      field === "dataAvailability" ||
      field === "mainBusinessChallenge" ||
      field === "priorityArea"
    ) {
      continue; // Handle array fields separately
    }

    const fieldValue = String(formData[field as keyof FormValues]);
    const scoreMap = SCORE_MAPS[field as keyof typeof SCORE_MAPS];

    if (scoreMap && fieldValue in scoreMap) {
      const score = scoreMap[fieldValue as keyof typeof scoreMap] as number;
      const weightedScore = score * weight * 20; // Scale to 0-100

      dimensionScores[field] = score;
      totalScore += weightedScore;
      maxPossibleScore += 5 * weight * 20; // Max possible is 5 for each category
    }
  }

  // Score array fields
  const arrayFields = {
    dataAvailability: {
      items: formData.dataAvailability,
      totalItems: 5,
      weight: CATEGORY_WEIGHTS.dataAvailability,
    },
    mainBusinessChallenge: {
      items: formData.mainBusinessChallenge,
      totalItems: 6,
      weight: CATEGORY_WEIGHTS.mainBusinessChallenge,
    },
    priorityArea: {
      items: formData.priorityArea,
      totalItems: 6,
      weight: CATEGORY_WEIGHTS.priorityArea,
    },
  };

  for (const [field, { items, totalItems, weight }] of Object.entries(
    arrayFields,
  )) {
    const score = calculateArrayFieldScore(items, totalItems);
    const weightedScore = score * weight * 20;

    dimensionScores[field] = score;
    totalScore += weightedScore;
    maxPossibleScore += 5 * weight * 20;
  }

  // Normalize to 0-100 scale
  const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

  // Determine readiness level
  const readinessLevel =
    READINESS_LEVELS.find(
      (level) => normalizedScore >= level.min && normalizedScore <= level.max,
    ) || READINESS_LEVELS[0]; // Default to first level if no match found

  return {
    score: normalizedScore,
    dimensionScores,
    readinessLevel: readinessLevel!.level,
    description: readinessLevel!.description,
  };
};
