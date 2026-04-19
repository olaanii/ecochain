import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/verification",
  "/merchants",
  "/api/verify",
  "/api/redeem",
  "/api/bridge",
];

const isSponsorRoute = createRouteMatcher(["/sponsor(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = request.nextUrl;

  // Unauthenticated users on protected routes → landing page
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role-based portal guards
  if (userId) {
    const role =
      ((sessionClaims?.publicMetadata as Record<string, unknown>)
        ?.role as string) ?? "user";

    if (isSponsorRoute(request) && role !== "sponsor") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (isAdminRoute(request) && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
