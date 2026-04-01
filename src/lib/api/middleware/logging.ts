import { NextRequest, NextResponse } from "next/server";
import { logInfo, logWarn, logError } from "../logger";

export type RequestLog = {
  requestId: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
};

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Logging middleware
 * Logs request/response with timing and correlation IDs
 * Requirements: 26.1, 26.8, 35.1
 */
export async function loggingMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  userId?: string,
): Promise<{ response: NextResponse; log: RequestLog }> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  const method = request.method;
  const path = request.nextUrl.pathname;
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Add correlation ID to request headers
  const headers = new Headers(request.headers);
  headers.set("x-request-id", requestId);

  // Create new request with updated headers
  const newRequest = new NextRequest(request, { headers });

  try {
    // Call handler
    const response = await handler(newRequest);

    const duration = Date.now() - startTime;
    const statusCode = response.status;

    const log: RequestLog = {
      requestId,
      timestamp: new Date().toISOString(),
      method,
      path,
      statusCode,
      duration,
      userId,
      ip,
      userAgent,
    };

    // Log based on status code
    if (statusCode >= 500) {
      logError("Server error", log);
    } else if (statusCode >= 400) {
      logWarn("Client error", log);
    } else {
      logInfo("Request completed", log);
    }

    // Add correlation ID to response
    response.headers.set("x-request-id", requestId);

    return { response, log };
  } catch (error) {
    const duration = Date.now() - startTime;

    const log: RequestLog = {
      requestId,
      timestamp: new Date().toISOString(),
      method,
      path,
      statusCode: 500,
      duration,
      userId,
      ip,
      userAgent,
    };

    logError("Request failed", {
      ...log,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * Create structured log for analytics
 */
export function createAnalyticsLog(
  log: RequestLog,
  additionalData?: any,
): any {
  return {
    timestamp: log.timestamp,
    requestId: log.requestId,
    method: log.method,
    path: log.path,
    statusCode: log.statusCode,
    duration: log.duration,
    userId: log.userId,
    ip: log.ip,
    userAgent: log.userAgent,
    ...additionalData,
  };
}

/**
 * Log API response times
 */
export function logResponseTime(
  requestId: string,
  path: string,
  duration: number,
  statusCode: number,
): void {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

  if (level === "error") {
    logError("API response time", {
      requestId,
      path,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  } else if (level === "warn") {
    logWarn("API response time", {
      requestId,
      path,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  } else {
    logInfo("API response time", {
      requestId,
      path,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Log API metrics
 */
export function logApiMetrics(
  path: string,
  method: string,
  statusCode: number,
  duration: number,
): void {
  logInfo("API metrics", {
    path,
    method,
    statusCode,
    duration,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Middleware wrapper for logging
 */
export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse>,
  userId?: string,
) {
  return async (request: NextRequest) => {
    const { response } = await loggingMiddleware(request, handler, userId);
    return response;
  };
}
