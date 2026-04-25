/**
 * Tests for error handling middleware
 * Requirements: 26.1, 26.2, 26.3, 26.4, 26.7
 */

import { NextRequest } from "next/server";
import {
  errorHandlerMiddleware,
  createErrorContext,
  generateRequestId,
  ApiError,
  ApiErrors,
  withErrorHandling,
} from "@/lib/api/middleware/error-handler";

// Mock logger
jest.mock("@/lib/api/logger", () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
  logInfo: jest.fn(),
}));

describe("Error Handler Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ApiError", () => {
    it("should create an ApiError with all properties", () => {
      const error = new ApiError(400, "Bad request", "BAD_REQUEST", { field: "email" });

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad request");
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.details).toEqual({ field: "email" });
      expect(error.name).toBe("ApiError");
    });
  });

  describe("generateRequestId", () => {
    it("should generate unique request IDs", () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it("should generate request ID with timestamp and random suffix", () => {
      const id = generateRequestId();
      const parts = id.split("-");

      expect(parts.length).toBe(2);
      expect(parts[0]).toMatch(/^\d+$/);
      expect(parts[1]).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe("createErrorContext", () => {
    it("should create error context from request", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
      });

      const context = createErrorContext(request, "user_123");

      expect(context.userId).toBe("user_123");
      expect(context.path).toBe("/api/test");
      expect(context.method).toBe("POST");
      expect(context.requestId).toBeDefined();
      expect(context.timestamp).toBeDefined();
    });

    it("should use x-request-id header if provided", () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-request-id": "custom-request-id",
        },
      });

      const context = createErrorContext(request);

      expect(context.requestId).toBe("custom-request-id");
    });

    it("should generate request ID if not provided", () => {
      const request = new NextRequest("http://localhost:3000/api/test");

      const context = createErrorContext(request);

      expect(context.requestId).toBeDefined();
      expect(context.requestId).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe("errorHandlerMiddleware", () => {
    it("should handle ApiError with custom status code", async () => {
      const error = new ApiError(400, "Invalid input", "VALIDATION_ERROR", { field: "email" });
      const request = new NextRequest("http://localhost:3000/api/test");
      const context = createErrorContext(request, "user_123");

      const response = await errorHandlerMiddleware(error, request, context);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("VALIDATION_ERROR");
      expect(body.message).toBe("Invalid input");
      expect(body.requestId).toBe(context.requestId);
    });

    it("should handle SyntaxError as 400", async () => {
      const error = new SyntaxError("Unexpected token");
      const request = new NextRequest("http://localhost:3000/api/test");
      const context = createErrorContext(request);

      const response = await errorHandlerMiddleware(error, request, context);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("INVALID_JSON");
    });

    it("should handle TypeError as 400", async () => {
      const error = new TypeError("Cannot read property");
      const request = new NextRequest("http://localhost:3000/api/test");
      const context = createErrorContext(request);

      const response = await errorHandlerMiddleware(error, request, context);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("TYPE_ERROR");
    });

    it("should handle generic Error as 500", async () => {
      const error = new Error("Something went wrong");
      const request = new NextRequest("http://localhost:3000/api/test");
      const context = createErrorContext(request);

      const response = await errorHandlerMiddleware(error, request, context);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should include security headers in response", async () => {
      const error = new Error("Test error");
      const request = new NextRequest("http://localhost:3000/api/test");
      const context = createErrorContext(request);

      const response = await errorHandlerMiddleware(error, request, context);

      expect(response.headers.get("X-Request-ID")).toBe(context.requestId);
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("should redact sensitive data from details", async () => {
      const error = new ApiError(400, "Error", "TEST", {
        walletAddress: "initia1abcdefghijklmnopqrstuvwxyz123456789012",
        apiKey: "secret-key-123",
      });
      const request = new NextRequest("http://localhost:3000/api/test");
      const context = createErrorContext(request);

      const response = await errorHandlerMiddleware(error, request, context);
      const body = await response.json();

      // The redactSensitiveData function checks for keys containing "address", "wallet", "key", "secret"
      // and directly replaces the value with "[REDACTED]"
      expect(body.details.walletAddress).toBe("[REDACTED]");
      expect(body.details.apiKey).toBe("[REDACTED]");
    });
  });

  describe("ApiErrors", () => {
    it("should create unauthorized error", () => {
      const error = ApiErrors.unauthorized();

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("should create forbidden error", () => {
      const error = ApiErrors.forbidden();

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
    });

    it("should create not found error", () => {
      const error = ApiErrors.notFound("User");

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.details.resource).toBe("User");
    });

    it("should create bad request error", () => {
      const error = ApiErrors.badRequest("Invalid email", { field: "email" });

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.details.field).toBe("email");
    });

    it("should create conflict error", () => {
      const error = ApiErrors.conflict("Email already exists");

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
    });

    it("should create rate limit error", () => {
      const error = ApiErrors.tooManyRequests(120);

      expect(error.statusCode).toBe(429);
      expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(error.details.retryAfter).toBe(120);
    });

    it("should create internal server error", () => {
      const error = ApiErrors.internalServerError("Database connection failed");

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.message).toBe("Database connection failed");
    });

    it("should create service unavailable error", () => {
      const error = ApiErrors.serviceUnavailable();

      expect(error.statusCode).toBe(503);
      expect(error.code).toBe("SERVICE_UNAVAILABLE");
    });
  });

  describe("withErrorHandling", () => {
    it("should catch errors and return error response", async () => {
      const handler = jest.fn().mockRejectedValue(new Error("Handler error"));
      const wrappedHandler = withErrorHandling(handler);

      const request = new NextRequest("http://localhost:3000/api/test");
      const response = await wrappedHandler(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("INTERNAL_SERVER_ERROR");
    });

    it("should pass through successful responses", async () => {
      const successResponse = new Response(JSON.stringify({ success: true }), { status: 200 });
      const handler = jest.fn().mockResolvedValue(successResponse);
      const wrappedHandler = withErrorHandling(handler);

      const request = new NextRequest("http://localhost:3000/api/test");
      const response = await wrappedHandler(request);

      expect(response.status).toBe(200);
    });
  });
});
