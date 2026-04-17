// ============================================================================
// API Error Handling Utilities
// ============================================================================
// This module provides comprehensive error handling utilities for the API,
// including error categorization, sanitization, and standardized error codes.
// Requirements: 13.2, 13.4

// ============================================================================
// Error Code Definitions
// ============================================================================

/**
 * Standardized error codes for all API error types
 */
export const ErrorCodes = {
  // Validation Errors (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_REQUEST: "INVALID_REQUEST",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_FIELD_TYPE: "INVALID_FIELD_TYPE",
  OUT_OF_RANGE: "OUT_OF_RANGE",
  MALFORMED_REQUEST: "MALFORMED_REQUEST",
  
  // Authentication Errors (401)
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  MISSING_TOKEN: "MISSING_TOKEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
  TOKEN_REFRESH_FAILED: "TOKEN_REFRESH_FAILED",
  
  // Authorization Errors (403)
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  RESOURCE_ACCESS_DENIED: "RESOURCE_ACCESS_DENIED",
  ROLE_REQUIREMENT_NOT_MET: "ROLE_REQUIREMENT_NOT_MET",
  
  // Not Found Errors (404)
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  ENDPOINT_NOT_FOUND: "ENDPOINT_NOT_FOUND",
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
  REWARD_NOT_FOUND: "REWARD_NOT_FOUND",
  
  // Conflict Errors (409)
  CONFLICT: "CONFLICT",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  
  // Rate Limit Errors (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  
  // Server Errors (500)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
  
  // Business Logic Errors (400)
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  VERIFICATION_FAILED: "VERIFICATION_FAILED",
  ORACLE_ERROR: "ORACLE_ERROR",
  BRIDGE_ERROR: "BRIDGE_ERROR",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Human-readable error messages for each error code
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Validation Errors
  VALIDATION_ERROR: "Request validation failed",
  INVALID_REQUEST: "The request is invalid",
  MISSING_REQUIRED_FIELD: "A required field is missing",
  INVALID_FIELD_TYPE: "A field has an invalid type",
  OUT_OF_RANGE: "A field value is out of acceptable range",
  MALFORMED_REQUEST: "The request body is malformed",
  
  // Authentication Errors
  AUTHENTICATION_ERROR: "Authentication failed",
  MISSING_TOKEN: "Authentication token is missing",
  INVALID_TOKEN: "Authentication token is invalid",
  EXPIRED_TOKEN: "Authentication token has expired",
  TOKEN_REFRESH_FAILED: "Failed to refresh authentication token",
  
  // Authorization Errors
  AUTHORIZATION_ERROR: "Authorization failed",
  INSUFFICIENT_PERMISSIONS: "You do not have sufficient permissions",
  RESOURCE_ACCESS_DENIED: "Access to this resource is denied",
  ROLE_REQUIREMENT_NOT_MET: "Your role does not meet the requirements",
  
  // Not Found Errors
  NOT_FOUND: "The requested resource was not found",
  RESOURCE_NOT_FOUND: "The specified resource does not exist",
  ENDPOINT_NOT_FOUND: "The requested endpoint does not exist",
  TASK_NOT_FOUND: "The specified task was not found",
  REWARD_NOT_FOUND: "The specified reward was not found",
  
  // Conflict Errors
  CONFLICT: "A conflict occurred with the current state",
  DUPLICATE_ENTRY: "This entry already exists",
  RESOURCE_ALREADY_EXISTS: "The resource already exists",
  
  // Rate Limit Errors
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
  TOO_MANY_REQUESTS: "Too many requests, please try again later",
  
  // Server Errors
  INTERNAL_SERVER_ERROR: "An unexpected error occurred",
  DATABASE_ERROR: "A database error occurred",
  EXTERNAL_SERVICE_ERROR: "An external service error occurred",
  UNHANDLED_EXCEPTION: "An unhandled exception occurred",
  
  // Business Logic Errors
  INSUFFICIENT_BALANCE: "Insufficient balance for this operation",
  VERIFICATION_FAILED: "Verification failed",
  ORACLE_ERROR: "Oracle service error",
  BRIDGE_ERROR: "Bridge operation failed",
};

// ============================================================================
// Error Category Interface
// ============================================================================

export interface CategorizedError {
  statusCode: number;
  errorCode: ErrorCode;
  message: string;
  isOperational: boolean;
}

// ============================================================================
// Error Categorization Function
// ============================================================================

/**
 * Categorize errors and determine appropriate HTTP status codes and error codes
 * @param error The error to categorize
 * @returns Categorized error with status code, error code, and message
 */
export function categorizeError(error: Error | unknown): CategorizedError {
  // Handle non-Error objects
  if (!(error instanceof Error)) {
    return {
      statusCode: 500,
      errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: ErrorMessages.INTERNAL_SERVER_ERROR,
      isOperational: false,
    };
  }
  
  const message = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();
  
  // Validation errors (400)
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    errorName.includes("validation")
  ) {
    if (message.includes("missing") || message.includes("required")) {
      return {
        statusCode: 400,
        errorCode: ErrorCodes.MISSING_REQUIRED_FIELD,
        message: error.message,
        isOperational: true,
      };
    }
    if (message.includes("type") || message.includes("expected")) {
      return {
        statusCode: 400,
        errorCode: ErrorCodes.INVALID_FIELD_TYPE,
        message: error.message,
        isOperational: true,
      };
    }
    if (message.includes("range") || message.includes("bounds")) {
      return {
        statusCode: 400,
        errorCode: ErrorCodes.OUT_OF_RANGE,
        message: error.message,
        isOperational: true,
      };
    }
    return {
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_ERROR,
      message: error.message,
      isOperational: true,
    };
  }
  
  // Authentication errors (401)
  if (
    message.includes("unauthorized") ||
    message.includes("authentication") ||
    message.includes("unauthenticated") ||
    message.includes("missing") && message.includes("token") ||
    message.includes("expired") ||
    errorName.includes("auth")
  ) {
    if (message.includes("missing") && message.includes("token")) {
      return {
        statusCode: 401,
        errorCode: ErrorCodes.MISSING_TOKEN,
        message: ErrorMessages.MISSING_TOKEN,
        isOperational: true,
      };
    }
    if (message.includes("invalid token")) {
      return {
        statusCode: 401,
        errorCode: ErrorCodes.INVALID_TOKEN,
        message: ErrorMessages.INVALID_TOKEN,
        isOperational: true,
      };
    }
    if (message.includes("expired")) {
      return {
        statusCode: 401,
        errorCode: ErrorCodes.EXPIRED_TOKEN,
        message: ErrorMessages.EXPIRED_TOKEN,
        isOperational: true,
      };
    }
    return {
      statusCode: 401,
      errorCode: ErrorCodes.AUTHENTICATION_ERROR,
      message: ErrorMessages.AUTHENTICATION_ERROR,
      isOperational: true,
    };
  }
  
  // Authorization errors (403)
  if (
    message.includes("forbidden") ||
    message.includes("permission") ||
    message.includes("access denied") ||
    message.includes("not allowed")
  ) {
    if (message.includes("role")) {
      return {
        statusCode: 403,
        errorCode: ErrorCodes.ROLE_REQUIREMENT_NOT_MET,
        message: ErrorMessages.ROLE_REQUIREMENT_NOT_MET,
        isOperational: true,
      };
    }
    if (message.includes("resource")) {
      return {
        statusCode: 403,
        errorCode: ErrorCodes.RESOURCE_ACCESS_DENIED,
        message: ErrorMessages.RESOURCE_ACCESS_DENIED,
        isOperational: true,
      };
    }
    return {
      statusCode: 403,
      errorCode: ErrorCodes.AUTHORIZATION_ERROR,
      message: ErrorMessages.AUTHORIZATION_ERROR,
      isOperational: true,
    };
  }
  
  // Not found errors (404)
  if (message.includes("not found") || errorName.includes("notfound")) {
    if (message.includes("task")) {
      return {
        statusCode: 404,
        errorCode: ErrorCodes.TASK_NOT_FOUND,
        message: ErrorMessages.TASK_NOT_FOUND,
        isOperational: true,
      };
    }
    if (message.includes("reward")) {
      return {
        statusCode: 404,
        errorCode: ErrorCodes.REWARD_NOT_FOUND,
        message: ErrorMessages.REWARD_NOT_FOUND,
        isOperational: true,
      };
    }
    if (message.includes("endpoint") || message.includes("route")) {
      return {
        statusCode: 404,
        errorCode: ErrorCodes.ENDPOINT_NOT_FOUND,
        message: ErrorMessages.ENDPOINT_NOT_FOUND,
        isOperational: true,
      };
    }
    return {
      statusCode: 404,
      errorCode: ErrorCodes.NOT_FOUND,
      message: error.message,
      isOperational: true,
    };
  }
  
  // Conflict errors (409)
  if (
    message.includes("conflict") ||
    message.includes("duplicate") ||
    message.includes("already exists")
  ) {
    if (message.includes("duplicate")) {
      return {
        statusCode: 409,
        errorCode: ErrorCodes.DUPLICATE_ENTRY,
        message: ErrorMessages.DUPLICATE_ENTRY,
        isOperational: true,
      };
    }
    return {
      statusCode: 409,
      errorCode: ErrorCodes.CONFLICT,
      message: error.message,
      isOperational: true,
    };
  }
  
  // Rate limit errors (429)
  if (
    message.includes("rate limit") ||
    message.includes("too many") ||
    message.includes("throttle")
  ) {
    return {
      statusCode: 429,
      errorCode: ErrorCodes.RATE_LIMIT_EXCEEDED,
      message: ErrorMessages.RATE_LIMIT_EXCEEDED,
      isOperational: true,
    };
  }
  
  // Business logic errors (400)
  if (message.includes("insufficient balance")) {
    return {
      statusCode: 400,
      errorCode: ErrorCodes.INSUFFICIENT_BALANCE,
      message: ErrorMessages.INSUFFICIENT_BALANCE,
      isOperational: true,
    };
  }
  
  if (message.includes("verification failed")) {
    return {
      statusCode: 400,
      errorCode: ErrorCodes.VERIFICATION_FAILED,
      message: error.message,
      isOperational: true,
    };
  }
  
  if (message.includes("oracle")) {
    return {
      statusCode: 500,
      errorCode: ErrorCodes.ORACLE_ERROR,
      message: ErrorMessages.ORACLE_ERROR,
      isOperational: true,
    };
  }
  
  if (message.includes("bridge")) {
    return {
      statusCode: 500,
      errorCode: ErrorCodes.BRIDGE_ERROR,
      message: error.message,
      isOperational: true,
    };
  }
  
  // Database errors (500)
  if (
    message.includes("database") ||
    message.includes("prisma") ||
    message.includes("connection") ||
    message.includes("query")
  ) {
    return {
      statusCode: 500,
      errorCode: ErrorCodes.DATABASE_ERROR,
      message: ErrorMessages.DATABASE_ERROR,
      isOperational: false,
    };
  }
  
  // External service errors (500)
  if (
    message.includes("external") ||
    message.includes("service") ||
    message.includes("api error")
  ) {
    return {
      statusCode: 500,
      errorCode: ErrorCodes.EXTERNAL_SERVICE_ERROR,
      message: ErrorMessages.EXTERNAL_SERVICE_ERROR,
      isOperational: false,
    };
  }
  
  // Default to internal server error (500)
  return {
    statusCode: 500,
    errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
    message: ErrorMessages.INTERNAL_SERVER_ERROR,
    isOperational: false,
  };
}

// ============================================================================
// Error Sanitization
// ============================================================================

/**
 * Patterns for sensitive data that should be removed from error messages
 */
const SENSITIVE_PATTERNS = [
  // File paths
  { pattern: /\/[^\s]+\.(ts|js|tsx|jsx|py|java|go|rb)/g, replacement: "[file]" },
  { pattern: /[A-Z]:\\[^\s]+\.(ts|js|tsx|jsx|py|java|go|rb)/g, replacement: "[file]" },
  
  // Database connection strings
  { pattern: /postgresql:\/\/[^\s]+/g, replacement: "[connection_string]" },
  { pattern: /mongodb:\/\/[^\s]+/g, replacement: "[connection_string]" },
  { pattern: /mysql:\/\/[^\s]+/g, replacement: "[connection_string]" },
  { pattern: /redis:\/\/[^\s]+/g, replacement: "[connection_string]" },
  
  // Authentication tokens (must come before other token patterns)
  { pattern: /Bearer\s+[A-Za-z0-9._-]+/g, replacement: "Bearer [token]" },
  { pattern: /jwt[=:]\s*[A-Za-z0-9._-]+/gi, replacement: "jwt=[redacted]" },
  { pattern: /authorization[=:]\s*[^\s&]+/gi, replacement: "authorization=[redacted]" },
  { pattern: /token[=:]\s*[A-Za-z0-9._-]+/gi, replacement: "token=[redacted]" },
  
  // API keys and secrets
  { pattern: /api[_-]?key[=:]\s*[^\s&]+/gi, replacement: "api_key=[redacted]" },
  { pattern: /secret[=:]\s*[^\s&]+/gi, replacement: "secret=[redacted]" },
  { pattern: /password[=:]\s*[^\s&]+/gi, replacement: "password=[redacted]" },
  { pattern: /access[_-]?key[=:]\s*[^\s&]+/gi, replacement: "access_key=[redacted]" },
  
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "[email]" },
  
  // IP addresses
  { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: "[ip_address]" },
  
  // Credit card numbers (basic pattern)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: "[card_number]" },
  
  // Blockchain addresses (Ethereum-like - 40 hex characters after 0x)
  { pattern: /0x[a-fA-F0-9]{40}\b/g, replacement: "[address]" },
  
  // Private keys (common formats)
  { pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]+?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g, replacement: "[private_key]" },
  
  // Environment variable values
  { pattern: /process\.env\.[A-Z_]+\s*=\s*['"][^'"]+['"]/g, replacement: "process.env.[VAR]=[redacted]" },
  
  // Session IDs
  { pattern: /session[_-]?id[=:]\s*[^\s&]+/gi, replacement: "session_id=[redacted]" },
];

/**
 * Sanitize error messages to remove sensitive data
 * @param message The error message to sanitize
 * @returns Sanitized error message with sensitive data removed
 */
export function sanitizeErrorMessage(message: string): string {
  let sanitized = message;
  
  // Apply all sensitive data patterns
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  
  return sanitized;
}

/**
 * Sanitize error stack traces to remove sensitive data
 * @param stack The error stack trace to sanitize
 * @returns Sanitized stack trace with sensitive data removed
 */
export function sanitizeStackTrace(stack: string | undefined): string | undefined {
  if (!stack) {
    return undefined;
  }
  
  return sanitizeErrorMessage(stack);
}

/**
 * Sanitize entire error object
 * @param error The error object to sanitize
 * @returns Sanitized error object
 */
export function sanitizeError(error: Error): {
  message: string;
  name: string;
  stack?: string;
} {
  return {
    message: sanitizeErrorMessage(error.message),
    name: error.name,
    stack: process.env.NODE_ENV === "development" 
      ? sanitizeStackTrace(error.stack) 
      : undefined,
  };
}

// ============================================================================
// Error Type Guards
// ============================================================================

/**
 * Check if an error is operational (expected) or programming error (unexpected)
 * @param error The error to check
 * @returns True if the error is operational
 */
export function isOperationalError(error: Error | unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  
  const categorized = categorizeError(error);
  return categorized.isOperational;
}

/**
 * Check if an error should be retried
 * @param error The error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: Error | unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  
  const categorized = categorizeError(error);
  
  // Retry on database errors, external service errors, and rate limits
  const retryableCodes: ErrorCode[] = [
    ErrorCodes.DATABASE_ERROR,
    ErrorCodes.EXTERNAL_SERVICE_ERROR,
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    ErrorCodes.ORACLE_ERROR,
  ];
  
  return retryableCodes.includes(categorized.errorCode);
}

// ============================================================================
// Error Logging Helpers
// ============================================================================

/**
 * Determine log level based on error type
 * @param error The error to evaluate
 * @returns Appropriate log level
 */
export function getErrorLogLevel(error: Error | unknown): "info" | "warn" | "error" {
  if (!(error instanceof Error)) {
    return "error";
  }
  
  const categorized = categorizeError(error);
  
  // Validation and not found errors are warnings
  if (categorized.statusCode === 400 || categorized.statusCode === 404) {
    return "warn";
  }
  
  // Rate limit errors are info
  if (categorized.statusCode === 429) {
    return "info";
  }
  
  // Everything else is an error
  return "error";
}

/**
 * Create a structured error log entry
 * @param error The error to log
 * @param context Additional context for the error
 * @returns Structured log entry
 */
export function createErrorLogEntry(
  error: Error | unknown,
  context: {
    requestId?: string;
    userId?: string;
    method?: string;
    path?: string;
    [key: string]: unknown;
  }
): {
  level: "info" | "warn" | "error";
  message: string;
  error: string;
  errorCode: ErrorCode;
  statusCode: number;
  stack?: string;
  context: typeof context;
  timestamp: string;
} {
  const categorized = categorizeError(error);
  const sanitized = error instanceof Error ? sanitizeError(error) : { message: String(error), name: "Unknown" };
  
  return {
    level: getErrorLogLevel(error),
    message: "API Error",
    error: sanitized.message,
    errorCode: categorized.errorCode,
    statusCode: categorized.statusCode,
    stack: sanitized.stack,
    context,
    timestamp: new Date().toISOString(),
  };
}
