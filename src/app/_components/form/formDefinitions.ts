import { z } from "zod";

// =========================================================
// Constants
// =========================================================

export const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1,000 employees",
  "1,001+ employees",
] as const;

export const INDUSTRIES = [
  "Healthcare",
  "Finance & Banking",
  "Retail & E-commerce",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Technology & Software",
  "Government & Public Sector",
  "Education",
  "Energy & Utilities",
  "Other",
] as const;

export const TECH_STACK_MATURITY_LEVELS = [
  "1 - No digital infrastructure (fully manual processes)",
  "2 - Basic (Some cloud tools, no AI usage)",
  "3 - Moderate (Using automation, but no AI models)",
  "4 - Advanced (Some AI models in production)",
  "5 - Highly mature (AI deeply integrated in operations)",
] as const;

export const DATA_AVAILABILITY_OPTIONS = [
  "We collect structured data (well-organized, databases, etc.)",
  "We collect unstructured data (documents, images, videos, etc.)",
  "We have real-time data streams (IoT, event-driven systems)",
  "We rely on third-party data providers",
  "We have little to no data collection",
] as const;

export const BUDGETS = [
  "Less than $10,000",
  "$10,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $500,000",
  "More than $500,000",
] as const;

export const TIMELINES = [
  "0-3 months (immediate implementation)",
  "3-6 months",
  "6-12 months",
  "12+ months (long-term plan)",
] as const;

export const TECHNICAL_EXPERTISE_LEVELS = [
  "1 - No in-house tech expertise",
  "2 - Some IT staff, but no AI/ML experience",
  "3 - Software team with basic AI/ML knowledge",
  "4 - AI specialists available, but limited experience",
  "5 - Strong AI/ML team with advanced capabilities",
] as const;

export const MAIN_BUSINESS_CHALLENGES = [
  "Reducing operational costs",
  "Increasing revenue and sales",
  "Improving customer experience",
  "Enhancing decision-making with AI insights",
  "Optimizing supply chain and logistics",
  "Automating repetitive tasks",
  "Other",
] as const;

export const PRIORITY_AREAS = [
  "Data-driven decision-making",
  "Process automation",
  "Customer service automation (e.g., chatbots, voice assistants)",
  "Predictive analytics (forecasting trends, risk assessment)",
  "AI-powered product innovation",
  "Other",
] as const;

// =========================================================
// Types
// =========================================================

export const formSchema = z.object({
  companySize: z.enum(COMPANY_SIZES),
  industry: z.enum(INDUSTRIES),
  techStackMaturity: z.enum(TECH_STACK_MATURITY_LEVELS),
  dataAvailability: z.array(z.enum(DATA_AVAILABILITY_OPTIONS)),
  budgetRange: z.enum(BUDGETS),
  timelineExpectations: z.enum(TIMELINES),
  technicalExpertiseLevel: z.enum(TECHNICAL_EXPERTISE_LEVELS),
  previousAiExperience: z.boolean(),
  mainBusinessChallenge: z.array(z.enum(MAIN_BUSINESS_CHALLENGES)),
  priorityArea: z.array(z.enum(PRIORITY_AREAS)),
});

export type FormValues = z.infer<typeof formSchema>;
