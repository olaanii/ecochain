/**
 * Server-side helper that resolves the currently-authenticated Clerk user
 * to the corresponding row in the application's `User` table.
 *
 * Prefer this over trusting client-supplied `userId` in request bodies.
 */

import { auth } from "@clerk/nextjs/server";
import { prisma, withRetry } from "@/lib/prisma/client";

export type DbUserRole = "user" | "sponsor" | "admin" | "owner";

export interface DbUser {
  id: string;
  clerkId: string;
  role: DbUserRole;
}

export async function getCurrentDbUser(): Promise<DbUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    // Use retry logic for database query to handle transient connection errors
    const user = await withRetry(
      () =>
        prisma.user.findUnique({
          where: { clerkId: userId },
          select: { id: true, clerkId: true, role: true },
        }),
      3,
      50
    );

    if (!user) return null;

    const role = (user.role as DbUserRole) || "user";
    return { id: user.id, clerkId: user.clerkId, role };
  } catch (error) {
    console.error("[getCurrentDbUser] Database query failed after retries:", error);
    return null;
  }
}

export async function requireCurrentDbUser(): Promise<DbUser | { error: Response }> {
  const user = await getCurrentDbUser();
  if (!user) {
    return {
      error: new Response(JSON.stringify({ success: false, error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return user;
}

export function requireRole(user: DbUser, roles: DbUserRole[]): Response | null {
  if (!roles.includes(user.role)) {
    return new Response(JSON.stringify({ success: false, error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}
