"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { InterwovenKit, useInterwovenKit } from "@initia/interwovenkit-react";
import clsx from "clsx";
import { MobileDrawer } from "./mobile-drawer";

interface NavItem {
  label: string;
  href: string;
}

interface TopNavBarProps {
  variant?: "landing" | "app";
  navItems?: NavItem[];
  brandName?: string;
}

/**
 * Top navigation bar with support for landing and app variants.
 * - 'landing': Simplified public navigation for landing page
 * - 'app': Full navigation with authentication and wallet integration
 *
 * **Validates: Requirements 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 12.1, 12.2**
 */
export function TopNavBar({
  variant = "app",
  navItems,
  brandName = "ECO_SYSTEM",
}: TopNavBarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { initiaAddress, openConnect, openWallet } = useInterwovenKit();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Default app navigation items
  const defaultAppNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Discover", href: "/discover" },
    { label: "Merchants", href: "/merchants" },
    { label: "Verification", href: "/verification" },
    { label: "Bridge", href: "/bridge" },
  ];

  // Use provided navItems or default based on variant
  const displayNavItems =
    navItems ?? (variant === "app" ? defaultAppNavItems : []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 flex h-16 items-center",
        "justify-between px-8",
        "border-b border-[rgba(73,72,71,0.15)]",
        "bg-[rgba(14,14,14,0.8)] backdrop-blur-xl",
        "shadow-[0_0_15px_rgba(202,253,0,0.05)]",
      )}
    >
      {/* Left: brand + nav links */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className={clsx(
            "font-['Plus_Jakarta_Sans'] font-bold",
            "text-xl tracking-tight text-[#f3ffca]",
          )}
        >
          {brandName}
        </Link>

        {/* Navigation links - hidden on mobile, shown on desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {displayNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm transition-colors",
                  isActive
                    ? "border-b-2 border-[#cafd00] pb-1.5 text-[#f3ffca]"
                    : "text-[#adaaaa] hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: authentication and wallet controls */}
      <div className="flex items-center gap-4">
        {variant === "app" && (
          <>
            {/* Wallet Connection */}
            <div className="hidden md:block">
              {initiaAddress ? (
                <button
                  onClick={openWallet}
                  className={clsx(
                    "rounded-lg px-3 py-1.5 text-xs font-medium",
                    "border border-[#cafd00] bg-[#cafd00]/10",
                    "text-[#cafd00] transition-colors hover:bg-[#cafd00]/20",
                  )}
                >
                  {initiaAddress.slice(0, 6)}...{initiaAddress.slice(-4)}
                </button>
              ) : (
                <button
                  onClick={openConnect}
                  className={clsx(
                    "rounded-lg px-3 py-1.5 text-xs font-medium",
                    "border border-[#adaaaa] bg-transparent",
                    "text-[#adaaaa] transition-colors hover:border-white hover:text-white",
                  )}
                >
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Authentication Controls */}
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                    userButtonPopoverCard: "bg-[#1a1a1a] border border-[rgba(73,72,71,0.3)]",
                    userButtonPopoverActionButton: "text-[#adaaaa] hover:text-white",
                  },
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button
                  className={clsx(
                    "rounded-lg px-4 py-2 text-sm font-medium",
                    "bg-[#cafd00] text-[#0e0e0e]",
                    "transition-colors hover:bg-[#b8e600]",
                  )}
                >
                  Sign In
                </button>
              </SignInButton>
            )}

            {/* Mobile menu toggle (Requirement 12.1, 12.2) */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className={clsx(
                "md:hidden rounded-lg p-2 text-[#adaaaa]",
                "transition-colors hover:bg-[rgba(73,72,71,0.3)] hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-[#cafd00]"
              )}
              aria-label="Open menu"
              aria-expanded={isMobileDrawerOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </>
        )}

        {variant === "landing" && (
          <>
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className={clsx(
                    "rounded-lg px-4 py-2 text-sm font-medium",
                    "bg-[#cafd00] text-[#0e0e0e]",
                    "transition-colors hover:bg-[#b8e600]",
                  )}
                >
                  Go to Dashboard
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                      userButtonPopoverCard: "bg-[#1a1a1a] border border-[rgba(73,72,71,0.3)]",
                      userButtonPopoverActionButton: "text-[#adaaaa] hover:text-white",
                    },
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button
                  className={clsx(
                    "rounded-lg px-4 py-2 text-sm font-medium",
                    "bg-[#cafd00] text-[#0e0e0e]",
                    "transition-colors hover:bg-[#b8e600]",
                  )}
                >
                  Sign In
                </button>
              </SignInButton>
            )}
          </>
        )}
      </div>

      {/* InterwovenKit Modal */}
      <InterwovenKit />

      {/* Mobile Drawer (Requirement 12.1, 12.2, 12.3, 12.4, 12.5, 12.6) */}
      {variant === "app" && (
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          navItems={displayNavItems}
        />
      )}
    </header>
  );
}
