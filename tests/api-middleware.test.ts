import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generateRequestId,
  sanitizeErrorMessage,
  categorizeError,
  formatSuccessResponse,
  formatErrorResponse,
  jsonResponse,
} from "../src/lib/api/middleware.js";

describe("API Middleware Utilities", () => {
  describe("generateRequestId", () => {
    it("should generate unique request IDs", () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      assert.match(id1, /^req_\d+_[a-z0-9]+$/);
      assert.match(id2, /^req_\d+_[a-z0-9]+$/);
      assert.notStrictEqual(id1, id2);
    });
  });

  describe("sanitizeErrorMessage", () => {
    it("should remove file paths from error messages", () => {
      const message = "Error in /home/user/project/src/file.ts";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "Error in [file]");
      assert.ok(!sanitized.includes("/home/user"));
    });

    it("should remove connection strings", () => {
      const message = "Failed to connect to postgresql://user:pass@localhost:5432/db";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "Failed to connect to [connection_string]");
      assert.ok(!sanitized.includes("postgresql://"));
    });

    it("should remove Bearer tokens", () => {
      const message = "Invalid token: Bearer abc123xyz456";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "Invalid token: Bearer [token]");
      assert.ok(!sanitized.includes("abc123xyz456"));
    });

    it("should remove API keys", () => {
      const message = "API request failed with api_key=secret123";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "API request failed with api_key=[redacted]");
      assert.ok(!sanitized.includes("secret123"));
    });

    it("should handle multiple sensitive data types", () => {
      const message = "Error at /path/file.ts with token=abc123 and api-key=xyz789";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.ok(!sanitized.includes("/path/file.ts"));
      assert.ok(!sanitized.includes("abc123"));
      assert.ok(!sanitized.includes("xyz789"));
    });
  });

  describe("categorizeError", () => {
    it("should categorize validation errors", () => {
      const error = new Error("Validation failed: invalid email");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 400);
      assert.strictEqual(result.errorCode, "VALIDATION_ERROR");
      assert.strictEqual(result.message, "Validation failed: invalid email");
    });

    it("should categorize authentication errors", () => {
      const error = new Error("Unauthorized access");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 401);
      assert.strictEqual(result.errorCode, "AUTHENTICATION_ERROR");
      assert.strictEqual(result.message, "Authentication required");
    });

    it("should categorize authorization errors", () => {
      const error = new Error("Forbidden: insufficient permissions");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 403);
      assert.strictEqual(result.errorCode, "AUTHORIZATION_ERROR");
      assert.strictEqual(result.message, "Insufficient permissions");
    });

    it("should categorize not found errors", () => {
      const error = new Error("Resource not found");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 404);
      assert.strictEqual(result.errorCode, "NOT_FOUND");
      assert.strictEqual(result.message, "Resource not found");
    });

    it("should categorize rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 429);
      assert.strictEqual(result.errorCode, "RATE_LIMIT_EXCEEDED");
      assert.strictEqual(result.message, "Too many requests");
    });

    it("should default to internal server error", () => {
      const error = new Error("Something went wrong");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 500);
      assert.strictEqual(result.errorCode, "INTERNAL_SERVER_ERROR");
      assert.strictEqual(result.message, "An unexpected error occurred");
    });
  });

  describe("formatSuccessResponse", () => {
    it("should format success response with data", () => {
      const data = { id: "123", name: "Test" };
      const response = formatSuccessResponse(data);
      
      assert.strictEqual(response.success, true);
      assert.deepStrictEqual(response.data, data);
      assert.ok(response.meta);
      assert.ok(response.meta?.timestamp);
      assert.ok(response.meta?.requestId);
    });

    it("should include custom request ID", () => {
      const data = { id: "123" };
      const requestId = "custom_req_id";
      const response = formatSuccessResponse(data, requestId);
      
      assert.strictEqual(response.meta?.requestId, requestId);
    });

    it("should handle null data", () => {
      const response = formatSuccessResponse(null);
      
      assert.strictEqual(response.success, true);
      assert.strictEqual(response.data, null);
    });

    it("should handle array data", () => {
      const data = [{ id: "1" }, { id: "2" }];
      const response = formatSuccessResponse(data);
      
      assert.strictEqual(response.success, true);
      assert.deepStrictEqual(response.data, data);
      assert.ok(Array.isArray(response.data));
    });
  });

  describe("formatErrorResponse", () => {
    it("should format error response", () => {
      const response = formatErrorResponse(
        "TEST_ERROR",
        "Test error message"
      );
      
      assert.strictEqual(response.success, false);
      assert.ok(response.error);
      assert.strictEqual(response.error?.code, "TEST_ERROR");
      assert.strictEqual(response.error?.message, "Test error message");
      assert.ok(response.meta);
    });

    it("should sanitize error message", () => {
      const response = formatErrorResponse(
        "ERROR",
        "Error at /path/file.ts with token=abc123"
      );
      
      assert.ok(!response.error?.message.includes("/path/file.ts"));
      assert.ok(!response.error?.message.includes("abc123"));
    });

    it("should include details in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      
      const details = { stack: "Error stack trace" };
      const response = formatErrorResponse(
        "ERROR",
        "Test error",
        details
      );
      
      assert.deepStrictEqual(response.error?.details, details);
      
      process.env.NODE_ENV = originalEnv;
    });

    it("should exclude details in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      const details = { stack: "Error stack trace" };
      const response = formatErrorResponse(
        "ERROR",
        "Test error",
        details
      );
      
      assert.strictEqual(response.error?.details, undefined);
      
      process.env.NODE_ENV = originalEnv;
    });

    it("should include custom request ID", () => {
      const requestId = "custom_req_id";
      const response = formatErrorResponse(
        "ERROR",
        "Test error",
        undefined,
        requestId
      );
      
      assert.strictEqual(response.meta?.requestId, requestId);
    });
  });

  describe("jsonResponse", () => {
    it("should create JSON response with default status", () => {
      const data = formatSuccessResponse({ test: "data" });
      const response = jsonResponse(data);
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers.get("Content-Type"), "application/json");
    });

    it("should create JSON response with custom status", () => {
      const data = formatErrorResponse("ERROR", "Test error");
      const response = jsonResponse(data, 400);
      
      assert.strictEqual(response.status, 400);
    });

    it("should include custom headers", () => {
      const data = formatSuccessResponse({ test: "data" });
      const response = jsonResponse(data, 200, {
        "X-Custom-Header": "custom-value",
      });
      
      assert.strictEqual(response.headers.get("X-Custom-Header"), "custom-value");
      assert.strictEqual(response.headers.get("Content-Type"), "application/json");
    });
  });
});

describe("Error Categorization Edge Cases", () => {
  it("should handle errors with mixed case messages", () => {
    const error = new Error("VALIDATION Failed");
    const result = categorizeError(error);
    
    assert.strictEqual(result.statusCode, 400);
    assert.strictEqual(result.errorCode, "VALIDATION_ERROR");
  });

  it("should handle errors with multiple keywords", () => {
    const error = new Error("Unauthorized: validation failed");
    const result = categorizeError(error);
    
    // Should match first keyword (validation)
    assert.strictEqual(result.statusCode, 400);
    assert.strictEqual(result.errorCode, "VALIDATION_ERROR");
  });

  it("should handle empty error messages", () => {
    const error = new Error("");
    const result = categorizeError(error);
    
    assert.strictEqual(result.statusCode, 500);
    assert.strictEqual(result.errorCode, "INTERNAL_SERVER_ERROR");
  });
});

describe("Sanitization Edge Cases", () => {
  it("should handle messages with no sensitive data", () => {
    const message = "Simple error message";
    const sanitized = sanitizeErrorMessage(message);
    
    assert.strictEqual(sanitized, message);
  });

  it("should handle empty messages", () => {
    const message = "";
    const sanitized = sanitizeErrorMessage(message);
    
    assert.strictEqual(sanitized, "");
  });

  it("should handle messages with multiple file paths", () => {
    const message = "Error in /path/file1.ts and /path/file2.js";
    const sanitized = sanitizeErrorMessage(message);
    
    assert.strictEqual(sanitized, "Error in [file] and [file]");
  });
});
