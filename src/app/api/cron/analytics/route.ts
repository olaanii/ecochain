/**
 * Vercel Cron handler for daily analytics rollup
 * Schedule: 0 2 * * * (daily at 2 AM)
 */

import { NextResponse } from "next/server";
import { queueJob } from "@/lib/jobs/queue";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const jobId = await queueJob("analytics:rollup", { date: yesterday.toISOString().split("T")[0] });
    return NextResponse.json({ success: true, jobId });
  } catch (err) {
    console.error("[Cron:analytics] Failed:", err);
    return NextResponse.json({ error: "Failed to queue analytics" }, { status: 500 });
  }
}
