/**
 * Tests for rate limiting middleware
 * Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7
 */

import { NextRequest } from "next/server";
import {
  checkRateLimit,
  rateLimitMiddleware,
  blockchainRateLimitMiddleware,
  resetRateLimit,
  getRateLimitStatus,
} from "@/lib/api/middleware/rate-limit";
import { redis } from "@/lib/redis/client";

// Mock Redis
jest.mock("@/lib/redis/client", () => ({
  redis: {
    incr: jest.fn(),
    pexpire: jest.fn(),
    del: jest.fn(),
  },
}));

describe("Rate Limiting Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkRateLimit", () => {
    it("should allow request when under limit", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.pexpire.mockResolvedValue(1);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      const result = await checkRateLimit("user_123", config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
      expect(result.retryAfter).toBeUndefined();
    });

    it("should deny request when limit exceeded", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(101);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      const result = await checkRateLimit("user_123", config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it("should fail open when Redis is unavailable", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockRejectedValue(new Error("Redis unavailable"));

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      const result = await checkRateLimit("user_123", config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(-1);
    });

    it("should set expiration on first request", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.pexpire.mockResolvedValue(1);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      await checkRateLimit("user_123", config);

      expect(mockRedis.pexpire).toHaveBeenCalledWith("test:user_123", 60000);
    });

    it("should not set expiration on subsequent requests", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(5);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      await checkRateLimit("user_123", config);

      expect(mockRedis.pexpire).not.toHaveBeenCalled();
    });

    it("should calculate remaining requests correctly", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(50);
      mockRedis.pexpire.mockResolvedValue(1);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      const result = await checkRateLimit("user_123", config);

      expect(result.remaining).toBe(50);
    });
  });

  describe("rateLimitMiddleware", () => {
    it("should apply public rate limit for unauthenticated requests", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.pexpire.mockResolvedValue(1);

      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
      });

      const result = await rateLimitMiddleware(request);

      expect(result.allowed).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should apply authenticated rate limit for authenticated users", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.pexpire.mockResolvedValue(1);

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await rateLimitMiddleware(request, "user_123");

      expect(result.allowed).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should apply admin rate limit for admin users", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.pexpire.mockResolvedValue(1);

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await rateLimitMiddleware(request, "admin_123", true);

      expect(result.allowed).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should return 429 when rate limit exceeded", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(101);

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await rateLimitMiddleware(request);

      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(429);
    });

    it("should include Retry-After header in rate limit response", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(101);

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await rateLimitMiddleware(request);

      expect(result.response?.headers.get("Retry-After")).toBeDefined();
      expect(result.response?.headers.get("X-RateLimit-Remaining")).toBe("0");
    });

    it("should include rate limit headers in response", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(101);

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await rateLimitMiddleware(request);

      expect(result.response?.headers.get("X-RateLimit-Limit")).toBeDefined();
      expect(result.response?.headers.get("X-RateLimit-Reset")).toBeDefined();
    });
  });

  describe("blockchainRateLimitMiddleware", () => {
    it("should allow blockchain transaction when under limit", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.pexpire.mockResolvedValue(1);

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await blockchainRateLimitMiddleware(request, "user_123");

      expect(result.allowed).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("should deny blockchain transaction when limit exceeded", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(11);

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await blockchainRateLimitMiddleware(request, "user_123");

      expect(result.allowed).toBe(false);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(429);
    });

    it("should enforce 10 tx/min limit for blockchain operations", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(10);
      mockRedis.pexpire.mockResolvedValue(1);

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await blockchainRateLimitMiddleware(request, "user_123");

      expect(result.allowed).toBe(true);
    });

    it("should fail open when Redis is unavailable", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockRejectedValue(new Error("Redis unavailable"));

      const request = new NextRequest("http://localhost:3000/api/test");

      const result = await blockchainRateLimitMiddleware(request, "user_123");

      expect(result.allowed).toBe(true);
    });
  });

  describe("resetRateLimit", () => {
    it("should delete rate limit key from Redis", async () => {
      const mockRedis = redis as any;
      mockRedis.del.mockResolvedValue(1);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      await resetRateLimit("user_123", config);

      expect(mockRedis.del).toHaveBeenCalledWith("test:user_123");
    });

    it("should handle deletion errors gracefully", async () => {
      const mockRedis = redis as any;
      mockRedis.del.mockRejectedValue(new Error("Redis error"));

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      await expect(resetRateLimit("user_123", config)).resolves.not.toThrow();
    });
  });

  describe("getRateLimitStatus", () => {
    it("should return rate limit status", async () => {
      const mockRedis = redis as any;
      mockRedis.incr.mockResolvedValue(50);
      mockRedis.pexpire.mockResolvedValue(1);

      const config = {
        windowMs: 60000,
        maxRequests: 100,
        keyPrefix: "test",
      };

      const result = await getRateLimitStatus("user_123", config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(50);
    });
  });
});
