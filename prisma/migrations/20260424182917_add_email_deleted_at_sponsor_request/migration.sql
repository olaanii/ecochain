/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "SponsorRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SponsorRequest_userId_idx" ON "SponsorRequest"("userId");

-- CreateIndex
CREATE INDEX "SponsorRequest_status_idx" ON "SponsorRequest"("status");

-- CreateIndex
CREATE INDEX "SponsorRequest_createdAt_idx" ON "SponsorRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- AddForeignKey
ALTER TABLE "SponsorRequest" ADD CONSTRAINT "SponsorRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
