"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Menu, Wallet } from "lucide-react";
import clsx from "clsx";
import { useInterwovenKit } from "@initia/interwovenkit-react";

import { Button } from "@/components/ui/button";
import { MobileDrawer } from "./mobile-drawer";
import { useWallet } from "@/contexts/wallet-context";
import { hasClerkSetup } from "@/lib/runtime-config";

interface NavItem {
  label: string;
  href: string;
}

interface TopNavBarProps {
  variant?: "landing" | "app";
  navItems?: NavItem[];
  brandName?: string;
}

type InterwovenKitActions = {
  openConnect?: () => void;
  openWallet?: () => void;
};

const defaultAppNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Discover", href: "/discover" },
  { label: "Merchants", href: "/merchants" },
  { label: "Verification", href: "/verification" },
  { label: "Bridge", href: "/bridge" },
];

function formatWalletLabel(address?: string, username?: string) {
  if (username) return username;
  if (!address) return "Connect wallet";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function TopNavBar({
  variant = "app",
  navItems,
  brandName = "EcoLoop",
}: TopNavBarProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { initiaAddress, username } = useWallet();
  const kit = useInterwovenKit() as unknown as InterwovenKitActions;
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const displayNavItems = navItems ?? (variant === "app" ? defaultAppNavItems : []);

  return (
    <>
      <header
        className={clsx(
          "fixed left-0 right-0 top-0 z-50 border-b border-white/8 backdrop-blur-xl",
          variant === "landing" ? "bg-slate-950/45" : "bg-slate-950/80",
        )}
      >
        <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 lg:gap-8">
            {variant === "app" && (
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 md:hidden"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
            )}

            <Link href="/" className="shrink-0">
              <span className="text-xl font-bold tracking-tight text-white">{brandName}</span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {displayNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-white" : "text-slate-400 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {variant === "landing" && (
              <Link
                href="/dashboard"
                className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 md:inline-flex"
              >
                Product tour
              </Link>
            )}

            {variant === "app" && (
              <Button
                variant={initiaAddress ? "secondary" : "primary"}
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => {
                  if (initiaAddress) {
                    kit.openWallet?.();
                    return;
                  }

                  kit.openConnect?.();
                }}
              >
                <Wallet size={15} />
                {formatWalletLabel(initiaAddress, username)}
              </Button>
            )}

            {hasClerkSetup && isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            ) : hasClerkSetup ? (
              <SignInButton mode="modal">
                <Button variant={variant === "landing" ? "primary" : "outline"} size="sm">
                  Sign in
                </Button>
              </SignInButton>
            ) : null}
          </div>
        </div>
      </header>

      {variant === "app" && (
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          navItems={displayNavItems}
        />
      )}
    </>
  );
}
