import { readFileSync } from "node:fs";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";
import { PrismaClient } from "@prisma/client";
import { rewardCatalog } from "../src/lib/data/eco.js";

type RewardSeedData = {
  id: string;
  title: string;
  subtitle: string;
  cost: number;
  partner: string;
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

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required for seeding. Copy .env.example to .env.local and point it at a real Postgres instance.",
  );
}

const prisma = new PrismaClient();

async function seedRewards() {
  try {
    console.log("Starting reward offerings seeding...");
    console.log(`Found ${rewardCatalog.length} reward offerings to seed`);

    for (const reward of rewardCatalog) {
      const existingReward = await prisma.rewardOffering.findFirst({
        where: { title: reward.title },
      });

      if (existingReward) {
        console.log(`Reward "${reward.title}" already exists, updating...`);
        await prisma.rewardOffering.update({
          where: { id: existingReward.id },
          data: {
            title: reward.title,
            description: reward.subtitle,
            cost: reward.cost,
            partner: reward.partner,
            category: "general",
            available: true,
          },
        });
      } else {
        console.log(`Creating reward "${reward.title}"...`);
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
    }

    const totalRewards = await prisma.rewardOffering.count();
    console.log(`✓ Reward seeding complete. Total rewards in database: ${totalRewards}`);
  } catch (error) {
    console.error("Reward seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRewards()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
