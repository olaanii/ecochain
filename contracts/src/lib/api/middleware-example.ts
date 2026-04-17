/**
 * Example usage of API middleware utilities
 * This file demonstrates how to use the middleware in API routes
 */

import { NextRequest } from "next/server";
import {
  createProtectedHandler,
  createPublicHandler,
  formatSuccessResponse,
  formatErrorResponse,
  jsonResponse,
  type AuthContext,
} from "./middleware";

// ============================================================================
// Example 1: Protected API Route with Authentication
// ============================================================================

/**
 * Example: /api/verify endpoint
 * Requires authentication, includes rate limiting and logging
 */
export const POST = createProtectedHandler(
  async (request: NextRequest, { auth, requestId }: { auth: AuthContext; requestId: string }) => {
    try {
      // Parse request body
      const body = await request.json();
      
      // Validate request (use Zod schema in real implementation)
      if (!body.taskId || !body.proofHash) {
        return jsonResponse(
          formatErrorResponse(
            "VALIDATION_ERROR",
            "Missing required fields: taskId and proofHash",
            undefined,
            requestId
          ),
          400
        );
      }
      
      // Business logic here
      // - Verify proof
      // - Mint rewards
      // - Create verification record
      
      const result = {
        verified: true,
        taskName: "Example Task",
        rewardDelta: 100,
      };
      
      return jsonResponse(
        formatSuccessResponse(result, requestId),
        200
      );
    } catch (error) {
      const err = error as Error;
      return jsonResponse(
        formatErrorResponse(
          "INTERNAL_SERVER_ERROR",
          err.message,
          undefined,
          requestId
        ),
        500
      );
    }
  },
  {
    // Rate limit: 10 requests per minute
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 10,
    },
  }
);

// ============================================================================
// Example 2: Public API Route with Rate Limiting
// ============================================================================

/**
 * Example: /api/tasks endpoint
 * Public access, includes rate limiting and logging
 */
export const GET = createPublicHandler(
  async (request: NextRequest) => {
    try {
      // Get query parameters
      const { searchParams } = request.nextUrl;
      const category = searchParams.get("category");
      
      // Fetch tasks from database
      // const tasks = await prisma.task.findMany({ where: { category } });
      
      // Mock data for example
      const tasks = [
        {
          id: "1",
          name: "Transit Task",
          description: "Use public transit",
          category: "transit",
          baseReward: 50,
          bonusMultiplier: 1.5,
        },
      ];
      
      return jsonResponse(
        formatSuccessResponse({ tasks }),
        200,
        {
          "Cache-Control": "public, max-age=300",
        }
      );
    } catch (error) {
      const err = error as Error;
      return jsonResponse(
        formatErrorResponse(
          "INTERNAL_SERVER_ERROR",
          err.message
        ),
        500
      );
    }
  },
  {
    // Rate limit: 100 requests per minute
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 100,
    },
  }
);

// ============================================================================
// Example 3: Manual Middleware Composition
// ============================================================================

/**
 * Example: Custom middleware composition for specific needs
 */
import {
  withAuth,
  withRateLimit,
  withLogging,
  withErrorHandling,
} from "./middleware";

export const customHandler = withErrorHandling(
  withLogging(
    withRateLimit({
      windowMs: 60 * 1000,
      maxRequests: 20,
    })(
      withAuth(async (request, { auth, requestId }) => {
        // Your handler logic here
        return jsonResponse(
          formatSuccessResponse({
            message: "Success",
            userId: auth.userId,
          }, requestId)
        );
      }) as any
    ) as any
  ) as any
);

// ============================================================================
// Example 4: Response Formatting
// ============================================================================

/**
 * Example: Using response formatting utilities directly
 */
export async function exampleResponseFormatting() {
  // Success response
  const successResponse = formatSuccessResponse({
    id: "123",
    name: "Example",
  });
  
  // Error response
  const errorResponse = formatErrorResponse(
    "NOT_FOUND",
    "Resource not found"
  );
  
  // JSON response with custom headers
  const response = jsonResponse(
    successResponse,
    200,
    {
      "X-Custom-Header": "value",
    }
  );
  
  return response;
}
