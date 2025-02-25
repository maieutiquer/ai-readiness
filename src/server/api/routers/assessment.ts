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

// Schema for follow-up question answers
const followUpAnswerSchema = z.object({
  formData: assessmentInputSchema,
  questionId: z.string(),
  answer: z.string(),
});

// Schema for multiple follow-up question answers
const multipleFollowUpAnswersSchema = z.object({
  formData: assessmentInputSchema,
  answers: z.record(z.string(), z.string()),
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

        // Get any follow-up questions from the agents
        const followUpQuestions = aiOrchestrator.getAllFollowUpQuestions();

        return {
          success: true,
          data: {
            recommendations: formattedRecommendations,
            aiReadinessScore: report.overallScore,
            aiReadinessLevel: report.readinessLevel,
            description: report.description,
            cached: false,
            followUpQuestions:
              followUpQuestions.length > 0 ? followUpQuestions : undefined,
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

  answerFollowUp: publicProcedure
    .input(z.union([followUpAnswerSchema, multipleFollowUpAnswersSchema]))
    .mutation(async ({ input }) => {
      try {
        console.log("Processing follow-up question answer(s)");

        // Initialize the AI orchestrator
        const aiOrchestrator = new AiOrchestrator();

        // Generate the AI readiness report first to populate the agent results
        const initialReport = await aiOrchestrator.generateAiReadinessReport(
          input.formData,
        );

        let updatedReport = initialReport; // Default to initial report if no answers processed
        let processedAnswers = 0;
        const errors: string[] = [];

        // Check if we're processing a single answer or multiple answers
        if ("answers" in input) {
          // Process multiple answers
          const answerCount = Object.keys(input.answers).length;
          console.log(`Processing ${answerCount} follow-up answers`);

          // Process each answer sequentially
          for (const [questionId, answer] of Object.entries(input.answers)) {
            try {
              updatedReport = await aiOrchestrator.processFollowUpAnswer(
                input.formData,
                questionId,
                answer,
              );
              processedAnswers++;
            } catch (error) {
              console.error(
                `Error processing answer for question ${questionId}:`,
                error,
              );
              errors.push(
                `Failed to process answer for question ${questionId}: ${error instanceof Error ? error.message : String(error)}`,
              );
              // Continue with other answers even if one fails
            }
          }

          // If no answers were processed successfully, throw an error
          if (processedAnswers === 0) {
            throw new Error(
              `Failed to process any answers. Errors: ${errors.join("; ")}`,
            );
          }

          // Log warning if some answers failed
          if (errors.length > 0) {
            console.warn(
              `Processed ${processedAnswers}/${answerCount} answers. Some answers failed:`,
              errors,
            );
          }
        } else {
          // Process a single answer (backward compatibility)
          updatedReport = await aiOrchestrator.processFollowUpAnswer(
            input.formData,
            input.questionId,
            input.answer,
          );
          processedAnswers = 1;
        }

        // Format the recommendations as a string
        const formattedRecommendations = `
# AI adoption strategy based on assessment results


## Pillar Scores
- Technology Readiness: ${updatedReport.pillars.technologyReadiness}/25
- Leadership Alignment: ${updatedReport.pillars.leadershipAlignment}/25
- Actionable Strategy: ${updatedReport.pillars.actionableStrategy}/25
- Systems Integration: ${updatedReport.pillars.systemsIntegration}/25

## Recommendations
${updatedReport.recommendations}
`;

        // Get the agent results from the orchestrator
        const agentResults = {
          dataAnalyst: aiOrchestrator.getDataAnalystResult(),
          strategyAdvisor: aiOrchestrator.getStrategyAdvisorResult(),
          technicalConsultant: aiOrchestrator.getTechnicalConsultantResult(),
        };

        // Save the updated assessment and report to the database
        const assessmentService = new AssessmentService();
        await assessmentService.saveAssessment(
          input.formData,
          agentResults,
          updatedReport,
          formattedRecommendations,
        );

        // Get any remaining follow-up questions from the agents
        const followUpQuestions = aiOrchestrator.getAllFollowUpQuestions();

        return {
          success: true,
          data: {
            recommendations: formattedRecommendations,
            aiReadinessScore: updatedReport.overallScore,
            aiReadinessLevel: updatedReport.readinessLevel,
            description: updatedReport.description,
            cached: false,
            followUpQuestions:
              followUpQuestions.length > 0 ? followUpQuestions : undefined,
          },
        };
      } catch (error) {
        console.error("Error processing follow-up question answer:", error);
        return {
          success: false,
          error: "Failed to process follow-up question answer",
          data: {
            recommendations: "An error occurred while processing your answer.",
            aiReadinessScore: 0,
            aiReadinessLevel: "Error",
            description: "An error occurred while processing your answer.",
            cached: false,
          },
        };
      }
    }),
});
