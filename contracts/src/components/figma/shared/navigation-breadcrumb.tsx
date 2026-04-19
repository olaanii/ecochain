"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { figmaNavigationConfig } from "@/lib/figma/navigation-config";

export interface NavigationBreadcrumbProps {
  className?: string;
  showHome?: boolean;
  separator?: string;
  maxItems?: number;
}

export function NavigationBreadcrumb({
  className,
  showHome = true,
  separator = "/",
  maxItems = 4
}: NavigationBreadcrumbProps) {
  const pathname = usePathname();
  
  // Build breadcrumb items from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Find current screen info
  const currentScreen = figmaNavigationConfig.screens.find(
    screen => screen.route === pathname
  );

  const breadcrumbItems = [];

  if (showHome) {
    breadcrumbItems.push({
      label: "Home",
      href: "/",
      current: pathname === "/"
    });
  }

  // Add intermediate segments
  let currentPath = "";
  for (let i = 0; i < pathSegments.length - 1; i++) {
    currentPath += `/${pathSegments[i]}`;
    breadcrumbItems.push({
      label: pathSegments[i].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      href: currentPath,
      current: false
    });
  }

  // Add current page
  if (currentScreen) {
    breadcrumbItems.push({
      label: currentScreen.label,
      href: currentScreen.route,
      current: true
    });
  }

  // Limit items if needed
  const displayItems = breadcrumbItems.length > maxItems
    ? [
        breadcrumbItems[0],
        { label: "...", href: "#", current: false },
        ...breadcrumbItems.slice(-2)
      ]
    : breadcrumbItems;

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        "flex items-center gap-2 text-sm",
        className
      )}
    >
      <ol className="flex items-center gap-2">
        {displayItems.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-slate-500" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.current ? (
              <span
                className="font-medium text-emerald-300"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.label === "..." ? (
              <span className="text-slate-500">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-400 transition-colors hover:text-slate-200"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
