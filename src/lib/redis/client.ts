import Redis from "ioredis";

/**
 * Redis Client Singleton with Connection Pooling
 * 
 * Configuration:
 * - Connection pooling enabled
 * - Connection timeout: 10 seconds
 * - Retry strategy: exponential backoff with max 10 attempts
 * - Auto-reconnect enabled
 * - Requirement: 28.10
 */

const MAX_RETRIES = 10;
const INITIAL_RETRY_DELAY = 100; // 100ms

/**
 * Create Redis client with connection pooling and error handling
 */
const redisClientSingleton = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    
    // Connection pooling and timeouts
    connectTimeout: 10000,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    
    // Retry strategy with exponential backoff
    retryStrategy: (times: number) => {
      if (times > MAX_RETRIES) {
        console.error(`[Redis] Max retries (${MAX_RETRIES}) exceeded`);
        return null; // Stop retrying
      }
      const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, times - 1), 30000);
      console.warn(`[Redis] Retry attempt ${times}/${MAX_RETRIES}, delay: ${delay}ms`);
      return delay;
    },
    
    // Reconnection strategy
    reconnectOnError: (err: Error) => {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        return true; // Reconnect on READONLY error
      }
      return false;
    },
    
    // Logging
    lazyConnect: false,
  });

  // Event handlers for connection lifecycle
  client.on("connect", () => {
    console.log("[Redis] Connected successfully");
  });

  client.on("ready", () => {
    console.log("[Redis] Client ready");
  });

  client.on("error", (err: Error) => {
    console.error("[Redis] Error:", err.message);
  });

  client.on("close", () => {
    console.log("[Redis] Connection closed");
  });

  client.on("reconnecting", () => {
    console.warn("[Redis] Attempting to reconnect...");
  });

  return client;
};

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? redisClientSingleton();

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
