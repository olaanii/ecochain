/**
 * Tests for logging middleware
 * Requirements: 26.1, 26.8, 35.1
 */

import { NextRequest, NextResponse } from "next/server";
import {
  loggingMiddleware,
  generateRequestId,
  createAnalyticsLog,
  logResponseTime,
  logApiMetrics,
  withLogging,
} from "@/lib/api/middleware/logging";

// Mock logger
jest.mock("@/lib/api/logger", () => ({
  logInfo: jest.fn(),
  logWarn: jest.fn(),
  logError: jest.fn(),
}));

import { logInfo, logWarn, logError } from "@/lib/api/logger";

describe("Logging Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe("loggingMiddleware", () => {
    it("should log successful request with 200 status", async () => {
      const handler = jest.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), { status: 200 })
      );

      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });

      const { response, log } = await loggingMiddleware(request, handler, "user_123");

      expect(response.status).toBe(200);
      expect(log.statusCode).toBe(200);
      expect(log.method).toBe("GET");
      expect(log.path).toBe("/api/test");
      expect(log.userId).toBe("user_123");
      expect(log.duration).toBeGreaterThanOrEqual(0);
      expect(logInfo).toHaveBeenCalled();
    });

    it("should log client error with 400 status", async () => {
      const handler = jest.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ error: "Bad request" }), { status: 400 })
      );

      const request = new NextRequest("http://localhost:3000/api/test");

      const { response, log } = await loggingMiddleware(request, handler);

      expect(response.status).toBe(400);
      expect(log.statusCode).toBe(400);
      expect(logWarn).toHaveBeenCalled();
    });

    it("should log server error with 500 status", async () => {
      const handler = jest.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ error: "Server error" }), { status: 500 })
      );

      const request = new NextRequest("http://localhost:3000/api/test");

      const { response, log } = await loggingMiddleware(request, handler);

      expect(response.status).toBe(500);
      expect(log.statusCode).toBe(500);
      expect(logError).toHaveBeenCalled();
    });

    it("should add correlation ID to request headers", async () => {
      let capturedRequest: any = null;

      const handler = jest.fn().mockImplementation((req: NextRequest) => {
        capturedRequest = req;
        return Promise.resolve(new NextResponse(null, { status: 200 }));
      });

      const request = new NextRequest("http://localhost:3000/api/test");

      const { log } = await loggingMiddleware(request, handler);

      expect(capturedRequest?.headers.get("x-request-id")).toBe(log.requestId);
    });

    it("should add correlation ID to response headers", async () => {
      const handler = jest.fn().mockResolvedValue(
        new NextResponse(null, { status: 200 })
      );

      const request = new NextRequest("http://localhost:3000/api/test");

      const { response, log } = await loggingMiddleware(request, handler);

      expect(response.headers.get("x-request-id")).toBe(log.requestId);
    });

    it("should capture request duration", async () => {
      const handler = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return new NextResponse(null, { status: 200 });
      });

      const request = new NextRequest("http://localhost:3000/api/test");

      const { log } = await loggingMiddleware(request, handler);

      expect(log.duration).toBeGreaterThanOrEqual(10);
    });

    it("should capture IP address from x-forwarded-for header", async () => {
      const handler = jest.fn().mockResolvedValue(
        new NextResponse(null, { status: 200 })
      );

      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
      });

      const { log } = await loggingMiddleware(request, handler);

      expect(log.ip).toBe("192.168.1.1");
    });

    it("should capture user agent", async () => {
      const handler = jest.fn().mockResolvedValue(
        new NextResponse(null, { status: 200 })
      );

      const request = new NextRequest("http://localhost:3000/api/test", {
        headers: {
          "user-agent": "Mozilla/5.0",
        },
      });

      const { log } = await loggingMiddleware(request, handler);

      expect(log.userAgent).toBe("Mozilla/5.0");
    });

    it("should handle handler errors", async () => {
      const handler = jest.fn().mockRejectedValue(new Error("Handler failed"));

      const request = new NextRequest("http://localhost:3000/api/test");

      await expect(loggingMiddleware(request, handler)).rejects.toThrow("Handler failed");
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("createAnalyticsLog", () => {
    it("should create analytics log with all fields", () => {
      const requestLog = {
        requestId: "123-abc",
        timestamp: "2024-01-01T00:00:00Z",
        method: "POST",
        path: "/api/test",
        statusCode: 200,
        duration: 100,
        userId: "user_123",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      };

      const analyticsLog = createAnalyticsLog(requestLog, { customField: "value" });

      expect(analyticsLog.requestId).toBe("123-abc");
      expect(analyticsLog.method).toBe("POST");
      expect(analyticsLog.statusCode).toBe(200);
      expect(analyticsLog.customField).toBe("value");
    });
  });

  describe("logResponseTime", () => {
    it("should log response time for successful request", () => {
      logResponseTime("req-123", "/api/test", 100, 200);

      expect(logInfo).toHaveBeenCalledWith(
        "API response time",
        expect.objectContaining({
          requestId: "req-123",
          path: "/api/test",
          duration: 100,
          statusCode: 200,
        })
      );
    });

    it("should log response time for client error", () => {
      logResponseTime("req-123", "/api/test", 50, 400);

      expect(logWarn).toHaveBeenCalledWith(
        "API response time",
        expect.objectContaining({
          statusCode: 400,
        })
      );
    });

    it("should log response time for server error", () => {
      logResponseTime("req-123", "/api/test", 200, 500);

      expect(logError).toHaveBeenCalledWith(
        "API response time",
        expect.objectContaining({
          statusCode: 500,
        })
      );
    });
  });

  describe("logApiMetrics", () => {
    it("should log API metrics", () => {
      logApiMetrics("/api/test", "POST", 200, 100);

      expect(logInfo).toHaveBeenCalledWith(
        "API metrics",
        expect.objectContaining({
          path: "/api/test",
          method: "POST",
          statusCode: 200,
          duration: 100,
        })
      );
    });
  });

  describe("withLogging", () => {
    it("should wrap handler with logging", async () => {
      const handler = jest.fn().mockResolvedValue(
        new NextResponse(JSON.stringify({ success: true }), { status: 200 })
      );

      const wrappedHandler = withLogging(handler, "user_123");

      const request = new NextRequest("http://localhost:3000/api/test");
      const response = await wrappedHandler(request);

      expect(response.status).toBe(200);
      expect(logInfo).toHaveBeenCalled();
    });

    it("should add correlation ID to response", async () => {
      const handler = jest.fn().mockResolvedValue(
        new NextResponse(null, { status: 200 })
      );

      const wrappedHandler = withLogging(handler);

      const request = new NextRequest("http://localhost:3000/api/test");
      const response = await wrappedHandler(request);

      expect(response.headers.get("x-request-id")).toBeDefined();
    });
  });
});
