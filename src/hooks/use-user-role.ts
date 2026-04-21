"use client";

import { useUser } from "@clerk/nextjs";

export type UserRole = "user" | "sponsor" | "sponsor_admin" | "sponsor_viewer" | "admin" | "owner";

export function useUserRole(): { role: UserRole; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata?.role as UserRole) ?? "user";
  return { role, isLoaded };
}
