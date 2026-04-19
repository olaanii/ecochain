import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

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
    // No local env file present
  }
};

loadEnvFile(".env.local");
loadEnvFile(".env");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for testing.");
}

const prisma = new PrismaClient();

async function testSeed() {
  try {
    console.log("🧪 Testing database seed...\n");

    // Test Tasks
    console.log("📋 Checking Tasks...");
    const taskCount = await prisma.task.count();
    console.log(`   Found ${taskCount} tasks`);

    if (taskCount > 0) {
      const tasks = await prisma.task.findMany({ take: 5 });
      tasks.forEach((task) => {
        console.log(`   ✓ ${task.name} (${task.category}) - ${task.baseReward} base reward`);
      });
    } else {
      console.log("   ⚠ No tasks found");
    }

    // Test Reward Offerings
    console.log("\n🎁 Checking Reward Offerings...");
    const rewardCount = await prisma.rewardOffering.count();
    console.log(`   Found ${rewardCount} reward offerings`);

    if (rewardCount > 0) {
      const rewards = await prisma.rewardOffering.findMany({ take: 5 });
      rewards.forEach((reward) => {
        console.log(`   ✓ ${reward.title} (${reward.partner}) - ${reward.cost} cost`);
      });
    } else {
      console.log("   ⚠ No rewards found");
    }

    // Test Users
    console.log("\n👥 Checking Users...");
    const userCount = await prisma.user.count();
    console.log(`   Found ${userCount} users`);

    if (userCount > 0) {
      const users = await prisma.user.findMany({ take: 3 });
      users.forEach((user) => {
        console.log(`   ✓ ${user.displayName} (${user.region}) - ${user.streakDays} day streak`);
      });
    }

    // Test Verifications
    console.log("\n✅ Checking Verifications...");
    const verificationCount = await prisma.verification.count();
    console.log(`   Found ${verificationCount} verifications`);

    // Test DAO Proposals
    console.log("\n🗳️  Checking DAO Proposals...");
    const proposalCount = await prisma.daoProposal.count();
    console.log(`   Found ${proposalCount} proposals`);

    if (proposalCount > 0) {
      const proposals = await prisma.daoProposal.findMany({ take: 3 });
      proposals.forEach((proposal) => {
        console.log(`   ✓ ${proposal.title} (${proposal.status})`);
      });
    }

    // Test Ledger Entries
    console.log("\n📊 Checking Ledger Entries...");
    const ledgerCount = await prisma.ledgerEntry.count();
    console.log(`   Found ${ledgerCount} ledger entries`);

    // Test Bridge Requests
    console.log("\n🌉 Checking Bridge Requests...");
    const bridgeCount = await prisma.bridgeRequest.count();
    console.log(`   Found ${bridgeCount} bridge requests`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📈 Database Seed Summary:");
    console.log("=".repeat(50));
    console.log(`Tasks:              ${taskCount}`);
    console.log(`Rewards:            ${rewardCount}`);
    console.log(`Users:              ${userCount}`);
    console.log(`Verifications:      ${verificationCount}`);
    console.log(`DAO Proposals:      ${proposalCount}`);
    console.log(`Ledger Entries:     ${ledgerCount}`);
    console.log(`Bridge Requests:    ${bridgeCount}`);
    console.log("=".repeat(50));

    if (taskCount > 0 && rewardCount > 0) {
      console.log("\n✅ Seed test passed! Database is properly seeded.");
    } else {
      console.log("\n⚠️  Seed test incomplete. Run seed scripts to populate data.");
    }
  } catch (error) {
    console.error("❌ Seed test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testSeed()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
