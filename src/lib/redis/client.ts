import Redis, { type RedisOptions } from "ioredis";

/**
 * Redis Client Singleton with Connection Pooling + Graceful Fallback
 *
 * Strategy
 * --------
 * - If Redis is not configured (no REDIS_URL/REDIS_HOST, or DISABLE_REDIS=1),
 *   export a **stub no-op client** so importing modules never crash and local
 *   dev doesn't need Redis running. Rate limiting / caching / pubsub degrade
 *   gracefully in that mode.
 * - If Redis IS configured, use `lazyConnect: true` + bounded retries so a
 *   bad connection doesn't flood the logs with thousands of `ECONNREFUSED`
 *   stack traces every tick. Errors are deduped behind a 60s window.
 * - A dedicated subscriber connection (for pubsub) MUST be created via
 *   `createRedisConnection()` below, which honours the same config.
 *
 * Requirement: 28.10
 */

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 200; // ms
const ERROR_LOG_DEDUPE_MS = 60_000;

/** Is a real Redis server configured for this environment? */
export function isRedisEnabled(): boolean {
  if (process.env.DISABLE_REDIS === "1") return false;
  if (process.env.REDIS_URL) return true;
  // `localhost` without an explicit opt-in is treated as "not configured" so
  // laptop dev doesn't require Redis running.
  if (process.env.REDIS_HOST && process.env.REDIS_HOST !== "localhost") return true;
  if (process.env.REDIS_ENABLED === "1") return true;
  return false;
}

function buildOptions(): RedisOptions {
  if (process.env.REDIS_URL) {
    // ioredis parses URL from the first ctor arg; we still add options below.
    return {};
  }
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
  };
}

function attachLifecycle(client: Redis, tag: string): void {
  let lastErrorLoggedAt = 0;
  let suppressed = 0;

  client.on("connect", () => {
    console.log(`[Redis${tag ? ":" + tag : ""}] connected`);
  });
  client.on("ready", () => {
    console.log(`[Redis${tag ? ":" + tag : ""}] ready`);
  });
  client.on("close", () => {
    console.log(`[Redis${tag ? ":" + tag : ""}] connection closed`);
  });
  client.on("reconnecting", (delay: number) => {
    console.warn(`[Redis${tag ? ":" + tag : ""}] reconnecting in ${delay}ms`);
  });
  client.on("error", (err: Error) => {
    const now = Date.now();
    if (now - lastErrorLoggedAt > ERROR_LOG_DEDUPE_MS) {
      const suffix = suppressed > 0 ? ` (+${suppressed} suppressed)` : "";
      console.error(
        `[Redis${tag ? ":" + tag : ""}] ${err.message}${suffix}`,
      );
      lastErrorLoggedAt = now;
      suppressed = 0;
    } else {
      suppressed++;
    }
  });
}

function baseConnectionOptions(): RedisOptions {
  return {
    ...buildOptions(),
    connectTimeout: 10_000,
    lazyConnect: true,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > MAX_RETRIES) return null;
      return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, times - 1), 30_000);
    },
    reconnectOnError: (err: Error) => err.message.includes("READONLY"),
  };
}

/**
 * Create a **real** Redis connection. Used by the singleton and by modules
 * that need a dedicated subscriber connection (e.g. the realtime pubsub bus).
 *
 * If Redis is disabled this returns a typed stub that no-ops every call so
 * callers never crash.
 */
export function createRedisConnection(tag = ""): Redis {
  if (!isRedisEnabled()) {
    return createStubClient(tag) as unknown as Redis;
  }
  const client = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, baseConnectionOptions())
    : new Redis(baseConnectionOptions());
  attachLifecycle(client, tag);
  // Kick off the lazy connection exactly once; any further failures are
  // handled by retryStrategy + the deduped error handler.
  client.connect().catch(() => {
    /* handled by 'error' listener */
  });
  return client;
}

/**
 * Tiny in-process stub matching the subset of the ioredis surface that this
 * codebase uses. All reads return null, writes no-op, pubsub no-ops. Anything
 * that awaits a Redis method still resolves cleanly.
 */
function createStubClient(tag: string) {
  let warned = false;
  const warnOnce = () => {
    if (warned) return;
    warned = true;
    console.warn(
      `[Redis${tag ? ":" + tag : ""}] disabled — running with no-op stub client. ` +
        "Set REDIS_URL or REDIS_HOST (not localhost) and REDIS_ENABLED=1 to enable.",
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noop = async () => {
    warnOnce();
    return null;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zero = async () => {
    warnOnce();
    return 0;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emptyArr = async () => {
    warnOnce();
    return [] as string[];
  };

  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  return {
    status: "disabled" as const,
    // reads
    get: noop,
    mget: emptyArr,
    keys: emptyArr,
    ttl: zero,
    exists: zero,
    incr: zero,
    decr: zero,
    hgetall: async () => {
      warnOnce();
      return {} as Record<string, string>;
    },
    info: async () => {
      warnOnce();
      return "";
    },
    // writes
    set: noop,
    setex: noop,
    del: zero,
    expire: zero,
    hset: zero,
    hdel: zero,
    zadd: zero,
    zrange: emptyArr,
    zrem: zero,
    flushdb: noop,
    // pubsub
    publish: zero,
    subscribe: async () => {
      warnOnce();
      return 0;
    },
    unsubscribe: async () => 0,
    // lifecycle
    ping: async () => {
      warnOnce();
      return "PONG-STUB";
    },
    connect: async () => undefined,
    disconnect: () => undefined,
    quit: async () => "OK",
    duplicate() {
      return createStubClient(tag);
    },
    on(event: string, cb: (...args: unknown[]) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(cb);
      return this;
    },
    off(event: string, cb: (...args: unknown[]) => void) {
      listeners.get(event)?.delete(cb);
      return this;
    },
    removeAllListeners() {
      listeners.clear();
      return this;
    },
  };
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis: Redis =
  globalForRedis.redis ?? createRedisConnection("main");

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/**
 * Check Redis health
 * @returns Promise with health status and latency
 */
export async function checkRedisHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    await redis.ping();
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
export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
    console.log("[Redis] Disconnected successfully");
  } catch (error) {
    console.error("[Redis] Error during disconnect:", error);
  }
}
