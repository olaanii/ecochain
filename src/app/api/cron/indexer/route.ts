/**
 * Vercel Cron handler for indexer sync
 * Schedule: every 5 minutes
 */

import { NextResponse } from "next/server";
import { queueJob } from "@/lib/jobs/queue";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const jobId = await queueJob("indexer:sync", {});
    return NextResponse.json({ success: true, jobId });
  } catch (err) {
    console.error("[Cron:indexer] Failed:", err);
    return NextResponse.json({ error: "Failed to queue indexer" }, { status: 500 });
  }
}
