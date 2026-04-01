import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { validateBech32Address } from "../validation";
import { logError, logWarn } from "../logger";

export type AuthContext = {
  userId: string;
  clerkId: string;
  walletAddress?: string;
  role: "public" | "authenticated" | "admin" | "owner";
};

export type AuthenticatedRequest = NextRequest & {
  auth?: AuthContext;
};

/**
 * Authentication middleware
 * Validates JWT token using Clerk and injects user context
 * Requirements: 16.1, 16.2, 16.3, 16.4, 29.2, 29.3, 29.4
 */
export async function authMiddleware(
  request: NextRequest,
): Promise<{ auth?: AuthContext; error?: NextResponse }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      logWarn("Authentication failed: No valid token", {
        path: request.nextUrl.pathname,
        method: request.method,
      });
      return {
        error: NextResponse.json(
          { error: "Unauthorized: No valid authentication token" },
          { status: 401 },
        ),
      };
    }

    // Determine user role based on userId or database lookup
    // For now, default to "authenticated"
    // In production, fetch from database or session
    const role: AuthContext["role"] = "authenticated";

    const authContext: AuthContext = {
      userId,
      clerkId: userId,
      role,
    };

    return { auth: authContext };
  } catch (error) {
    logError("Authentication error", {
      error: error instanceof Error ? error.message : String(error),
      path: request.nextUrl.pathname,
    });
    return {
      error: NextResponse.json(
        { error: "Unauthorized: Invalid authentication token" },
        { status: 401 },
      ),
    };
  }
}

/**
 * Optional authentication middleware
 * Allows requests without authentication but injects context if available
 */
export async function optionalAuthMiddleware(
  request: NextRequest,
): Promise<{ auth?: AuthContext }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { auth: undefined };
    }

    const authContext: AuthContext = {
      userId,
      clerkId: userId,
      role: "authenticated",
    };

    return { auth: authContext };
  } catch {
    return { auth: undefined };
  }
}

/**
 * Wallet address validation middleware
 * Validates wallet address format and injects into auth context
 */
export async function validateWalletMiddleware(
  request: NextRequest,
  authContext: AuthContext,
): Promise<{ auth?: AuthContext; error?: NextResponse }> {
  try {
    const walletAddress = request.headers.get("x-wallet-address");

    if (!walletAddress) {
      return {
        error: NextResponse.json(
          { error: "Bad Request: Missing wallet address header" },
          { status: 400 },
        ),
      };
    }

    // Validate Bech32 format
    if (!validateBech32Address(walletAddress)) {
      return {
        error: NextResponse.json(
          { error: "Bad Request: Invalid wallet address format" },
          { status: 400 },
        ),
      };
    }

    return {
      auth: {
        ...authContext,
        walletAddress,
      },
    };
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: "Bad Request: Invalid wallet address" },
        { status: 400 },
      ),
    };
  }
}

/**
 * Role-based access control middleware
 * Validates user has required role
 */
export function rbacMiddleware(
  authContext: AuthContext,
  requiredRoles: AuthContext["role"][],
): NextResponse | null {
  if (!requiredRoles.includes(authContext.role)) {
    return NextResponse.json(
      { error: "Forbidden: Insufficient permissions" },
      { status: 403 },
    );
  }

  return null;
}

/**
 * Compose multiple middleware functions
 */
export async function composeMiddleware(
  request: NextRequest,
  middlewares: Array<(req: NextRequest) => Promise<any>>,
): Promise<{ auth?: AuthContext; error?: NextResponse }> {
  let result: any = { auth: undefined };

  for (const middleware of middlewares) {
    const middlewareResult = await middleware(request);

    if (middlewareResult.error) {
      return middlewareResult;
    }

    if (middlewareResult.auth) {
      result.auth = middlewareResult.auth;
    }
  }

  return result;
}
