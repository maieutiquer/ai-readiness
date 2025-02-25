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
    const questions: FollowUpQuestionWithAgent[] = [];

    if (this.dataAnalystResult?.followUpQuestions) {
      questions.push(
        ...this.dataAnalystResult.followUpQuestions.map((q) => ({
          ...q,
          agentType: "dataAnalyst" as AgentType,
        })),
      );
    }

    if (this.strategyAdvisorResult?.followUpQuestions) {
      questions.push(
        ...this.strategyAdvisorResult.followUpQuestions.map((q) => ({
          ...q,
          agentType: "strategyAdvisor" as AgentType,
        })),
      );
    }

    if (this.technicalConsultantResult?.followUpQuestions) {
      questions.push(
        ...this.technicalConsultantResult.followUpQuestions.map((q) => ({
          ...q,
          agentType: "technicalConsultant" as AgentType,
        })),
      );
    }

    // Only return questions that haven't been answered yet
    return questions.filter((q) => !q.answered);
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
    const question = allQuestions.find((q) => q.id === questionId);

    if (!question) {
      console.error(`Question with ID ${questionId} not found`);
      throw new Error(`Question with ID ${questionId} not found`);
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
