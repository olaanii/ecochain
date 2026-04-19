# EcoChain API Documentation

This directory contains all backend API endpoints for the EcoChain application, implementing production-ready RESTful APIs with authentication, validation, error handling, and structured logging.

## Architecture

All API endpoints follow a consistent architecture:

1. **Request Validation**: Zod schemas validate all incoming requests
2. **Authentication**: Clerk-based authentication for protected endpoints
3. **Authorization**: Role-based access control and resource ownership checks
4. **Business Logic**: Core functionality with database operations
5. **Error Handling**: Consistent error responses with proper status codes
6. **Logging**: Structured logging for all requests, responses, and errors
7. **Rate Limiting**: Configurable rate limits to prevent abuse

## Endpoints

### Tasks API

#### `GET /api/tasks`

Retrieve available eco-tasks with optional filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by category (`transit`, `recycling`, `energy`, `community`)
- `taskId` (optional): Retrieve a specific task by ID
- `limit` (optional): Maximum number of tasks to return (default: 20, max: 100)
- `offset` (optional): Number of tasks to skip for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "transit | recycling | energy | community",
        "baseReward": 0,
        "bonusMultiplier": 0,
        "verificationHint": "string"
      }
    ],
    "total": 0,
    "limit": 20,
    "offset": 0
  },
  "meta": {
    "timestamp": "ISO 8601",
    "requestId": "string"
  }
}
```

**Rate Limit:** 100 requests per minute

**Cache:** 5 minutes (public), 10 minutes (CDN)

---

### Verification API

#### `POST /api/verify`

Submit proof of eco-action for verification and reward minting.

**Authentication:** Required

**Request Body:**
```json
{
  "taskId": "string",
  "proofHash": "string",
  "submittedAt": 0,
  "geoHash": "string (optional)",
  "proofType": "photo | transit | weight | sensor",
  "oracleSource": "string (optional)",
  "oracleConfidence": 0.0-1.0 (optional),
  "proofDetails": {} (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "verified": true,
      "taskName": "string",
      "rewardDelta": 0,
      "reason": "string (if failed)"
    },
    "ledger": [
      {
        "id": "string",
        "taskId": "string",
        "reward": 0,
        "mintedAt": "ISO 8601"
      }
    ]
  },
  "meta": {
    "timestamp": "ISO 8601",
    "requestId": "string"
  }
}
```

**Rate Limit:** 20 requests per minute

---

### Rewards API

#### `GET /api/rewards`

Retrieve available rewards catalog.

**Response:**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "string",
        "title": "string",
        "subtitle": "string",
        "cost": 0,
        "partner": "string",
        "available": true,
        "category": "string"
      }
    ]
  },
  "meta": {
    "timestamp": "ISO 8601",
    "requestId": "string"
  }
}
```

**Rate Limit:** 100 requests per minute

**Cache:** 5 minutes (public), 10 minutes (CDN)

---

### Redemption API

#### `POST /api/redeem`

Redeem earned rewards for real-world benefits.

**Authentication:** Required

**Request Body:**
```json
{
  "rewardId": "string",
  "initiaAddress": "string",
  "initiaUsername": "string (optional)",
  "displayName": "string (optional)",
  "region": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "reward": {
      "id": "string",
      "title": "string",
      "cost": 0
    },
    "balanceBefore": 0,
    "balanceAfter": 0,
    "reason": "string (if failed)"
  },
  "meta": {
    "timestamp": "ISO 8601",
    "requestId": "string"
  }
}
```

**Rate Limit:** 10 requests per minute

---

### Bridge API

#### `GET /api/bridge/history`

Retrieve user's bridge transaction history.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "string",
        "amount": 0,
        "denom": "string",
        "status": "pending | completed | failed",
        "sourceChain": "string",
        "targetChain": "string",
        "timestamp": "ISO 8601",
        "transactionLink": "string"
      }
    ]
  },
  "meta": {
    "timestamp": "ISO 8601",
    "requestId": "string"
  }
}
```

**Rate Limit:** 30 requests per minute

---

#### `POST /api/bridge/initiate`

Initiate a cross-chain bridge transaction.

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 0,
  "denom": "string",
  "sourceChain": "string",
  "targetChain": "string",
  "recipientAddress": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "string",
    "status": "pending",
    "estimatedCompletionTime": "ISO 8601",
    "trackingUrl": "string"
  },
  "meta": {
    "timestamp": "ISO 8601",
    "requestId": "string"
  }
}
```

**Rate Limit:** 5 requests per minute

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} (optional, development only)
  },
  "meta": {
    "timestamp": "ISO 8601",
    "requestId": "string"
  }
}
```

### Error Codes

- **400 Bad Request**
  - `VALIDATION_ERROR`: Request validation failed
  - `INSUFFICIENT_BALANCE`: Insufficient balance for operation
  - `VERIFICATION_FAILED`: Verification failed

- **401 Unauthorized**
  - `AUTHENTICATION_ERROR`: Authentication required
  - `MISSING_TOKEN`: Authentication token is missing
  - `INVALID_TOKEN`: Authentication token is invalid
  - `EXPIRED_TOKEN`: Authentication token has expired

- **403 Forbidden**
  - `AUTHORIZATION_ERROR`: Authorization failed
  - `RESOURCE_ACCESS_DENIED`: Access to resource denied
  - `ROLE_REQUIREMENT_NOT_MET`: Role requirement not met

- **404 Not Found**
  - `NOT_FOUND`: Resource not found
  - `TASK_NOT_FOUND`: Task not found
  - `REWARD_NOT_FOUND`: Reward not found

- **429 Too Many Requests**
  - `RATE_LIMIT_EXCEEDED`: Rate limit exceeded

- **500 Internal Server Error**
  - `INTERNAL_SERVER_ERROR`: Unexpected error occurred
  - `DATABASE_ERROR`: Database error occurred
  - `EXTERNAL_SERVICE_ERROR`: External service error

## Middleware

All endpoints use a middleware stack that provides:

### Authentication Middleware (`withAuth`)

- Validates Clerk authentication tokens
- Extracts user ID and session information
- Checks token expiration
- Returns 401 for missing/invalid tokens

### Rate Limiting Middleware (`withRateLimit`)

- Configurable per-endpoint rate limits
- In-memory storage (use Redis in production)
- Returns 429 with Retry-After header when exceeded
- Adds rate limit headers to all responses

### Logging Middleware (`withLogging`)

- Structured JSON logging
- Logs all requests and responses
- Includes request ID for tracing
- Sanitizes sensitive data

### Error Handling Middleware (`withErrorHandling`)

- Catches all unhandled errors
- Categorizes errors by type
- Returns consistent error responses
- Logs errors with full context

## Authorization

### Resource Access Control

Use `canAccessUserResource()` to check if a user can access a resource:

```typescript
import { canAccessUserResource } from "@/lib/api/middleware";

if (!canAccessUserResource(context.auth, resourceUserId)) {
  return createAuthorizationError("Access denied", context.requestId);
}
```

### Admin-Only Endpoints

Use `withAdminAuth()` for admin-only endpoints:

```typescript
export const GET = withAdminAuth(async (request, context) => {
  // Only admins can access this
});
```

## Logging

All API operations are logged with structured JSON format:

```json
{
  "level": "info | warn | error",
  "timestamp": "ISO 8601",
  "message": "Log message",
  "requestId": "string",
  "method": "string",
  "path": "string",
  "userId": "string (optional)",
  "statusCode": 0,
  "duration": 0,
  "error": "string (optional)",
  "stack": "string (optional, development only)"
}
```

### Log Levels

- **info**: Successful operations, normal flow
- **warn**: Recoverable errors, validation failures
- **error**: Unrecoverable errors, exceptions

### Using the Logger

```typescript
import { logInfo, logWarn, logError } from "@/lib/api/logger";

logInfo("Operation completed", { userId: "123", action: "create" });
logWarn("Validation warning", { field: "email", value: "invalid" });
logError("Database error", { error: err.message, query: "SELECT..." });
```

## Rate Limiting

Rate limits are configured per endpoint:

```typescript
export const GET = createPublicHandler(handler, {
  rateLimit: {
    windowMs: 60000,      // 1 minute window
    maxRequests: 100,     // 100 requests per window
  },
});
```

Rate limit headers are included in all responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds to wait (when limit exceeded)

## Validation

All request validation uses Zod schemas defined in `src/lib/api/schemas.ts`.

Example validation:

```typescript
import { validateRequestBody, formatValidationError } from "@/lib/api/schemas";

const validation = validateRequestBody(MySchema, body);

if (!validation.success) {
  const errorDetails = formatValidationError(validation.error);
  return jsonResponse({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: errorDetails.message,
      details: errorDetails.details,
    },
  }, 400);
}

// Use validated data
const data = validation.data;
```

## Testing

See `tests/api-*.test.ts` for comprehensive test coverage including:

- Unit tests for specific scenarios
- Property-based tests for universal properties
- Integration tests for full request/response cycles
- Error handling tests

## Production Considerations

### Database

- All endpoints include fallback to static data if database is unavailable
- Use connection pooling for optimal performance
- Implement retry logic for transient failures

### Caching

- Public endpoints include cache headers
- Consider CDN caching for static data
- Implement cache invalidation strategies

### Monitoring

- All logs are structured JSON for easy parsing
- Use log aggregation service (Datadog, New Relic, etc.)
- Set up alerts for error rates and response times

### Security

- All sensitive data is sanitized from logs
- Authentication tokens are validated on every request
- Rate limiting prevents abuse
- CORS is configured appropriately

### Scalability

- Rate limiting uses in-memory storage (migrate to Redis for multi-instance)
- Consider horizontal scaling with load balancer
- Implement database read replicas for read-heavy endpoints
