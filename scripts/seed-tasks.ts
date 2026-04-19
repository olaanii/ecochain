import { readFileSync } from "node:fs";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";
import { PrismaClient } from "@prisma/client";
import { ecoTasks } from "../src/lib/data/eco.js";

type TaskSeedData = {
  id: string;
  name: string;
  description: string;
  verificationHint: string;
  baseReward: number;
  bonusMultiplier: number;
  category: "Transport" | "Recycling" | "Energy" | "Community";
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

async function seedTasks() {
  try {
    console.log("Starting task seeding...");
    console.log(`Found ${ecoTasks.length} tasks to seed`);

    const categoryMap: Record<string, string> = {
      Transport: "transit",
      Recycling: "recycling",
      Energy: "energy",
      Community: "community",
    };

    for (const task of ecoTasks) {
      const normalizedCategory = categoryMap[task.category] || task.category.toLowerCase();

      const existingTask = await prisma.task.findUnique({
        where: { slug: task.id },
      });

      if (existingTask) {
        console.log(`Task "${task.name}" already exists, updating...`);
        await prisma.task.update({
          where: { slug: task.id },
          data: {
            name: task.name,
            description: task.description,
            verificationHint: task.verificationHint,
            category: normalizedCategory,
            baseReward: task.baseReward,
            bonusFactor: task.bonusMultiplier,
            verificationMethod: "photo",
            active: true,
          },
        });
      } else {
        console.log(`Creating task "${task.name}"...`);
        await prisma.task.create({
          data: {
            id: createId(),
            slug: task.id,
            name: task.name,
            description: task.description,
            verificationHint: task.verificationHint,
            category: normalizedCategory,
            baseReward: task.baseReward,
            bonusFactor: task.bonusMultiplier,
            verificationMethod: "photo",
            active: true,
          },
        });
      }
    }

    const totalTasks = await prisma.task.count();
    console.log(`✓ Task seeding complete. Total tasks in database: ${totalTasks}`);
  } catch (error) {
    console.error("Task seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTasks()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
