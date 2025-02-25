import { DataAnalystAgent } from "./agents/dataAnalystAgent";
import { StrategyAdvisorAgent } from "./agents/strategyAdvisorAgent";
import { TechnicalConsultantAgent } from "./agents/technicalConsultantAgent";
import {
  ReportGeneratorAgent,
  type ReportResult,
} from "./agents/reportGeneratorAgent";
import type { AgentResult } from "./agents/baseAgent";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export class AiOrchestrator {
  private dataAnalystAgent: DataAnalystAgent;
  private strategyAdvisorAgent: StrategyAdvisorAgent;
  private technicalConsultantAgent: TechnicalConsultantAgent;
  private reportGeneratorAgent: ReportGeneratorAgent;

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

      const dataAnalystResult = results[0];
      const strategyAdvisorResult = results[1];
      const technicalConsultantResult = results[2];

      // Generate the final report using the Report Generator Agent
      try {
        const report = await this.reportGeneratorAgent.generateReport(data, {
          dataAnalyst: dataAnalystResult,
          strategyAdvisor: strategyAdvisorResult,
          technicalConsultant: technicalConsultantResult,
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
