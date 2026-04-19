"use client";

import type { ReactNode } from "react";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { SideNavBar } from "@/components/layout/side-nav-bar";

type SponsorShellProps = {
  children: ReactNode;
};

/**
 * App shell for Sponsor portal pages (/sponsor/*).
 * Same layout as ProductShell but always passes role="sponsor"
 * so the sidebar shows sponsor-specific navigation icons.
 */
export function SponsorShell({ children }: SponsorShellProps) {
  return (
    <div className="relative min-h-screen bg-[#f9f9f9]">
      <TopNavBar variant="app" role="sponsor" />
      <SideNavBar role="sponsor" />

      <main className="pt-16 md:pl-20">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-24">
          {children}
        </div>
      </main>
    </div>
  );
}
