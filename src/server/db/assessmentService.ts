/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { db } from "~/server/db";
import type { FormValues } from "~/app/_components/form/formDefinitions";
import { generateAssessmentHash } from "~/lib/utils";
import type { AgentResult } from "~/lib/ai/agents/baseAgent";
import type { ReportResult } from "~/lib/ai/agents/reportGeneratorAgent";
import type { PrismaClient } from "@prisma/client";

// Define interfaces for our return types
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
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db;
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
      // Check if the assessment already exists
      const existingAssessment = await this.prisma.assessment.findUnique({
        where: { inputHash },
        include: { aiReport: true },
      });

      if (existingAssessment) {
        // If it exists, update the AI report
        await this.prisma.aiReport.update({
          where: { id: existingAssessment.aiReport?.id },
          data: {
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
        });
      } else {
        // If it doesn't exist, create a new assessment and AI report
        await this.prisma.assessment.create({
          data: {
            inputHash,
            companySize: data.companySize,
            industry: data.industry,
            techStackMaturity: data.techStackMaturity,
            dataAvailability: data.dataAvailability,
            budgetRange: data.budgetRange || "",
            timelineExpectations: data.timelineExpectations || "",
            technicalExpertiseLevel: data.technicalExpertiseLevel || "",
            previousAiExperience: data.previousAiExperience || false,
            mainBusinessChallenge: data.mainBusinessChallenge || [],
            priorityArea: data.priorityArea || [],
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
                technicalConsultantScore:
                  agentResults.technicalConsultant.score,
                technicalConsultantRecommendations:
                  agentResults.technicalConsultant.recommendations,
                recommendations: report.recommendations,
                formattedReport,
              },
            },
          },
        });
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      throw error; // Re-throw to handle in the caller
    }
  }
}
