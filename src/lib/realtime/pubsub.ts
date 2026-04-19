/**
 * Realtime pub/sub layer backed by Redis.
 *
 * Server code publishes domain events (e.g. proposal.voted, leaderboard.updated)
 * and the SSE endpoint (/api/events) subscribes to fan them out to connected
 * browsers. This gives us "WebSocket-like" live updates without requiring a
 * custom Next.js server, while still being horizontally scalable across
 * instances via Redis Pub/Sub.
 */

import Redis from "ioredis";
import { redis } from "@/lib/redis/client";

export type RealtimeChannel =
  | "proposal.created"
  | "proposal.voted"
  | "proposal.executed"
  | "leaderboard.updated"
  | "analytics.updated"
  | "bridge.updated"
  | "notification.created";

export interface RealtimeEvent<T = unknown> {
  channel: RealtimeChannel;
  payload: T;
  at: number;
}

const CHANNEL_PREFIX = "ecochain:rt:";

function fullChannel(channel: RealtimeChannel): string {
  return `${CHANNEL_PREFIX}${channel}`;
}

/**
 * Publish an event to all subscribers.
 */
export async function publishEvent<T>(channel: RealtimeChannel, payload: T): Promise<void> {
  const event: RealtimeEvent<T> = { channel, payload, at: Date.now() };
  try {
    await redis.publish(fullChannel(channel), JSON.stringify(event));
  } catch (err) {
    console.error("[realtime] publish failed", channel, err);
  }
}

/**
 * Create a dedicated Redis subscriber connection. ioredis requires a separate
 * connection for subscribe mode (can't issue normal commands on it).
 */
export function createSubscriber(channels: RealtimeChannel[]): {
  client: Redis;
  onMessage: (cb: (event: RealtimeEvent) => void) => void;
  close: () => Promise<void>;
} {
  const client = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    lazyConnect: false,
    maxRetriesPerRequest: null,
  });

  const fullChannels = channels.map(fullChannel);
  client.subscribe(...fullChannels).catch((err) => {
    console.error("[realtime] subscribe failed", err);
  });

  return {
    client,
    onMessage(cb) {
      client.on("message", (_channel, message) => {
        try {
          const parsed = JSON.parse(message) as RealtimeEvent;
          cb(parsed);
        } catch (err) {
          console.error("[realtime] malformed message", err);
        }
      });
    },
    async close() {
      try {
        await client.unsubscribe();
      } catch {}
      await client.quit().catch(() => undefined);
    },
  };
}

export const ALL_CHANNELS: RealtimeChannel[] = [
  "proposal.created",
  "proposal.voted",
  "proposal.executed",
  "leaderboard.updated",
  "analytics.updated",
  "bridge.updated",
  "notification.created",
];
