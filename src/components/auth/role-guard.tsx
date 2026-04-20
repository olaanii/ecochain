"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import type { UserRole } from "@/hooks/use-user-role";

interface RoleGuardProps {
  /** Role(s) that are permitted to view this content. */
  allow: UserRole | UserRole[];
  /** What to render while the role is still loading. Defaults to null. */
  fallback?: React.ReactNode;
  /** Where to redirect on denial. Defaults to "/403". */
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Client-side role guard.
 *
 * Renders `children` only when the signed-in user's role is in `allow`.
 * While loading, renders `fallback` (default: null).
 * On denial, redirects to `redirectTo` (default: "/403").
 *
 * Usage:
 * ```tsx
 * <RoleGuard allow="admin">
 *   <AdminPanel />
 * </RoleGuard>
 *
 * <RoleGuard allow={["admin", "sponsor"]} redirectTo="/dashboard">
 *   <SponsorFeature />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  allow,
  fallback = null,
  redirectTo = "/403",
  children,
}: RoleGuardProps) {
  const { role, isLoaded } = useUserRole();
  const router = useRouter();

  const allowed = Array.isArray(allow) ? allow : [allow];
  // owner always has elevated access
  const isPermitted = allowed.includes(role) || role === "owner";

  useEffect(() => {
    if (isLoaded && !isPermitted) {
      router.replace(redirectTo);
    }
  }, [isLoaded, isPermitted, router, redirectTo]);

  if (!isLoaded) return <>{fallback}</>;
  if (!isPermitted) return null;

  return <>{children}</>;
}

/**
 * Inline role gate — renders `children` when permitted, `denied` otherwise.
 * Does NOT redirect; useful for hiding individual UI elements.
 *
 * Usage:
 * ```tsx
 * <ShowForRole allow={["admin", "sponsor"]}>
 *   <ExportButton />
 * </ShowForRole>
 * ```
 */
export function ShowForRole({
  allow,
  denied = null,
  children,
}: {
  allow: UserRole | UserRole[];
  denied?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { role } = useUserRole();
  const allowed = Array.isArray(allow) ? allow : [allow];
  const isPermitted = allowed.includes(role) || role === "owner";
  return <>{isPermitted ? children : denied}</>;
}
