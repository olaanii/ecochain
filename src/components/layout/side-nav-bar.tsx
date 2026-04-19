"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Gift,
  Clock,
  BarChart3,
  ListTodo,
  Megaphone,
  Wallet,
  Settings,
  Users,
  ClipboardCheck,
  ShieldAlert,
} from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";
import type { UserRole } from "@/hooks/use-user-role";

interface SideNavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

const userNavItems: SideNavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/dashboard" },
  { icon: <Compass size={17} />, label: "Actions", href: "/discover" },
  { icon: <Gift size={18} />, label: "Offers", href: "/merchants" },
  { icon: <Clock size={18} />, label: "History", href: "/rewards" },
  { icon: <BarChart3 size={18} />, label: "Impact", href: "/analytics" },
];

const sponsorNavItems: SideNavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/sponsor" },
  { icon: <ListTodo size={18} />, label: "Tasks", href: "/sponsor/tasks" },
  { icon: <Megaphone size={18} />, label: "Campaigns", href: "/sponsor/campaigns" },
  { icon: <BarChart3 size={18} />, label: "Analytics", href: "/sponsor/analytics" },
  { icon: <Wallet size={18} />, label: "Rewards Pool", href: "/sponsor/rewards-pool" },
  { icon: <Settings size={18} />, label: "Settings", href: "/sponsor/settings" },
];

const adminNavItems: SideNavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", href: "/admin" },
  { icon: <Users size={18} />, label: "Users", href: "/admin/users" },
  { icon: <ClipboardCheck size={18} />, label: "Review Queue", href: "/admin/review" },
  { icon: <ShieldAlert size={18} />, label: "Fraud Analytics", href: "/admin/fraud" },
  { icon: <BarChart3 size={18} />, label: "Analytics", href: "/admin/analytics" },
  { icon: <Settings size={18} />, label: "Config", href: "/admin/config" },
];

const navByRole: Record<UserRole, SideNavItem[]> = {
  user: userNavItems,
  owner: userNavItems,
  sponsor: sponsorNavItems,
  admin: adminNavItems,
};

interface SideNavBarProps {
  role?: UserRole;
}

/**
 * 80px icon-only sidebar.
 * Role-aware: renders different nav items for user / sponsor / admin.
 * Light #e4e9ea background, centered icons with active state scaling.
 */
export function SideNavBar({ role = "user" }: SideNavBarProps) {
  const pathname = usePathname();
  const items = navByRole[role] ?? userNavItems;

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
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/sponsor" &&
              item.href !== "/admin" &&
              pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/sponsor" && pathname === "/sponsor") ||
            (item.href === "/admin" && pathname === "/admin");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex w-20 items-center justify-center py-5",
                "transition-all duration-200",
                isActive
                  ? "scale-110 text-[#2d3435]"
                  : "text-[#5a6061] hover:text-[#2d3435]",
              )}
              title={item.label}
              aria-label={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
