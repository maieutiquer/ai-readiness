import { BaseAgent, type AgentResult } from "./baseAgent";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export class DataAnalystAgent extends BaseAgent {
  async analyze(data: FormValues): Promise<AgentResult> {
    const systemPrompt = `You are an expert Data Analyst specializing in AI readiness assessments. 
    Your task is to analyze a company's responses to an AI readiness assessment and identify data-related gaps and opportunities.
    Focus on their data availability, technical expertise, and current tech stack maturity.
    
    Provide a score from 0-25 for the Technology Readiness pillar based on their responses.
    
    Format your response as a JSON object with the following structure:
    {
      "insights": "A detailed analysis of the company's data readiness",
      "score": 0-25,
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
    }
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.`;

    const userPrompt = `Please analyze the following company assessment data:
    ${JSON.stringify(data, null, 2)}`;

    const responseText = await this.generateResponse(systemPrompt, userPrompt);
    const jsonText = this.extractJsonFromResponse(responseText);

    try {
      return JSON.parse(jsonText) as AgentResult;
    } catch (error) {
      console.error("Failed to parse Data Analyst response:", error);
      console.error("Raw response:", responseText);
      console.error("Extracted JSON:", jsonText);
      return {
        insights: "Error analyzing data readiness",
        score: 0,
        recommendations: ["Unable to analyze data readiness due to an error"],
      };
    }
  }
}
