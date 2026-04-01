import { describe, it } from "node:test";
import assert from "node:assert";
import {
  TasksQueryParamsSchema,
  VerifyRequestSchema,
  RedeemRequestSchema,
  BridgeInitiateRequestSchema,
  validateRequestBody,
  validateQueryParams,
  formatValidationError,
} from "../src/lib/api/schemas.js";

describe("API Validation Schemas", () => {
  describe("TasksQueryParamsSchema", () => {
    it("should validate valid query parameters", () => {
      const valid = {
        category: "transit",
        limit: "10",
        offset: "0",
      };
      
      const result = TasksQueryParamsSchema.safeParse(valid);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.category, "transit");
        assert.strictEqual(result.data.limit, 10);
        assert.strictEqual(result.data.offset, 0);
      }
    });

    it("should reject invalid category", () => {
      const invalid = {
        category: "invalid-category",
      };
      
      const result = TasksQueryParamsSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });

    it("should apply default values", () => {
      const minimal = {};
      
      const result = TasksQueryParamsSchema.safeParse(minimal);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.limit, 20);
        assert.strictEqual(result.data.offset, 0);
      }
    });

    it("should enforce maximum limit", () => {
      const tooLarge = {
        limit: "200",
      };
      
      const result = TasksQueryParamsSchema.safeParse(tooLarge);
      assert.strictEqual(result.success, false);
    });
  });

  describe("VerifyRequestSchema", () => {
    it("should validate valid verification request", () => {
      const valid = {
        taskId: "task-123",
        proofHash: "0xabcdef123456",
        submittedAt: 1234567890,
        proofType: "photo",
      };
      
      const result = VerifyRequestSchema.safeParse(valid);
      assert.strictEqual(result.success, true);
    });

    it("should reject missing required fields", () => {
      const invalid = {
        taskId: "task-123",
        // Missing proofHash, submittedAt, proofType
      };
      
      const result = VerifyRequestSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });

    it("should validate optional oracle fields", () => {
      const valid = {
        taskId: "task-123",
        proofHash: "0xabcdef123456",
        submittedAt: 1234567890,
        proofType: "sensor",
        oracleSource: "chainlink",
        oracleConfidence: 0.95,
      };
      
      const result = VerifyRequestSchema.safeParse(valid);
      assert.strictEqual(result.success, true);
    });

    it("should reject invalid proof type", () => {
      const invalid = {
        taskId: "task-123",
        proofHash: "0xabcdef123456",
        submittedAt: 1234567890,
        proofType: "invalid-type",
      };
      
      const result = VerifyRequestSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });

    it("should reject oracle confidence outside 0-1 range", () => {
      const invalid = {
        taskId: "task-123",
        proofHash: "0xabcdef123456",
        submittedAt: 1234567890,
        proofType: "photo",
        oracleConfidence: 1.5,
      };
      
      const result = VerifyRequestSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });
  });

  describe("RedeemRequestSchema", () => {
    it("should validate valid redemption request", () => {
      const valid = {
        rewardId: "reward-123",
        initiaAddress: "init1abc123def456",
      };
      
      const result = RedeemRequestSchema.safeParse(valid);
      assert.strictEqual(result.success, true);
    });

    it("should reject missing required fields", () => {
      const invalid = {
        rewardId: "reward-123",
        // Missing initiaAddress
      };
      
      const result = RedeemRequestSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });

    it("should validate optional fields", () => {
      const valid = {
        rewardId: "reward-123",
        initiaAddress: "init1abc123def456",
        initiaUsername: "user123",
        displayName: "John Doe",
        region: "US-CA",
      };
      
      const result = RedeemRequestSchema.safeParse(valid);
      assert.strictEqual(result.success, true);
    });

    it("should reject empty required strings", () => {
      const invalid = {
        rewardId: "",
        initiaAddress: "init1abc123def456",
      };
      
      const result = RedeemRequestSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });
  });

  describe("BridgeInitiateRequestSchema", () => {
    it("should validate valid bridge request", () => {
      const valid = {
        amount: 100,
        denom: "uinit",
        sourceChain: "initia",
        targetChain: "ethereum",
        recipientAddress: "0x1234567890abcdef",
      };
      
      const result = BridgeInitiateRequestSchema.safeParse(valid);
      assert.strictEqual(result.success, true);
    });

    it("should reject missing required fields", () => {
      const invalid = {
        amount: 100,
        denom: "uinit",
        // Missing sourceChain, targetChain, recipientAddress
      };
      
      const result = BridgeInitiateRequestSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });

    it("should reject non-positive amounts", () => {
      const invalid = {
        amount: 0,
        denom: "uinit",
        sourceChain: "initia",
        targetChain: "ethereum",
        recipientAddress: "0x1234567890abcdef",
      };
      
      const result = BridgeInitiateRequestSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });

    it("should reject empty strings", () => {
      const invalid = {
        amount: 100,
        denom: "",
        sourceChain: "initia",
        targetChain: "ethereum",
        recipientAddress: "0x1234567890abcdef",
      };
      
      const result = BridgeInitiateRequestSchema.safeParse(invalid);
      assert.strictEqual(result.success, false);
    });
  });

  describe("Validation Helper Functions", () => {
    describe("validateRequestBody", () => {
      it("should return success for valid data", () => {
        const data = {
          rewardId: "reward-123",
          initiaAddress: "init1abc123def456",
        };
        
        const result = validateRequestBody(RedeemRequestSchema, data);
        assert.strictEqual(result.success, true);
        if (result.success) {
          assert.strictEqual(result.data.rewardId, "reward-123");
        }
      });

      it("should return error for invalid data", () => {
        const data = {
          rewardId: "reward-123",
          // Missing initiaAddress
        };
        
        const result = validateRequestBody(RedeemRequestSchema, data);
        assert.strictEqual(result.success, false);
        if (!result.success) {
          assert.ok(result.error);
        }
      });
    });

    describe("validateQueryParams", () => {
      it("should parse URLSearchParams correctly", () => {
        const params = new URLSearchParams({
          category: "transit",
          limit: "10",
        });
        
        const result = validateQueryParams(TasksQueryParamsSchema, params);
        assert.strictEqual(result.success, true);
        if (result.success) {
          assert.strictEqual(result.data.category, "transit");
          assert.strictEqual(result.data.limit, 10);
        }
      });

      it("should return error for invalid params", () => {
        const params = new URLSearchParams({
          category: "invalid",
        });
        
        const result = validateQueryParams(TasksQueryParamsSchema, params);
        assert.strictEqual(result.success, false);
      });
    });

    describe("formatValidationError", () => {
      it("should format validation errors correctly", () => {
        const data = {
          rewardId: "",
          // Missing initiaAddress
        };
        
        const parseResult = RedeemRequestSchema.safeParse(data);
        assert.strictEqual(parseResult.success, false);
        
        if (!parseResult.success) {
          const formatted = formatValidationError(parseResult.error);
          assert.strictEqual(formatted.message, "Validation failed");
          assert.ok(Array.isArray(formatted.details));
          assert.ok(formatted.details.length > 0);
          assert.ok(formatted.details[0].field !== undefined);
          assert.ok(formatted.details[0].message !== undefined);
        }
      });
    });
  });
});
