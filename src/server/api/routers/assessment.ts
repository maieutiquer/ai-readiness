import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// This should match your frontend form schema
const assessmentSchema = z.object({
  company_size: z.enum(["Small (1-50)", "Medium (51-500)", "Large (500+)"]),
  industry: z.enum(["Finance", "Healthcare", "Retail", "Technology", "Other"]),
  tech_maturity: z.number().min(1).max(5),
  data_availability: z.enum([
    "None",
    "Limited",
    "Structured",
    "Structured & Unstructured",
  ]),
  budget: z.enum(["< $50k", "$50k - $100k", "$100k - $500k", "$500k+"]),
  timeline: z.enum(["< 3 months", "3-6 months", "6-12 months", "12+ months"]),
  expertise_level: z.number().min(1).max(5),
  ai_experience: z.boolean(),
  priority_area: z.enum([
    "Customer Service",
    "Process Automation",
    "Decision Support",
    "Other",
  ]),
});

export const assessmentRouter = createTRPCRouter({
  create: publicProcedure
    .input(assessmentSchema)
    .mutation(async ({ input }) => {
      // Here you would typically save to database and/or process the assessment
      // For now, we'll return mock recommendations
      const recommendations = `Based on your assessment:
        - Company Size: ${input.company_size}
        - Industry: ${input.industry}
        - Tech Maturity: ${input.tech_maturity}
        We recommend focusing on ${input.priority_area} as your initial AI implementation area.`;

      return {
        success: true,
        data: {
          recommendations,
        },
      };
    }),
});
