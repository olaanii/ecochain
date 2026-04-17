"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { figmaNavigationConfig } from "@/lib/figma/navigation-config";

export function ScreenNavigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-2xl px-6">
        <div className="flex gap-1 overflow-x-auto py-3">
          {figmaNavigationConfig.screens.map((screen) => {
            const isActive = pathname === screen.route;
            
            return (
              <Link
                key={screen.id}
                href={screen.route}
                className={clsx(
                  "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-400/10 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {screen.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
