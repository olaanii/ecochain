-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "initiaAddress" TEXT NOT NULL,
    "initiaUsername" TEXT,
    "username" TEXT,
    "displayName" TEXT,
    "region" TEXT,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "totalRewards" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "badges" JSONB NOT NULL DEFAULT '[]',
    "lastTaskAt" TIMESTAMP(3),
    "preferences" JSONB,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "verificationHint" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "baseReward" INTEGER NOT NULL,
    "bonusFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "verificationMethod" TEXT NOT NULL,
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proofHash" TEXT NOT NULL,
    "proofType" TEXT NOT NULL,
    "proofData" JSONB,
    "geoHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reward" INTEGER NOT NULL DEFAULT 0,
    "oracleSource" TEXT,
    "oracleConfidence" DOUBLE PRECISION,
    "transactionHash" TEXT,
    "metadata" JSONB,
    "ipfsHash" TEXT,
    "fraudScore" DOUBLE PRECISION,
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "transactionHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardOffering" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "partner" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BridgeRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "denom" TEXT NOT NULL,
    "sourceChain" TEXT NOT NULL,
    "targetChain" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transactionId" TEXT,
    "transactionLink" TEXT,
    "trackingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BridgeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaoProposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "proposer" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "votesFor" INTEGER NOT NULL,
    "votesAgainst" INTEGER NOT NULL,
    "votesAbstain" INTEGER NOT NULL DEFAULT 0,
    "quorum" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "executionTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DaoProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "apy" DOUBLE PRECISION NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "accruedRewards" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "voucherCode" TEXT,
    "transactionHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "support" TEXT NOT NULL,
    "reason" TEXT,
    "votingPower" INTEGER NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalExecution" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionHash" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "ProposalExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_initiaAddress_key" ON "User"("initiaAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_initiaAddress_idx" ON "User"("initiaAddress");

-- CreateIndex
CREATE INDEX "User_totalRewards_idx" ON "User"("totalRewards");

-- CreateIndex
CREATE INDEX "User_level_idx" ON "User"("level");

-- CreateIndex
CREATE INDEX "User_region_idx" ON "User"("region");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Task_slug_key" ON "Task"("slug");

-- CreateIndex
CREATE INDEX "Task_category_idx" ON "Task"("category");

-- CreateIndex
CREATE INDEX "Task_active_idx" ON "Task"("active");

-- CreateIndex
CREATE INDEX "Task_baseReward_idx" ON "Task"("baseReward");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_proofHash_key" ON "Verification"("proofHash");

-- CreateIndex
CREATE INDEX "Verification_userId_idx" ON "Verification"("userId");

-- CreateIndex
CREATE INDEX "Verification_taskId_idx" ON "Verification"("taskId");

-- CreateIndex
CREATE INDEX "Verification_taskId_userId_idx" ON "Verification"("taskId", "userId");

-- CreateIndex
CREATE INDEX "Verification_status_idx" ON "Verification"("status");

-- CreateIndex
CREATE INDEX "Verification_verifiedAt_idx" ON "Verification"("verifiedAt");

-- CreateIndex
CREATE INDEX "Verification_createdAt_idx" ON "Verification"("createdAt");

-- CreateIndex
CREATE INDEX "Verification_fraudScore_idx" ON "Verification"("fraudScore");

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_idx" ON "LedgerEntry"("userId");

-- CreateIndex
CREATE INDEX "LedgerEntry_type_idx" ON "LedgerEntry"("type");

-- CreateIndex
CREATE INDEX "LedgerEntry_createdAt_idx" ON "LedgerEntry"("createdAt");

-- CreateIndex
CREATE INDEX "RewardOffering_category_idx" ON "RewardOffering"("category");

-- CreateIndex
CREATE INDEX "RewardOffering_available_idx" ON "RewardOffering"("available");

-- CreateIndex
CREATE INDEX "RewardOffering_cost_idx" ON "RewardOffering"("cost");

-- CreateIndex
CREATE INDEX "RewardOffering_expiresAt_idx" ON "RewardOffering"("expiresAt");

-- CreateIndex
CREATE INDEX "BridgeRequest_userId_idx" ON "BridgeRequest"("userId");

-- CreateIndex
CREATE INDEX "BridgeRequest_status_idx" ON "BridgeRequest"("status");

-- CreateIndex
CREATE INDEX "BridgeRequest_createdAt_idx" ON "BridgeRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DaoProposal_title_key" ON "DaoProposal"("title");

-- CreateIndex
CREATE INDEX "Stake_userId_idx" ON "Stake"("userId");

-- CreateIndex
CREATE INDEX "Stake_status_idx" ON "Stake"("status");

-- CreateIndex
CREATE INDEX "Stake_createdAt_idx" ON "Stake"("createdAt");

-- CreateIndex
CREATE INDEX "Redemption_userId_idx" ON "Redemption"("userId");

-- CreateIndex
CREATE INDEX "Redemption_rewardId_idx" ON "Redemption"("rewardId");

-- CreateIndex
CREATE INDEX "Redemption_redeemedAt_idx" ON "Redemption"("redeemedAt");

-- CreateIndex
CREATE INDEX "Redemption_status_idx" ON "Redemption"("status");

-- CreateIndex
CREATE INDEX "Vote_userId_idx" ON "Vote"("userId");

-- CreateIndex
CREATE INDEX "Vote_proposalId_idx" ON "Vote"("proposalId");

-- CreateIndex
CREATE INDEX "Vote_votedAt_idx" ON "Vote"("votedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_proposalId_key" ON "Vote"("userId", "proposalId");

-- CreateIndex
CREATE INDEX "ProposalExecution_proposalId_idx" ON "ProposalExecution"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalExecution_status_idx" ON "ProposalExecution"("status");

-- CreateIndex
CREATE INDEX "ProposalExecution_executedAt_idx" ON "ProposalExecution"("executedAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BridgeRequest" ADD CONSTRAINT "BridgeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "RewardOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "DaoProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalExecution" ADD CONSTRAINT "ProposalExecution_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "DaoProposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
