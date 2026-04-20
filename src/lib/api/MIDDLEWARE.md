# API Middleware Layer Documentation

## Overview

The API middleware layer provides comprehensive request handling including authentication, rate limiting, validation, error handling, and logging. All middleware is composable and can be combined for flexible request processing.

## Middleware Components

### 1. Authentication Middleware (`auth.ts`)

Handles JWT token validation using Clerk and injects user context into requests.

#### Functions

**`authMiddleware(request: NextRequest)`**
- Validates JWT token using Clerk
- Returns 401 if no valid token
- Injects `AuthContext` with userId, clerkId, and role

**`optionalAuthMiddleware(request: NextRequest)`**
- Allows requests without authentication
- Injects context if available
- Returns undefined if not authenticated

**`validateWalletMiddleware(request: NextRequest, authContext: AuthContext)`**
- Validates wallet address from `x-wallet-address` header
- Validates Bech32 format
- Returns 400 if invalid

**`rbacMiddleware(authContext: AuthContext, requiredRoles: string[])`**
- Checks if user has required role
- Returns 403 if insufficient permissions
- Supports roles: public, authenticated, admin, owner

#### Usage

```typescript
import { authMiddleware, rbacMiddleware } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  // Require authentication
  const { auth, error } = await authMiddleware(request);
  if (error) return error;

  // Check admin role
  const rbacError = rbacMiddleware(auth!, ["admin", "owner"]);
  if (rbacError) return rbacError;

  // Process request
  return NextResponse.json({ success: true });
}
```

### 2. Rate Limiting Middleware (`rate-limit.ts`)

Implements Redis-based distributed rate limiting with different limits per user role.

#### Rate Limits

- **Public**: 100 req/min
- **Authenticated**: 300 req/min
- **Admin**: 1000 req/min
- **Blockchain**: 10 tx/min per user

#### Functions

**`checkRateLimit(key: string, config: RateLimitConfig)`**
- Checks if request is within rate limit
- Returns remaining requests and reset time
- Fails open if Redis is unavailable

**`rateLimitMiddleware(request: NextRequest, userId?: string, isAdmin?: boolean)`**
- Applies rate limiting based on user role
- Returns 429 if limit exceeded
- Sets Retry-After header

**`blockchainRateLimitMiddleware(request: NextRequest, userId: string)`**
- Stricter limits for blockchain operations
- 10 transactions per minute per user

#### Usage

```typescript
import { rateLimitMiddleware } from "@/lib/api/middleware";

export async function POST(request: NextRequest) {
  const { allowed, response } = await rateLimitMiddleware(
    request,
    userId,
    isAdmin,
  );

  if (!allowed) return response;

  // Process request
  return NextResponse.json({ success: true });
}
```

### 3. Validation Middleware (`validation.ts`)

Validates request bodies against Zod schemas and sanitizes input.

#### Validation Schemas

- `walletAddress` - Bech32 format validation
- `tokenAmount` - Positive integer validation
- `timestamp` - Within 48 hours validation
- `taskId` - Task ID format validation
- `proofHash` - SHA-256 hash format validation
- `stakeDuration` - [30, 90, 180, 365] days validation
- `pagination` - Limit and offset validation
- `category` - [transit, recycling, energy, community] validation
- `status` - [pending, verified, rejected, expired] validation

#### Composite Schemas

- `ProofSubmissionSchema` - Proof submission validation
- `StakeSubmissionSchema` - Stake submission validation
- `RedemptionSchema` - Redemption validation
- `VoteSubmissionSchema` - Vote submission validation

#### Functions

**`validationMiddleware(request: NextRequest, schema: ZodSchema)`**
- Validates request body against schema
- Returns 400 with detailed errors if invalid
- Handles JSON parsing errors

**`sanitizeInput(input: string)`**
- Removes HTML tags
- Removes script tags
- Removes event handlers
- Trims whitespace

**`sanitizeObject(obj: any)`**
- Recursively sanitizes object
- Handles strings, arrays, and nested objects

#### Usage

```typescript
import {
  validationMiddleware,
  ProofSubmissionSchema,
} from "@/lib/api/middleware";

export async function POST(request: NextRequest) {
  const { data, error } = await validationMiddleware(
    request,
    ProofSubmissionSchema,
  );

  if (error) return error;

  // Use validated data
  const { taskId, proofData, timestamp } = data;
  return NextResponse.json({ success: true });
}
```

### 4. Error Handling Middleware (`error-handler.ts`)

Provides global error handling with user-friendly messages and error logging.

#### Error Types

- **4xx Errors**: Client errors (bad request, unauthorized, etc.)
- **5xx Errors**: Server errors (internal server error, service unavailable)

#### Functions

**`errorHandlerMiddleware(error: Error, request: NextRequest, context: ErrorContext)`**
- Handles errors and returns formatted response
- Logs errors with context
- Redacts sensitive data from logs
- Adds security headers

**`createErrorContext(request: NextRequest, userId?: string)`**
- Creates error context with request details
- Generates unique request ID
- Captures timestamp and path

**`withErrorHandling(handler: Function)`**
- Wraps async route handler with error handling
- Catches and formats errors
- Returns proper HTTP responses

#### Common Errors

```typescript
import { ApiErrors } from "@/lib/api/middleware";

// Unauthorized
throw ApiErrors.unauthorized();

// Forbidden
throw ApiErrors.forbidden();

// Not found
throw ApiErrors.notFound("User");

// Bad request
throw ApiErrors.badRequest("Invalid input", { field: "email" });

// Conflict
throw ApiErrors.conflict("Email already exists");

// Too many requests
throw ApiErrors.tooManyRequests(60);

// Internal server error
throw ApiErrors.internalServerError("Database connection failed");

// Service unavailable
throw ApiErrors.serviceUnavailable();
```

#### Usage

```typescript
import { withErrorHandling, ApiErrors } from "@/lib/api/middleware";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await getUser(userId);
  if (!user) {
    throw ApiErrors.notFound("User");
  }

  return NextResponse.json({ user });
});
```

### 5. Logging Middleware (`logging.ts`)

Logs requests and responses with timing and correlation IDs.

#### Logged Information

- Request ID (correlation ID)
- Timestamp
- HTTP method and path
- Status code
- Response time (ms)
- User ID
- IP address
- User agent

#### Functions

**`loggingMiddleware(request: NextRequest, handler: Function, userId?: string)`**
- Logs request/response with timing
- Generates unique request ID
- Adds correlation ID to headers
- Returns log data

**`createAnalyticsLog(log: RequestLog, additionalData?: any)`**
- Creates structured log for analytics
- Combines request log with additional data

**`logResponseTime(requestId: string, path: string, duration: number, statusCode: number)`**
- Logs API response times
- Useful for performance monitoring

**`logApiMetrics(path: string, method: string, statusCode: number, duration: number)`**
- Logs API metrics for analytics
- Tracks performance by endpoint

#### Usage

```typescript
import { loggingMiddleware } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  const { response, log } = await loggingMiddleware(
    request,
    async (req) => {
      // Handle request
      return NextResponse.json({ success: true });
    },
    userId,
  );

  return response;
}
```

## Composing Middleware

### Example: Complete Request Handler

```typescript
import {
  authMiddleware,
  rbacMiddleware,
  rateLimitMiddleware,
  validationMiddleware,
  withErrorHandling,
  ProofSubmissionSchema,
  ApiErrors,
} from "@/lib/api/middleware";

export const POST = withErrorHandling(async (request: NextRequest) => {
  // 1. Authenticate
  const { auth, error: authError } = await authMiddleware(request);
  if (authError) return authError;

  // 2. Check permissions
  const rbacError = rbacMiddleware(auth!, ["authenticated", "admin"]);
  if (rbacError) return rbacError;

  // 3. Rate limit
  const { allowed, response: rateLimitResponse } = await rateLimitMiddleware(
    request,
    auth!.userId,
  );
  if (!allowed) return rateLimitResponse;

  // 4. Validate input
  const { data, error: validationError } = await validationMiddleware(
    request,
    ProofSubmissionSchema,
  );
  if (validationError) return validationError;

  // 5. Process request
  const result = await submitProof(auth!.userId, data);

  return NextResponse.json(result);
});
```

## Security Features

### Input Sanitization
- Removes HTML tags and script content
- Removes event handlers
- Prevents XSS attacks

### Sensitive Data Redaction
- Redacts wallet addresses from logs
- Redacts API keys and secrets
- Prevents information leakage

### Rate Limiting
- Prevents brute force attacks
- Protects against DDoS
- Configurable per user role

### RBAC
- Role-based access control
- Supports multiple roles
- Flexible permission checking

### Error Handling
- User-friendly error messages
- Detailed error logging
- Proper HTTP status codes

## Performance Considerations

### Caching
- Rate limit data cached in Redis
- 30-second TTL for balance data
- 5-minute TTL for task/reward data

### Timeouts
- 30-second timeout for oracle responses
- 100ms target for query execution
- Configurable per operation

### Monitoring
- Request/response logging
- Performance metrics tracking
- Error rate monitoring

## Testing

### Unit Tests
```bash
npm run test -- tests/middleware/
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

## Configuration

### Environment Variables
```env
# Rate limiting
RATE_LIMIT_PUBLIC=100
RATE_LIMIT_AUTH=300
RATE_LIMIT_ADMIN=1000
RATE_LIMIT_BLOCKCHAIN=10

# Timeouts
ORACLE_TIMEOUT=30000
QUERY_TIMEOUT=100

# Redis
REDIS_URL=redis://localhost:6379
```

## Best Practices

1. **Always use error handling wrapper** - Use `withErrorHandling` for all route handlers
2. **Validate early** - Validate input before processing
3. **Sanitize user input** - Always sanitize strings from user input
4. **Log important events** - Log authentication, authorization, and errors
5. **Use correlation IDs** - Track requests through system with request IDs
6. **Handle rate limits gracefully** - Provide clear error messages and retry information
7. **Fail securely** - Fail closed for security, fail open for availability

## Troubleshooting

### Rate Limit Issues
- Check Redis connection
- Verify rate limit configuration
- Check user role assignment

### Validation Errors
- Review schema definition
- Check input format
- Verify sanitization rules

### Authentication Failures
- Verify Clerk configuration
- Check JWT token validity
- Verify user session

### Performance Issues
- Monitor query execution times
- Check Redis performance
- Review middleware order
