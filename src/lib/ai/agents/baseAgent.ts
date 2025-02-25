import { ChatOpenAI } from "@langchain/openai";
import { env } from "~/env";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export interface AgentResult {
  insights: string;
  score: number;
  recommendations: string[];
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
