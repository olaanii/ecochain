"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Home,
  Compass,
  Gift,
  Clock,
  BarChart3,
  Landmark,
  LayoutDashboard,
  Megaphone,
  ListTodo,
  BadgeDollarSign,
  Settings,
  Users,
  ClipboardCheck,
  ShieldAlert,
  Link2,
  SlidersHorizontal,
  ScrollText,
  Wallet,
  Zap,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { useUserRole, type UserRole } from "@/hooks/use-user-role";

interface Command {
  id: string;
  title: string;
  shortcut?: string;
  icon: typeof Home;
  href?: string;
  action?: () => void;
  section: string;
  keywords: string[];
}

const baseCommands: Command[] = [
  { id: "dashboard", title: "Dashboard", icon: Home, href: "/dashboard", section: "Navigation", keywords: ["home", "overview", "stats"] },
  { id: "earn", title: "Earn", icon: Zap, href: "/earn", section: "Navigation", keywords: ["tasks", "actions", "complete", "rewards"] },
  { id: "wallet", title: "Wallet", icon: Wallet, href: "/wallet", section: "Navigation", keywords: ["balance", "transactions", "staking", "eco"] },
  { id: "impact", title: "Impact", icon: BarChart3, href: "/impact", section: "Navigation", keywords: ["analytics", "metrics", "carbon", "environment"] },
  { id: "community", title: "Community", icon: Trophy, href: "/community", section: "Navigation", keywords: ["leaderboard", "governance", "social"] },
  { id: "discover", title: "Discover Actions", icon: Compass, href: "/discover", section: "Legacy", keywords: ["tasks", "browse", "find"] },
  { id: "merchants", title: "Offers", icon: Gift, href: "/merchants", section: "Legacy", keywords: ["redeem", "shop", "discounts"] },
  { id: "rewards", title: "History", icon: Clock, href: "/rewards", section: "Legacy", keywords: ["past", "completed", "transactions"] },
];

const sponsorCommands: Command[] = [
  { id: "sponsor-dashboard", title: "Sponsor Dashboard", icon: LayoutDashboard, href: "/sponsor", section: "Sponsor", keywords: ["overview", "home"] },
  { id: "campaigns", title: "Campaigns", icon: Megaphone, href: "/sponsor/campaigns", section: "Sponsor", keywords: ["marketing", "promotions"] },
  { id: "tasks", title: "Tasks", icon: ListTodo, href: "/sponsor/tasks", section: "Sponsor", keywords: ["actions", "manage", "create"] },
  { id: "rewards-pool", title: "Rewards Pool", icon: BadgeDollarSign, href: "/sponsor/rewards-pool", section: "Sponsor", keywords: ["budget", "funding", "eco"] },
  { id: "sponsor-analytics", title: "Analytics", icon: BarChart3, href: "/sponsor/analytics", section: "Sponsor", keywords: ["stats", "metrics", "performance"] },
  { id: "sponsor-settings", title: "Settings", icon: Settings, href: "/sponsor/settings", section: "Sponsor", keywords: ["profile", "company", "preferences"] },
];

const adminCommands: Command[] = [
  { id: "admin-dashboard", title: "Admin Dashboard", icon: LayoutDashboard, href: "/admin", section: "Admin", keywords: ["overview", "system"] },
  { id: "users", title: "Users", icon: Users, href: "/admin/users", section: "Admin", keywords: ["accounts", "members", "manage"] },
  { id: "sponsors", title: "Sponsors", icon: Megaphone, href: "/admin/sponsors", section: "Admin", keywords: ["partners", "approvals"] },
  { id: "review", title: "Review Queue", icon: ClipboardCheck, href: "/admin/review", section: "Admin", keywords: ["verify", "approve", "moderate"] },
  { id: "fraud", title: "Fraud", icon: ShieldAlert, href: "/admin/fraud", section: "Admin", keywords: ["security", "alerts", "monitoring"] },
  { id: "onchain", title: "On-chain", icon: Link2, href: "/admin/onchain", section: "Admin", keywords: ["contracts", "blockchain", "pause"] },
  { id: "config", title: "Config", icon: SlidersHorizontal, href: "/admin/config", section: "Admin", keywords: ["settings", "system", "parameters"] },
  { id: "audit", title: "Audit Log", icon: ScrollText, href: "/admin/audit", section: "Admin", keywords: ["logs", "history", "actions"] },
  { id: "admin-analytics", title: "Analytics", icon: BarChart3, href: "/admin/analytics", section: "Admin", keywords: ["platform", "metrics", "stats"] },
];

function getCommandsForRole(role: UserRole): Command[] {
  if (role === "admin" || role === "owner") {
    return [...baseCommands, ...sponsorCommands, ...adminCommands];
  }
  if (role === "sponsor" || role === "sponsor_admin" || role === "sponsor_viewer") {
    return [...baseCommands, ...sponsorCommands];
  }
  return baseCommands;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { role } = useUserRole();

  const commands = getCommandsForRole(role);

  // Filter commands based on query
  const filteredCommands = commands.filter((cmd) => {
    const searchTerms = query.toLowerCase().split(" ");
    const searchable = [cmd.title, ...cmd.keywords, cmd.section].join(" ").toLowerCase();
    return searchTerms.every((term) => searchable.includes(term));
  });

  // Group by section
  const grouped = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.section]) acc[cmd.section] = [];
    acc[cmd.section].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const sections = Object.keys(grouped);
  const flatCommands = sections.flatMap((s) => grouped[s]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(
    (cmd: Command) => {
      setIsOpen(false);
      setQuery("");
      if (cmd.href) {
        router.push(cmd.href);
      }
      cmd.action?.();
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatCommands.length) % flatCommands.length);
    } else if (e.key === "Enter" && flatCommands[selectedIndex]) {
      e.preventDefault();
      executeCommand(flatCommands[selectedIndex]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-muted)] md:inline-flex"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
        <kbd className="ml-2 rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5 text-xs">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--color-surface-elevated)] shadow-2xl">
        {/* Search input */}
        <div className="border-b p-4" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5" style={{ color: "var(--color-text-muted)" }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-[var(--color-text-muted)]"
              style={{ color: "var(--color-text-dark)" }}
              aria-label="Command search"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 transition-colors hover:bg-[var(--color-surface-muted)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" style={{ color: "var(--color-text-muted)" }} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {flatCommands.length === 0 ? (
            <div className="py-12 text-center">
              <p style={{ color: "var(--color-text-muted)" }}>No commands found</p>
            </div>
          ) : (
            sections.map((section, sectionIndex) => {
              const sectionCmds = grouped[section];
              const prevCount = sections
                .slice(0, sectionIndex)
                .reduce((sum, s) => sum + grouped[s].length, 0);

              return (
                <div key={section}>
                  <div
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {section}
                  </div>
                  {sectionCmds.map((cmd, i) => {
                    const absoluteIndex = prevCount + i;
                    const isSelected = absoluteIndex === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                        style={{
                          backgroundColor: isSelected
                            ? "var(--color-surface-muted)"
                            : "transparent",
                        }}
                      >
                        <Icon
                          className="h-5 w-5 shrink-0"
                          style={{ color: "var(--color-text-muted)" }}
                        />
                        <span className="flex-1" style={{ color: "var(--color-text-dark)" }}>
                          {cmd.title}
                        </span>
                        {cmd.href?.startsWith("http") && (
                          <ExternalLink
                            className="h-4 w-4"
                            style={{ color: "var(--color-text-muted)" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between rounded-b-2xl border-t px-4 py-3 text-xs"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <span>{flatCommands.length} commands</span>
        </div>
      </div>
    </div>
  );
}
