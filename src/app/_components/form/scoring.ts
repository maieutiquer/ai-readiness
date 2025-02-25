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
// const calculateArrayFieldScore = (
//   selectedItems: string[],
//   totalPossibleItems: number,
// ): number => {
//   if (totalPossibleItems === 0) return 0;
//   // Scale from 1-5 based on percentage of items selected
//   return Math.max(
//     1,
//     Math.min(5, Math.ceil((selectedItems.length / totalPossibleItems) * 5)),
//   );
// };

// Main scoring function
import type { FormValues } from "./formDefinitions";

interface ScoringResult {
  score: number;
  readinessLevel: string;
  description: string;
}

export function calculateAiReadinessScore(_data: FormValues): ScoringResult {
  // This is a simplified scoring algorithm
  // In the real implementation, we'll use the AI agents to calculate the score

  // Default score for development/testing
  const score = 50;

  // Determine readiness level based on score
  let readinessLevel = "";
  let description = "";

  if (score >= 0 && score <= 20) {
    readinessLevel = "Early Stage";
    description =
      "Limited AI readiness with significant gaps across all pillars.";
  } else if (score > 20 && score <= 40) {
    readinessLevel = "Developing";
    description =
      "Beginning to build AI capabilities but with major challenges to address.";
  } else if (score > 40 && score <= 60) {
    readinessLevel = "Advancing";
    description =
      "Moderate AI readiness with some key elements in place and others needing development.";
  } else if (score > 60 && score <= 80) {
    readinessLevel = "Established";
    description =
      "Strong foundation for AI adoption with only minor gaps to address.";
  } else {
    readinessLevel = "Leading";
    description =
      "Excellent AI readiness with robust capabilities across all pillars.";
  }

  return {
    score,
    readinessLevel,
    description,
  };
}
