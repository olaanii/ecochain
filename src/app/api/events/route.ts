/**
 * Server-Sent Events endpoint for realtime updates.
 * Subscribes to Redis pub/sub and streams events to the browser.
 *
 * Client: use the `useServerEvents` hook in `src/hooks/use-server-events.ts`.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  ALL_CHANNELS,
  subscribeConnection,
  type RealtimeChannel,
} from "@/lib/realtime/pubsub";
import { getCurrentDbUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_MS = 25_000;

export async function GET(request: NextRequest) {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawChannels = url.searchParams.get("channels");
  const channels: RealtimeChannel[] = rawChannels
    ? (rawChannels
        .split(",")
        .filter((c) => ALL_CHANNELS.includes(c as RealtimeChannel)) as RealtimeChannel[])
    : ALL_CHANNELS;

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let sub: { close: () => Promise<void> } | null = null;
  let cleanedUp = false;

  const stream = new ReadableStream({
    async start(controller) {
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        if (heartbeat) clearInterval(heartbeat);
        heartbeat = null;
        sub?.close().catch(() => undefined);
        sub = null;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const safeEnqueue = (chunk: string) => {
        if (cleanedUp) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Stream was closed from the other side — tear everything down.
          cleanup();
        }
      };

      safeEnqueue(`: connected ${new Date().toISOString()}\n\n`);

      try {
        sub = await subscribeConnection({
          channels,
          userId: user.id,
          onEvent: (event) => {
            safeEnqueue(`event: ${event.channel}\ndata: ${JSON.stringify(event)}\n\n`);
          },
        });
      } catch (err) {
        console.error("[/api/events] subscribe failed", err);
        cleanup();
        return;
      }

      heartbeat = setInterval(() => {
        safeEnqueue(`: hb ${Date.now()}\n\n`);
      }, HEARTBEAT_MS);

      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      if (cleanedUp) return;
      cleanedUp = true;
      if (heartbeat) clearInterval(heartbeat);
      sub?.close().catch(() => undefined);
      sub = null;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
