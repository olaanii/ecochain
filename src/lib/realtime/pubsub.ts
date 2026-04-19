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
import { EventEmitter } from "node:events";
import { redis } from "@/lib/redis/client";

export type RealtimeChannel =
  | "proposal.created"
  | "proposal.voted"
  | "proposal.executed"
  | "leaderboard.updated"
  | "analytics.updated"
  | "bridge.updated"
  | "notification.created"
  // Per-user broadcast. The real Redis channel is suffixed with the userId.
  | "user";

export interface RealtimeEvent<T = unknown> {
  channel: RealtimeChannel;
  /** Recipient userId for user-scoped events, else null. */
  userId?: string | null;
  payload: T;
  at: number;
}

const CHANNEL_PREFIX = "ecochain:rt:";

function fullChannel(channel: string): string {
  return `${CHANNEL_PREFIX}${channel}`;
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

/**
 * Publish a broadcast event to every subscriber.
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
 * Publish an event addressed to a specific user. Delivered only to SSE
 * connections that authenticated as that userId.
 */
export async function publishUserEvent<T>(userId: string, payload: T): Promise<void> {
  const event: RealtimeEvent<T> = { channel: "user", userId, payload, at: Date.now() };
  try {
    await redis.publish(fullChannel(`user:${userId}`), JSON.stringify(event));
  } catch (err) {
    console.error("[realtime] publish failed user", userId, err);
  }
}

/**
 * One process-wide Redis subscriber that fans events out via an in-process
 * EventEmitter. Previously every SSE client opened its own Redis connection,
 * which exhausts `maxclients` under load.
 */
interface SharedBus {
  client: Redis;
  emitter: EventEmitter;
  broadcastSubscribed: boolean;
  userRefCounts: Map<string, number>;
}

let sharedBus: SharedBus | null = null;

function getSharedBus(): SharedBus {
  if (sharedBus) return sharedBus;

  const client = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    lazyConnect: false,
    maxRetriesPerRequest: null,
  });

  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);

  client.on("message", (channel, message) => {
    try {
      const parsed = JSON.parse(message) as RealtimeEvent;
      emitter.emit(channel, parsed);
    } catch (err) {
      console.error("[realtime] malformed message", err);
    }
  });

  client.on("error", (err) => {
    console.error("[realtime] shared bus error", err);
  });

  sharedBus = {
    client,
    emitter,
    broadcastSubscribed: false,
    userRefCounts: new Map(),
  };
  return sharedBus;
}

async function ensureBroadcastSubscribed(bus: SharedBus) {
  if (bus.broadcastSubscribed) return;
  const broadcastChannels = ALL_CHANNELS.map(fullChannel);
  try {
    await bus.client.subscribe(...broadcastChannels);
    bus.broadcastSubscribed = true;
  } catch (err) {
    console.error("[realtime] broadcast subscribe failed", err);
  }
}

async function ensureUserSubscribed(bus: SharedBus, userId: string) {
  const key = fullChannel(`user:${userId}`);
  const current = bus.userRefCounts.get(key) ?? 0;
  bus.userRefCounts.set(key, current + 1);
  if (current === 0) {
    try {
      await bus.client.subscribe(key);
    } catch (err) {
      console.error("[realtime] user subscribe failed", userId, err);
    }
  }
}

async function releaseUserSubscribed(bus: SharedBus, userId: string) {
  const key = fullChannel(`user:${userId}`);
  const current = bus.userRefCounts.get(key) ?? 0;
  if (current <= 1) {
    bus.userRefCounts.delete(key);
    try {
      await bus.client.unsubscribe(key);
    } catch {
      /* ignore */
    }
  } else {
    bus.userRefCounts.set(key, current - 1);
  }
}

/**
 * Subscribe an SSE connection to broadcast channels and (optionally) its own
 * user-scoped channel. Returns a `close()` that cleans up both the emitter
 * listener and the refcounted Redis subscription.
 */
export async function subscribeConnection(opts: {
  channels?: RealtimeChannel[];
  userId?: string;
  onEvent: (event: RealtimeEvent) => void;
}): Promise<{ close: () => Promise<void> }> {
  const bus = getSharedBus();
  const wanted = new Set(
    (opts.channels && opts.channels.length
      ? opts.channels.filter((c) => ALL_CHANNELS.includes(c))
      : ALL_CHANNELS
    ).map(fullChannel),
  );

  await ensureBroadcastSubscribed(bus);

  const userKey = opts.userId ? fullChannel(`user:${opts.userId}`) : null;
  if (opts.userId && userKey) {
    await ensureUserSubscribed(bus, opts.userId);
    wanted.add(userKey);
  }

  const listener = (channel: string, event: RealtimeEvent) => {
    if (!wanted.has(channel)) return;
    // Double-guard user-scoped events: only deliver if addressed to caller.
    if (event.channel === "user" && event.userId && event.userId !== opts.userId) return;
    opts.onEvent(event);
  };

  // Use a wildcard-ish bridge: listen on every possible channel key we care about.
  const wrap = (channel: string) => (evt: RealtimeEvent) => listener(channel, evt);
  const bindings: Array<{ channel: string; fn: (e: RealtimeEvent) => void }> = [];
  for (const ch of wanted) {
    const fn = wrap(ch);
    bus.emitter.on(ch, fn);
    bindings.push({ channel: ch, fn });
  }

  return {
    async close() {
      for (const b of bindings) {
        bus.emitter.off(b.channel, b.fn);
      }
      if (opts.userId) {
        await releaseUserSubscribed(bus, opts.userId);
      }
    },
  };
}
