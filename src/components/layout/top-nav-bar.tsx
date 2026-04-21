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
import { CommandPalette } from "@/components/command-palette";
import type { UserRole } from "@/hooks/use-user-role";
import { navigationFor, resolveSubNav } from "@/lib/navigation/config";

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

function getRoleBadge(role: UserRole) {
  if (role === "admin") return { label: "Admin", cls: "bg-red-100 text-red-700" };
  if (role === "owner") return { label: "Owner", cls: "bg-red-100 text-red-700" };
  if (role === "sponsor") return { label: "Sponsor", cls: "bg-amber-100 text-amber-700" };
  if (role === "sponsor_admin") return { label: "Admin", cls: "bg-amber-100 text-amber-700" };
  if (role === "sponsor_viewer") return { label: "Viewer", cls: "bg-gray-100 text-gray-700" };
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

  const { sections } = navigationFor(role);
  const subTabs =
    variant === "landing"
      ? landingNavItems
      : resolveSubNav(sections, pathname);

  const roleBadge = getRoleBadge(role);

  const mobileNavItems = variant === "landing" ? landingNavItems : undefined;
  const mobileSections = variant === "app" ? sections : undefined;

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
            <CommandPalette />
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

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        navItems={mobileNavItems}
        sections={mobileSections}
      />
    </>
  );
}
