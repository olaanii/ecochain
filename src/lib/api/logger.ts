// ============================================================================
// Structured Logging System
// ============================================================================
// This module provides a production-ready structured logging system with
// log levels, sanitization, and consistent formatting.
// Requirements: 13.1, 13.5

// ============================================================================
// Types and Interfaces
// ============================================================================

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  timestamp: string;
  requestId?: string;
  userId?: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface ApiLogContext {
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
  stack?: string;
}

// ============================================================================
// Sensitive Data Patterns
// ============================================================================

const SENSITIVE_PATTERNS = [
  // Authentication tokens
  { pattern: /Bearer\s+[A-Za-z0-9._-]+/g, replacement: "Bearer [token]" },
  { pattern: /jwt[=:]\s*[A-Za-z0-9._-]+/gi, replacement: "jwt=[redacted]" },
  { pattern: /token[=:]\s*[A-Za-z0-9._-]+/gi, replacement: "token=[redacted]" },
  
  // API keys and secrets
  { pattern: /api[_-]?key[=:]\s*[^\s&]+/gi, replacement: "api_key=[redacted]" },
  { pattern: /secret[=:]\s*[^\s&]+/gi, replacement: "secret=[redacted]" },
  { pattern: /password[=:]\s*[^\s&]+/gi, replacement: "password=[redacted]" },
  
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "[email]" },
  
  // IP addresses
  { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: "[ip_address]" },
  
  // Connection strings
  { pattern: /postgresql:\/\/[^\s]+/g, replacement: "[connection_string]" },
  { pattern: /mongodb:\/\/[^\s]+/g, replacement: "[connection_string]" },
  { pattern: /mysql:\/\/[^\s]+/g, replacement: "[connection_string]" },
];

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitize log data to remove sensitive information
 * @param data Data to sanitize (string or object)
 * @returns Sanitized data
 */
export function sanitizeLogData(data: unknown): unknown {
  if (typeof data === "string") {
    let sanitized = data;
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, replacement);
    }
    return sanitized;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }
  
  if (data && typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive keys entirely
      if (
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("secret") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("apikey")
      ) {
        sanitized[key] = "[redacted]";
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

// ============================================================================
// Core Logging Functions
// ============================================================================

/**
 * Create a structured log entry
 * @param level Log level
 * @param message Log message
 * @param context Additional context
 * @returns Structured log entry
 */
export function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    timestamp: new Date().toISOString(),
    message,
    context: context ? sanitizeLogData(context) as Record<string, unknown> : undefined,
  };
}

/**
 * Write log entry to output
 * @param entry Log entry to write
 */
function writeLog(entry: LogEntry): void {
  const logString = JSON.stringify(entry);
  
  switch (entry.level) {
    case "error":
      console.error(logString);
      break;
    case "warn":
      console.warn(logString);
      break;
    case "info":
    default:
      console.log(logString);
      break;
  }
}

/**
 * Log an info message
 * @param message Log message
 * @param context Additional context
 */
export function logInfo(message: string, context?: Record<string, unknown>): void {
  writeLog(createLogEntry("info", message, context));
}

/**
 * Log a warning message
 * @param message Log message
 * @param context Additional context
 */
export function logWarn(message: string, context?: Record<string, unknown>): void {
  writeLog(createLogEntry("warn", message, context));
}

/**
 * Log an error message
 * @param message Log message
 * @param context Additional context
 */
export function logError(message: string, context?: Record<string, unknown>): void {
  writeLog(createLogEntry("error", message, context));
}

// ============================================================================
// API-Specific Logging Functions
// ============================================================================

/**
 * Log an API request
 * @param context API request context
 */
export function logApiRequest(context: ApiLogContext): void {
  logInfo("API Request", {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    userId: context.userId,
  });
}

/**
 * Log an API response
 * @param context API response context
 */
export function logApiResponse(context: ApiLogContext): void {
  const level: LogLevel = 
    context.statusCode && context.statusCode >= 500 ? "error" :
    context.statusCode && context.statusCode >= 400 ? "warn" :
    "info";
  
  writeLog(createLogEntry(level, "API Response", {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    userId: context.userId,
    statusCode: context.statusCode,
    duration: context.duration,
  }));
}

/**
 * Log an API error
 * @param context API error context
 */
export function logApiError(context: ApiLogContext): void {
  logError("API Error", {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    userId: context.userId,
    statusCode: context.statusCode,
    duration: context.duration,
    error: context.error,
    stack: process.env.NODE_ENV === "development" ? context.stack : undefined,
  });
}

// ============================================================================
// Logger Class (Optional - for more advanced usage)
// ============================================================================

export class Logger {
  private context: Record<string, unknown>;
  
  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }
  
  /**
   * Create a child logger with additional context
   * @param additionalContext Additional context to merge
   * @returns New logger instance
   */
  child(additionalContext: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }
  
  /**
   * Log an info message
   * @param message Log message
   * @param context Additional context
   */
  info(message: string, context?: Record<string, unknown>): void {
    logInfo(message, { ...this.context, ...context });
  }
  
  /**
   * Log a warning message
   * @param message Log message
   * @param context Additional context
   */
  warn(message: string, context?: Record<string, unknown>): void {
    logWarn(message, { ...this.context, ...context });
  }
  
  /**
   * Log an error message
   * @param message Log message
   * @param context Additional context
   */
  error(message: string, context?: Record<string, unknown>): void {
    logError(message, { ...this.context, ...context });
  }
}

/**
 * Create a logger instance with initial context
 * @param context Initial context
 * @returns Logger instance
 */
export function createLogger(context: Record<string, unknown> = {}): Logger {
  return new Logger(context);
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  info: logInfo,
  warn: logWarn,
  error: logError,
  apiRequest: logApiRequest,
  apiResponse: logApiResponse,
  apiError: logApiError,
  createLogger,
  sanitizeLogData,
};
