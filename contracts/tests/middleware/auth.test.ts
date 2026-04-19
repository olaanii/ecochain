/**
 * Tests for authentication middleware
 * Requirements: 16.1, 16.2, 16.3, 16.4, 29.2, 29.3, 29.4
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  authMiddleware,
  optionalAuthMiddleware,
  validateWalletMiddleware,
  rbacMiddleware,
  composeMiddleware,
} from "src/lib/api/middleware/auth";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock logger
vi.mock("src/lib/api/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";

describe("Authentication Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authMiddleware", () => {
    it("should return auth context when valid userId is provided", async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: "user_123" });

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await authMiddleware(request);

      expect(result.auth).toBeDefined();
      expect(result.auth?.userId).toBe("user_123");
      expect(result.auth?.clerkId).toBe("user_123");
      expect(result.auth?.role).toBe("authenticated");
      expect(result.error).toBeUndefined();
    });

    it("should return 401 error when no userId is provided", async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await authMiddleware(request);

      expect(result.auth).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(401);
    });

    it("should return 401 error on auth exception", async () => {
      const mockAuth = auth as any;
      mockAuth.mockRejectedValue(new Error("Auth failed"));

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await authMiddleware(request);

      expect(result.auth).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(401);
    });

    it("should include clerkId in auth context", async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: "clerk_user_456" });

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await authMiddleware(request);

      expect(result.auth?.clerkId).toBe("clerk_user_456");
    });
  });

  describe("optionalAuthMiddleware", () => {
    it("should return auth context when userId is available", async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: "user_123" });

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await optionalAuthMiddleware(request);

      expect(result.auth).toBeDefined();
      expect(result.auth?.userId).toBe("user_123");
      expect(result.auth?.role).toBe("authenticated");
    });

    it("should return undefined auth when no userId", async () => {
      const mockAuth = auth as any;
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await optionalAuthMiddleware(request);

      expect(result.auth).toBeUndefined();
    });

    it("should return undefined auth on exception", async () => {
      const mockAuth = auth as any;
      mockAuth.mockRejectedValue(new Error("Auth failed"));

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await optionalAuthMiddleware(request);

      expect(result.auth).toBeUndefined();
    });
  });

  describe("validateWalletMiddleware", () => {
    it("should validate and inject wallet address", async () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-wallet-address": "initia1abcdefghijklmnopqrstuvwxyz1234567890ab",
        },
      });

      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "authenticated" as const,
      };

      const result = await validateWalletMiddleware(request, authContext);

      expect(result.auth).toBeDefined();
      expect(result.auth?.walletAddress).toBe("initia1abcdefghijklmnopqrstuvwxyz1234567890ab");
      expect(result.error).toBeUndefined();
    });

    it("should return 400 error when wallet address header is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/test");

      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "authenticated" as const,
      };

      const result = await validateWalletMiddleware(request, authContext);

      expect(result.auth).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(400);
    });

    it("should return 400 error for invalid wallet address format", async () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-wallet-address": "invalid-address",
        },
      });

      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "authenticated" as const,
      };

      const result = await validateWalletMiddleware(request, authContext);

      expect(result.auth).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(400);
    });

    it("should preserve existing auth context when adding wallet", async () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-wallet-address": "initia1abcdefghijklmnopqrstuvwxyz1234567890ab",
        },
      });

      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "admin" as const,
      };

      const result = await validateWalletMiddleware(request, authContext);

      expect(result.auth?.userId).toBe("user_123");
      expect(result.auth?.role).toBe("admin");
      expect(result.auth?.walletAddress).toBe("initia1abcdefghijklmnopqrstuvwxyz1234567890ab");
    });
  });

  describe("rbacMiddleware", () => {
    it("should allow access when user has required role", () => {
      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "admin" as const,
      };

      const result = rbacMiddleware(authContext, ["admin", "owner"]);

      expect(result).toBeNull();
    });

    it("should deny access when user lacks required role", () => {
      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "authenticated" as const,
      };

      const result = rbacMiddleware(authContext, ["admin", "owner"]);

      expect(result).toBeDefined();
      expect(result?.status).toBe(403);
    });

    it("should allow public access when public role is required", () => {
      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "public" as const,
      };

      const result = rbacMiddleware(authContext, ["public", "authenticated"]);

      expect(result).toBeNull();
    });

    it("should allow owner role access", () => {
      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "owner" as const,
      };

      const result = rbacMiddleware(authContext, ["owner"]);

      expect(result).toBeNull();
    });

    it("should return 403 error response", () => {
      const authContext = {
        userId: "user_123",
        clerkId: "user_123",
        role: "authenticated" as const,
      };

      const result = rbacMiddleware(authContext, ["admin"]);

      expect(result?.status).toBe(403);
    });
  });

  describe("composeMiddleware", () => {
    it("should compose multiple middleware functions", async () => {
      const middleware1 = vi.fn().mockResolvedValue({ auth: { userId: "user_123" } });
      const middleware2 = vi.fn().mockResolvedValue({ auth: { role: "authenticated" } });

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await composeMiddleware(request, [middleware1, middleware2]);

      expect(middleware1).toHaveBeenCalledWith(request);
      expect(middleware2).toHaveBeenCalledWith(request);
      expect(result.auth).toBeDefined();
    });

    it("should stop on first error", async () => {
      const errorResponse = new Response(null, { status: 401 });
      const middleware1 = vi.fn().mockResolvedValue({ error: errorResponse });
      const middleware2 = vi.fn();

      const request = new NextRequest("http://localhost:3000/api/test");
      const result = await composeMiddleware(request, [middleware1, middleware2]);

      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).not.toHaveBeenCalled();
      expect(result.error).toBeDefined();
    });
  });
});
