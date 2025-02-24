import { z } from "zod";
import {
  COMPANY_SIZES,
  INDUSTRIES,
  TECH_STACK_MATURITY_LEVELS,
  DATA_AVAILABILITY_OPTIONS,
  BUDGETS,
  TIMELINES,
  TECHNICAL_EXPERTISE_LEVELS,
  MAIN_BUSINESS_CHALLENGES,
  PRIORITY_AREAS,
} from "./constants";

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
