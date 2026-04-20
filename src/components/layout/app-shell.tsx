"use client";

import type { ReactNode } from "react";
import { SideNavBar } from "./side-nav-bar";
import { TopNavBar } from "./top-nav-bar";
import { Footer } from "./footer";
import { useUserRole } from "@/hooks/use-user-role";

interface AppShellProps {
  children: ReactNode;
}

/**
 * The main application shell wrapping content with sidebar,
 * top navigation, and footer.
 * Sub-nav tabs are resolved automatically from the current pathname
 * via `navigationFor(role)` inside TopNavBar — no hardcoded nav arrays here.
 */
export function AppShell({ children }: AppShellProps) {
  const { role } = useUserRole();

  return (
    <div className="relative min-h-screen bg-[#f9f9f9]">
      <TopNavBar variant="app" role={role} />
      <SideNavBar role={role} />

      <main className="pt-16 md:pl-20">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-24">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
