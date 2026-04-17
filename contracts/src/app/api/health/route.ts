import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/prisma/client";
import { checkRedisHealth } from "@/lib/redis/client";
import { getCacheStats } from "@/lib/redis/cache";

/**
 * Health check endpoint for database and Redis
 * GET /api/health
 */
export async function GET() {
  try {
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    const cacheStats = getCacheStats();

    const isHealthy = dbHealth.healthy && redisHealth.healthy;

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        database: {
          healthy: dbHealth.healthy,
          latency: dbHealth.latency,
          error: dbHealth.error,
        },
        redis: {
          healthy: redisHealth.healthy,
          latency: redisHealth.latency,
          error: redisHealth.error,
        },
        cache: {
          stats: cacheStats,
        },
      },
      {
        status: isHealthy ? 200 : 503,
      }
    );
  } catch (error) {
    console.error("[Health Check] Error:", error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
