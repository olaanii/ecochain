"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { navigationFor } from "@/lib/navigation/config";
import { useUserRole } from "@/hooks/use-user-role";

interface BreadcrumbsProps {
  maxItems?: number;
  separator?: React.ReactNode;
}

interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrentPage: boolean;
}

/** Capitalise each word in a kebab-case slug. */
function capitalise(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Breadcrumbs component with automatic route segment generation.
 * Labels are resolved from the centralised `navigationFor(role)` config;
 * unknown segments fall back to capitalised slug text.
 *
 * **Validates: Requirements 11.1–11.5**
 */
export function Breadcrumbs({
  maxItems = 5,
  separator = <ChevronRight className="h-4 w-4" />,
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const { role } = useUserRole();

  const breadcrumbs = useMemo<BreadcrumbSegment[]>(() => {
    const segments = pathname.split("/").filter(Boolean);

    // Hide on root or single-segment (top-level) routes (Requirement 11.5)
    if (segments.length <= 1) return [];

    // Build a label map from nav config: href → label
    const { sections } = navigationFor(role);
    const labelMap: Record<string, string> = {};
    for (const section of sections) {
      labelMap[section.href] = section.label;
      for (const sub of section.subNav) {
        // Strip query string for label lookup
        const key = sub.href.split("?")[0];
        if (key) labelMap[key] = sub.label;
      }
    }

    const crumbs: BreadcrumbSegment[] = [];
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      const label = labelMap[currentPath] ?? capitalise(segment);
      crumbs.push({ label, href: currentPath, isCurrentPage: isLast });
    });

    if (crumbs.length > maxItems) {
      return [
        crumbs[0],
        { label: "...", href: "#", isCurrentPage: false },
        ...crumbs.slice(-(maxItems - 2)),
      ];
    }

    return crumbs;
  }, [pathname, role, maxItems]);

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        "flex items-center gap-2 px-8 py-4",
        "border-b border-[rgba(73,72,71,0.15)]",
        "bg-[rgba(14,14,14,0.4)]",
        // Responsive: collapse on mobile (Requirement 11.5)
        "text-sm md:text-base"
      )}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-2">
            {/* Breadcrumb segment (Requirement 11.3 - clickable) */}
            {crumb.isCurrentPage ? (
              <span
                className="text-[#f3ffca] font-medium"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : crumb.label === "..." ? (
              <span className="text-[#adaaaa]">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className={clsx(
                  "text-[#adaaaa] transition-colors",
                  "hover:text-white hover:underline"
                )}
              >
                {crumb.label}
              </Link>
            )}

            {/* Separator */}
            {index < breadcrumbs.length - 1 && (
              <span className="text-[#adaaaa]" aria-hidden="true">
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
