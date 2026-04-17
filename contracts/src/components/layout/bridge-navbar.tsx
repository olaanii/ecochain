"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, Wallet } from "lucide-react";
import clsx from "clsx";

const bridgeNavItems = [
  { label: "Bridge", href: "/bridge" },
  { label: "Identity", href: "/identity" },
  { label: "Assets", href: "/assets" },
  { label: "Explorer", href: "/explorer" },
];

/**
 * Design 4 — Bridge-specific navbar (Figma node 3:3057).
 *
 * A standalone dark nav bar with a "Connect Wallet" CTA.
 * Used on the bridge page instead of the Operator Hub shell.
 */
export function BridgeNavbar() {
  const pathname = usePathname();

  return (
    <header
      className={clsx(
        "flex h-16 items-center justify-between px-8",
        "border-b border-[rgba(73,72,71,0.15)]",
        "bg-[rgba(14,14,14,0.8)] backdrop-blur-xl",
      )}
    >
      {/* Left: brand + nav */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-['Plus_Jakarta_Sans'] text-xl
                     font-bold tracking-tight text-[#f3ffca]"
        >
          ECO_SYSTEM
        </Link>

        <nav className="flex items-center gap-6">
          {bridgeNavItems.map((item) => {
            const isActive = pathname === item.href;
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

      {/* Right: actions + Connect Wallet */}
      <div className="flex items-center gap-4">
        <button
          className="rounded-full p-2 text-[#adaaaa]
                     hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          className="rounded-full p-2 text-[#adaaaa]
                     hover:text-white"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          className={clsx(
            "flex items-center gap-2 rounded-full",
            "bg-[#cafd00] px-5 py-2.5 text-sm font-semibold",
            "text-black transition-colors",
            "hover:bg-[#d6ff4a]",
          )}
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>
      </div>
    </header>
  );
}
