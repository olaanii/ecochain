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
        "fixed left-0 top-0 z-40 hidden md:flex",
        "h-full w-20 flex-col items-center justify-center",
        "bg-[#e4e9ea]",
        "pb-8 pt-20",
      )}
    >
      <nav className="flex flex-1 flex-col items-center justify-center gap-[52px]">
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
                "flex w-20 items-center justify-center py-5",
                "transition-all duration-200",
                isActive
                  ? "scale-110 text-[#2d3435]"
                  : "text-[#5a6061] hover:text-[#2d3435]",
              )}
              title={section.label}
              aria-label={section.label}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
