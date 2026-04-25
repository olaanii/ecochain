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

      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe("sanitizeErrorMessage", () => {
    it("should remove file paths from error messages", () => {
      const message = "Error in /home/user/project/src/file.ts";
      const sanitized = sanitizeErrorMessage(message);

      expect(sanitized).toBe("Error in [file]");
      expect(sanitized).not.toContain("/home/user");
    });

    it("should remove connection strings", () => {
      const message = "Failed to connect to postgresql://user:pass@localhost:5432/db";
      const sanitized = sanitizeErrorMessage(message);

      expect(sanitized).toBe("Failed to connect to [connection_string]");
      expect(sanitized).not.toContain("postgresql://");
    });

    it("should remove Bearer tokens", () => {
      const message = "Invalid token: Bearer abc123xyz456";
      const sanitized = sanitizeErrorMessage(message);

      // The token pattern matches first, then Bearer pattern
      expect(sanitized).not.toContain("abc123xyz456");
      expect(sanitized.includes("[token]") || sanitized.includes("[redacted]")).toBe(true);
    });

    it("should remove API keys", () => {
      const message = "API request failed with api_key=secret123";
      const sanitized = sanitizeErrorMessage(message);

      expect(sanitized).toBe("API request failed with api_key=[redacted]");
      expect(sanitized).not.toContain("secret123");
    });

    it("should handle multiple sensitive data types", () => {
      const message = "Error at /path/file.ts with token=abc123 and api-key=xyz789";
      const sanitized = sanitizeErrorMessage(message);

      expect(sanitized).not.toContain("/path/file.ts");
      expect(sanitized).not.toContain("abc123");
      expect(sanitized).not.toContain("xyz789");
    });
  });

  describe("categorizeError", () => {
    it("should categorize validation errors", () => {
      const error = new Error("Validation failed: invalid email");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(400);
      expect(result.errorCode).toBe("VALIDATION_ERROR");
      expect(result.message).toBe("Validation failed: invalid email");
    });

    it("should categorize authentication errors", () => {
      const error = new Error("Unauthorized access");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(401);
      expect(result.errorCode).toBe("AUTHENTICATION_ERROR");
      expect(result.message).toBe("Authentication required");
    });

    it("should categorize authorization errors", () => {
      const error = new Error("Forbidden: insufficient permissions");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(403);
      expect(result.errorCode).toBe("AUTHORIZATION_ERROR");
      expect(result.message).toBe("Insufficient permissions");
    });

    it("should categorize not found errors", () => {
      const error = new Error("Resource not found");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(404);
      expect(result.errorCode).toBe("NOT_FOUND");
      expect(result.message).toBe("Resource not found");
    });

    it("should categorize rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(429);
      expect(result.errorCode).toBe("RATE_LIMIT_EXCEEDED");
      expect(result.message).toBe("Too many requests");
    });

    it("should default to internal server error", () => {
      const error = new Error("Something went wrong");
      const result = categorizeError(error);
      
      expect(result.statusCode).toBe(500);
      expect(result.errorCode).toBe("INTERNAL_SERVER_ERROR");
      expect(result.message).toBe("An unexpected error occurred");
    });
  });

  describe("formatSuccessResponse", () => {
    it("should format success response with data", () => {
      const data = { id: "123", name: "Test" };
      const response = formatSuccessResponse(data);
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.meta).toBeDefined();
      expect(response.meta?.timestamp).toBeDefined();
      expect(response.meta?.requestId).toBeDefined();
    });

    it("should include custom request ID", () => {
      const data = { id: "123" };
      const requestId = "custom_req_id";
      const response = formatSuccessResponse(data, requestId);
      
      expect(response.meta?.requestId).toBe(requestId);
    });

    it("should handle null data", () => {
      const response = formatSuccessResponse(null);
      
      expect(response.success).toBe(true);
      expect(response.data).toBe(null);
    });

    it("should handle array data", () => {
      const data = [{ id: "1" }, { id: "2" }];
      const response = formatSuccessResponse(data);
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(Array.isArray(response.data));
    });
  });

  describe("formatErrorResponse", () => {
    it("should format error response", () => {
      const response = formatErrorResponse(
        "TEST_ERROR",
        "Test error message"
      );
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe("TEST_ERROR");
      expect(response.error?.message).toBe("Test error message");
      expect(response.meta).toBeDefined();
    });

    it("should sanitize error message", () => {
      const response = formatErrorResponse(
        "ERROR",
        "Error at /path/file.ts with token=abc123"
      );
      
      expect(response.error?.message).not.toContain("/path/file.ts");
      expect(response.error?.message).not.toContain("abc123");
    });

    it("should include details in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      // @ts-ignore - NODE_ENV is read-only in some TypeScript configs
      process.env.NODE_ENV = "development";

      const details = { stack: "Error stack trace" };
      const response = formatErrorResponse(
        "ERROR",
        "Test error",
        details
      );

      expect(response.error?.details).toEqual(details);

      // @ts-ignore
      process.env.NODE_ENV = originalEnv;
    });

    it("should exclude details in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      // @ts-ignore - NODE_ENV is read-only in some TypeScript configs
      process.env.NODE_ENV = "production";

      const details = { stack: "Error stack trace" };
      const response = formatErrorResponse(
        "ERROR",
        "Test error",
        details
      );

      expect(response.error?.details).toBeUndefined();

      // @ts-ignore
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
      
      expect(response.meta?.requestId).toBe(requestId);
    });
  });

  describe("jsonResponse", () => {
    it("should create JSON response with default status", () => {
      const data = formatSuccessResponse({ test: "data" });
      const response = jsonResponse(data);
      
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("should create JSON response with custom status", () => {
      const data = formatErrorResponse("ERROR", "Test error");
      const response = jsonResponse(data, 400);
      
      expect(response.status).toBe(400);
    });

    it("should include custom headers", () => {
      const data = formatSuccessResponse({ test: "data" });
      const response = jsonResponse(data, 200, {
        "X-Custom-Header": "custom-value",
      });
      
      expect(response.headers.get("X-Custom-Header")).toBe("custom-value");
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });
  });
});

describe("Error Categorization Edge Cases", () => {
  it("should handle errors with mixed case messages", () => {
    const error = new Error("VALIDATION Failed");
    const result = categorizeError(error);
    
    expect(result.statusCode).toBe(400);
    expect(result.errorCode).toBe("VALIDATION_ERROR");
  });

  it("should handle errors with multiple keywords", () => {
    const error = new Error("Unauthorized: validation failed");
    const result = categorizeError(error);
    
    // Should match first keyword (validation)
    expect(result.statusCode).toBe(400);
    expect(result.errorCode).toBe("VALIDATION_ERROR");
  });

  it("should handle empty error messages", () => {
    const error = new Error("");
    const result = categorizeError(error);
    
    expect(result.statusCode).toBe(500);
    expect(result.errorCode).toBe("INTERNAL_SERVER_ERROR");
  });
});

describe("Sanitization Edge Cases", () => {
  it("should handle messages with no sensitive data", () => {
    const message = "Simple error message";
    const sanitized = sanitizeErrorMessage(message);
    
    expect(sanitized).toBe(message);
  });

  it("should handle empty messages", () => {
    const message = "";
    const sanitized = sanitizeErrorMessage(message);
    
    expect(sanitized).toBe("");
  });

  it("should handle messages with multiple file paths", () => {
    const message = "Error in /path/file1.ts and /path/file2.js";
    const sanitized = sanitizeErrorMessage(message);
    
    expect(sanitized).toBe("Error in [file] and [file]");
  });
});
