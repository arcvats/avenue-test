import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
});

export const createIdeaSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1, 'Idea name is required').max(200),
  description: z.string().optional(),
});

export const updateIntakeDataSchema = z.object({
  versionId: z.string(),
  problemStatement: z.string().min(10, 'Problem statement must be at least 10 characters'),
  targetCustomer: z.string().optional(),
  currentSolution: z.string().optional(),
  proposedSolution: z.string().optional(),
  uniqueValue: z.string().optional(),
  assumptions: z.array(z.string()).optional(),
  riskFactors: z.array(z.string()).optional(),
  founderExperience: z.string().optional(),
  domainExpertise: z.string().optional(),
  relevantSkills: z.array(z.string()).optional(),
});

export const updateMarketDataSchema = z.object({
  versionId: z.string(),
  totalAddressableMarket: z.string().optional(),
  serviceableMarket: z.string().optional(),
  targetMarket: z.string().optional(),
  marketTrends: z.string().optional(),
  regulatoryFactors: z.string().optional(),
});

export const addCompetitorSchema = z.object({
  marketDataId: z.string(),
  name: z.string().min(1, 'Competitor name is required'),
  description: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  marketShare: z.string().optional(),
  pricing: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

export const updateICPDataSchema = z.object({
  versionId: z.string(),
  demographics: z.string().optional(),
  psychographics: z.string().optional(),
  painPoints: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  currentBehaviors: z.array(z.string()).optional(),
  buyingProcess: z.string().optional(),
  decisionCriteria: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
  preferredChannels: z.array(z.string()).optional(),
});

export const createValidationTestSchema = z.object({
  versionId: z.string(),
  type: z.enum(['LANDING_PAGE', 'SURVEY', 'INTERVIEW', 'MVP', 'AD_CAMPAIGN', 'WAITLIST', 'PROTOTYPE_TEST', 'OTHER']),
  hypothesis: z.string().min(10, 'Hypothesis must be at least 10 characters'),
  channel: z.string().optional(),
  sampleSize: z.number().int().positive().optional(),
  successMetric: z.string().optional(),
  actualOutcome: z.string().optional(),
  notes: z.string().optional(),
  externalLinks: z.array(z.string().url()).optional(),
  isHardSignal: z.boolean().optional(),
});

export const updatePositioningDataSchema = z.object({
  versionId: z.string(),
  tagline: z.string().optional(),
  valueProposition: z.string().optional(),
  differentiators: z.array(z.string()).optional(),
  targetSegment: z.string().optional(),
  messagingFramework: z.string().optional(),
});

export const createShareLinkSchema = z.object({
  versionId: z.string(),
  artifactType: z.enum(['PROBLEM_BRIEF', 'MARKET_SNAPSHOT', 'ICP_MAP', 'VALIDATION_LOG', 'POSITIONING_PAGE', 'FINAL_MEMO']),
  password: z.string().optional(),
  expiresAt: z.date().optional(),
});
