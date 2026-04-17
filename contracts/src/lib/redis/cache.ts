import { redis } from "./client";

/**
 * Cache Statistics for monitoring hit/miss rates
 * Requirements: 28.1, 28.2, 28.3, 28.4, 28.5
 */
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

const cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  hitRate: 0,
};

/**
 * Update hit rate calculation
 */
function updateHitRate(): void {
  const total = cacheStats.hits + cacheStats.misses;
  cacheStats.hitRate = total > 0 ? (cacheStats.hits / total) * 100 : 0;
}

/**
 * Get a value from cache
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);

    if (value === null) {
      cacheStats.misses++;
      updateHitRate();
      return null;
    }

    cacheStats.hits++;
    updateHitRate();

    try {
      return JSON.parse(value) as T;
    } catch {
      // If parsing fails, return raw value
      return value as unknown as T;
    }
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error);
    return null;
  }
}

/**
 * Set a value in cache with TTL
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttlSeconds - Time to live in seconds (default: 300)
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = 300
): Promise<boolean> {
  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);

    if (ttlSeconds > 0) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }

    cacheStats.sets++;
    return true;
  } catch (error) {
    console.error(`[Cache] Error setting key ${key}:`, error);
    return false;
  }
}

/**
 * Delete a value from cache
 * @param key - Cache key
 */
export async function cacheDelete(key: string): Promise<boolean> {
  try {
    const result = await redis.del(key);
    cacheStats.deletes++;
    return result > 0;
  } catch (error) {
    console.error(`[Cache] Error deleting key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 * @param pattern - Key pattern (e.g., "user:*", "task:123:*")
 */
export async function cacheInvalidateByPattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    const deleted = await redis.del(...keys);
    cacheStats.deletes += deleted;
    return deleted;
  } catch (error) {
    console.error(`[Cache] Error invalidating pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return { ...cacheStats };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.sets = 0;
  cacheStats.deletes = 0;
  cacheStats.hitRate = 0;
}

/**
 * Warm cache with frequently accessed data
 * @param warmupFunctions - Array of functions that populate cache
 */
export async function warmCache(
  warmupFunctions: Array<() => Promise<void>>
): Promise<{ successful: number; failed: number }> {
  let successful = 0;
  let failed = 0;

  for (const warmupFn of warmupFunctions) {
    try {
      await warmupFn();
      successful++;
    } catch (error) {
      console.error("[Cache] Warmup function failed:", error);
      failed++;
    }
  }

  console.log(
    `[Cache] Warmup complete: ${successful} successful, ${failed} failed`
  );

  return { successful, failed };
}

/**
 * Clear all cache
 */
export async function cacheClear(): Promise<boolean> {
  try {
    await redis.flushdb();
    resetCacheStats();
    console.log("[Cache] All cache cleared");
    return true;
  } catch (error) {
    console.error("[Cache] Error clearing cache:", error);
    return false;
  }
}

/**
 * Get cache size (approximate)
 */
export async function getCacheSize(): Promise<number> {
  try {
    const info = await redis.info("memory");
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  } catch (error) {
    console.error("[Cache] Error getting cache size:", error);
    return 0;
  }
}

/**
 * Cache decorator for functions
 * Usage: @cacheDecorator(300) async function getData() { ... }
 */
export function cacheDecorator(ttlSeconds: number = 300) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cacheGet(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cacheSet(cacheKey, result, ttlSeconds);

      return result;
    };

    return descriptor;
  };
}
