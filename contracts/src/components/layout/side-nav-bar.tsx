"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  ShieldCheck,
  ArrowLeftRight,
  Headphones,
  Plus,
  Settings,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

interface SideNavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

const sideNavItems: SideNavItem[] = [
  {
    icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
    label: "Overview",
    href: "/dashboard",
  },
  {
    icon: <Monitor className="h-4 w-5" />,
    label: "Terminals",
    href: "/terminals",
  },
  {
    icon: <ShieldCheck className="h-5 w-4" />,
    label: "Security",
    href: "/verification",
  },
  {
    icon: <ArrowLeftRight className="h-5 w-[18px]" />,
    label: "Transactions",
    href: "/transactions",
  },
  {
    icon: <Headphones className="h-[18px] w-5" />,
    label: "Support",
    href: "/support",
  },
];

/**
 * Shared side navigation bar for the Operator Hub layout.
 * Renders a fixed sidebar with navigation links, a "New Terminal"
 * button, settings, and logout at the bottom.
 */
export function SideNavBar() {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 z-40 flex h-full w-64",
        "flex-col justify-between",
        "border-r border-[rgba(73,72,71,0.15)] bg-[#0e0e0e]",
        "py-6",
      )}
    >
      {/* Top: Branding */}
      <div className="px-6 pb-10">
        <h1
          className={clsx(
            "font-['Plus_Jakarta_Sans'] text-lg font-bold",
            "tracking-tight text-white",
          )}
        >
          Operator Hub
        </h1>
        <span
          className={clsx(
            "text-[10px] font-medium uppercase",
            "tracking-widest text-[#adaaaa]",
          )}
        >
          Terminal v2.4
        </span>
      </div>

      {/* Middle: Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {sideNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-4 py-3",
                "text-sm font-medium transition-colors",
                isActive
                  ? [
                      "border-r-4 border-[#cafd00] bg-[#262626]",
                      "text-[#f3ffca]",
                    ]
                  : "text-[#adaaaa] hover:bg-[#1a1a1a] hover:text-white",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Actions */}
      <div className="px-4">
        <button
          className={clsx(
            "flex w-full items-center justify-center gap-2",
            "rounded-xl px-4 py-3 text-base font-semibold",
            "text-[#3a4a00]",
            "shadow-[0_0_20px_rgba(202,253,0,0.2)]",
          )}
          style={{
            backgroundImage:
              "linear-gradient(168deg, #f3ffca 0%, #cafd00 100%)",
          }}
        >
          <Plus className="h-3 w-3" />
          New Terminal
        </button>

        <div className="mt-5 flex flex-col gap-1">
          <Link
            href="/settings"
            className={clsx(
              "flex items-center gap-3 rounded-lg px-4 py-2",
              "text-sm text-[#adaaaa] hover:text-white",
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <button
            className={clsx(
              "flex items-center gap-3 rounded-lg px-4 py-2",
              "text-sm text-[#adaaaa] hover:text-white",
            )}
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
