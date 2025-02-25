/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PrismaClient } from "@prisma/client";

// This file is just to check the Prisma client types
// It's not meant to be imported anywhere

// Check if the Assessment model exists
const _checkAssessment = (prisma: PrismaClient) => {
  return prisma.assessment.findMany();
};

// Check if the AiReport model exists
const _checkAiReport = (prisma: PrismaClient) => {
  return prisma.aiReport.findMany();
};
