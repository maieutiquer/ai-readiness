import { BaseAgent, type AgentResult } from "./baseAgent";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export class TechnicalConsultantAgent extends BaseAgent {
  async analyze(data: FormValues): Promise<AgentResult> {
    const systemPrompt = `You are an expert Technical Consultant specializing in AI integration.
    Your task is to analyze a company's responses to an AI readiness assessment and recommend specific tools and technologies.
    Focus on their industry, tech stack maturity, and technical expertise level.
    
    Provide a score from 0-25 for the Systems Integration pillar based on their responses.
    
    Format your response as a JSON object with the following structure:
    {
      "insights": "A detailed analysis of the company's technical readiness for AI integration",
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
      console.error("Failed to parse Technical Consultant response:", error);
      console.error("Raw response:", responseText);
      console.error("Extracted JSON:", jsonText);
      return {
        insights: "Error analyzing technical readiness",
        score: 0,
        recommendations: [
          "Unable to analyze technical readiness due to an error",
        ],
      };
    }
  }
}
