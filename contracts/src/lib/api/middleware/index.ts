// Authentication middleware
export {
  authMiddleware,
  optionalAuthMiddleware,
  validateWalletMiddleware,
  rbacMiddleware,
  composeMiddleware,
  type AuthContext,
  type AuthenticatedRequest,
} from "./auth";

// Rate limiting middleware
export {
  checkRateLimit,
  rateLimitMiddleware,
  blockchainRateLimitMiddleware,
  resetRateLimit,
  getRateLimitStatus,
  type RateLimitConfig,
  type RateLimitResult,
} from "./rate-limit";

// Validation middleware
export {
  validationMiddleware,
  sanitizeInput,
  sanitizeObject,
  ValidationSchemas,
  ProofSubmissionSchema,
  StakeSubmissionSchema,
  RedemptionSchema,
  VoteSubmissionSchema,
} from "./validation";

// Error handling middleware
export {
  errorHandlerMiddleware,
  createErrorContext,
  generateRequestId,
  ApiError,
  ApiErrors,
  withErrorHandling,
  type ErrorContext,
} from "./error-handler";

// Logging middleware
export {
  loggingMiddleware,
  createAnalyticsLog,
  logResponseTime,
  logApiMetrics,
  withLogging,
  generateRequestId as generateLoggingRequestId,
  type RequestLog,
} from "./logging";
