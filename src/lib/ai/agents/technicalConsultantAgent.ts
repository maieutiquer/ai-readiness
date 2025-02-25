import { BaseAgent, type AgentResult } from "./baseAgent";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export class TechnicalConsultantAgent extends BaseAgent {
  async analyze(data: FormValues): Promise<AgentResult> {
    const systemPrompt = `You are an expert Technical Consultant specializing in AI implementation. 
    Your task is to analyze a company's responses to an AI readiness assessment and recommend tools and technologies.
    Focus on their tech stack maturity, technical expertise, and data availability.
    
    Provide a score from 0-25 for the Systems Integration pillar based on their responses.
    
    IMPORTANT: If you need more information to provide a better assessment, include at most 1 follow-up question.
    
    Format your response as a JSON object with the following structure:
    {
      "insights": "A detailed analysis of the company's technical readiness for AI",
      "score": 0-25,
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
      "followUpQuestions": [
        {
          "question": "Your specific follow-up question here?",
          "context": "Why you're asking this question and how it will help your assessment"
        }
      ]
    }
    
    Only include the followUpQuestions field if you have a specific question that would help you provide a better assessment.
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.`;

    const userPrompt = `Please analyze the following company assessment data:
    ${JSON.stringify(data, null, 2)}`;

    const responseText = await this.generateResponse(systemPrompt, userPrompt);
    const jsonText = this.extractJsonFromResponse(responseText);

    try {
      const result = JSON.parse(jsonText) as AgentResult;

      // Add stable IDs to any follow-up questions
      if (result.followUpQuestions && result.followUpQuestions.length > 0) {
        // Generate a stable ID for each question
        result.followUpQuestions = result.followUpQuestions.map((q, index) => {
          // Create a stable ID that won't change between requests
          const uniqueId = `technical-consultant-q${index}`;
          return {
            ...q,
            id: uniqueId,
            answered: false,
          };
        });

        // Limit to just one question to simplify
        if (result.followUpQuestions.length > 1) {
          result.followUpQuestions = result.followUpQuestions.slice(0, 1);
        }
      }

      return result;
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

  protected getFollowUpSystemPrompt(): string {
    return `You are an expert Technical Consultant specializing in AI implementation.
    You've received an answer to a follow-up question you asked about the company's technical readiness for AI.
    
    Update your analysis based on this new information.
    
    Provide an updated score from 0-25 for the Systems Integration pillar based on all information available.
    
    Format your response as a JSON object with the following structure:
    {
      "insights": "A detailed analysis of the company's technical readiness for AI, incorporating the new information",
      "score": 0-25,
      "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
    }
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.`;
  }
}
