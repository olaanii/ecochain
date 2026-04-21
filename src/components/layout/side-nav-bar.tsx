"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { UserRole } from "@/hooks/use-user-role";
import { navigationFor } from "@/lib/navigation/config";

interface SideNavBarProps {
  role?: UserRole;
}

/**
 * 80px icon-only sidebar.
 * Role-aware: renders sections from the centralised navigationFor(role) config.
 * Light #e4e9ea background, centered icons with active state scaling.
 */
export function SideNavBar({ role = "user" }: SideNavBarProps) {
  const pathname = usePathname();
  const { sections } = navigationFor(role);

  return (
    <aside
      className={clsx(
        "fixed left-4 top-24 z-40 hidden md:flex",
        "flex-col items-center",
        "bg-[var(--color-surface-elevated)] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        "py-3 px-2",
      )}
    >
      <nav className="flex flex-col items-center gap-2">
        {sections.map((section) => {
          const rootHrefs = ["/sponsor", "/admin"];
          const isActive =
            pathname === section.href ||
            (!rootHrefs.includes(section.href) &&
              pathname.startsWith(`${section.href}/`)) ||
            (rootHrefs.includes(section.href) && pathname === section.href);

          const Icon = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                "transition-all duration-200",
                isActive
                  ? "bg-white text-[var(--color-brand-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:bg-white/50 hover:text-[var(--color-text-dark)]",
              )}
              title={section.label}
              aria-label={section.label}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
