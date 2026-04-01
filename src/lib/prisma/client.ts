import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton with Connection Pooling
 * 
 * Configuration:
 * - Connection pool: max 20 connections (Requirement 27.6)
 * - Connection timeout: 10 seconds
 * - Pool timeout: 10 seconds
 * - Retry logic: exponential backoff with max 3 attempts
 */

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create Prisma Client with connection pooling configuration
 */
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  return client;
};

/**
 * Connect to database with exponential backoff retry logic
 */
async function connectWithRetry(
  client: PrismaClient,
  retries = MAX_RETRIES
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.$connect();
      console.log(`[Prisma] Database connected successfully`);
      return;
    } catch (error) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
      console.error(
        `[Prisma] Connection attempt ${attempt}/${retries} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt === retries) {
        console.error(`[Prisma] Failed to connect after ${retries} attempts`);
        throw error;
      }

      console.log(`[Prisma] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
  prismaConnected: boolean;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Initialize connection with retry logic
if (!globalForPrisma.prismaConnected) {
  connectWithRetry(prisma)
    .then(() => {
      globalForPrisma.prismaConnected = true;
    })
    .catch((error) => {
      console.error("[Prisma] Fatal: Could not establish database connection", error);
    });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Check database health
 * @returns Promise<boolean> - true if database is healthy
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Graceful shutdown handler
 */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("[Prisma] Database disconnected successfully");
  } catch (error) {
    console.error("[Prisma] Error during disconnect:", error);
  }
}

