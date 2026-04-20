import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route matchers ──────────────────────────────────────────────────────────

/** Routes that require the user to be authenticated. */
const isAuthRequired = createRouteMatcher([
  "/dashboard(.*)",
  "/verification(.*)",
  "/merchants(.*)",
  "/analytics(.*)",
  "/governance(.*)",
  "/sponsor(.*)",
  "/admin(.*)",
  "/api/verify(.*)",
  "/api/redeem(.*)",
  "/api/bridge(.*)",
  "/api/stake(.*)",
  "/api/me(.*)",
  "/api/notifications(.*)",
  "/api/rewards(.*)",
  "/api/balance(.*)",
  "/api/leaderboard(.*)",
  "/api/tasks(.*)",
  "/api/governance(.*)",
  "/api/admin(.*)",
  "/api/transactions(.*)",
  "/api/verification(.*)",
  "/api/analytics(.*)",
  "/api/blockchain(.*)",
  "/api/events(.*)",
]);

/** Routes that require role = "admin" or "owner". */
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

/** Routes that require role = "sponsor" | "admin" | "owner". */
const isSponsorRoute = createRouteMatcher([
  "/sponsor(.*)",
]);

type UserRole = "user" | "sponsor" | "admin" | "owner";

function getRole(sessionClaims: Record<string, unknown> | null): UserRole {
  return (
    (sessionClaims?.publicMetadata as { role?: UserRole } | undefined)?.role ??
    "user"
  );
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims } = await auth();

  // 1. Auth gate — redirect unauthenticated visitors to sign-in.
  if (isAuthRequired(req) && !userId) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }

  // From here the user is authenticated (or the route is public).
  if (!userId) return NextResponse.next();

  const role = getRole(sessionClaims as Record<string, unknown>);

  // 2. Admin gate — non-admin users accessing /admin → 403.
  if (isAdminRoute(req) && role !== "admin" && role !== "owner") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  // 3. Sponsor gate — non-sponsor, non-admin users accessing /sponsor → 403.
  if (isSponsorRoute(req) && role !== "sponsor" && role !== "admin" && role !== "owner") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  // 4. Propagate role to server components via a response header.
  const response = NextResponse.next();
  response.headers.set("x-user-role", role);
  return response;
});

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
