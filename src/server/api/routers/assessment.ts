import { formSchema } from "~/app/_components/form/formDefinitions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

// Extend the form schema to include the AI readiness score
const assessmentInputSchema = formSchema.extend({
  aiReadinessScore: z.number().optional(),
  aiReadinessLevel: z.string().optional(),
});

export const assessmentRouter = createTRPCRouter({
  create: publicProcedure
    .input(assessmentInputSchema)
    .mutation(async ({ input }) => {
      // Here you would typically save to database and/or process the assessment
      // For now, we'll return mock recommendations
      const recommendations = `Mock recommendations 
    ${JSON.stringify(input, null, 2)}`;

      return {
        success: true,
        data: {
          recommendations,
        },
      };
    }),
});
