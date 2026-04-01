import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/verification",
  "/merchants",
  "/api/verify",
  "/api/redeem",
  "/api/bridge",
];

// Public routes that don't require authentication
// Note: These are documented here for clarity, but the middleware
// allows all non-protected routes by default
const publicRoutes = [
  "/",
  "/discover",
  "/bridge",
  "/figma-screens",
  "/api/tasks",
  "/api/rewards",
];

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route (check this first)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a protected route and user is not authenticated, redirect to landing page
  if (isProtectedRoute && !userId) {
    const landingUrl = new URL("/", request.url);
    return NextResponse.redirect(landingUrl);
  }

  // Allow the request to proceed for:
  // - Authenticated users accessing protected routes
  // - Anyone accessing public routes (listed above)
  // - Any other routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
