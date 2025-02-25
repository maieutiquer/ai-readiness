import { formSchema } from "~/app/_components/form/formDefinitions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { AiOrchestrator } from "~/lib/ai/aiOrchestrator";

// Extend the form schema to include the AI readiness score
const assessmentInputSchema = formSchema.extend({
  aiReadinessScore: z.number().optional(),
  aiReadinessLevel: z.string().optional(),
});

export const assessmentRouter = createTRPCRouter({
  create: publicProcedure
    .input(assessmentInputSchema)
    .mutation(async ({ input }) => {
      try {
        // Initialize the AI orchestrator
        const aiOrchestrator = new AiOrchestrator();

        // Generate the AI readiness report
        const report = await aiOrchestrator.generateAiReadinessReport(input);

        // Format the recommendations as a string
        const formattedRecommendations = `
# AI Readiness Assessment Report

## Overall Score: ${report.overallScore}/100
**Readiness Level: ${report.readinessLevel}**

${report.description}

## Pillar Scores
- Technology Readiness: ${report.pillars.technologyReadiness}/25
- Leadership Alignment: ${report.pillars.leadershipAlignment}/25
- Actionable Strategy: ${report.pillars.actionableStrategy}/25
- Systems Integration: ${report.pillars.systemsIntegration}/25

## Recommendations
${report.recommendations}
`;

        return {
          success: true,
          data: {
            recommendations: formattedRecommendations,
            aiReadinessScore: report.overallScore,
            aiReadinessLevel: report.readinessLevel,
            description: report.description,
          },
        };
      } catch (error) {
        console.error("Error generating AI readiness report:", error);
        return {
          success: false,
          error: "Failed to generate AI readiness report",
          data: {
            recommendations:
              "An error occurred while generating the AI readiness report.",
            aiReadinessScore: 0,
            aiReadinessLevel: "Error",
            description:
              "An error occurred while generating the AI readiness report.",
          },
        };
      }
    }),
});
