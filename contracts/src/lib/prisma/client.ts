import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaAdapter: PrismaPg | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize PrismaClient.");
  }

  const adapter = globalForPrisma.prismaAdapter ?? new PrismaPg(connectionString);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaAdapter = adapter;
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      healthy: true,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
