"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Coins, 
  Home, 
  Trophy, 
  Settings, 
  Plus,
  HelpCircle,
  FileText,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { href: "/figma-screens", label: "All Screens", icon: Home },
  { href: "/figma-screens/personal-dashboard", label: "Dashboard", icon: Home },
  { href: "/figma-screens/ai-coach", label: "AI Coach", icon: BarChart3 },
  { href: "/figma-screens/daily-missions", label: "Daily Missions", icon: Plus },
  { href: "/figma-screens/achievements", label: "Achievements", icon: Trophy },
  { href: "/figma-screens/earnings-ledger", label: "Earnings", icon: Coins },
  { href: "/figma-screens/impact-comparison", label: "Rankings", icon: BarChart3 },
  { href: "/figma-screens/efficiency-score", label: "Efficiency", icon: BarChart3 },
  { href: "/figma-screens/goal-setting", label: "Goals", icon: Settings },
  { href: "/figma-screens/action-optimization", label: "Optimization", icon: Settings },
  { href: "/figma-screens/co2-breakdown", label: "CO2 Breakdown", icon: BarChart3 },
];

interface NavigationProps {
  title?: string;
  subtitle?: string;
}

export function Navigation({ title = "Impact Terminal", subtitle = "Verified On-Chain" }: NavigationProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/8 bg-slate-950">
      <div className="flex h-full flex-col justify-between p-4 pt-20">
        {/* Header */}
        <div className="mb-8 px-4">
          <h2 className="text-lg font-bold text-lime-200">{title}</h2>
          <p className="text-xs uppercase tracking-wider text-slate-400">{subtitle}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "border-r-2 border-lime-300 bg-slate-800 text-lime-200"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-4">
          <Button className="w-full">
            <Plus size={16} className="mr-2" />
            New Impact Report
          </Button>
          
          <div className="space-y-2 border-t border-white/10 pt-4">
            <Link
              href="/support"
              className="flex items-center gap-3 px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              <HelpCircle size={14} />
              Support
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-3 px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              <FileText size={14} />
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface TopNavigationProps {
  searchPlaceholder?: string;
}

export function TopNavigation({ searchPlaceholder = "Search..." }: TopNavigationProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/8 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-lime-200">
            NeonVoid Impact
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/overview" className="text-sm font-semibold text-lime-200">
              Overview
            </Link>
            <Link href="/marketplace" className="text-sm text-slate-400 hover:text-white">
              Marketplace
            </Link>
            <Link href="/governance" className="text-sm text-slate-400 hover:text-white">
              Governance
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="bg-transparent text-sm text-white placeholder-slate-400 outline-none"
            />
          </div>

          {/* Actions */}
          <button className="rounded-lg p-2 hover:bg-slate-800">
            <Bell size={18} className="text-slate-400" />
          </button>
          
          <Button>Connect Wallet</Button>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
