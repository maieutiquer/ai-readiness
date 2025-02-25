import { BaseAgent, type AgentResult } from "./baseAgent";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export interface AgentResults {
  dataAnalyst: AgentResult;
  strategyAdvisor: AgentResult;
  technicalConsultant: AgentResult;
}

export interface ReportResult {
  overallScore: number;
  readinessLevel: string;
  description: string;
  pillars: {
    technologyReadiness: number;
    leadershipAlignment: number;
    actionableStrategy: number;
    systemsIntegration: number;
  };
  recommendations: string;
}

export class ReportGeneratorAgent extends BaseAgent {
  async generateReport(
    data: FormValues,
    agentResults: {
      dataAnalyst: AgentResult;
      strategyAdvisor: AgentResult;
      technicalConsultant: AgentResult;
    },
  ): Promise<ReportResult> {
    try {
      // Check if any follow-up questions were answered
      const hasAnsweredFollowUps =
        agentResults.dataAnalyst.followUpQuestions?.some(
          (q) => q.answered && q.answer,
        ) ||
        false ||
        agentResults.strategyAdvisor.followUpQuestions?.some(
          (q) => q.answered && q.answer,
        ) ||
        false ||
        agentResults.technicalConsultant.followUpQuestions?.some(
          (q) => q.answered && q.answer,
        ) ||
        false;

      // Count how many follow-up questions were answered
      const answeredQuestionCount =
        (agentResults.dataAnalyst.followUpQuestions?.filter(
          (q) => q.answered && q.answer,
        ).length || 0) +
        (agentResults.strategyAdvisor.followUpQuestions?.filter(
          (q) => q.answered && q.answer,
        ).length || 0) +
        (agentResults.technicalConsultant.followUpQuestions?.filter(
          (q) => q.answered && q.answer,
        ).length || 0);

      console.log(
        `Generating report with ${answeredQuestionCount} answered follow-up questions`,
      );

      // Create the system prompt
      const systemPrompt = `You are an AI Readiness Report Generator. Your task is to analyze the results from three specialized AI agents and create a comprehensive AI readiness report.

The report should include:
1. An overall AI readiness score (0-100)
2. A readiness level classification
3. A brief description of what the score means
4. Scores for four key pillars: Technology Readiness, Leadership Alignment, Actionable Strategy, and Systems Integration
5. Actionable recommendations based on the insights from all three agents

${
  hasAnsweredFollowUps
    ? `
Include a section titled "INSIGHTS FROM FOLLOW-UP QUESTIONS" that explicitly mentions each follow-up question that was answered and how the answer influenced your recommendations.
${answeredQuestionCount > 1 ? `IMPORTANT: Multiple follow-up questions (${answeredQuestionCount}) were answered. Make sure to address ALL of them in your analysis, not just the last one.` : ""}
`
    : ""
}

Format your response as a JSON object with the following structure:
{
  "overallScore": number, // 0-100
  "readinessLevel": string, // "Beginner", "Developing", "Established", "Advanced", or "Leading"
  "description": string, // Brief explanation of what the score means
  "pillars": {
    "technologyReadiness": number, // 0-25
    "leadershipAlignment": number, // 0-25
    "actionableStrategy": number, // 0-25
    "systemsIntegration": number // 0-25
  },
  "recommendations": string // Markdown-formatted recommendations
}

The sum of the four pillar scores should equal the overall score.`;

      // Create the user prompt
      const userPrompt = `Please generate an AI readiness report based on the following assessment data and agent insights:

ASSESSMENT DATA:
${JSON.stringify(data, null, 2)}

DATA ANALYST INSIGHTS:
${agentResults.dataAnalyst.insights}
Score: ${agentResults.dataAnalyst.score}/100
Recommendations: ${agentResults.dataAnalyst.recommendations.join(", ")}

STRATEGY ADVISOR INSIGHTS:
${agentResults.strategyAdvisor.insights}
Score: ${agentResults.strategyAdvisor.score}/100
Recommendations: ${agentResults.strategyAdvisor.recommendations.join(", ")}

TECHNICAL CONSULTANT INSIGHTS:
${agentResults.technicalConsultant.insights}
Score: ${agentResults.technicalConsultant.score}/100
Recommendations: ${agentResults.technicalConsultant.recommendations.join(", ")}

${
  hasAnsweredFollowUps
    ? `
FOLLOW-UP QUESTIONS AND ANSWERS:
${this.formatFollowUpQuestionsAndAnswers(agentResults)}
`
    : ""
}

${
  answeredQuestionCount > 1
    ? `IMPORTANT: ${answeredQuestionCount} follow-up questions were answered. Please incorporate ALL of these answers into your analysis and recommendations, not just the last one.`
    : ""
}

Please provide a comprehensive AI readiness report with an overall score, readiness level, description, pillar scores, and actionable recommendations.`;

      // Call the OpenAI API
      const response = await this.generateResponse(systemPrompt, userPrompt);

      // Parse the response
      try {
        // Extract JSON from the response
        const jsonText = this.extractJsonFromResponse(response);
        const parsedResponse = JSON.parse(jsonText) as ReportResult;
        return parsedResponse;
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        console.error("Raw response:", response);
        throw new Error("Failed to parse the report generator response");
      }
    } catch (error) {
      console.error("Error in report generation:", error);
      throw error;
    }
  }

  private formatFollowUpQuestionsAndAnswers(agentResults: {
    dataAnalyst: AgentResult;
    strategyAdvisor: AgentResult;
    technicalConsultant: AgentResult;
  }): string {
    const formattedQuestions: string[] = [];

    // Data Analyst follow-up questions
    if (agentResults.dataAnalyst.followUpQuestions) {
      agentResults.dataAnalyst.followUpQuestions
        .filter((q) => q.answered && q.answer)
        .forEach((q) => {
          formattedQuestions.push(
            `Data Analyst Question: ${q.question}\nContext: ${q.context}\nAnswer: ${q.answer}`,
          );
        });
    }

    // Strategy Advisor follow-up questions
    if (agentResults.strategyAdvisor.followUpQuestions) {
      agentResults.strategyAdvisor.followUpQuestions
        .filter((q) => q.answered && q.answer)
        .forEach((q) => {
          formattedQuestions.push(
            `Strategy Advisor Question: ${q.question}\nContext: ${q.context}\nAnswer: ${q.answer}`,
          );
        });
    }

    // Technical Consultant follow-up questions
    if (agentResults.technicalConsultant.followUpQuestions) {
      agentResults.technicalConsultant.followUpQuestions
        .filter((q) => q.answered && q.answer)
        .forEach((q) => {
          formattedQuestions.push(
            `Technical Consultant Question: ${q.question}\nContext: ${q.context}\nAnswer: ${q.answer}`,
          );
        });
    }

    return formattedQuestions.join("\n\n");
  }

  // This method is required by the BaseAgent abstract class but not used directly
  async analyze(_data: FormValues): Promise<AgentResult> {
    throw new Error("Use generateReport method instead");
  }
}
