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
    agentResults: AgentResults,
  ): Promise<ReportResult> {
    const systemPrompt = `You are an expert Report Generator specializing in AI readiness assessments.
    Your task is to compile the findings from multiple AI agents into a comprehensive, structured report.
    
    Based on the overall score, determine the readiness level:
    - 0-20: "Early Stage" - Limited AI readiness with significant gaps
    - 21-40: "Developing" - Beginning to build AI capabilities but with major challenges
    - 41-60: "Advancing" - Moderate AI readiness with some key elements in place
    - 61-80: "Established" - Strong foundation for AI adoption with minor gaps
    - 81-100: "Leading" - Excellent AI readiness with robust capabilities
    
    Format your response as a JSON object with the following structure:
    {
      "overallScore": 0-100,
      "readinessLevel": "Early Stage|Developing|Advancing|Established|Leading",
      "description": "A detailed description of the company's overall AI readiness",
      "pillars": {
        "technologyReadiness": 0-25,
        "leadershipAlignment": 0-25,
        "actionableStrategy": 0-25,
        "systemsIntegration": 0-25
      },
      "recommendations": "Comprehensive, structured recommendations based on all agent findings"
    }
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.`;

    const userPrompt = `Please generate a comprehensive AI readiness report based on the following:
    
    Company Assessment Data:
    ${JSON.stringify(data, null, 2)}
    
    Data Analyst Findings:
    ${JSON.stringify(agentResults.dataAnalyst, null, 2)}
    
    Strategy Advisor Findings:
    ${JSON.stringify(agentResults.strategyAdvisor, null, 2)}
    
    Technical Consultant Findings:
    ${JSON.stringify(agentResults.technicalConsultant, null, 2)}`;

    const responseText = await this.generateResponse(systemPrompt, userPrompt);
    const jsonText = this.extractJsonFromResponse(responseText);

    try {
      return JSON.parse(jsonText) as ReportResult;
    } catch (error) {
      console.error("Failed to parse Report Generator response:", error);
      console.error("Raw response:", responseText);
      console.error("Extracted JSON:", jsonText);
      return {
        overallScore: 0,
        readinessLevel: "Error",
        description: "Error generating AI readiness report",
        pillars: {
          technologyReadiness: 0,
          leadershipAlignment: 0,
          actionableStrategy: 0,
          systemsIntegration: 0,
        },
        recommendations: "Unable to generate recommendations due to an error",
      };
    }
  }

  // This method is required by the BaseAgent abstract class but not used directly
  async analyze(_data: FormValues): Promise<AgentResult> {
    throw new Error("Use generateReport method instead");
  }
}
