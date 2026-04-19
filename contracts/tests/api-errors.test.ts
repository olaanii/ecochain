import { describe, it } from "node:test";
import assert from "node:assert";
import {
  ErrorCodes,
  ErrorMessages,
  categorizeError,
  sanitizeErrorMessage,
  sanitizeStackTrace,
  sanitizeError,
  isOperationalError,
  isRetryableError,
  getErrorLogLevel,
  createErrorLogEntry,
} from "../src/lib/api/errors.js";

describe("API Error Handling Utilities", () => {
  describe("categorizeError", () => {
    it("should categorize validation errors correctly", () => {
      const error = new Error("Validation failed: invalid email");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 400);
      assert.strictEqual(result.errorCode, ErrorCodes.VALIDATION_ERROR);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize missing field errors", () => {
      const error = new Error("Validation failed: Missing required field: taskId");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 400);
      assert.strictEqual(result.errorCode, ErrorCodes.MISSING_REQUIRED_FIELD);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize authentication errors", () => {
      const error = new Error("Unauthorized: authentication required");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 401);
      assert.strictEqual(result.errorCode, ErrorCodes.AUTHENTICATION_ERROR);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize missing token errors", () => {
      const error = new Error("Missing token in request");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 401);
      assert.strictEqual(result.errorCode, ErrorCodes.MISSING_TOKEN);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize expired token errors", () => {
      const error = new Error("Token has expired");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 401);
      assert.strictEqual(result.errorCode, ErrorCodes.EXPIRED_TOKEN);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize authorization errors", () => {
      const error = new Error("Forbidden: insufficient permissions");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 403);
      assert.strictEqual(result.errorCode, ErrorCodes.AUTHORIZATION_ERROR);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize role requirement errors", () => {
      const error = new Error("Access denied: admin role required");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 403);
      assert.strictEqual(result.errorCode, ErrorCodes.ROLE_REQUIREMENT_NOT_MET);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize not found errors", () => {
      const error = new Error("Resource not found");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 404);
      assert.strictEqual(result.errorCode, ErrorCodes.NOT_FOUND);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize task not found errors", () => {
      const error = new Error("Task not found with id: 123");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 404);
      assert.strictEqual(result.errorCode, ErrorCodes.TASK_NOT_FOUND);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 429);
      assert.strictEqual(result.errorCode, ErrorCodes.RATE_LIMIT_EXCEEDED);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize database errors", () => {
      const error = new Error("Database connection failed");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 500);
      assert.strictEqual(result.errorCode, ErrorCodes.DATABASE_ERROR);
      assert.strictEqual(result.isOperational, false);
    });
    
    it("should categorize insufficient balance errors", () => {
      const error = new Error("Insufficient balance for redemption");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 400);
      assert.strictEqual(result.errorCode, ErrorCodes.INSUFFICIENT_BALANCE);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should categorize oracle errors", () => {
      const error = new Error("Oracle service unavailable");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 500);
      assert.strictEqual(result.errorCode, ErrorCodes.ORACLE_ERROR);
      assert.strictEqual(result.isOperational, true);
    });
    
    it("should handle non-Error objects", () => {
      const result = categorizeError("string error");
      
      assert.strictEqual(result.statusCode, 500);
      assert.strictEqual(result.errorCode, ErrorCodes.INTERNAL_SERVER_ERROR);
      assert.strictEqual(result.isOperational, false);
    });
    
    it("should default to internal server error for unknown errors", () => {
      const error = new Error("Something went wrong");
      const result = categorizeError(error);
      
      assert.strictEqual(result.statusCode, 500);
      assert.strictEqual(result.errorCode, ErrorCodes.INTERNAL_SERVER_ERROR);
      assert.strictEqual(result.isOperational, false);
    });
  });
  
  describe("sanitizeErrorMessage", () => {
    it("should remove file paths from error messages", () => {
      const message = "Error in /home/user/project/src/api/tasks.ts";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "Error in [file]");
      assert.ok(!sanitized.includes("/home/user"));
    });
    
    it("should remove database connection strings", () => {
      const message = "Failed to connect to postgresql://user:pass@localhost:5432/db";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "Failed to connect to [connection_string]");
      assert.ok(!sanitized.includes("user:pass"));
    });
    
    it("should remove Bearer tokens", () => {
      const message = "Invalid token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const sanitized = sanitizeErrorMessage(message);
      
      // The token pattern will match first, then Bearer pattern
      // Result will have both patterns applied
      assert.ok(!sanitized.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"));
      assert.ok(sanitized.includes("[token]") || sanitized.includes("[redacted]"));
    });
    
    it("should remove API keys", () => {
      const message = "API request failed with api_key=sk_test_1234567890";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "API request failed with api_key=[redacted]");
      assert.ok(!sanitized.includes("sk_test_1234567890"));
    });
    
    it("should remove email addresses", () => {
      const message = "User not found: user@example.com";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "User not found: [email]");
      assert.ok(!sanitized.includes("user@example.com"));
    });
    
    it("should remove IP addresses", () => {
      const message = "Request from 192.168.1.100 blocked";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "Request from [ip_address] blocked");
      assert.ok(!sanitized.includes("192.168.1.100"));
    });
    
    it("should remove blockchain addresses", () => {
      const message = "Transfer to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
      const sanitized = sanitizeErrorMessage(message);
      
      // Check that the address is removed
      assert.ok(!sanitized.includes("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"));
      assert.ok(sanitized.includes("[address]"));
    });
    
    it("should remove passwords", () => {
      const message = "Authentication failed with password=secret123";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, "Authentication failed with password=[redacted]");
      assert.ok(!sanitized.includes("secret123"));
    });
    
    it("should handle messages with multiple sensitive data types", () => {
      const message = "Error at /app/src/auth.ts: Invalid token Bearer abc123 for user@example.com from 10.0.0.1";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.ok(!sanitized.includes("/app/src/auth.ts"));
      assert.ok(!sanitized.includes("abc123"));
      assert.ok(!sanitized.includes("user@example.com"));
      assert.ok(!sanitized.includes("10.0.0.1"));
    });
    
    it("should preserve non-sensitive information", () => {
      const message = "Validation failed: taskId is required";
      const sanitized = sanitizeErrorMessage(message);
      
      assert.strictEqual(sanitized, message);
    });
  });
  
  describe("sanitizeStackTrace", () => {
    it("should sanitize stack traces", () => {
      const stack = `Error: Database error
    at /home/user/project/src/api/tasks.ts:42:15
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`;
      
      const sanitized = sanitizeStackTrace(stack);
      
      assert.ok(sanitized);
      assert.ok(!sanitized.includes("/home/user/project"));
      assert.ok(sanitized.includes("[file]"));
    });
    
    it("should return undefined for undefined input", () => {
      const sanitized = sanitizeStackTrace(undefined);
      
      assert.strictEqual(sanitized, undefined);
    });
  });
  
  describe("sanitizeError", () => {
    it("should sanitize error object in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";
      
      const error = new Error("Error with token=secret123");
      error.stack = "Error: Error with token=secret123\n    at /app/src/api.ts:10:5";
      
      const sanitized = sanitizeError(error);
      
      assert.ok(!sanitized.message.includes("secret123"));
      assert.ok(sanitized.stack);
      assert.ok(!sanitized.stack.includes("/app/src/api.ts"));
      
      process.env.NODE_ENV = originalEnv;
    });
    
    it("should not include stack in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      const error = new Error("Production error");
      error.stack = "Error: Production error\n    at /app/src/api.ts:10:5";
      
      const sanitized = sanitizeError(error);
      
      assert.strictEqual(sanitized.stack, undefined);
      
      process.env.NODE_ENV = originalEnv;
    });
  });
  
  describe("isOperationalError", () => {
    it("should return true for validation errors", () => {
      const error = new Error("Validation failed");
      
      assert.strictEqual(isOperationalError(error), true);
    });
    
    it("should return true for authentication errors", () => {
      const error = new Error("Unauthorized");
      
      assert.strictEqual(isOperationalError(error), true);
    });
    
    it("should return false for database errors", () => {
      const error = new Error("Database connection failed");
      
      assert.strictEqual(isOperationalError(error), false);
    });
    
    it("should return false for non-Error objects", () => {
      assert.strictEqual(isOperationalError("string error"), false);
    });
  });
  
  describe("isRetryableError", () => {
    it("should return true for database errors", () => {
      const error = new Error("Database query timeout");
      
      assert.strictEqual(isRetryableError(error), true);
    });
    
    it("should return true for rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      
      assert.strictEqual(isRetryableError(error), true);
    });
    
    it("should return true for oracle errors", () => {
      const error = new Error("Oracle service unavailable");
      
      assert.strictEqual(isRetryableError(error), true);
    });
    
    it("should return false for validation errors", () => {
      const error = new Error("Validation failed");
      
      assert.strictEqual(isRetryableError(error), false);
    });
    
    it("should return false for authentication errors", () => {
      const error = new Error("Unauthorized");
      
      assert.strictEqual(isRetryableError(error), false);
    });
  });
  
  describe("getErrorLogLevel", () => {
    it("should return 'warn' for validation errors", () => {
      const error = new Error("Validation failed");
      
      assert.strictEqual(getErrorLogLevel(error), "warn");
    });
    
    it("should return 'warn' for not found errors", () => {
      const error = new Error("Resource not found");
      
      assert.strictEqual(getErrorLogLevel(error), "warn");
    });
    
    it("should return 'info' for rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      
      assert.strictEqual(getErrorLogLevel(error), "info");
    });
    
    it("should return 'error' for server errors", () => {
      const error = new Error("Internal server error");
      
      assert.strictEqual(getErrorLogLevel(error), "error");
    });
    
    it("should return 'error' for non-Error objects", () => {
      assert.strictEqual(getErrorLogLevel("string error"), "error");
    });
  });
  
  describe("createErrorLogEntry", () => {
    it("should create structured log entry with all fields", () => {
      const error = new Error("Validation failed: invalid taskId");
      const context = {
        requestId: "req_123",
        userId: "user_456",
        method: "POST",
        path: "/api/verify",
      };
      
      const logEntry = createErrorLogEntry(error, context);
      
      assert.strictEqual(logEntry.level, "warn");
      assert.strictEqual(logEntry.message, "API Error");
      assert.ok(logEntry.error.includes("Validation failed"));
      assert.strictEqual(logEntry.errorCode, ErrorCodes.VALIDATION_ERROR);
      assert.strictEqual(logEntry.statusCode, 400);
      assert.deepStrictEqual(logEntry.context, context);
      assert.ok(logEntry.timestamp);
    });
    
    it("should sanitize error message in log entry", () => {
      const error = new Error("Error with token=secret123");
      const context = { requestId: "req_123" };
      
      const logEntry = createErrorLogEntry(error, context);
      
      assert.ok(!logEntry.error.includes("secret123"));
      assert.ok(logEntry.error.includes("[redacted]"));
    });
    
    it("should handle non-Error objects", () => {
      const context = { requestId: "req_123" };
      
      const logEntry = createErrorLogEntry("string error", context);
      
      assert.strictEqual(logEntry.level, "error");
      assert.strictEqual(logEntry.errorCode, ErrorCodes.INTERNAL_SERVER_ERROR);
      assert.strictEqual(logEntry.statusCode, 500);
    });
  });
  
  describe("ErrorCodes and ErrorMessages", () => {
    it("should have matching error codes and messages", () => {
      const codes = Object.values(ErrorCodes);
      const messageKeys = Object.keys(ErrorMessages);
      
      assert.strictEqual(codes.length, messageKeys.length);
      
      codes.forEach((code) => {
        assert.ok(ErrorMessages[code]);
        assert.ok(ErrorMessages[code].length > 0);
      });
    });
    
    it("should have unique error codes", () => {
      const codes = Object.values(ErrorCodes);
      const uniqueCodes = new Set(codes);
      
      assert.strictEqual(codes.length, uniqueCodes.size);
    });
  });
});
