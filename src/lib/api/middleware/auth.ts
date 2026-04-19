import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { validateBech32Address } from "../validation";
import { logError, logWarn } from "../logger";
import { prisma } from "@/lib/prisma/client";

export type AuthContext = {
  userId: string;
  clerkId: string;
  walletAddress?: string;
  role: "public" | "user" | "sponsor" | "admin" | "owner";
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

    // Resolve the DB role for this Clerk user. Fall back to "user" if the
    // row does not exist yet (pre-onboarding) so routes can distinguish
    // "no DB record" from "real account".
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    const role = ((dbUser?.role as AuthContext["role"]) || "user");

    const authContext: AuthContext = {
      userId: dbUser?.id ?? userId,
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

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    const role = ((dbUser?.role as AuthContext["role"]) || "user");

    const authContext: AuthContext = {
      userId: dbUser?.id ?? userId,
      clerkId: userId,
      role,
    };

    return { auth: authContext };
  } catch {
    return { auth: undefined };
  }
}

export async function requireAuth(
  request: NextRequest,
): Promise<{
  id: string;
  clerkId: string;
  role: AuthContext["role"];
} | null> {
  const { auth: authContext, error } = await authMiddleware(request);

  if (error || !authContext) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: authContext.clerkId },
    select: {
      id: true,
      clerkId: true,
      role: true,
    },
  });

  if (!user) {
    logWarn("Authenticated Clerk user is missing a database record", {
      clerkId: authContext.clerkId,
      path: request.nextUrl.pathname,
    });
    return null;
  }

  return {
    id: user.id,
    clerkId: user.clerkId,
    role: (user.role as AuthContext["role"]) || "user",
  };
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
 * Compose multiple middleware functions.
 *
 * Each step receives the original request plus the accumulated `AuthContext`
 * from any prior step, so later middleware (e.g. wallet validation, RBAC)
 * can build on earlier results.
 */
export async function composeMiddleware(
  request: NextRequest,
  middlewares: Array<
    (req: NextRequest, ctx?: AuthContext) => Promise<{ auth?: AuthContext; error?: NextResponse }>
  >,
): Promise<{ auth?: AuthContext; error?: NextResponse }> {
  let authContext: AuthContext | undefined;

  for (const middleware of middlewares) {
    const middlewareResult = await middleware(request, authContext);

    if (middlewareResult.error) {
      return { auth: authContext, error: middlewareResult.error };
    }

    if (middlewareResult.auth) {
      authContext = middlewareResult.auth;
    }
  }

  return { auth: authContext };
}
