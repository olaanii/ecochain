"use client";

import type { ReactNode } from "react";
import { SideNavBar } from "./side-nav-bar";
import { TopNavBar } from "./top-nav-bar";
import { Footer } from "./footer";

const operatorHubNav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Verification", href: "/verification" },
  { label: "Merchants", href: "/merchants" },
  { label: "Analytics", href: "/analytics" },
];

interface AppShellProps {
  children: ReactNode;
}

/**
 * The main application shell wrapping content with sidebar,
 * top navigation, and footer. Used by the Operator Hub pages
 * (Camera, Sensor, Verification Status, etc.).
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0e0e0e]">
      {/* Fixed sidebar */}
      <SideNavBar />

      {/* Main content area (offset by sidebar width) */}
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <TopNavBar navItems={operatorHubNav} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
