/**
 * On-chain indexer worker — syncs events from blockchain to Postgres
 * Intended to run as a Vercel Cron or Fly.io background process
 */

import { registerWorker, type JobData } from "../queue";
import { prisma } from "@/lib/prisma/client";
import { createPublicClient, http, parseAbi } from "viem";

const EcoRewardABI = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event RewardsClaimed(address indexed user, uint256 amount, uint256 taskId)",
  "event StakeDeposited(address indexed user, uint256 amount, uint256 lockPeriod)",
  "event StakeWithdrawn(address indexed user, uint256 amount, uint256 reward)",
]);

const EcoVerifierABI = parseAbi([
  "event ProofSubmitted(bytes32 indexed proofHash, address indexed user, uint256 taskId)",
  "event ProofVerified(bytes32 indexed proofHash, address indexed oracle, uint256 reward)",
  "event ProofRejected(bytes32 indexed proofHash, address indexed oracle, string reason)",
]);

export function registerIndexerWorker(): void {
  registerWorker("indexer:sync", async (data) => {
    const { fromBlock, toBlock, contract } = data;

    const rpcUrl = process.env.NEXT_PUBLIC_INITIA_RPC_URL || "http://localhost:8545";
    const client = createPublicClient({
      transport: http(rpcUrl),
    });

    // Get current block if not specified
    const latestBlock = toBlock ?? Number(await client.getBlockNumber());
    const startBlock = fromBlock ?? latestBlock - 1000; // Default: last 1000 blocks

    const rewardAddress = process.env.NEXT_PUBLIC_ECO_REWARD_ADDR;
    const verifierAddress = process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDR;

    if (!rewardAddress || !verifierAddress) {
      console.warn("[Indexer] Contract addresses not configured, skipping sync");
      return;
    }

    // Fetch events
    const rewardLogs = await client.getLogs({
      address: rewardAddress as `0x${string}`,
      events: EcoRewardABI,
      fromBlock: BigInt(startBlock),
      toBlock: BigInt(latestBlock),
    });

    const verifierLogs = await client.getLogs({
      address: verifierAddress as `0x${string}`,
      events: EcoVerifierABI,
      fromBlock: BigInt(startBlock),
      toBlock: BigInt(latestBlock),
    });

    // Store events in database
    for (const log of rewardLogs) {
      await prisma.blockchainEvent.upsert({
        where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.logIndex } },
        create: {
          txHash: log.transactionHash,
          logIndex: log.logIndex,
          contract: rewardAddress,
          event: log.eventName || "Unknown",
          blockNumber: Number(log.blockNumber),
          data: JSON.stringify(log.args),
          processed: false,
        },
        update: {}, // No-op if exists
      });
    }

    for (const log of verifierLogs) {
      await prisma.blockchainEvent.upsert({
        where: { txHash_logIndex: { txHash: log.transactionHash, logIndex: log.logIndex } },
        create: {
          txHash: log.transactionHash,
          logIndex: log.logIndex,
          contract: verifierAddress,
          event: log.eventName || "Unknown",
          blockNumber: Number(log.blockNumber),
          data: JSON.stringify(log.args),
          processed: false,
        },
        update: {},
      });
    }

    console.log(`[Indexer] Synced ${rewardLogs.length} reward + ${verifierLogs.length} verifier events (blocks ${startBlock}-${latestBlock})`);

    // Process unprocessed events
    await processPendingEvents();
  });
}

async function processPendingEvents(): Promise<void> {
  const pending = await prisma.blockchainEvent.findMany({
    where: { processed: false },
    take: 100,
    orderBy: { blockNumber: "asc" },
  });

  for (const event of pending) {
    try {
      await processEvent(event);
      await prisma.blockchainEvent.update({
        where: { id: event.id },
        data: { processed: true, processedAt: new Date() },
      });
    } catch (err) {
      console.error(`[Indexer] Failed to process event ${event.id}:`, err);
    }
  }
}

async function processEvent(event: { id: string; event: string; data: string }): Promise<void> {
  const data = JSON.parse(event.data);

  switch (event.event) {
    case "RewardsClaimed":
      // Update user's reward total
      await prisma.rewardClaim.upsert({
        where: { txHash: event.id },
        create: {
          userId: data.user,
          amount: BigInt(data.amount),
          taskId: String(data.taskId),
          txHash: event.id,
          claimedAt: new Date(),
        },
        update: {},
      });
      break;

    case "ProofVerified":
      // Mark verification as on-chain confirmed
      await prisma.verification.updateMany({
        where: { proofHash: data.proofHash },
        data: { status: "confirmed", onChainConfirmed: true },
      });
      break;

    // Add more event handlers as needed
  }
}
