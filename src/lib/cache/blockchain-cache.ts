import { redis } from "@/lib/redis/client";

/**
 * Blockchain Data Cache
 * 
 * Provides caching layer for blockchain data using Redis.
 * Reduces RPC calls and improves performance.
 */

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string;
}

const DEFAULT_TTL = 300; // 5 minutes
const BLOCKCHAIN_CACHE_PREFIX = "blockchain:";

/**
 * Generate cache key with prefix
 */
function getCacheKey(key: string, prefix?: string): string {
  return `${BLOCKCHAIN_CACHE_PREFIX}${prefix || ""}${key}`;
}

/**
 * Get cached data
 */
export async function getCachedData<T>(
  key: string,
  config?: CacheConfig
): Promise<T | null> {
  try {
    const cacheKey = getCacheKey(key, config?.keyPrefix);
    const data = await redis.get(cacheKey);
    
    if (!data) return null;
    
    return JSON.parse(data) as T;
  } catch (error) {
    console.error("[BlockchainCache] Error getting cached data:", error);
    return null;
  }
}

/**
 * Set cached data with TTL
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  config?: CacheConfig
): Promise<void> {
  try {
    const cacheKey = getCacheKey(key, config?.keyPrefix);
    const serialized = JSON.stringify(data);
    const ttl = config?.ttl ?? DEFAULT_TTL;
    
    await redis.setex(cacheKey, ttl, serialized);
  } catch (error) {
    console.error("[BlockchainCache] Error setting cached data:", error);
  }
}

/**
 * Get or fetch pattern - tries cache first, falls back to fetch function
 */
export async function getOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  config?: CacheConfig
): Promise<T> {
  // Try to get from cache
  const cached = await getCachedData<T>(key, config);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch fresh data
  const data = await fetchFn();
  
  // Cache the result
  await setCachedData(key, data, config);
  
  return data;
}

/**
 * Invalidate cache by key pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const cachePattern = getCacheKey(pattern);
    const keys = await redis.keys(cachePattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("[BlockchainCache] Error invalidating cache:", error);
  }
}

/**
 * Cache configurations for different data types
 */
export const CacheConfigs = {
  // Block data - cache for 2 minutes
  block: {
    ttl: 120,
    keyPrefix: "block:",
  },
  
  // Transaction data - cache for 5 minutes
  transaction: {
    ttl: 300,
    keyPrefix: "tx:",
  },
  
  // Account balance - cache for 30 seconds (frequently changing)
  balance: {
    ttl: 30,
    keyPrefix: "balance:",
  },
  
  // Contract state - cache for 1 minute
  contract: {
    ttl: 60,
    keyPrefix: "contract:",
  },
  
  // Protocol stats - cache for 5 minutes
  stats: {
    ttl: 300,
    keyPrefix: "stats:",
  },
  
  // Gas prices - cache for 30 seconds
  gas: {
    ttl: 30,
    keyPrefix: "gas:",
  },
} as const;

/**
 * Helper functions for common cache operations
 */
export const BlockchainCache = {
  /**
   * Cache block data
   */
  async getBlock(blockNumber: number) {
    return getCachedData(`block:${blockNumber}`, CacheConfigs.block);
  },
  
  async setBlock(blockNumber: number, data: unknown) {
    return setCachedData(`block:${blockNumber}`, data, CacheConfigs.block);
  },
  
  /**
   * Cache transaction data
   */
  async getTransaction(txHash: string) {
    return getCachedData(txHash, CacheConfigs.transaction);
  },
  
  async setTransaction(txHash: string, data: unknown) {
    return setCachedData(txHash, data, CacheConfigs.transaction);
  },
  
  /**
   * Cache account balance
   */
  async getBalance(address: string) {
    return getCachedData(address, CacheConfigs.balance);
  },
  
  async setBalance(address: string, data: unknown) {
    return setCachedData(address, data, CacheConfigs.balance);
  },
  
  /**
   * Cache contract state
   */
  async getContract(address: string) {
    return getCachedData(address, CacheConfigs.contract);
  },
  
  async setContract(address: string, data: unknown) {
    return setCachedData(address, data, CacheConfigs.contract);
  },
  
  /**
   * Cache protocol stats
   */
  async getStats(key: string) {
    return getCachedData(key, CacheConfigs.stats);
  },
  
  async setStats(key: string, data: unknown) {
    return setCachedData(key, data, CacheConfigs.stats);
  },
  
  /**
   * Cache gas prices
   */
  async getGasPrices() {
    return getCachedData("current", CacheConfigs.gas);
  },
  
  async setGasPrices(data: unknown) {
    return setCachedData("current", data, CacheConfigs.gas);
  },
  
  /**
   * Invalidate all blockchain cache
   */
  async invalidateAll() {
    return invalidateCache("*");
  },
  
  /**
   * Invalidate specific type cache
   */
  async invalidateType(type: keyof typeof CacheConfigs) {
    return invalidateCache(`${CacheConfigs[type].keyPrefix}*`);
  },
};
