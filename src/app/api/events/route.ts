/**
 * Server-Sent Events endpoint for realtime updates.
 * Subscribes to Redis pub/sub and streams events to the browser.
 *
 * Client: use the `useServerEvents` hook in `src/hooks/use-server-events.ts`.
 */

import { NextRequest } from "next/server";
import {
  ALL_CHANNELS,
  createSubscriber,
  type RealtimeChannel,
} from "@/lib/realtime/pubsub";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_MS = 25_000;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rawChannels = url.searchParams.get("channels");
  const channels: RealtimeChannel[] = rawChannels
    ? (rawChannels.split(",").filter((c) => ALL_CHANNELS.includes(c as RealtimeChannel)) as RealtimeChannel[])
    : ALL_CHANNELS;

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let sub: ReturnType<typeof createSubscriber> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const safeEnqueue = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Client likely disconnected — cleanup will run via abort signal.
        }
      };

      safeEnqueue(`: connected ${new Date().toISOString()}\n\n`);

      sub = createSubscriber(channels);
      sub.onMessage((event) => {
        safeEnqueue(`event: ${event.channel}\ndata: ${JSON.stringify(event)}\n\n`);
      });

      heartbeat = setInterval(() => {
        safeEnqueue(`: hb ${Date.now()}\n\n`);
      }, HEARTBEAT_MS);

      const cleanup = () => {
        if (heartbeat) clearInterval(heartbeat);
        heartbeat = null;
        sub?.close().catch(() => undefined);
        sub = null;
        try {
          controller.close();
        } catch {}
      };

      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      sub?.close().catch(() => undefined);
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
