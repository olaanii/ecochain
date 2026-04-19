import { readFileSync } from "node:fs";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";
import { PrismaClient } from "@prisma/client";

import {
  daoProposals,
  ecoTasks,
  rewardCatalog,
} from "../src/lib/data/eco.js";
import { initiaSubmission } from "../src/lib/initia/submission.js";

type SampleUser = {
  clerkId: string;
  initiaAddress: string;
  initiaUsername: string;
  displayName: string;
  region: string;
  streakDays: number;
};

const loadEnvFile = (filename: string) => {
  try {
    const contents = readFileSync(path.resolve(process.cwd(), filename), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").trim().replace(/^"(.*)"$/, "$1");
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // No local env file present; fall back to already exported variables.
  }
};

loadEnvFile(".env.local");
loadEnvFile(".env");

const sampleUsers: SampleUser[] = [
  {
    clerkId: "clerk-lina",
    initiaAddress: "initia1lina",
    initiaUsername: "lina.init",
    displayName: "Lina M.",
    region: "Cape Town",
    streakDays: 42,
  },
  {
    clerkId: "clerk-mateo",
    initiaAddress: "initia1mateo",
    initiaUsername: "mateo.init",
    displayName: "Mateo V.",
    region: "Mexico City",
    streakDays: 31,
  },
  {
    clerkId: "clerk-aria",
    initiaAddress: "initia1aria",
    initiaUsername: "aria.init",
    displayName: "Aria K.",
    region: "Nairobi",
    streakDays: 28,
  },
  {
    clerkId: "clerk-sol",
    initiaAddress: "initia1sol",
    initiaUsername: "sol.init",
    displayName: "Sol T.",
    region: "Lisbon",
    streakDays: 24,
  },
];

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required for seeding. Copy .env.example to .env.local and point it at a real Postgres instance.",
  );
}

if (
  databaseUrl.includes("user:password@localhost") ||
  databaseUrl.includes("user@localhost") ||
  databaseUrl.includes("password@localhost")
) {
  throw new Error(
    "DATABASE_URL still points at the local placeholder. Update it to your Supabase, Planetscale, or managed Postgres instance before running npm run db:seed.",
  );
}

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Clearing existing data...");
    // Delete in reverse order of foreign key dependencies
    await prisma.bridgeRequest.deleteMany({});
    await prisma.ledgerEntry.deleteMany({});
    await prisma.verification.deleteMany({});
    await prisma.redemption.deleteMany({});
    await prisma.vote.deleteMany({});
    await prisma.proposalExecution.deleteMany({});
    await prisma.stake.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.rewardOffering.deleteMany({});
    await prisma.daoProposal.deleteMany({});
    await prisma.task.deleteMany({});

    console.log("Seeding tasks...");
    const createdTasks: Array<{ id: string; slug: string }> = [];
    for (const task of ecoTasks) {
      const taskId = createId();
      const createdTask = await prisma.task.create({
        data: {
          id: taskId,
          slug: task.id,
          name: task.name,
          description: task.description,
          verificationHint: task.verificationHint,
          category: task.category.toLowerCase(),
          baseReward: task.baseReward,
          bonusFactor: task.bonusMultiplier,
          verificationMethod: "photo",
          active: true,
        },
      });
      createdTasks.push({ id: createdTask.id, slug: createdTask.slug });
    }

    console.log("Seeding reward offerings...");
    for (const reward of rewardCatalog) {
      await prisma.rewardOffering.create({
        data: {
          id: createId(),
          title: reward.title,
          description: reward.subtitle,
          cost: reward.cost,
          partner: reward.partner,
          category: "general",
          available: true,
        },
      });
    }

    console.log("Seeding DAO proposals...");
    const now = new Date();
    const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    for (const proposal of daoProposals) {
      await prisma.daoProposal.create({
        data: {
          id: createId(),
          title: proposal.title,
          description: proposal.description,
          proposer: "system",
          status: proposal.status,
          votesFor: proposal.votesFor,
          votesAgainst: proposal.votesAgainst,
          votesAbstain: 0,
          quorum: 100,
          startTime,
          endTime,
        },
      });
    }

    console.log("Seeding sample users and verifications...");
    for (const [index, sample] of sampleUsers.entries()) {
      const user = await prisma.user.create({
        data: {
          id: createId(),
          clerkId: sample.clerkId,
          initiaAddress: sample.initiaAddress,
          initiaUsername: sample.initiaUsername,
          username: sample.initiaUsername,
          displayName: sample.displayName,
          region: sample.region,
          streakDays: sample.streakDays,
          totalRewards: 0,
          level: 1,
          badges: [],
        },
      });

      const task = createdTasks[index % createdTasks.length];
      const mintedAmount = 80 + index * 20;

      // Create verification record
      await prisma.verification.create({
        data: {
          id: createId(),
          taskId: task.id,
          userId: user.id,
          proofHash: `seed-${task.slug}-${index}`,
          proofType: "photo",
          status: "verified",
          reward: mintedAmount,
          oracleSource: "seeded-oracle",
          oracleConfidence: 0.85,
        },
      });

      // Create ledger entry
      await prisma.ledgerEntry.create({
        data: {
          id: createId(),
          userId: user.id,
          amount: mintedAmount,
          type: "mint",
          source: "seeded rewards",
        },
      });

      // Create bridge request
      await prisma.bridgeRequest.create({
        data: {
          id: createId(),
          userId: user.id,
          amount: 40 + index * 10,
          denom: "INITIA",
          sourceChain: process.env.NEXT_PUBLIC_INITIA_CHAIN_ID ?? initiaSubmission.chainId,
          targetChain: process.env.NEXT_PUBLIC_INITIA_CHAIN_ID ?? initiaSubmission.chainId,
          status: "completed",
          transactionLink: initiaSubmission.txnEvidence.replace("0xabc123", `seeded-${index}`),
        },
      });
    }

    console.log("Seeding complete.");
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
