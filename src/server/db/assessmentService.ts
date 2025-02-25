import { db } from "~/server/db";
import type { FormValues } from "~/app/_components/form/formDefinitions";
import { generateAssessmentHash } from "~/lib/utils";
import type { AgentResult } from "~/lib/ai/agents/baseAgent";
import type { ReportResult } from "~/lib/ai/agents/reportGeneratorAgent";
import type { PrismaClient } from "@prisma/client";

// Define a custom type for the Prisma client with our models
interface ExtendedPrismaClient extends PrismaClient {
  assessment: {
    findUnique: (args: {
      where: { inputHash: string };
      include?: { aiReport: boolean };
    }) => Promise<{
      aiReport?: {
        formattedReport: string;
        overallScore: number;
        readinessLevel: string;
        description: string;
      };
    } | null>;
    create: (args: {
      data: {
        inputHash: string;
        companySize: string;
        industry: string;
        techStackMaturity: string;
        dataAvailability: string[];
        budgetRange: string;
        timelineExpectations: string;
        technicalExpertiseLevel: string;
        previousAiExperience: boolean;
        mainBusinessChallenge: string[];
        priorityArea: string[];
        aiReport: {
          create: {
            overallScore: number;
            readinessLevel: string;
            description: string;
            technologyReadiness: number;
            leadershipAlignment: number;
            actionableStrategy: number;
            systemsIntegration: number;
            dataAnalystInsights: string;
            dataAnalystScore: number;
            dataAnalystRecommendations: string[];
            strategyAdvisorInsights: string;
            strategyAdvisorScore: number;
            strategyAdvisorRecommendations: string[];
            technicalConsultantInsights: string;
            technicalConsultantScore: number;
            technicalConsultantRecommendations: string[];
            recommendations: string;
            formattedReport: string;
          };
        };
      };
    }) => Promise<unknown>;
  };
}

export interface AgentResults {
  dataAnalyst: AgentResult;
  strategyAdvisor: AgentResult;
  technicalConsultant: AgentResult;
}

export interface CachedReport {
  formattedReport: string;
  aiReadinessScore: number;
  aiReadinessLevel: string;
  description: string;
}

export class AssessmentService {
  private prisma: ExtendedPrismaClient;

  constructor() {
    // Cast the db to our extended type
    this.prisma = db as unknown as ExtendedPrismaClient;
  }

  /**
   * Checks if an assessment with the same input data already exists
   */
  async findExistingAssessment(data: FormValues): Promise<CachedReport | null> {
    const inputHash = generateAssessmentHash(data);

    try {
      const existingAssessment = await this.prisma.assessment.findUnique({
        where: { inputHash },
        include: { aiReport: true },
      });

      if (existingAssessment && existingAssessment.aiReport) {
        return {
          formattedReport: existingAssessment.aiReport.formattedReport,
          aiReadinessScore: existingAssessment.aiReport.overallScore,
          aiReadinessLevel: existingAssessment.aiReport.readinessLevel,
          description: existingAssessment.aiReport.description,
        };
      }
    } catch (error) {
      console.error("Error finding existing assessment:", error);
    }

    return null;
  }

  /**
   * Saves assessment data and AI report to the database
   */
  async saveAssessment(
    data: FormValues,
    agentResults: AgentResults,
    report: ReportResult,
    formattedReport: string,
  ): Promise<void> {
    const inputHash = generateAssessmentHash(data);

    try {
      await this.prisma.assessment.create({
        data: {
          inputHash,
          companySize: data.companySize,
          industry: data.industry,
          techStackMaturity: data.techStackMaturity,
          dataAvailability: data.dataAvailability,
          budgetRange: data.budgetRange,
          timelineExpectations: data.timelineExpectations,
          technicalExpertiseLevel: data.technicalExpertiseLevel,
          previousAiExperience: data.previousAiExperience,
          mainBusinessChallenge: data.mainBusinessChallenge,
          priorityArea: data.priorityArea,
          aiReport: {
            create: {
              overallScore: report.overallScore,
              readinessLevel: report.readinessLevel,
              description: report.description,
              technologyReadiness: report.pillars.technologyReadiness,
              leadershipAlignment: report.pillars.leadershipAlignment,
              actionableStrategy: report.pillars.actionableStrategy,
              systemsIntegration: report.pillars.systemsIntegration,
              dataAnalystInsights: agentResults.dataAnalyst.insights,
              dataAnalystScore: agentResults.dataAnalyst.score,
              dataAnalystRecommendations:
                agentResults.dataAnalyst.recommendations,
              strategyAdvisorInsights: agentResults.strategyAdvisor.insights,
              strategyAdvisorScore: agentResults.strategyAdvisor.score,
              strategyAdvisorRecommendations:
                agentResults.strategyAdvisor.recommendations,
              technicalConsultantInsights:
                agentResults.technicalConsultant.insights,
              technicalConsultantScore: agentResults.technicalConsultant.score,
              technicalConsultantRecommendations:
                agentResults.technicalConsultant.recommendations,
              recommendations: report.recommendations,
              formattedReport,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error saving assessment:", error);
      throw error; // Re-throw to handle in the caller
    }
  }
}
