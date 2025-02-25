import { formSchema } from "~/app/_components/form/formDefinitions";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { AiOrchestrator } from "~/lib/ai/aiOrchestrator";
import { AssessmentService } from "~/server/db/assessmentService";

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
        // Initialize the assessment service
        const assessmentService = new AssessmentService();

        // Check if we already have a cached result for this input
        const cachedReport =
          await assessmentService.findExistingAssessment(input);

        if (cachedReport) {
          console.log("Using cached AI readiness report");
          return {
            success: true,
            data: {
              recommendations: cachedReport.formattedReport,
              aiReadinessScore: cachedReport.aiReadinessScore,
              aiReadinessLevel: cachedReport.aiReadinessLevel,
              description: cachedReport.description,
              cached: true,
            },
          };
        }

        // If no cached result, generate a new report
        console.log("Generating new AI readiness report");

        // Initialize the AI orchestrator
        const aiOrchestrator = new AiOrchestrator();

        // Generate the AI readiness report
        const report = await aiOrchestrator.generateAiReadinessReport(input);

        // Format the recommendations as a string
        const formattedRecommendations = `
# AI adoption strategy based on assessment results


## Pillar Scores
- Technology Readiness: ${report.pillars.technologyReadiness}/25
- Leadership Alignment: ${report.pillars.leadershipAlignment}/25
- Actionable Strategy: ${report.pillars.actionableStrategy}/25
- Systems Integration: ${report.pillars.systemsIntegration}/25

## Recommendations
${report.recommendations}
`;

        // Get the agent results from the orchestrator
        const agentResults = {
          dataAnalyst: aiOrchestrator.getDataAnalystResult(),
          strategyAdvisor: aiOrchestrator.getStrategyAdvisorResult(),
          technicalConsultant: aiOrchestrator.getTechnicalConsultantResult(),
        };

        // Save the assessment and report to the database
        await assessmentService.saveAssessment(
          input,
          agentResults,
          report,
          formattedRecommendations,
        );

        return {
          success: true,
          data: {
            recommendations: formattedRecommendations,
            aiReadinessScore: report.overallScore,
            aiReadinessLevel: report.readinessLevel,
            description: report.description,
            cached: false,
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
            cached: false,
          },
        };
      }
    }),
});
