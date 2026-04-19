"use client";

import type { ReactNode } from "react";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { SideNavBar } from "@/components/layout/side-nav-bar";
import { useUserRole } from "@/hooks/use-user-role";

type ProductShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * App shell for authenticated pages in The Quiet Earth.
 * Combines TopNavBar (64px fixed top) + SideNavBar (80px fixed left)
 * with a content area offset by both. Role-aware: passes role to both
 * nav components so icons and sub-nav tabs match the signed-in user.
 */
export function ProductShell({ children }: ProductShellProps) {
  const { role } = useUserRole();

  return (
    <div className="relative min-h-screen bg-[#f9f9f9]">
      <TopNavBar variant="app" role={role} />
      <SideNavBar role={role} />

      {/* Main content — offset for nav */}
      <main className="pt-16 md:pl-20">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-24">
          {children}
        </div>
      </main>
    </div>
  );
}
