-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'COLLABORATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "FlowMode" AS ENUM ('FAST', 'NORMAL', 'DETAILED');

-- CreateEnum
CREATE TYPE "Persona" AS ENUM ('SOLO_FOUNDER', 'CONSULTANT', 'INDIE_MAKER');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('INTAKE', 'MARKET', 'ICP', 'VALIDATION', 'POSITIONING', 'SUMMARY');

-- CreateEnum
CREATE TYPE "ValidationTestType" AS ENUM ('LANDING_PAGE', 'SURVEY', 'INTERVIEW', 'MVP', 'AD_CAMPAIGN', 'WAITLIST', 'PROTOTYPE_TEST', 'OTHER');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('GO', 'CONDITIONAL_GO', 'NO_GO');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('PROBLEM_BRIEF', 'MARKET_SNAPSHOT', 'ICP_MAP', 'VALIDATION_LOG', 'POSITIONING_PAGE', 'FINAL_MEMO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "WorkspacePlan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdeaVersion" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "label" TEXT,
    "flowMode" "FlowMode" NOT NULL DEFAULT 'NORMAL',
    "persona" "Persona" NOT NULL DEFAULT 'SOLO_FOUNDER',
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "isPivot" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdeaVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepState" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "step" "StepType" NOT NULL,
    "isGatePassed" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StepState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeData" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "targetCustomer" TEXT,
    "currentSolution" TEXT,
    "proposedSolution" TEXT,
    "uniqueValue" TEXT,
    "assumptions" TEXT[],
    "riskFactors" TEXT[],
    "founderExperience" TEXT,
    "domainExpertise" TEXT,
    "relevantSkills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "totalAddressableMarket" TEXT,
    "serviceableMarket" TEXT,
    "targetMarket" TEXT,
    "marketTrends" TEXT,
    "regulatoryFactors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "marketDataId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "marketShare" TEXT,
    "pricing" TEXT,
    "url" TEXT,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSegment" (
    "id" TEXT NOT NULL,
    "marketDataId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT,
    "growth" TEXT,
    "characteristics" TEXT[],

    CONSTRAINT "MarketSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ICPData" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "demographics" TEXT,
    "psychographics" TEXT,
    "painPoints" TEXT[],
    "goals" TEXT[],
    "currentBehaviors" TEXT[],
    "buyingProcess" TEXT,
    "decisionCriteria" TEXT[],
    "budgetRange" TEXT,
    "preferredChannels" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ICPData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationTest" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "icpDataId" TEXT,
    "type" "ValidationTestType" NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "channel" TEXT,
    "sampleSize" INTEGER,
    "successMetric" TEXT,
    "actualOutcome" TEXT,
    "notes" TEXT,
    "externalLinks" TEXT[],
    "isHardSignal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidationTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceAttachment" (
    "id" TEXT NOT NULL,
    "validationTestId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositioningData" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "tagline" TEXT,
    "valueProposition" TEXT,
    "differentiators" TEXT[],
    "targetSegment" TEXT,
    "messagingFramework" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PositioningData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreRun" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "confidence" "ConfidenceLevel" NOT NULL,
    "recommendation" "Recommendation" NOT NULL,
    "problemClarityScore" DOUBLE PRECISION NOT NULL,
    "icpClarityScore" DOUBLE PRECISION NOT NULL,
    "marketSaturationScore" DOUBLE PRECISION NOT NULL,
    "demandSignalsScore" DOUBLE PRECISION NOT NULL,
    "founderMarketFitScore" DOUBLE PRECISION NOT NULL,
    "evidenceCompletenessScore" DOUBLE PRECISION NOT NULL,
    "explanationJson" JSONB NOT NULL,
    "inputsSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverrideLog" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "warningType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OverrideLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "artifactType" "ArtifactType" NOT NULL,
    "passwordHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT NOT NULL DEFAULT 'read',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "versionId" TEXT,
    "ideaId" TEXT,
    "userId" TEXT NOT NULL,
    "section" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventData" JSONB,
    "userId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "Idea_workspaceId_idx" ON "Idea"("workspaceId");

-- CreateIndex
CREATE INDEX "IdeaVersion_ideaId_idx" ON "IdeaVersion"("ideaId");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaVersion_ideaId_versionNumber_key" ON "IdeaVersion"("ideaId", "versionNumber");

-- CreateIndex
CREATE INDEX "StepState_versionId_idx" ON "StepState"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "StepState_versionId_step_key" ON "StepState"("versionId", "step");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeData_versionId_key" ON "IntakeData"("versionId");

-- CreateIndex
CREATE INDEX "IntakeData_versionId_idx" ON "IntakeData"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketData_versionId_key" ON "MarketData"("versionId");

-- CreateIndex
CREATE INDEX "MarketData_versionId_idx" ON "MarketData"("versionId");

-- CreateIndex
CREATE INDEX "Competitor_marketDataId_idx" ON "Competitor"("marketDataId");

-- CreateIndex
CREATE INDEX "MarketSegment_marketDataId_idx" ON "MarketSegment"("marketDataId");

-- CreateIndex
CREATE UNIQUE INDEX "ICPData_versionId_key" ON "ICPData"("versionId");

-- CreateIndex
CREATE INDEX "ICPData_versionId_idx" ON "ICPData"("versionId");

-- CreateIndex
CREATE INDEX "ValidationTest_versionId_idx" ON "ValidationTest"("versionId");

-- CreateIndex
CREATE INDEX "ValidationTest_icpDataId_idx" ON "ValidationTest"("icpDataId");

-- CreateIndex
CREATE INDEX "EvidenceAttachment_validationTestId_idx" ON "EvidenceAttachment"("validationTestId");

-- CreateIndex
CREATE UNIQUE INDEX "PositioningData_versionId_key" ON "PositioningData"("versionId");

-- CreateIndex
CREATE INDEX "PositioningData_versionId_idx" ON "PositioningData"("versionId");

-- CreateIndex
CREATE INDEX "ScoreRun_versionId_idx" ON "ScoreRun"("versionId");

-- CreateIndex
CREATE INDEX "ScoreRun_createdAt_idx" ON "ScoreRun"("createdAt");

-- CreateIndex
CREATE INDEX "OverrideLog_versionId_idx" ON "OverrideLog"("versionId");

-- CreateIndex
CREATE INDEX "OverrideLog_userId_idx" ON "OverrideLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_versionId_idx" ON "ShareLink"("versionId");

-- CreateIndex
CREATE INDEX "ShareLink_token_idx" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "Comment_versionId_idx" ON "Comment"("versionId");

-- CreateIndex
CREATE INDEX "Comment_ideaId_idx" ON "Comment"("ideaId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_idx" ON "AuditLog"("workspaceId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_workspaceId_idx" ON "AnalyticsEvent"("workspaceId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaVersion" ADD CONSTRAINT "IdeaVersion_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepState" ADD CONSTRAINT "StepState_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeData" ADD CONSTRAINT "IntakeData_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketData" ADD CONSTRAINT "MarketData_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_marketDataId_fkey" FOREIGN KEY ("marketDataId") REFERENCES "MarketData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketSegment" ADD CONSTRAINT "MarketSegment_marketDataId_fkey" FOREIGN KEY ("marketDataId") REFERENCES "MarketData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ICPData" ADD CONSTRAINT "ICPData_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationTest" ADD CONSTRAINT "ValidationTest_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidationTest" ADD CONSTRAINT "ValidationTest_icpDataId_fkey" FOREIGN KEY ("icpDataId") REFERENCES "ICPData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAttachment" ADD CONSTRAINT "EvidenceAttachment_validationTestId_fkey" FOREIGN KEY ("validationTestId") REFERENCES "ValidationTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositioningData" ADD CONSTRAINT "PositioningData_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreRun" ADD CONSTRAINT "ScoreRun_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverrideLog" ADD CONSTRAINT "OverrideLog_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverrideLog" ADD CONSTRAINT "OverrideLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "IdeaVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
