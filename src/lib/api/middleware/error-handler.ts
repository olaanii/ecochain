import { NextRequest, NextResponse } from "next/server";
import { logError, logWarn } from "../logger";

export type ErrorContext = {
  userId?: string;
  requestId: string;
  path: string;
  method: string;
  timestamp: string;
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Redact sensitive data from logs
 * Requirements: 26.3
 */
function redactSensitiveData(data: any): any {
  if (typeof data === "string") {
    // Redact wallet addresses
    return data.replace(/initia1[a-z0-9]{38}/g, "initia1[REDACTED]");
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (data !== null && typeof data === "object") {
    const redacted: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Redact sensitive fields
      if (
        key.toLowerCase().includes("address") ||
        key.toLowerCase().includes("wallet") ||
        key.toLowerCase().includes("key") ||
        key.toLowerCase().includes("secret")
      ) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }

  return data;
}

/**
 * Error handler middleware
 * Requirements: 26.1, 26.2, 26.3, 26.4, 26.7
 */
export async function errorHandlerMiddleware(
  error: Error,
  request: NextRequest,
  context: ErrorContext,
): Promise<NextResponse> {
  const { userId, requestId, path, method, timestamp } = context;

  // Determine error type and status code
  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred";
  let details: any = undefined;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code || "API_ERROR";
    message = error.message;
    details = error.details;
  } else if (error instanceof SyntaxError) {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Invalid JSON in request body";
  } else if (error instanceof TypeError) {
    statusCode = 400;
    code = "TYPE_ERROR";
    message = "Invalid request format";
  }

  // Categorize error
  const isClientError = statusCode >= 400 && statusCode < 500;
  const isServerError = statusCode >= 500;

  // Log error with context
  const logData = {
    requestId,
    userId,
    path,
    method,
    statusCode,
    code,
    message,
    timestamp,
    stack: error.stack,
    details: redactSensitiveData(details),
  };

  if (isServerError) {
    logError("Server error", logData);
  } else if (isClientError) {
    logWarn("Client error", logData);
  }

  // Build response
  const response: any = {
    error: code,
    message,
  };

  if (details) {
    response.details = redactSensitiveData(details);
  }

  // Add request ID for tracking
  response.requestId = requestId;

  const httpResponse = NextResponse.json(response, { status: statusCode });

  // Add security headers
  httpResponse.headers.set("X-Request-ID", requestId);
  httpResponse.headers.set("X-Content-Type-Options", "nosniff");
  httpResponse.headers.set("X-Frame-Options", "DENY");

  return httpResponse;
}

/**
 * Create error context from request
 */
export function createErrorContext(
  request: NextRequest,
  userId?: string,
): ErrorContext {
  return {
    userId,
    requestId: request.headers.get("x-request-id") || generateRequestId(),
    path: request.nextUrl.pathname,
    method: request.method,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Common API errors
 */
export const ApiErrors = {
  unauthorized: () =>
    new ApiError(401, "Unauthorized", "UNAUTHORIZED", {
      message: "Authentication required",
    }),

  forbidden: () =>
    new ApiError(403, "Forbidden", "FORBIDDEN", {
      message: "Insufficient permissions",
    }),

  notFound: (resource: string) =>
    new ApiError(404, `${resource} not found`, "NOT_FOUND", {
      resource,
    }),

  badRequest: (message: string, details?: any) =>
    new ApiError(400, message, "BAD_REQUEST", details),

  conflict: (message: string, details?: any) =>
    new ApiError(409, message, "CONFLICT", details),

  tooManyRequests: (retryAfter?: number) =>
    new ApiError(429, "Too many requests", "RATE_LIMIT_EXCEEDED", {
      retryAfter: retryAfter || 60,
    }),

  internalServerError: (message?: string) =>
    new ApiError(500, message || "Internal server error", "INTERNAL_ERROR"),

  serviceUnavailable: () =>
    new ApiError(503, "Service unavailable", "SERVICE_UNAVAILABLE"),
};

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling(
  handler: (
    request: NextRequest,
    context?: any,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const errorContext = createErrorContext(request);
      return errorHandlerMiddleware(
        error instanceof Error ? error : new Error(String(error)),
        request,
        errorContext,
      );
    }
  };
}
