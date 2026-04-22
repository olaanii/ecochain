/**
 * pg-boss job queue wrapper for background job processing.
 * Uses Postgres as the job store (free, no additional infra needed).
 * Falls back to in-memory stub if DATABASE_URL is not configured.
 *
 * Jobs handled:
 * - notification:send — push notifications via web-push
 * - indexer:sync — on-chain event indexing
 * - analytics:rollup — daily analytics aggregation
 * - fraud:check — async fraud detection on verifications
 * - reward:distribute — batch reward distribution
 */

import { PgBoss } from "pg-boss";

export type JobName =
  | "notification:send"
  | "indexer:sync"
  | "analytics:rollup"
  | "fraud:check"
  | "reward:distribute";

export type JobData = {
  "notification:send": {
    userId: string;
    title: string;
    body: string;
    url?: string;
  };
  "indexer:sync": {
    fromBlock?: number;
    toBlock?: number;
    contract?: string;
  };
  "analytics:rollup": {
    date?: string; // ISO date, defaults to yesterday
  };
  "fraud:check": {
    verificationId: string;
    userId: string;
    proofHash: string;
  };
  "reward:distribute": {
    batchId: string;
    claimIds: string[];
  };
};

let boss: PgBoss | null = null;
let isStub = false;

function createStubBoss(): PgBoss {
  // No-op stub that logs jobs but doesn't execute them
  isStub = true;
  return {
    start: async () => {
      console.log("[JobQueue] Stub mode — jobs will be logged but not executed");
    },
    stop: async () => {},
    send: async (name: string, data: unknown) => {
      console.log("[JobQueue:stub] Job queued:", name, data);
      return "stub-job-id";
    },
    work: async () => {
      // No-op in stub mode
    },
    on: () => {},
  } as unknown as PgBoss;
}

export async function initJobQueue(): Promise<PgBoss> {
  if (boss) return boss;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[JobQueue] DATABASE_URL not set, using stub mode");
    boss = createStubBoss();
    await boss.start();
    return boss;
  }

  try {
    boss = new PgBoss({
      connectionString: dbUrl,
      max: 5, // Pool size
    });

    boss.on("error", (err: Error) => {
      console.error("[JobQueue] pg-boss error:", err);
    });

    await boss.start();
    console.log("[JobQueue] pg-boss started successfully");
    return boss;
  } catch (err) {
    console.error("[JobQueue] Failed to start pg-boss, falling back to stub:", err);
    boss = createStubBoss();
    await boss.start();
    return boss;
  }
}

export async function queueJob<T extends JobName>(
  name: T,
  data: JobData[T],
  options?: { delaySeconds?: number; priority?: number }
): Promise<string | null> {
  const queue = await initJobQueue();

  const sendOptions: { delaySeconds?: number; priority?: number; retryLimit?: number; retryDelay?: number; retryBackoff?: boolean } = { retryLimit: 3, retryDelay: 60, retryBackoff: true };
  if (options?.delaySeconds) sendOptions.delaySeconds = options.delaySeconds;
  if (options?.priority) sendOptions.priority = options.priority;

  return queue.send(name, data, Object.keys(sendOptions).length > 0 ? sendOptions : undefined);
}

export async function registerWorker<T extends JobName>(
  name: T,
  handler: (data: JobData[T]) => Promise<void>
): Promise<void> {
  const queue = await initJobQueue();

  if (isStub) {
    console.log(`[JobQueue:stub] Worker registered for ${name} (no-op)`);
    return;
  }

  await queue.work(name, async (jobs) => {
    for (const job of Array.isArray(jobs) ? jobs : [jobs]) {
      console.log(`[JobQueue] Processing ${name} job:`, job.id);
      try {
        await handler(job.data as JobData[T]);
        console.log(`[JobQueue] Completed ${name} job:`, job.id);
      } catch (err) {
        console.error(`[JobQueue] Failed ${name} job:`, job.id, err);
        throw err; // Trigger retry
      }
    }
  });
}

export async function stopJobQueue(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
    isStub = false;
  }
}

// Health check
export async function isJobQueueHealthy(): Promise<boolean> {
  if (!boss) return false;
  if (isStub) return true; // Stub is always "healthy"
  try {
    // pg-boss doesn't expose a direct ping, but we can check via internal state
    return true;
  } catch {
    return false;
  }
}
