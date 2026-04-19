import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../../lib/redis/client";

export type RateLimitConfig = {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix: string; // Redis key prefix
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
};

const DEFAULT_CONFIGS = {
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "ratelimit:public",
  },
  authenticated: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 300,
    keyPrefix: "ratelimit:auth",
  },
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
    keyPrefix: "ratelimit:admin",
  },
  blockchain: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: "ratelimit:blockchain",
  },
};

/**
 * Check rate limit for a given key
 * Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  try {
    const redisKey = `${config.keyPrefix}:${key}`;
    const now = Date.now();

    // Get current count
    const count = await redis.incr(redisKey);

    // Set expiration on first request
    if (count === 1) {
      await redis.pexpire(redisKey, config.windowMs);
    }

    const remaining = Math.max(0, config.maxRequests - count);
    const resetTime = now + config.windowMs;

    if (count > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil(config.windowMs / 1000),
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: -1,
      resetTime: Date.now(),
    };
  }
}

/**
 * Rate limiting middleware for HTTP requests
 * Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  userId?: string,
  isAdmin: boolean = false,
): Promise<{ allowed: boolean; response?: NextResponse }> {
  try {
    // Determine rate limit config based on user role
    let config: RateLimitConfig;
    let key: string;

    if (isAdmin) {
      config = DEFAULT_CONFIGS.admin;
      key = userId || request.headers.get("x-forwarded-for") || "unknown";
    } else if (userId) {
      config = DEFAULT_CONFIGS.authenticated;
      key = userId;
    } else {
      config = DEFAULT_CONFIGS.public;
      key = request.headers.get("x-forwarded-for") || "unknown";
    }

    const result = await checkRateLimit(key, config);

    if (!result.allowed) {
      const response = NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded",
          retryAfter: result.retryAfter,
        },
        { status: 429 },
      );

      response.headers.set("Retry-After", String(result.retryAfter || 60));
      response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", String(result.resetTime));

      return { allowed: false, response };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limit middleware error:", error);
    // Fail open
    return { allowed: true };
  }
}

/**
 * Blockchain transaction rate limiting
 * Stricter limits for blockchain operations
 * Requirements: 24.4
 */
export async function blockchainRateLimitMiddleware(
  request: NextRequest,
  userId: string,
): Promise<{ allowed: boolean; response?: NextResponse }> {
  try {
    const config = DEFAULT_CONFIGS.blockchain;
    const result = await checkRateLimit(userId, config);

    if (!result.allowed) {
      const response = NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Blockchain transaction rate limit exceeded",
          retryAfter: result.retryAfter,
        },
        { status: 429 },
      );

      response.headers.set("Retry-After", String(result.retryAfter || 60));
      response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", String(result.resetTime));

      return { allowed: false, response };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Blockchain rate limit error:", error);
    // Fail open
    return { allowed: true };
  }
}

/**
 * Reset rate limit for a key (admin only)
 */
export async function resetRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<void> {
  try {
    const redisKey = `${config.keyPrefix}:${key}`;
    await redis.del(redisKey);
  } catch (error) {
    console.error("Failed to reset rate limit:", error);
  }
}

/**
 * Get rate limit status for a key
 */
export async function getRateLimitStatus(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  return checkRateLimit(key, config);
}
