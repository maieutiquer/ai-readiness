import { DataAnalystAgent } from "./agents/dataAnalystAgent";
import { StrategyAdvisorAgent } from "./agents/strategyAdvisorAgent";
import { TechnicalConsultantAgent } from "./agents/technicalConsultantAgent";
import {
  ReportGeneratorAgent,
  type ReportResult,
} from "./agents/reportGeneratorAgent";
import type { AgentResult, FollowUpQuestion } from "./agents/baseAgent";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export type AgentType =
  | "dataAnalyst"
  | "strategyAdvisor"
  | "technicalConsultant";

export interface FollowUpQuestionWithAgent extends FollowUpQuestion {
  agentType: AgentType;
}

export class AiOrchestrator {
  private dataAnalystAgent: DataAnalystAgent;
  private strategyAdvisorAgent: StrategyAdvisorAgent;
  private technicalConsultantAgent: TechnicalConsultantAgent;
  private reportGeneratorAgent: ReportGeneratorAgent;

  // Store agent results for later retrieval
  private dataAnalystResult: AgentResult | null = null;
  private strategyAdvisorResult: AgentResult | null = null;
  private technicalConsultantResult: AgentResult | null = null;

  // Track if we've already processed a follow-up answer
  private hasProcessedFollowUp: boolean = false;
  // Track which questions have been answered
  private processedQuestionIds: Set<string> = new Set();

  constructor() {
    this.dataAnalystAgent = new DataAnalystAgent();
    this.strategyAdvisorAgent = new StrategyAdvisorAgent();
    this.technicalConsultantAgent = new TechnicalConsultantAgent();
    this.reportGeneratorAgent = new ReportGeneratorAgent();
  }

  async generateAiReadinessReport(data: FormValues): Promise<ReportResult> {
    try {
      // Run all specialized agents in parallel with individual error handling
      const results = await Promise.all([
        this.runAgentWithErrorHandling(
          () => this.dataAnalystAgent.analyze(data),
          "Data Analyst",
        ),
        this.runAgentWithErrorHandling(
          () => this.strategyAdvisorAgent.analyze(data),
          "Strategy Advisor",
        ),
        this.runAgentWithErrorHandling(
          () => this.technicalConsultantAgent.analyze(data),
          "Technical Consultant",
        ),
      ]);

      // Store the results for later retrieval
      this.dataAnalystResult = results[0];
      this.strategyAdvisorResult = results[1];
      this.technicalConsultantResult = results[2];

      // Generate the final report using the Report Generator Agent
      try {
        const report = await this.reportGeneratorAgent.generateReport(data, {
          dataAnalyst: this.dataAnalystResult,
          strategyAdvisor: this.strategyAdvisorResult,
          technicalConsultant: this.technicalConsultantResult,
        });

        return report;
      } catch (error) {
        console.error("Error in Report Generator:", error);
        return this.createErrorReport("Failed to generate the final report");
      }
    } catch (error) {
      console.error("Error in AI Orchestrator:", error);
      return this.createErrorReport(
        "An error occurred while processing the assessment",
      );
    }
  }

  /**
   * Get all follow-up questions from all agents
   */
  getAllFollowUpQuestions(): FollowUpQuestionWithAgent[] {
    // If we've already processed a follow-up answer, don't return any more questions
    if (this.hasProcessedFollowUp) {
      return [];
    }

    const questions: FollowUpQuestionWithAgent[] = [];

    if (this.dataAnalystResult?.followUpQuestions) {
      questions.push(
        ...this.dataAnalystResult.followUpQuestions
          .filter((q) => !this.processedQuestionIds.has(q.id))
          .map((q) => ({
            ...q,
            agentType: "dataAnalyst" as AgentType,
          })),
      );
    }

    if (this.strategyAdvisorResult?.followUpQuestions) {
      questions.push(
        ...this.strategyAdvisorResult.followUpQuestions
          .filter((q) => !this.processedQuestionIds.has(q.id))
          .map((q) => ({
            ...q,
            agentType: "strategyAdvisor" as AgentType,
          })),
      );
    }

    if (this.technicalConsultantResult?.followUpQuestions) {
      questions.push(
        ...this.technicalConsultantResult.followUpQuestions
          .filter((q) => !this.processedQuestionIds.has(q.id))
          .map((q) => ({
            ...q,
            agentType: "technicalConsultant" as AgentType,
          })),
      );
    }

    // Filter out questions that have been answered
    const unansweredQuestions = questions.filter((q) => !q.answered);

    // Filter out duplicate or similar questions
    const uniqueQuestions: FollowUpQuestionWithAgent[] = [];
    const questionTexts = new Set<string>();

    for (const question of unansweredQuestions) {
      // Normalize the question text for comparison (lowercase, remove punctuation)
      const normalizedText = question.question
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Check if we already have a similar question
      let isDuplicate = false;

      for (const existingText of questionTexts) {
        // Calculate similarity (simple check for now - if one contains the other)
        if (
          normalizedText.includes(existingText) ||
          existingText.includes(normalizedText) ||
          // Check for high word overlap
          this.calculateWordOverlap(normalizedText, existingText) > 0.7
        ) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        questionTexts.add(normalizedText);
        uniqueQuestions.push(question);
      }
    }

    return uniqueQuestions;
  }

  /**
   * Calculate word overlap between two strings
   * Returns a value between 0 and 1, where 1 means all words are shared
   */
  private calculateWordOverlap(text1: string, text2: string): number {
    const words1 = new Set(text1.split(" "));
    const words2 = new Set(text2.split(" "));

    // Count shared words
    let sharedCount = 0;
    for (const word of words1) {
      if (words2.has(word)) {
        sharedCount++;
      }
    }

    // Calculate overlap ratio
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    return totalUniqueWords > 0 ? sharedCount / totalUniqueWords : 0;
  }

  /**
   * Process a follow-up question answer
   */
  async processFollowUpAnswer(
    data: FormValues,
    questionId: string,
    answer: string,
  ): Promise<ReportResult> {
    // Find which agent the question belongs to
    const allQuestions = this.getAllFollowUpQuestions();
    let question = allQuestions.find((q) => q.id === questionId);

    // If question not found in current questions, try to determine the agent type from the ID
    if (!question) {
      console.log(
        `Question with ID ${questionId} not found in current questions, trying to determine agent type from ID`,
      );

      let agentType: AgentType | null = null;

      // Try to determine agent type from question ID
      if (questionId.startsWith("data-analyst")) {
        agentType = "dataAnalyst";
      } else if (questionId.startsWith("strategy-advisor")) {
        agentType = "strategyAdvisor";
      } else if (questionId.startsWith("technical-consultant")) {
        agentType = "technicalConsultant";
      }

      if (agentType) {
        // Create a placeholder question
        question = {
          id: questionId,
          question: "Unknown question",
          context:
            "This question was not found in the current list of questions",
          answered: false,
          answer: "",
          agentType: agentType,
        };
      } else {
        console.error(
          `Could not determine agent type for question ID ${questionId}`,
        );
        throw new Error(
          `Could not determine agent type for question ID ${questionId}`,
        );
      }
    }

    // Process the answer with the appropriate agent
    try {
      let updatedAgentResult: AgentResult;

      if (question.agentType === "dataAnalyst") {
        if (!this.dataAnalystResult) {
          throw new Error("Data Analyst result not available");
        }
        updatedAgentResult = await this.dataAnalystAgent.processFollowUpAnswer(
          data,
          questionId,
          answer,
          this.dataAnalystResult,
        );
        this.dataAnalystResult = updatedAgentResult;
      } else if (question.agentType === "strategyAdvisor") {
        if (!this.strategyAdvisorResult) {
          throw new Error("Strategy Advisor result not available");
        }
        updatedAgentResult =
          await this.strategyAdvisorAgent.processFollowUpAnswer(
            data,
            questionId,
            answer,
            this.strategyAdvisorResult,
          );
        this.strategyAdvisorResult = updatedAgentResult;
      } else if (question.agentType === "technicalConsultant") {
        if (!this.technicalConsultantResult) {
          throw new Error("Technical Consultant result not available");
        }
        updatedAgentResult =
          await this.technicalConsultantAgent.processFollowUpAnswer(
            data,
            questionId,
            answer,
            this.technicalConsultantResult,
          );
        this.technicalConsultantResult = updatedAgentResult;
      } else {
        throw new Error(`Unknown agent type: ${String(question.agentType)}`);
      }

      // Mark that we've processed a follow-up answer
      this.hasProcessedFollowUp = true;
      // Track this specific question as processed
      this.processedQuestionIds.add(questionId);

      // Generate an updated report with the new agent results
      const updatedReport = await this.reportGeneratorAgent.generateReport(
        data,
        {
          dataAnalyst: this.dataAnalystResult || {
            insights: "Data Analyst result not available",
            score: 0,
            recommendations: ["Unable to provide data analysis"],
          },
          strategyAdvisor: this.strategyAdvisorResult || {
            insights: "Strategy Advisor result not available",
            score: 0,
            recommendations: ["Unable to provide strategy advice"],
          },
          technicalConsultant: this.technicalConsultantResult || {
            insights: "Technical Consultant result not available",
            score: 0,
            recommendations: ["Unable to provide technical consultation"],
          },
        },
      );

      return updatedReport;
    } catch (error) {
      console.error("Error processing follow-up answer:", error);
      throw error;
    }
  }

  // Getter methods for agent results
  getDataAnalystResult(): AgentResult {
    if (!this.dataAnalystResult) {
      throw new Error("Data Analyst result not available");
    }
    return this.dataAnalystResult;
  }

  getStrategyAdvisorResult(): AgentResult {
    if (!this.strategyAdvisorResult) {
      throw new Error("Strategy Advisor result not available");
    }
    return this.strategyAdvisorResult;
  }

  getTechnicalConsultantResult(): AgentResult {
    if (!this.technicalConsultantResult) {
      throw new Error("Technical Consultant result not available");
    }
    return this.technicalConsultantResult;
  }

  private async runAgentWithErrorHandling(
    agentFn: () => Promise<AgentResult>,
    agentName: string,
  ): Promise<AgentResult> {
    try {
      return await agentFn();
    } catch (error) {
      console.error(`Error in ${agentName} agent:`, error);
      return {
        insights: `Error in ${agentName} analysis`,
        score: 0,
        recommendations: [
          `The ${agentName} encountered an error during analysis`,
        ],
      };
    }
  }

  private createErrorReport(errorMessage: string): ReportResult {
    return {
      overallScore: 0,
      readinessLevel: "Error",
      description: errorMessage,
      pillars: {
        technologyReadiness: 0,
        leadershipAlignment: 0,
        actionableStrategy: 0,
        systemsIntegration: 0,
      },
      recommendations:
        "Unable to generate recommendations due to an error. Please try again later.",
    };
  }
}
