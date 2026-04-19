"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  maxItems?: number;
  separator?: React.ReactNode;
}

interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrentPage: boolean;
}

/**
 * Route label mapping for all application routes
 * Maps route paths to human-readable labels
 */
const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/discover": "Discover",
  "/verification": "Verification",
  "/verification/camera": "Camera",
  "/verification/status": "Status",
  "/merchants": "Merchants",
  "/merchants/hub-main": "Hub",
  "/merchants/redemption": "Redemption",
  "/bridge": "Bridge",
};

/**
 * Top-level routes where breadcrumbs should be hidden
 * (Requirement 11.5)
 */
const topLevelRoutes = ["/", "/dashboard", "/discover", "/bridge"];

/**
 * Breadcrumbs component with automatic route segment generation.
 * Displays hierarchical navigation path for nested routes.
 *
 * **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**
 */
export function Breadcrumbs({
  maxItems = 5,
  separator = <ChevronRight className="h-4 w-4" />,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumb segments from pathname (Requirement 11.2, 11.4)
  const breadcrumbs = useMemo<BreadcrumbSegment[]>(() => {
    // Hide breadcrumbs on top-level routes (Requirement 11.5)
    if (topLevelRoutes.includes(pathname)) {
      return [];
    }

    // Split pathname into segments
    const segments = pathname.split("/").filter(Boolean);

    // If only one segment, it's a top-level route - hide breadcrumbs
    if (segments.length <= 1) {
      return [];
    }

    // Build breadcrumb segments
    const crumbs: BreadcrumbSegment[] = [];
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Get label from mapping or capitalize segment
      const label =
        routeLabels[currentPath] ||
        segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      crumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast,
      });
    });

    // Limit breadcrumbs to maxItems if specified
    if (crumbs.length > maxItems) {
      // Keep first and last items, collapse middle
      return [
        crumbs[0],
        {
          label: "...",
          href: "#",
          isCurrentPage: false,
        },
        ...crumbs.slice(-(maxItems - 2)),
      ];
    }

    return crumbs;
  }, [pathname, maxItems]);

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
