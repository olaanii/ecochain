"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import clsx from "clsx";
import { useInterwovenKit } from "@initia/interwovenkit-react";

import { MobileDrawer } from "./mobile-drawer";
import { useWallet } from "@/contexts/wallet-context";
import { hasClerkSetup } from "@/lib/runtime-config";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notifications/notification-center";
import type { UserRole } from "@/hooks/use-user-role";

interface SubNavTab {
  label: string;
  href: string;
}

interface TopNavBarProps {
  variant?: "landing" | "app";
  brandName?: string;
  role?: UserRole;
}

type InterwovenKitActions = {
  openConnect?: () => void;
  openWallet?: () => void;
};

const landingNavItems: SubNavTab[] = [
  { label: "Explore", href: "/discover" },
  { label: "Initiatives", href: "/governance" },
  { label: "Journal", href: "/analytics" },
];

/** Map of route prefix → contextual sub-nav tabs */
const subNavMap: Record<string, SubNavTab[]> = {
  "/discover": [
    { label: "All Actions", href: "/discover" },
    { label: "Mine", href: "/discover?filter=mine" },
    { label: "Trending", href: "/discover?filter=trending" },
  ],
  "/merchants": [
    { label: "All Offers", href: "/merchants" },
    { label: "Redeemed", href: "/merchants?filter=redeemed" },
    { label: "Expiring Soon", href: "/merchants?filter=expiring" },
  ],
  "/rewards": [
    { label: "Overview", href: "/rewards" },
    { label: "History", href: "/rewards?tab=history" },
    { label: "Pending", href: "/rewards?tab=pending" },
  ],
  "/analytics": [
    { label: "Impact", href: "/analytics" },
    { label: "Carbon", href: "/analytics?tab=carbon" },
    { label: "Community", href: "/analytics?tab=community" },
  ],
  "/sponsor/tasks": [
    { label: "Active", href: "/sponsor/tasks" },
    { label: "Draft", href: "/sponsor/tasks?status=draft" },
    { label: "Ended", href: "/sponsor/tasks?status=ended" },
  ],
  "/sponsor/campaigns": [
    { label: "Active", href: "/sponsor/campaigns" },
    { label: "Scheduled", href: "/sponsor/campaigns?status=scheduled" },
    { label: "Completed", href: "/sponsor/campaigns?status=completed" },
  ],
  "/sponsor/analytics": [
    { label: "Overview", href: "/sponsor/analytics" },
    { label: "Users", href: "/sponsor/analytics?tab=users" },
    { label: "Trends", href: "/sponsor/analytics?tab=trends" },
  ],
  "/sponsor/rewards-pool": [
    { label: "Balance", href: "/sponsor/rewards-pool" },
    { label: "Payouts", href: "/sponsor/rewards-pool?tab=payouts" },
    { label: "Settings", href: "/sponsor/rewards-pool?tab=settings" },
  ],
  "/admin/users": [
    { label: "All", href: "/admin/users" },
    { label: "Flagged", href: "/admin/users?filter=flagged" },
    { label: "Suspended", href: "/admin/users?filter=suspended" },
  ],
  "/admin/review": [
    { label: "Pending", href: "/admin/review" },
    { label: "Approved", href: "/admin/review?status=approved" },
    { label: "Rejected", href: "/admin/review?status=rejected" },
  ],
  "/admin/fraud": [
    { label: "Overview", href: "/admin/fraud" },
    { label: "Patterns", href: "/admin/fraud?tab=patterns" },
    { label: "History", href: "/admin/fraud?tab=history" },
  ],
  "/admin/analytics": [
    { label: "Platform", href: "/admin/analytics" },
    { label: "Tasks", href: "/admin/analytics?tab=tasks" },
    { label: "Users", href: "/admin/analytics?tab=users" },
  ],
  "/admin/config": [
    { label: "General", href: "/admin/config" },
    { label: "Contracts", href: "/admin/config?tab=contracts" },
    { label: "Features", href: "/admin/config?tab=features" },
  ],
};

function getSubNavTabs(pathname: string): SubNavTab[] {
  const match = Object.keys(subNavMap)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => pathname === prefix || pathname.startsWith(prefix + "/") || pathname.startsWith(prefix + "?"));
  return match ? subNavMap[match] : [];
}

function getRoleBadge(role: UserRole) {
  if (role === "admin") return { label: "Admin", cls: "bg-red-100 text-red-700" };
  if (role === "sponsor") return { label: "Sponsor", cls: "bg-amber-100 text-amber-700" };
  return null;
}

/**
 * Top navigation bar for The Quiet Earth.
 * Logo left | Contextual sub-nav tabs centre | Actions right.
 * Sub-nav tabs are derived from the current pathname.
 */
export function TopNavBar({
  variant = "app",
  brandName = "The Quiet Earth",
  role = "user",
}: TopNavBarProps) {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const { initiaAddress } = useWallet();
  const kit = useInterwovenKit() as unknown as InterwovenKitActions;
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const subTabs =
    variant === "landing"
      ? landingNavItems
      : getSubNavTabs(pathname);

  const roleBadge = getRoleBadge(role);

  const mobileNavItems =
    variant === "landing"
      ? landingNavItems
      : (subNavMap[pathname] ?? []);

  return (
    <>
      <header
        className={clsx(
          "fixed left-0 right-0 top-0 z-50 h-16",
          "bg-[var(--color-surface)]",
          "border-b border-[var(--color-surface-muted,#e4e9ea)]",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-8">
          {/* Left: Brand + role badge */}
          <div className="flex min-w-0 items-center gap-3 md:pl-20">
            {variant === "app" && (
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-dark)] md:hidden"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            )}

            <Link href="/" className="shrink-0">
              <span
                className="text-xl font-semibold tracking-[-1px] text-[var(--color-text-dark)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {brandName}
              </span>
            </Link>

            {roleBadge && (
              <span
                className={clsx(
                  "hidden md:inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  roleBadge.cls,
                )}
              >
                {roleBadge.label}
              </span>
            )}
          </div>

          {/* Centre: Contextual sub-nav tabs */}
          {subTabs.length > 0 && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Sub navigation">
              {subTabs.map((tab) => {
                const isActive = pathname === tab.href || pathname === tab.href.split("?")[0];
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={clsx(
                      "rounded-lg px-4 py-1.5 text-sm tracking-[-0.3px] transition-colors",
                      isActive
                        ? "bg-[#e4e9ea] font-medium text-[#2d3435]"
                        : "font-normal text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#2d3435]",
                    )}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <NotificationCenter userId={user?.id} />

            {hasClerkSetup && isSignedIn ? (
              <UserButton
                appearance={{
                  elements: { avatarBox: "h-8 w-8 rounded-xl" },
                }}
              />
            ) : hasClerkSetup ? (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="h-8 w-8 rounded-xl bg-[var(--color-secondary-alt)] overflow-hidden"
                >
                  <div className="h-full w-full bg-[var(--color-text-muted)]" />
                </button>
              </SignInButton>
            ) : (
              <button
                type="button"
                className="h-8 w-8 rounded-xl bg-[var(--color-secondary-alt)] overflow-hidden"
                onClick={() => {
                  if (initiaAddress) {
                    kit.openWallet?.();
                  } else {
                    kit.openConnect?.();
                  }
                }}
              >
                <div className="h-full w-full bg-[var(--color-text-muted)]" />
              </button>
            )}
          </div>
        </div>
      </header>

      {variant === "app" && (
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          navItems={mobileNavItems}
        />
      )}
    </>
  );
}
