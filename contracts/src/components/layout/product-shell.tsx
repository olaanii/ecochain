"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Blocks,
  Compass,
  Gem,
  Menu,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import clsx from "clsx";
import { useInterwovenKit } from "@initia/interwovenkit-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { useWallet } from "@/contexts/wallet-context";
import { hasClerkSetup, runtimeConfig } from "@/lib/runtime-config";

export const productNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: Blocks },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Verification", href: "/verification", icon: ShieldCheck },
  { label: "Merchants", href: "/merchants", icon: Gem },
  { label: "Bridge", href: "/bridge", icon: ArrowUpRight },
] as const;

type ProductShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

type InterwovenKitActions = {
  openConnect?: () => void;
  openWallet?: () => void;
};

function formatAddress(address?: string) {
  if (!address) return "Wallet ready";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ProductShell({ title, subtitle, children }: ProductShellProps) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { initiaAddress, username } = useWallet();
  const kit = useInterwovenKit() as unknown as InterwovenKitActions;
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const walletLabel = username || formatAddress(initiaAddress);
  const primaryCta = initiaAddress ? "Open wallet" : "Connect wallet";

  return (
    <div className="min-h-screen bg-transparent text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/8 bg-slate-950/80 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="border-b border-white/8 px-6 pb-6 pt-7">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">ECO_SYSTEM</p>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Initia appchain OS</p>
            </div>
          </Link>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Mainnet beta
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {productNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/10 text-white shadow-[0_18px_50px_rgba(15,23,42,0.35)]"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                {isActive && (
                  <span className="absolute inset-y-3 right-0 w-1 rounded-full bg-emerald-300" />
                )}
                <span
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                    isActive
                      ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-200"
                      : "border-white/8 bg-white/[0.04] text-slate-400 group-hover:text-white",
                  )}
                >
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 px-4 py-5">
          <div className="rounded-[1.75rem] border border-white/8 bg-white/5 p-5">
            <Badge>Chain live</Badge>
            <p className="mt-4 text-sm font-semibold text-white">{runtimeConfig.initiaChainId}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Verified impact, retained rewards, and native bridging in one workspace.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Wallet
                </p>
                <p className="mt-2 font-semibold text-white">
                  {initiaAddress ? "Connected" : "Ready"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Bridge
                </p>
                <p className="mt-2 font-semibold text-white">Native</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 lg:hidden"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300/90">
                  Appchain workspace
                </p>
                <h1 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-1 hidden text-sm text-slate-400 md:block">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 xl:flex xl:items-center xl:gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Auto-sign and bridge routing active
              </div>

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
                {initiaAddress ? walletLabel : primaryCta}
              </Button>

              {hasClerkSetup && isSignedIn ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10",
                    },
                  }}
                />
              ) : hasClerkSetup ? (
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
              ) : null}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="app-shell mx-auto w-full max-w-7xl">
            <div className="hero-orb" />
            <div className="hero-orb alt" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
            {children}
          </div>
        </main>
      </div>

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        navItems={productNavItems.map(({ label, href }) => ({ label, href }))}
      />
    </div>
  );
}
