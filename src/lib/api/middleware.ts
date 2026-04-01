import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logApiRequest, logApiResponse, logApiError } from "./logger";

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface AuthContext {
  userId: string;
  sessionId: string;
  role: "user" | "admin";
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

export interface LogContext {
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  error?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Sanitize error messages to remove sensitive information
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove file paths
  message = message.replace(/\/[^\s]+\.(ts|js|tsx|jsx)/g, "[file]");
  
  // Remove connection strings
  message = message.replace(/postgresql:\/\/[^\s]+/g, "[connection_string]");
  message = message.replace(/mongodb:\/\/[^\s]+/g, "[connection_string]");
  
  // Remove tokens
  message = message.replace(/Bearer\s+[^\s]+/g, "Bearer [token]");
  message = message.replace(/token[=:]\s*[^\s&]+/gi, "token=[redacted]");
  
  // Remove API keys
  message = message.replace(/api[_-]?key[=:]\s*[^\s&]+/gi, "api_key=[redacted]");
  
  return message;
}

/**
 * Categorize errors and determine appropriate status codes
 */
export function categorizeError(error: Error): {
  statusCode: number;
  errorCode: string;
  message: string;
} {
  const message = error.message.toLowerCase();
  
  // Validation errors
  if (message.includes("validation") || message.includes("invalid")) {
    return {
      statusCode: 400,
      errorCode: "VALIDATION_ERROR",
      message: error.message,
    };
  }
  
  // Authentication errors
  if (message.includes("unauthorized") || message.includes("authentication")) {
    return {
      statusCode: 401,
      errorCode: "AUTHENTICATION_ERROR",
      message: "Authentication required",
    };
  }
  
  // Authorization errors
  if (message.includes("forbidden") || message.includes("permission")) {
    return {
      statusCode: 403,
      errorCode: "AUTHORIZATION_ERROR",
      message: "Insufficient permissions",
    };
  }
  
  // Not found errors
  if (message.includes("not found")) {
    return {
      statusCode: 404,
      errorCode: "NOT_FOUND",
      message: error.message,
    };
  }
  
  // Rate limit errors
  if (message.includes("rate limit") || message.includes("too many")) {
    return {
      statusCode: 429,
      errorCode: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests",
    };
  }
  
  // Default to internal server error
  return {
    statusCode: 500,
    errorCode: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  };
}

// ============================================================================
// Response Formatting Utilities
// ============================================================================

/**
 * Format successful API response
 */
export function formatSuccessResponse<T>(
  data: T,
  requestId?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId(),
    },
  };
}

/**
 * Format error API response
 */
export function formatErrorResponse(
  code: string,
  message: string,
  details?: unknown,
  requestId?: string
): ApiResponse {
  const errorObj: ApiResponse["error"] = {
    code,
    message: sanitizeErrorMessage(message),
  };
  
  if (process.env.NODE_ENV === "development" && details) {
    errorObj.details = details;
  }
  
  return {
    success: false,
    error: errorObj,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId || generateRequestId(),
    },
  };
}

/**
 * Create JSON response with proper headers
 */
export function jsonResponse<T>(
  data: ApiResponse<T>,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Authentication middleware using Clerk
 * Validates authentication token and extracts user context
 * Implements token validation with expiration checking
 */
export async function withAuth(
  handler: (
    request: NextRequest,
    context: { auth: AuthContext; requestId: string }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId();
    
    try {
      const { userId, sessionId, sessionClaims } = await auth();
      
      if (!userId) {
        return jsonResponse(
          formatErrorResponse(
            "AUTHENTICATION_ERROR",
            "Authentication required",
            undefined,
            requestId
          ),
          401
        );
      }
      
      // Check if session is expired (Clerk handles this, but we add explicit check)
      if (sessionClaims && sessionClaims.exp) {
        const expirationTime = sessionClaims.exp as number;
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (currentTime > expirationTime) {
          return jsonResponse(
            formatErrorResponse(
              "EXPIRED_TOKEN",
              "Authentication token has expired",
              undefined,
              requestId
            ),
            401
          );
        }
      }
      
      // Extract role from session claims (default to 'user')
      const role = (sessionClaims?.role as "user" | "admin") ?? "user";
      
      const authContext: AuthContext = {
        userId,
        sessionId: sessionId || "",
        role,
      };
      
      return await handler(request, { auth: authContext, requestId });
    } catch (error) {
      const err = error as Error;
      
      // Check if error is due to invalid token
      if (err.message.toLowerCase().includes("invalid") || 
          err.message.toLowerCase().includes("malformed")) {
        return jsonResponse(
          formatErrorResponse(
            "INVALID_TOKEN",
            "Authentication token is invalid",
            undefined,
            requestId
          ),
          401
        );
      }
      
      return jsonResponse(
        formatErrorResponse(
          "AUTHENTICATION_ERROR",
          err.message,
          undefined,
          requestId
        ),
        401
      );
    }
  };
}

// ============================================================================
// Rate Limiting Middleware
// ============================================================================

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting middleware with configurable limits
 */
export function withRateLimit(config: RateLimitConfig) {
  return function (
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const requestId = generateRequestId();
      
      // Generate rate limit key (default: IP address from headers)
      const key = config.keyGenerator
        ? config.keyGenerator(request)
        : request.headers.get("x-forwarded-for") || 
          request.headers.get("x-real-ip") || 
          "unknown";
      
      const now = Date.now();
      const rateLimitKey = `${key}:${Math.floor(now / config.windowMs)}`;
      
      // Get or create rate limit entry
      let entry = rateLimitStore.get(rateLimitKey);
      
      if (!entry) {
        entry = {
          count: 0,
          resetAt: now + config.windowMs,
        };
        rateLimitStore.set(rateLimitKey, entry);
      }
      
      // Clean up expired entries
      if (now > entry.resetAt) {
        entry.count = 0;
        entry.resetAt = now + config.windowMs;
      }
      
      // Increment request count
      entry.count++;
      
      // Check if rate limit exceeded
      if (entry.count > config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        
        return jsonResponse(
          formatErrorResponse(
            "RATE_LIMIT_EXCEEDED",
            "Too many requests",
            { retryAfter },
            requestId
          ),
          429,
          {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": entry.resetAt.toString(),
          }
        );
      }
      
      // Add rate limit headers to response
      const response = await handler(request);
      
      response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        (config.maxRequests - entry.count).toString()
      );
      response.headers.set("X-RateLimit-Reset", entry.resetAt.toString());
      
      return response;
    };
  };
}

// ============================================================================
// Request Logging Middleware
// ============================================================================

/**
 * Request logging middleware with structured logging
 */
export function withLogging(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    const logContext = {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
      userId: undefined as string | undefined,
    };
    
    // Try to get user ID from auth
    try {
      const { userId } = await auth();
      if (userId) {
        logContext.userId = userId;
      }
    } catch {
      // Ignore auth errors in logging
    }
    
    // Log request
    logApiRequest(logContext);
    
    try {
      const response = await handler(request);
      
      // Log response
      const duration = Date.now() - startTime;
      logApiResponse({
        ...logContext,
        statusCode: response.status,
        duration,
      });
      
      return response;
    } catch (error) {
      const err = error as Error;
      const duration = Date.now() - startTime;
      
      // Log error
      logApiError({
        ...logContext,
        duration,
        error: err.message,
        stack: err.stack,
      });
      
      throw error;
    }
  };
}

// ============================================================================
// Error Handling Middleware
// ============================================================================

/**
 * Error handling middleware with consistent error response format
 */
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId();
    
    try {
      return await handler(request);
    } catch (error) {
      const err = error as Error;
      
      // Log error with full context
      logApiError({
        requestId,
        method: request.method,
        path: request.nextUrl.pathname,
        error: err.message,
        stack: err.stack,
      });
      
      // Categorize error and return appropriate response
      const { statusCode, errorCode, message } = categorizeError(err);
      
      return jsonResponse(
        formatErrorResponse(
          errorCode,
          message,
          process.env.NODE_ENV === "development" ? err.stack : undefined,
          requestId
        ),
        statusCode
      );
    }
  };
}

// ============================================================================
// Authorization Utilities
// ============================================================================

/**
 * Check if authenticated user has permission to access a resource
 * @param authContext Authentication context from middleware
 * @param resourceUserId User ID of the resource owner
 * @returns True if user has access, false otherwise
 */
export function canAccessUserResource(
  authContext: AuthContext,
  resourceUserId: string
): boolean {
  // Admin can access all resources
  if (authContext.role === "admin") {
    return true;
  }
  
  // User can only access their own resources
  return authContext.userId === resourceUserId;
}

/**
 * Check if authenticated user has admin role
 * @param authContext Authentication context from middleware
 * @returns True if user is admin, false otherwise
 */
export function isAdmin(authContext: AuthContext): boolean {
  return authContext.role === "admin";
}

/**
 * Middleware to enforce admin-only access
 */
export function withAdminAuth(
  handler: (
    request: NextRequest,
    context: { auth: AuthContext; requestId: string }
  ) => Promise<NextResponse>
) {
  return withAuth(async (request, context) => {
    if (!isAdmin(context.auth)) {
      return jsonResponse(
        formatErrorResponse(
          "ROLE_REQUIREMENT_NOT_MET",
          "Your role does not meet the requirements",
          undefined,
          context.requestId
        ),
        403
      );
    }
    
    return await handler(request, context);
  });
}

/**
 * Create authorization error response
 */
export function createAuthorizationError(
  message: string = "Access to this resource is denied",
  requestId?: string
): NextResponse {
  return jsonResponse(
    formatErrorResponse(
      "RESOURCE_ACCESS_DENIED",
      message,
      undefined,
      requestId
    ),
    403
  );
}

// ============================================================================
// Middleware Composition Utilities
// ============================================================================

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(
  ...middlewares: Array<
    (handler: (request: NextRequest) => Promise<NextResponse>) => (request: NextRequest) => Promise<NextResponse>
  >
) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Create a protected API handler with all middleware applied
 */
export function createProtectedHandler(
  handler: (
    request: NextRequest,
    context: { auth: AuthContext; requestId: string }
  ) => Promise<NextResponse>,
  options?: {
    rateLimit?: RateLimitConfig;
    skipLogging?: boolean;
  }
) {
  let wrappedHandler = withAuth(handler);
  
  if (!options?.skipLogging) {
    wrappedHandler = withLogging(wrappedHandler as any) as any;
  }
  
  if (options?.rateLimit) {
    wrappedHandler = withRateLimit(options.rateLimit)(wrappedHandler as any) as any;
  }
  
  wrappedHandler = withErrorHandling(wrappedHandler as any) as any;
  
  return wrappedHandler;
}

/**
 * Create a public API handler with logging and error handling
 */
export function createPublicHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: {
    rateLimit?: RateLimitConfig;
    skipLogging?: boolean;
  }
) {
  let wrappedHandler = handler;
  
  if (!options?.skipLogging) {
    wrappedHandler = withLogging(wrappedHandler);
  }
  
  if (options?.rateLimit) {
    wrappedHandler = withRateLimit(options.rateLimit)(wrappedHandler);
  }
  
  wrappedHandler = withErrorHandling(wrappedHandler);
  
  return wrappedHandler;
}
