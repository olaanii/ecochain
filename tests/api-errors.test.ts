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
      
      expect(result.statusCode).toBe(400);
      expect(result.errorCode).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize missing field errors", () => {
      const error = new Error("Validation failed: Missing required field: taskId");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(400);
      expect(result.errorCode).toBe(ErrorCodes.MISSING_REQUIRED_FIELD);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize authentication errors", () => {
      const error = new Error("Unauthorized: authentication required");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(401);
      expect(result.errorCode).toBe(ErrorCodes.AUTHENTICATION_ERROR);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize missing token errors", () => {
      const error = new Error("Missing token in request");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(401);
      expect(result.errorCode).toBe(ErrorCodes.MISSING_TOKEN);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize expired token errors", () => {
      const error = new Error("Token has expired");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(401);
      expect(result.errorCode).toBe(ErrorCodes.EXPIRED_TOKEN);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize authorization errors", () => {
      const error = new Error("Forbidden: insufficient permissions");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(403);
      expect(result.errorCode).toBe(ErrorCodes.AUTHORIZATION_ERROR);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize role requirement errors", () => {
      const error = new Error("Access denied: admin role required");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(403);
      expect(result.errorCode).toBe(ErrorCodes.ROLE_REQUIREMENT_NOT_MET);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize not found errors", () => {
      const error = new Error("Resource not found");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(404);
      expect(result.errorCode).toBe(ErrorCodes.NOT_FOUND);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize task not found errors", () => {
      const error = new Error("Task not found with id: 123");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(404);
      expect(result.errorCode).toBe(ErrorCodes.TASK_NOT_FOUND);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(429);
      expect(result.errorCode).toBe(ErrorCodes.RATE_LIMIT_EXCEEDED);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize database errors", () => {
      const error = new Error("Database connection failed");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(500);
      expect(result.errorCode).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.isOperational).toBe(false);
    });
    
    it("should categorize insufficient balance errors", () => {
      const error = new Error("Insufficient balance for redemption");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(400);
      expect(result.errorCode).toBe(ErrorCodes.INSUFFICIENT_BALANCE);
      expect(result.isOperational).toBe(true);
    });
    
    it("should categorize oracle errors", () => {
      const error = new Error("Oracle service unavailable");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(500);
      expect(result.errorCode).toBe(ErrorCodes.ORACLE_ERROR);
      expect(result.isOperational).toBe(true);
    });
    
    it("should handle non-Error objects", () => {
      const result = categorizeError("string error");
      
      expect(result.statusCode).toBe(500);
      expect(result.errorCode).toBe(ErrorCodes.INTERNAL_SERVER_ERROR);
      expect(result.isOperational).toBe(false);
    });
    
    it("should default to internal server error for unknown errors", () => {
      const error = new Error("Something went wrong");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(500);
      expect(result.errorCode).toBe(ErrorCodes.INTERNAL_SERVER_ERROR);
      expect(result.isOperational).toBe(false);
    });
  });
  
  describe("sanitizeErrorMessage", () => {
    it("should remove file paths from error messages", () => {
      const message = "Error in /home/user/project/src/api/tasks.ts";
      const sanitized = sanitizeErrorMessage(message);
      
      expect(sanitized).toBe("Error in [file]");
      expect(sanitized.includes("/home/user")).toBe(false);
    });
    
    it("should remove database connection strings", () => {
      const message = "Failed to connect to postgresql://user:pass@localhost:5432/db";
      const sanitized = sanitizeErrorMessage(message);
      
      expect(sanitized).toBe("Failed to connect to [connection_string]");
      expect(sanitized.includes("user:pass")).toBe(false);
    });
    
    it("should remove Bearer tokens", () => {
      const message = "Invalid token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const sanitized = sanitizeErrorMessage(message);
      
      // The token pattern will match first, then Bearer pattern
      // Result will have both patterns applied
      expect(sanitized.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")).toBe(false);
      expect(sanitized.includes("[token]") || sanitized.includes("[redacted]")).toBe(true);
    });
    
    it("should remove API keys", () => {
      const message = "API request failed with api_key=sk_test_1234567890";
      const sanitized = sanitizeErrorMessage(message);
      
      expect(sanitized).toBe("API request failed with api_key=[redacted]");
      expect(sanitized.includes("sk_test_1234567890")).toBe(false);
    });
    
    it("should remove email addresses", () => {
      const message = "User not found: user@example.com";
      const sanitized = sanitizeErrorMessage(message);
      
      expect(sanitized).toBe("User not found: [email]");
      expect(sanitized.includes("user@example.com")).toBe(false);
    });
    
    it("should remove IP addresses", () => {
      const message = "Request from 192.168.1.100 blocked";
      const sanitized = sanitizeErrorMessage(message);
      
      expect(sanitized).toBe("Request from [ip_address] blocked");
      expect(sanitized.includes("192.168.1.100")).toBe(false);
    });
    
    it("should remove blockchain addresses", () => {
      const message = "Transfer to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
      const sanitized = sanitizeErrorMessage(message);
      
      // Check that the address is removed
      expect(sanitized.includes("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0")).toBe(false);
      expect(sanitized.includes("[address]")).toBe(true);
    });
    
    it("should remove passwords", () => {
      const message = "Authentication failed with password=secret123";
      const sanitized = sanitizeErrorMessage(message);
      
      expect(sanitized).toBe("Authentication failed with password=[redacted]");
      expect(sanitized.includes("secret123")).toBe(false);
    });
    
    it("should handle messages with multiple sensitive data types", () => {
      const message = "Error at /app/src/auth.ts: Invalid token Bearer abc123 for user@example.com from 10.0.0.1";
      const sanitized = sanitizeErrorMessage(message);
      
      expect(sanitized.includes("/app/src/auth.ts")).toBe(false);
      expect(sanitized.includes("abc123")).toBe(false);
      expect(sanitized.includes("user@example.com")).toBe(false);
      expect(sanitized.includes("10.0.0.1")).toBe(false);
    });
    
    it("should preserve non-sensitive information", () => {
      const message = "Validation failed: taskId is required";
      const sanitized = sanitizeErrorMessage(message);
      
      expect(sanitized).toBe(message);
    });
  });
  
  describe("sanitizeStackTrace", () => {
    it("should sanitize stack traces", () => {
      const stack = `Error: Database error
    at /home/user/project/src/api/tasks.ts:42:15
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`;
      
      const sanitized = sanitizeStackTrace(stack);
      
      expect(sanitized).toBeDefined();
      if (sanitized) {
        expect(sanitized.includes("/home/user/project")).toBe(false);
        expect(sanitized.includes("[file]")).toBe(true);
      }
    });
    
    it("should return undefined for undefined input", () => {
      const sanitized = sanitizeStackTrace(undefined);
      
      expect(sanitized).toBeUndefined();
    });
  });
  
  describe("sanitizeError", () => {
    it("should sanitize error object in development", () => {
      const originalEnv = process.env.NODE_ENV;
      // @ts-ignore - NODE_ENV is read-only in some TypeScript configs
      process.env.NODE_ENV = "development";
      
      const error = new Error("Error with token=secret123");
      error.stack = "Error: Error with token=secret123\n    at /app/src/api.ts:10:5";
      
      const sanitized = sanitizeError(error);
      
      expect(sanitized.message.includes("secret123")).toBe(false);
      expect(sanitized.stack).toBeDefined();
      if (sanitized.stack) {
        expect(sanitized.stack.includes("/app/src/api.ts")).toBe(false);
      }
      
      // @ts-ignore
      process.env.NODE_ENV = originalEnv;
    });
    
    it("should not include stack in production", () => {
      const originalEnv = process.env.NODE_ENV;
      // @ts-ignore - NODE_ENV is read-only in some TypeScript configs
      process.env.NODE_ENV = "production";
      
      const error = new Error("Production error");
      error.stack = "Error: Production error\n    at /app/src/api.ts:10:5";
      
      const sanitized = sanitizeError(error);
      
      expect(sanitized.stack).toBeUndefined();
      
      // @ts-ignore
      process.env.NODE_ENV = originalEnv;
    });
  });
  
  describe("isOperationalError", () => {
    it("should return true for validation errors", () => {
      const error = new Error("Validation failed");
      
      expect(isOperationalError(error)).toBe(true);
    });
    
    it("should return true for authentication errors", () => {
      const error = new Error("Unauthorized");
      
      expect(isOperationalError(error)).toBe(true);
    });
    
    it("should return false for database errors", () => {
      const error = new Error("Database connection failed");
      
      expect(isOperationalError(error)).toBe(false);
    });
    
    it("should return false for non-Error objects", () => {
      expect(isOperationalError("string error")).toBe(false);
    });
  });
  
  describe("isRetryableError", () => {
    it("should return true for database errors", () => {
      const error = new Error("Database query timeout");
      
      expect(isRetryableError(error)).toBe(true);
    });
    
    it("should return true for rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      
      expect(isRetryableError(error)).toBe(true);
    });
    
    it("should return true for oracle errors", () => {
      const error = new Error("Oracle service unavailable");
      
      expect(isRetryableError(error)).toBe(true);
    });
    
    it("should return false for validation errors", () => {
      const error = new Error("Validation failed");
      
      expect(isRetryableError(error)).toBe(false);
    });
    
    it("should return false for authentication errors", () => {
      const error = new Error("Unauthorized");
      
      expect(isRetryableError(error)).toBe(false);
    });
  });
  
  describe("getErrorLogLevel", () => {
    it("should return 'warn' for validation errors", () => {
      const error = new Error("Validation failed");
      
      expect(getErrorLogLevel(error)).toBe("warn");
    });
    
    it("should return 'warn' for not found errors", () => {
      const error = new Error("Resource not found");
      
      expect(getErrorLogLevel(error)).toBe("warn");
    });
    
    it("should return 'info' for rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      
      expect(getErrorLogLevel(error)).toBe("info");
    });
    
    it("should return 'error' for server errors", () => {
      const error = new Error("Internal server error");
      
      expect(getErrorLogLevel(error)).toBe("error");
    });
    
    it("should return 'error' for non-Error objects", () => {
      expect(getErrorLogLevel("string error")).toBe("error");
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
      
      expect(logEntry.level).toBe("warn");
      expect(logEntry.message).toBe("API Error");
      expect(logEntry.error.includes("Validation failed")).toBe(true);
      expect(logEntry.errorCode).toBe(ErrorCodes.VALIDATION_ERROR);
      expect(logEntry.statusCode).toBe(400);
      expect(logEntry.context).toEqual(context);
      expect(logEntry.timestamp).toBeDefined();
    });
    
    it("should sanitize error message in log entry", () => {
      const error = new Error("Error with token=secret123");
      const context = { requestId: "req_123" };
      
      const logEntry = createErrorLogEntry(error, context);
      
      expect(logEntry.error.includes("secret123")).toBe(false);
      expect(logEntry.error.includes("[redacted]")).toBe(true);
    });
    
    it("should handle non-Error objects", () => {
      const context = { requestId: "req_123" };
      
      const logEntry = createErrorLogEntry("string error", context);
      
      expect(logEntry.level).toBe("error");
      expect(logEntry.errorCode).toBe(ErrorCodes.INTERNAL_SERVER_ERROR);
      expect(logEntry.statusCode).toBe(500);
    });
  });
  
  describe("ErrorCodes and ErrorMessages", () => {
    it("should have matching error codes and messages", () => {
      const codes = Object.values(ErrorCodes);
      const messageKeys = Object.keys(ErrorMessages);
      
      expect(codes.length).toBe(messageKeys.length);
      
      codes.forEach((code) => {
        expect(ErrorMessages[code]).toBeDefined();
        expect(ErrorMessages[code].length).toBeGreaterThan(0);
      });
    });
    
    it("should have unique error codes", () => {
      const codes = Object.values(ErrorCodes);
      const uniqueCodes = new Set(codes);
      
      expect(codes.length).toBe(uniqueCodes.size);
    });
  });
});
