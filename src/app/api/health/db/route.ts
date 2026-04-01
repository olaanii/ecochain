import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/prisma/client";

/**
 * Database Health Check Endpoint
 * 
 * GET /api/health/db
 * 
 * Returns database connection status and latency
 * 
 * Requirements: 27.6
 */
export async function GET() {
  try {
    const health = await checkDatabaseHealth();

    if (health.healthy) {
      return NextResponse.json(
        {
          status: "healthy",
          database: "connected",
          latency: health.latency,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          error: health.error,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
