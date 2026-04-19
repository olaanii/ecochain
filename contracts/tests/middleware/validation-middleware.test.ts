/**
 * Tests for validation middleware
 * Requirements: 25.1, 25.2, 25.3, 25.5, 25.6, 25.7, 25.8
 */

import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import {
  validationMiddleware,
  sanitizeInput,
  sanitizeObject,
  ValidationSchemas,
  ProofSubmissionSchema,
  StakeSubmissionSchema,
  RedemptionSchema,
  VoteSubmissionSchema,
} from "src/lib/api/middleware/validation";
import { z } from "zod";

describe("Validation Middleware", () => {
  describe("validationMiddleware", () => {
    it("should validate request body against schema", async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        body: JSON.stringify({ name: "John", age: 30 }),
      });

      const result = await validationMiddleware(request, schema);

      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("John");
      expect(result.data.age).toBe(30);
      expect(result.error).toBeUndefined();
    });

    it("should return 400 error for invalid data", async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        body: JSON.stringify({ name: "John", age: "not a number" }),
      });

      const result = await validationMiddleware(request, schema);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(400);
    });

    it("should return 400 error for invalid JSON", async () => {
      const schema = z.object({
        name: z.string(),
      });

      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        body: "invalid json",
      });

      const result = await validationMiddleware(request, schema);

      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(400);
    });

    it("should include detailed error messages", async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        body: JSON.stringify({ email: "invalid", age: 10 }),
      });

      const result = await validationMiddleware(request, schema);

      expect(result.error).toBeDefined();
      const errorBody = await result.error?.json();
      expect(errorBody.details).toBeDefined();
      expect(errorBody.details.length).toBeGreaterThan(0);
    });
  });

  describe("sanitizeInput", () => {
    it("should remove HTML tags", () => {
      const input = "<script>alert('xss')</script>Hello";
      const result = sanitizeInput(input);

      expect(result).not.toContain("<script>");
      expect(result).not.toContain("</script>");
      expect(result).toContain("Hello");
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>';
      const result = sanitizeInput(input);

      expect(result).not.toContain("onclick");
      expect(result).toContain("Click me");
    });

    it("should remove javascript: protocol", () => {
      const input = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = sanitizeInput(input);

      expect(result).not.toContain("javascript:");
      expect(result).toContain("Link");
    });

    it("should trim whitespace", () => {
      const input = "  Hello World  ";
      const result = sanitizeInput(input);

      expect(result).toBe("Hello World");
    });

    it("should handle empty strings", () => {
      const result = sanitizeInput("");
      expect(result).toBe("");
    });
  });

  describe("sanitizeObject", () => {
    it("should sanitize string values in object", () => {
      const obj = {
        name: "<script>alert('xss')</script>John",
        email: "john@example.com",
      };

      const result = sanitizeObject(obj);

      expect(result.name).not.toContain("<script>");
      expect(result.email).toBe("john@example.com");
    });

    it("should sanitize nested objects", () => {
      const obj = {
        user: {
          name: "<img src=x onerror='alert(1)'>",
          profile: {
            bio: "<script>alert('xss')</script>",
          },
        },
      };

      const result = sanitizeObject(obj);

      expect(result.user.name).not.toContain("onerror");
      expect(result.user.profile.bio).not.toContain("<script>");
    });

    it("should sanitize arrays", () => {
      const obj = {
        items: [
          "<script>alert('xss')</script>Item 1",
          "Item 2",
        ],
      };

      const result = sanitizeObject(obj);

      expect(result.items[0]).not.toContain("<script>");
      expect(result.items[1]).toBe("Item 2");
    });

    it("should preserve non-string values", () => {
      const obj = {
        name: "John",
        age: 30,
        active: true,
        balance: 100.50,
      };

      const result = sanitizeObject(obj);

      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
      expect(result.balance).toBe(100.50);
    });

    it("should handle null and undefined", () => {
      const obj = {
        name: "John",
        middle: null,
        last: undefined,
      };

      const result = sanitizeObject(obj);

      expect(result.name).toBe("John");
      expect(result.middle).toBeNull();
      expect(result.last).toBeUndefined();
    });
  });

  describe("ValidationSchemas", () => {
    describe("walletAddress", () => {
      it("should validate valid Bech32 address", () => {
        const result = ValidationSchemas.walletAddress.safeParse(
          "initia1abcdefghijklmnopqrstuvwxyz1234567890ab"
        );
        expect(result.success).toBe(true);
      });

      it("should reject invalid address", () => {
        const result = ValidationSchemas.walletAddress.safeParse("invalid-address");
        expect(result.success).toBe(false);
      });
    });

    describe("tokenAmount", () => {
      it("should validate positive integer", () => {
        const result = ValidationSchemas.tokenAmount.safeParse(100);
        expect(result.success).toBe(true);
      });

      it("should reject negative amount", () => {
        const result = ValidationSchemas.tokenAmount.safeParse(-100);
        expect(result.success).toBe(false);
      });

      it("should reject decimal amount", () => {
        const result = ValidationSchemas.tokenAmount.safeParse(100.5);
        expect(result.success).toBe(false);
      });
    });

    describe("timestamp", () => {
      it("should validate current timestamp", () => {
        const result = ValidationSchemas.timestamp.safeParse(Date.now());
        expect(result.success).toBe(true);
      });

      it("should reject future timestamp", () => {
        const result = ValidationSchemas.timestamp.safeParse(Date.now() + 1000);
        expect(result.success).toBe(false);
      });

      it("should reject timestamp older than 48 hours", () => {
        const result = ValidationSchemas.timestamp.safeParse(
          Date.now() - 49 * 60 * 60 * 1000
        );
        expect(result.success).toBe(false);
      });
    });

    describe("taskId", () => {
      it("should validate valid task ID", () => {
        const result = ValidationSchemas.taskId.safeParse("task-123");
        expect(result.success).toBe(true);
      });

      it("should reject invalid task ID", () => {
        const result = ValidationSchemas.taskId.safeParse("Task@123");
        expect(result.success).toBe(false);
      });
    });

    describe("proofHash", () => {
      it("should validate valid SHA-256 hash", () => {
        const hash = "a".repeat(64);
        const result = ValidationSchemas.proofHash.safeParse(hash);
        expect(result.success).toBe(true);
      });

      it("should reject invalid hash length", () => {
        const result = ValidationSchemas.proofHash.safeParse("abc");
        expect(result.success).toBe(false);
      });

      it("should reject non-hex characters", () => {
        const hash = "g".repeat(64);
        const result = ValidationSchemas.proofHash.safeParse(hash);
        expect(result.success).toBe(false);
      });
    });

    describe("stakeDuration", () => {
      it("should validate valid durations", () => {
        expect(ValidationSchemas.stakeDuration.safeParse(30).success).toBe(true);
        expect(ValidationSchemas.stakeDuration.safeParse(90).success).toBe(true);
        expect(ValidationSchemas.stakeDuration.safeParse(180).success).toBe(true);
        expect(ValidationSchemas.stakeDuration.safeParse(365).success).toBe(true);
      });

      it("should reject invalid duration", () => {
        const result = ValidationSchemas.stakeDuration.safeParse(60);
        expect(result.success).toBe(false);
      });
    });

    describe("pagination", () => {
      it("should validate pagination with defaults", () => {
        const result = ValidationSchemas.pagination.safeParse({});
        expect(result.success).toBe(true);
        expect(result.data?.limit).toBe(50);
        expect(result.data?.offset).toBe(0);
      });

      it("should validate custom pagination", () => {
        const result = ValidationSchemas.pagination.safeParse({
          limit: 25,
          offset: 10,
        });
        expect(result.success).toBe(true);
        expect(result.data?.limit).toBe(25);
        expect(result.data?.offset).toBe(10);
      });

      it("should reject limit exceeding 100", () => {
        const result = ValidationSchemas.pagination.safeParse({ limit: 101 });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("ProofSubmissionSchema", () => {
    it("should validate valid proof submission", () => {
      const result = ProofSubmissionSchema.safeParse({
        taskId: "task-123",
        proofData: "proof-data",
        timestamp: Date.now(),
      });
      expect(result.success).toBe(true);
    });

    it("should validate with geolocation", () => {
      const result = ProofSubmissionSchema.safeParse({
        taskId: "task-123",
        proofData: "proof-data",
        timestamp: Date.now(),
        geolocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid geolocation", () => {
      const result = ProofSubmissionSchema.safeParse({
        taskId: "task-123",
        proofData: "proof-data",
        timestamp: Date.now(),
        geolocation: {
          latitude: 100,
          longitude: -74.006,
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StakeSubmissionSchema", () => {
    it("should validate valid stake submission", () => {
      const result = StakeSubmissionSchema.safeParse({
        amount: 500,
        duration: 90,
      });
      expect(result.success).toBe(true);
    });

    it("should reject amount below minimum", () => {
      const result = StakeSubmissionSchema.safeParse({
        amount: 50,
        duration: 90,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid duration", () => {
      const result = StakeSubmissionSchema.safeParse({
        amount: 500,
        duration: 60,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("RedemptionSchema", () => {
    it("should validate valid redemption", () => {
      const result = RedemptionSchema.safeParse({
        rewardId: "reward-123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing rewardId", () => {
      const result = RedemptionSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("VoteSubmissionSchema", () => {
    it("should validate valid vote submission", () => {
      const result = VoteSubmissionSchema.safeParse({
        proposalId: "proposal-123",
        support: "for",
      });
      expect(result.success).toBe(true);
    });

    it("should validate vote with reason", () => {
      const result = VoteSubmissionSchema.safeParse({
        proposalId: "proposal-123",
        support: "against",
        reason: "This proposal is not beneficial",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid support value", () => {
      const result = VoteSubmissionSchema.safeParse({
        proposalId: "proposal-123",
        support: "maybe",
      });
      expect(result.success).toBe(false);
    });

    it("should reject reason exceeding 500 characters", () => {
      const result = VoteSubmissionSchema.safeParse({
        proposalId: "proposal-123",
        support: "for",
        reason: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});
