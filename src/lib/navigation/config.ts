/**
 * Navigation Configuration — single source of truth for all role-based nav.
 *
 * `navigationFor(role)` returns the full navigation tree for a given role.
 * `SideNavBar` renders the top-level sections (icons only).
 * `TopNavBar` derives sub-nav tabs from the active section.
 *
 * Also exports legacy performance constants (Requirements 15.x).
 */

import {
  LayoutDashboard,
  Compass,
  Gift,
  Clock,
  BarChart3,
  ListTodo,
  Megaphone,
  Settings,
  Users,
  ClipboardCheck,
  ShieldAlert,
  Globe,
  Landmark,
  BadgeDollarSign,
  Link2,
  SlidersHorizontal,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/hooks/use-user-role";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubNavItem {
  label: string;
  href: string;
}

export interface NavSection {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
  subNav: SubNavItem[];
}

export interface NavigationConfig {
  role: UserRole;
  sections: NavSection[];
}

// ─── User sections ────────────────────────────────────────────────────────────

const userSections: NavSection[] = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    subNav: [],
  },
  {
    id: "discover",
    icon: Compass,
    label: "Actions",
    href: "/discover",
    subNav: [
      { label: "All Actions", href: "/discover" },
      { label: "Mine", href: "/discover?filter=mine" },
      { label: "Trending", href: "/discover?filter=trending" },
    ],
  },
  {
    id: "merchants",
    icon: Gift,
    label: "Offers",
    href: "/merchants",
    subNav: [
      { label: "All Offers", href: "/merchants" },
      { label: "Redeemed", href: "/merchants?filter=redeemed" },
      { label: "Expiring Soon", href: "/merchants?filter=expiring" },
    ],
  },
  {
    id: "rewards",
    icon: Clock,
    label: "History",
    href: "/rewards",
    subNav: [
      { label: "Overview", href: "/rewards" },
      { label: "History", href: "/rewards?tab=history" },
      { label: "Pending", href: "/rewards?tab=pending" },
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Impact",
    href: "/analytics",
    subNav: [
      { label: "Impact", href: "/analytics" },
      { label: "Carbon", href: "/analytics?tab=carbon" },
      { label: "Community", href: "/analytics?tab=community" },
    ],
  },
  {
    id: "governance",
    icon: Landmark,
    label: "Community",
    href: "/governance",
    subNav: [
      { label: "Leaderboard", href: "/governance?tab=leaderboard" },
      { label: "Governance", href: "/governance" },
    ],
  },
];

// ─── Sponsor sections ─────────────────────────────────────────────────────────

const sponsorSections: NavSection[] = [
  {
    id: "sponsor",
    icon: LayoutDashboard,
    label: "Overview",
    href: "/sponsor",
    subNav: [],
  },
  {
    id: "campaigns",
    icon: Megaphone,
    label: "Campaigns",
    href: "/sponsor/campaigns",
    subNav: [
      { label: "Active", href: "/sponsor/campaigns" },
      { label: "Scheduled", href: "/sponsor/campaigns?status=scheduled" },
      { label: "Completed", href: "/sponsor/campaigns?status=completed" },
    ],
  },
  {
    id: "tasks",
    icon: ListTodo,
    label: "Tasks",
    href: "/sponsor/tasks",
    subNav: [
      { label: "Active", href: "/sponsor/tasks" },
      { label: "Draft", href: "/sponsor/tasks?status=draft" },
      { label: "Ended", href: "/sponsor/tasks?status=ended" },
    ],
  },
  {
    id: "rewards-pool",
    icon: BadgeDollarSign,
    label: "Rewards Pool",
    href: "/sponsor/rewards-pool",
    subNav: [
      { label: "Balance", href: "/sponsor/rewards-pool" },
      { label: "Payouts", href: "/sponsor/rewards-pool?tab=payouts" },
      { label: "Settings", href: "/sponsor/rewards-pool?tab=settings" },
    ],
  },
  {
    id: "sponsor-analytics",
    icon: BarChart3,
    label: "Analytics",
    href: "/sponsor/analytics",
    subNav: [
      { label: "Overview", href: "/sponsor/analytics" },
      { label: "Users", href: "/sponsor/analytics?tab=users" },
      { label: "Trends", href: "/sponsor/analytics?tab=trends" },
    ],
  },
  {
    id: "sponsor-settings",
    icon: Settings,
    label: "Settings",
    href: "/sponsor/settings",
    subNav: [
      { label: "Brand", href: "/sponsor/settings" },
      { label: "Team", href: "/sponsor/settings?tab=team" },
      { label: "API Keys", href: "/sponsor/settings?tab=api-keys" },
    ],
  },
];

// ─── Admin sections ───────────────────────────────────────────────────────────

const adminSections: NavSection[] = [
  {
    id: "admin",
    icon: LayoutDashboard,
    label: "Overview",
    href: "/admin",
    subNav: [],
  },
  {
    id: "admin-users",
    icon: Users,
    label: "Users",
    href: "/admin/users",
    subNav: [
      { label: "All", href: "/admin/users" },
      { label: "Flagged", href: "/admin/users?filter=flagged" },
      { label: "Suspended", href: "/admin/users?filter=suspended" },
    ],
  },
  {
    id: "admin-sponsors",
    icon: Globe,
    label: "Sponsors",
    href: "/admin/sponsors",
    subNav: [
      { label: "Approved", href: "/admin/sponsors" },
      { label: "Pending", href: "/admin/sponsors?filter=pending" },
      { label: "Rejected", href: "/admin/sponsors?filter=rejected" },
    ],
  },
  {
    id: "admin-review",
    icon: ClipboardCheck,
    label: "Review Queue",
    href: "/admin/review",
    subNav: [
      { label: "Pending", href: "/admin/review" },
      { label: "Approved", href: "/admin/review?status=approved" },
      { label: "Rejected", href: "/admin/review?status=rejected" },
    ],
  },
  {
    id: "admin-fraud",
    icon: ShieldAlert,
    label: "Fraud",
    href: "/admin/fraud",
    subNav: [
      { label: "Overview", href: "/admin/fraud" },
      { label: "Patterns", href: "/admin/fraud?tab=patterns" },
      { label: "History", href: "/admin/fraud?tab=history" },
    ],
  },
  {
    id: "admin-onchain",
    icon: Link2,
    label: "On-chain",
    href: "/admin/onchain",
    subNav: [
      { label: "Contracts", href: "/admin/onchain" },
      { label: "Pause", href: "/admin/onchain?tab=pause" },
      { label: "Upgrades", href: "/admin/onchain?tab=upgrades" },
    ],
  },
  {
    id: "admin-config",
    icon: SlidersHorizontal,
    label: "Config",
    href: "/admin/config",
    subNav: [
      { label: "General", href: "/admin/config" },
      { label: "Contracts", href: "/admin/config?tab=contracts" },
      { label: "Features", href: "/admin/config?tab=features" },
    ],
  },
  {
    id: "admin-audit",
    icon: ScrollText,
    label: "Audit Log",
    href: "/admin/audit",
    subNav: [],
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function navigationFor(role: UserRole): NavigationConfig {
  const sections =
    role === "sponsor" || role === "sponsor_admin" || role === "sponsor_viewer"
      ? sponsorSections
      : role === "admin" || role === "owner"
        ? adminSections
        : userSections;
  return { role, sections };
}

/**
 * Given a pathname, find the matching section and return its subNav items.
 * Longest prefix wins so `/sponsor/analytics` beats `/sponsor`.
 */
export function resolveSubNav(sections: NavSection[], pathname: string): SubNavItem[] {
  const match = [...sections]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (s) =>
        pathname === s.href ||
        pathname.startsWith(s.href + "/") ||
        pathname.startsWith(s.href + "?"),
    );
  return match?.subNav ?? [];
}

// ─── Legacy performance constants (Requirements 15.x) ─────────────────────────

export const LINK_PREFETCH_ENABLED = true;
export const SCROLL_RESTORATION_ENABLED = true;
export const LOADING_INDICATOR_THRESHOLD_MS = 200;
export const CODE_SPLITTING_ENABLED = true;
export const CRITICAL_ASSETS_PRELOAD = [
  "navigation-context",
  "top-nav-bar",
  "mobile-drawer",
  "breadcrumbs",
] as const;
export const PAGE_CACHE_ENABLED = true;
export const DYNAMIC_ROUTE_CACHE_DURATION_MS = 30 * 1000;
export const STATIC_ROUTE_CACHE_DURATION_MS = 5 * 60 * 1000;
