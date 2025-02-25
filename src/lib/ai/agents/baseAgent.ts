import { ChatOpenAI } from "@langchain/openai";
import { env } from "~/env";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export interface AgentResult {
  insights: string;
  score: number;
  recommendations: string[];
  followUpQuestions?: FollowUpQuestion[];
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  context: string;
  answered: boolean;
  answer?: string;
}

export abstract class BaseAgent {
  protected model: ChatOpenAI;

  constructor(modelName: string = "gpt-4o-mini") {
    this.model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName,
      temperature: 0.2,
    });
  }

  abstract analyze(data: FormValues): Promise<AgentResult>;

  /**
   * Process a follow-up question answer and update the analysis
   */
  async processFollowUpAnswer(
    data: FormValues,
    questionId: string,
    answer: string,
    previousResult: AgentResult,
  ): Promise<AgentResult> {
    // Find the question that was answered
    const question = previousResult.followUpQuestions?.find(
      (q) => q.id === questionId,
    );

    if (!question) {
      console.error(`Question with ID ${questionId} not found`);
      return previousResult;
    }

    // Mark the question as answered and store the answer
    question.answered = true;
    question.answer = answer;

    // Generate an updated analysis with the new information
    const systemPrompt = this.getFollowUpSystemPrompt();

    const userPrompt = `
    Original assessment data:
    ${JSON.stringify(data, null, 2)}
    
    Previous analysis:
    ${JSON.stringify(previousResult, null, 2)}
    
    Follow-up question: ${question.question}
    Context: ${question.context}
    User's answer: ${answer}
    
    Please provide an updated analysis based on this additional information.
    `;

    const responseText = await this.generateResponse(systemPrompt, userPrompt);
    const jsonText = this.extractJsonFromResponse(responseText);

    try {
      const updatedResult = JSON.parse(jsonText) as AgentResult;

      // Preserve the follow-up questions from the previous result
      // but update the one that was just answered
      updatedResult.followUpQuestions = previousResult.followUpQuestions?.map(
        (q) => {
          if (q.id === questionId) {
            return question;
          }
          return q;
        },
      );

      return updatedResult;
    } catch (error) {
      console.error("Failed to parse follow-up response:", error);
      console.error("Raw response:", responseText);
      console.error("Extracted JSON:", jsonText);
      return previousResult;
    }
  }

  /**
   * Get the system prompt for follow-up question processing
   * Can be overridden by specific agents
   */
  protected getFollowUpSystemPrompt(): string {
    return `You are an AI agent analyzing a company's AI readiness. 
    You've received an answer to a follow-up question you asked.
    
    Update your analysis based on this new information.
    
    IMPORTANT: Explicitly reference the user's answer in your insights and at least one recommendation.
    Make it very clear how the additional information has changed or refined your analysis.
    Begin your insights with "Based on your answer about..." or similar phrasing to acknowledge the follow-up information.
    
    Format your response as a JSON object with the following structure:
    {
      "insights": "A detailed analysis that explicitly references the user's answer to the follow-up question",
      "score": 0-25,
      "recommendations": ["recommendation1 that references the follow-up answer", "recommendation2", "recommendation3"]
    }
    
    IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.`;
  }

  protected async generateResponse(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const response = await this.model.invoke([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ]);

    // Handle the response content as a string
    if (typeof response.content === "string") {
      return response.content;
    } else if (Array.isArray(response.content)) {
      // If it's an array of content parts, join them
      return response.content
        .map((part) => {
          if (typeof part === "string") {
            return part;
          } else if (
            typeof part === "object" &&
            part !== null &&
            "text" in part
          ) {
            return String(part.text);
          }
          return "";
        })
        .join("");
    }

    // Fallback
    return String(response.content);
  }

  // Helper method to extract JSON from a string that might be wrapped in Markdown code blocks
  protected extractJsonFromResponse(text: string): string {
    // Check if the response is wrapped in a Markdown code block
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = text.match(jsonRegex);

    if (match && match[1]) {
      // Return the content inside the code block
      return match[1].trim();
    }

    // If no code block is found, return the original text
    return text.trim();
  }
}
