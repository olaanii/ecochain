# API Middleware Utilities

This directory contains middleware utilities for building production-ready API routes with authentication, rate limiting, logging, and error handling.

## Overview

The middleware system provides a composable approach to building API endpoints with consistent behavior across all routes. It implements the requirements from the routing-and-navigation-system spec (Requirements 5.1, 5.5, 5.6, 5.7, 13.1, 13.2, 13.5, 14.1, 14.2).

## Files

- `middleware.ts` - Core middleware functions and utilities
- `middleware-example.ts` - Example usage patterns
- `README.md` - This documentation file

## Core Features

### 1. Authentication Middleware

Validates Clerk authentication tokens and extracts user context.

```typescript
import { withAuth } from '@/lib/api/middleware';

export const POST = withAuth(async (request, { auth, requestId }) => {
  // auth.userId - Authenticated user ID
  // auth.sessionId - Session ID
  // auth.role - User role (user | admin)
  // requestId - Unique request identifier
  
  // Your handler logic here
});
```

### 2. Rate Limiting Middleware

Prevents abuse by limiting requests per time window.

```typescript
import { withRateLimit } from '@/lib/api/middleware';

export const GET = withRateLimit({
  windowMs: 60 * 1000,      // 1 minute window
  maxRequests: 100,          // Max 100 requests per window
})(async (request) => {
  // Your handler logic here
});
```

**Rate Limit Headers:**
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Reset` - Timestamp when limit resets
- `Retry-After` - Seconds to wait (when limit exceeded)

### 3. Request Logging Middleware

Logs all API requests with structured logging format.

```typescript
import { withLogging } from '@/lib/api/middleware';

export const GET = withLogging(async (request) => {
  // Automatically logs:
  // - Request method, path, timestamp
  // - User ID (if authenticated)
  // - Response status code
  // - Request duration
  
  // Your handler logic here
});
```

**Log Format:**
```json
{
  "level": "info",
  "message": "API Request",
  "requestId": "req_1234567890_abc123",
  "method": "POST",
  "path": "/api/verify",
  "userId": "user_xyz",
  "timestamp": "2024-03-31T10:00:00.000Z",
  "statusCode": 200,
  "duration": 145
}
```

### 4. Error Handling Middleware

Catches unhandled errors and returns consistent error responses.

```typescript
import { withErrorHandling } from '@/lib/api/middleware';

export const POST = withErrorHandling(async (request) => {
  // Any thrown errors are automatically caught and formatted
  throw new Error("Something went wrong");
  // Returns: { success: false, error: { code, message }, meta: { ... } }
});
```

**Error Categorization:**
- `400` - Validation errors
- `401` - Authentication errors
- `403` - Authorization errors
- `404` - Not found errors
- `429` - Rate limit errors
- `500` - Internal server errors

### 5. Response Formatting Utilities

Consistent response format across all API endpoints.

```typescript
import { formatSuccessResponse, formatErrorResponse, jsonResponse } from '@/lib/api/middleware';

// Success response
const data = { id: "123", name: "Example" };
const response = formatSuccessResponse(data);
// Returns: { success: true, data: {...}, meta: { timestamp, requestId } }

// Error response
const error = formatErrorResponse("NOT_FOUND", "Resource not found");
// Returns: { success: false, error: { code, message }, meta: { ... } }

// JSON response with headers
return jsonResponse(response, 200, { "Cache-Control": "public, max-age=300" });
```

## Quick Start

### Protected API Route

Use `createProtectedHandler` for routes requiring authentication:

```typescript
// src/app/api/verify/route.ts
import { createProtectedHandler, formatSuccessResponse, jsonResponse } from '@/lib/api/middleware';

export const POST = createProtectedHandler(
  async (request, { auth, requestId }) => {
    const body = await request.json();
    
    // Your business logic here
    const result = { verified: true, rewardDelta: 100 };
    
    return jsonResponse(formatSuccessResponse(result, requestId));
  },
  {
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 10,
    },
  }
);
```

### Public API Route

Use `createPublicHandler` for public routes:

```typescript
// src/app/api/tasks/route.ts
import { createPublicHandler, formatSuccessResponse, jsonResponse } from '@/lib/api/middleware';

export const GET = createPublicHandler(
  async (request) => {
    // Fetch data from database
    const tasks = await prisma.task.findMany();
    
    return jsonResponse(
      formatSuccessResponse({ tasks }),
      200,
      { "Cache-Control": "public, max-age=300" }
    );
  },
  {
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 100,
    },
  }
);
```

## Advanced Usage

### Custom Middleware Composition

Compose middleware manually for fine-grained control:

```typescript
import {
  withAuth,
  withRateLimit,
  withLogging,
  withErrorHandling,
  composeMiddleware,
} from '@/lib/api/middleware';

const handler = composeMiddleware(
  withErrorHandling,
  withLogging,
  withRateLimit({ windowMs: 60000, maxRequests: 20 }),
)(async (request) => {
  // Your handler logic
});
```

### Custom Rate Limit Key Generator

Use custom logic to generate rate limit keys:

```typescript
withRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyGenerator: (request) => {
    // Rate limit by user ID instead of IP
    const userId = request.headers.get('x-user-id');
    return userId || 'anonymous';
  },
})
```

### Error Sanitization

Sensitive data is automatically removed from error messages:

```typescript
// Input: "Error at /home/user/project/src/file.ts with token=abc123"
// Output: "Error at [file] with token=[redacted]"
```

**Sanitized Data:**
- File paths
- Database connection strings
- Bearer tokens
- API keys
- Passwords

## Security Features

### 1. Sensitive Data Exclusion

Error responses never expose:
- Internal file paths
- Database connection strings
- Authentication tokens
- API keys
- Stack traces (in production)

### 2. Authentication Token Validation

All protected routes validate:
- Token presence
- Token signature
- Token expiration
- User identity

### 3. Authorization Enforcement

User identity is extracted and used to scope all operations:
- Database queries filtered by user ID
- Cross-user access prevented
- Role-based access control supported

## Configuration

### Environment Variables

```env
NODE_ENV=production  # Controls error detail exposure
```

### Rate Limiting

Default configuration (can be overridden per route):
- Window: 60 seconds
- Max requests: 100 (public), 10 (protected)
- Storage: In-memory (use Redis in production)

### Logging

- Format: Structured JSON
- Output: stdout (captured by container orchestration)
- Levels: info, warn, error
- Sanitization: Automatic removal of sensitive data

## Testing

See `tests/api-middleware.test.ts` for comprehensive test coverage:

```bash
npm run test:unit
```

## Best Practices

1. **Always use middleware helpers** - Don't implement auth/logging manually
2. **Set appropriate rate limits** - Balance security and usability
3. **Use structured logging** - Include context for debugging
4. **Sanitize error messages** - Never expose sensitive data
5. **Return consistent responses** - Use formatting utilities
6. **Handle errors gracefully** - Catch and categorize all errors
7. **Add cache headers** - Improve performance for cacheable data

## Migration Guide

### From Manual Auth Checks

**Before:**
```typescript
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Handler logic
}
```

**After:**
```typescript
export const POST = createProtectedHandler(
  async (request, { auth, requestId }) => {
    // Handler logic - auth is guaranteed
  }
);
```

### From Manual Error Handling

**Before:**
```typescript
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**After:**
```typescript
export const GET = createPublicHandler(
  async (request) => {
    const data = await fetchData();
    return jsonResponse(formatSuccessResponse(data));
  }
);
```

## Troubleshooting

### Rate Limit Issues

If rate limits are too restrictive:
1. Increase `maxRequests` for the route
2. Increase `windowMs` for longer windows
3. Use custom `keyGenerator` for per-user limits

### Authentication Failures

If auth middleware rejects valid requests:
1. Check Clerk configuration
2. Verify token is included in request
3. Check token expiration
4. Review Clerk dashboard for errors

### Logging Not Appearing

If logs are missing:
1. Check stdout/stderr output
2. Verify log level configuration
3. Check container orchestration logs
4. Ensure structured logging is enabled

## Related Documentation

- [Clerk Authentication](https://clerk.com/docs)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Validation](https://zod.dev/)
- [Winston Logging](https://github.com/winstonjs/winston)

## Support

For issues or questions:
1. Check this documentation
2. Review example usage in `middleware-example.ts`
3. Check test cases in `tests/api-middleware.test.ts`
4. Consult the routing-and-navigation-system spec
