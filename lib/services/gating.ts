import { prisma } from '@/lib/prisma';
import type { FlowMode, StepType } from '@prisma/client';

interface GateCheckResult {
  isGatePassed: boolean;
  requiredFields: string[];
  missingFields: string[];
  warnings: string[];
}

const STEP_ORDER: StepType[] = ['INTAKE', 'MARKET', 'ICP', 'VALIDATION', 'POSITIONING', 'SUMMARY'];

const REQUIRED_FIELDS_BY_FLOW: Record<FlowMode, Record<StepType, string[]>> = {
  FAST: {
    INTAKE: ['problemStatement'],
    MARKET: [],
    ICP: ['painPoints'],
    VALIDATION: ['atLeastOneTest'],
    POSITIONING: [],
    SUMMARY: [],
  },
  NORMAL: {
    INTAKE: ['problemStatement', 'targetCustomer', 'proposedSolution'],
    MARKET: ['competitors'],
    ICP: ['painPoints', 'demographics'],
    VALIDATION: ['atLeastTwoTests'],
    POSITIONING: ['valueProposition'],
    SUMMARY: [],
  },
  DETAILED: {
    INTAKE: ['problemStatement', 'targetCustomer', 'proposedSolution', 'uniqueValue', 'assumptions'],
    MARKET: ['competitors', 'targetMarket', 'marketTrends'],
    ICP: ['painPoints', 'demographics', 'psychographics', 'buyingProcess'],
    VALIDATION: ['atLeastThreeTests', 'diverseTestTypes'],
    POSITIONING: ['valueProposition', 'differentiators', 'messagingFramework'],
    SUMMARY: [],
  },
};

export class GatingService {

  static async checkGate(versionId: string, step: StepType): Promise<GateCheckResult> {
    const version = await prisma.ideaVersion.findUnique({
      where: { id: versionId },
      include: {
        intakeData: true,
        marketData: {
          include: {
            competitors: true,
          },
        },
        icpData: true,
        validationTests: true,
        positioningData: true,
      },
    });

    if (!version) {
      throw new Error('Version not found');
    }

    const requiredFields = REQUIRED_FIELDS_BY_FLOW[version.flowMode][step];
    const missingFields: string[] = [];
    const warnings: string[] = [];

    for (const field of requiredFields) {
      const isMissing = this.isFieldMissing(field, version);
      if (isMissing) {
        missingFields.push(field);
      }
    }

    const isGatePassed = missingFields.length === 0;

    await prisma.stepState.upsert({
      where: {
        versionId_step: {
          versionId,
          step,
        },
      },
      update: {
        isGatePassed,
        lastUpdated: new Date(),
      },
      create: {
        versionId,
        step,
        isGatePassed,
        isRequired: true,
      },
    });

    return {
      isGatePassed,
      requiredFields,
      missingFields,
      warnings,
    };
  }

  private static isFieldMissing(field: string, version: any): boolean {
    switch (field) {
      case 'problemStatement':
        return !version.intakeData?.problemStatement || version.intakeData.problemStatement.length < 10;
      case 'targetCustomer':
        return !version.intakeData?.targetCustomer;
      case 'proposedSolution':
        return !version.intakeData?.proposedSolution;
      case 'uniqueValue':
        return !version.intakeData?.uniqueValue;
      case 'assumptions':
        return !version.intakeData?.assumptions || version.intakeData.assumptions.length < 2;
      case 'competitors':
        return !version.marketData?.competitors || version.marketData.competitors.length === 0;
      case 'targetMarket':
        return !version.marketData?.targetMarket;
      case 'marketTrends':
        return !version.marketData?.marketTrends;
      case 'painPoints':
        return !version.icpData?.painPoints || version.icpData.painPoints.length < 2;
      case 'demographics':
        return !version.icpData?.demographics;
      case 'psychographics':
        return !version.icpData?.psychographics;
      case 'buyingProcess':
        return !version.icpData?.buyingProcess;
      case 'atLeastOneTest':
        return version.validationTests.length < 1;
      case 'atLeastTwoTests':
        return version.validationTests.length < 2;
      case 'atLeastThreeTests':
        return version.validationTests.length < 3;
      case 'diverseTestTypes':
        return new Set(version.validationTests.map((t: any) => t.type)).size < 2;
      case 'valueProposition':
        return !version.positioningData?.valueProposition;
      case 'differentiators':
        return !version.positioningData?.differentiators || version.positioningData.differentiators.length < 2;
      case 'messagingFramework':
        return !version.positioningData?.messagingFramework;
      default:
        return false;
    }
  }

  static async canProgressToStep(versionId: string, targetStep: StepType): Promise<boolean> {
    const targetIndex = STEP_ORDER.indexOf(targetStep);
    if (targetIndex === 0) return true;

    const previousStep = STEP_ORDER[targetIndex - 1];

    const stepState = await prisma.stepState.findUnique({
      where: {
        versionId_step: {
          versionId,
          step: previousStep,
        },
      },
    });

    return stepState?.isGatePassed || false;
  }

  static async getStepStatus(versionId: string): Promise<Record<StepType, boolean>> {
    const stepStates = await prisma.stepState.findMany({
      where: { versionId },
    });

    const status: Record<StepType, boolean> = {
      INTAKE: false,
      MARKET: false,
      ICP: false,
      VALIDATION: false,
      POSITIONING: false,
      SUMMARY: false,
    };

    stepStates.forEach(state => {
      status[state.step] = state.isGatePassed;
    });

    return status;
  }

  static getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      problemStatement: 'Problem Statement',
      targetCustomer: 'Target Customer',
      proposedSolution: 'Proposed Solution',
      uniqueValue: 'Unique Value',
      assumptions: 'Key Assumptions (at least 2)',
      competitors: 'At least one competitor',
      targetMarket: 'Target Market Size',
      marketTrends: 'Market Trends',
      painPoints: 'Pain Points (at least 2)',
      demographics: 'Demographics',
      psychographics: 'Psychographics',
      buyingProcess: 'Buying Process',
      atLeastOneTest: 'At least 1 validation test',
      atLeastTwoTests: 'At least 2 validation tests',
      atLeastThreeTests: 'At least 3 validation tests',
      diverseTestTypes: 'At least 2 different test types',
      valueProposition: 'Value Proposition',
      differentiators: 'Differentiators (at least 2)',
      messagingFramework: 'Messaging Framework',
    };
    return labels[field] || field;
  }
}
