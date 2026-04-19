"use client";

import type { ReactNode } from "react";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { SideNavBar } from "@/components/layout/side-nav-bar";

type AdminShellProps = {
  children: ReactNode;
};

/**
 * App shell for Admin portal pages (/admin/*).
 * Always passes role="admin" so the sidebar shows admin-specific icons.
 */
export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="relative min-h-screen bg-[#f9f9f9]">
      <TopNavBar variant="app" role="admin" />
      <SideNavBar role="admin" />

      <main className="pt-16 md:pl-20">
        <div className="mx-auto max-w-[1400px] px-8 py-10 lg:px-24">
          {children}
        </div>
      </main>
    </div>
  );
}
