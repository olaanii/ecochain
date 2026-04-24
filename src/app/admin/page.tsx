"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Users, ClipboardCheck, ShieldAlert, Activity, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totals: {
    co2OffsetKg: number;
    totalUsers: number;
    activeUsers30d: number;
    verificationsThisMonth: number;
    treasuryBalance: number;
    activeTasks: number;
  };
  updatedAt: string;
}

const severityStyle: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/metrics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = analytics ? [
    { label: "Total Users", value: analytics.totals.totalUsers.toLocaleString(), delta: "All time", icon: Users, color: "text-[#2d6fa6]", href: "/admin/users" },
    { label: "Active Users", value: analytics.totals.activeUsers30d.toLocaleString(), delta: "Last 30 days", icon: Activity, color: "text-[#3b6934]", href: "/admin/analytics" },
    { label: "Verifications", value: analytics.totals.verificationsThisMonth.toLocaleString(), delta: "This month", icon: ClipboardCheck, color: "text-[#a05c1a]", href: "/admin/review" },
    { label: "Active Tasks", value: analytics.totals.activeTasks.toString(), delta: "Live", icon: TrendingUp, color: "text-[#2d6fa6]", href: "/admin/analytics" },
  ] : [];

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Platform health, fraud activity, and system overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#5a6061]">{s.label}</p>
                  <p
                    className="mt-2 text-2xl font-semibold tracking-[-0.5px] text-[#2d3435]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-[#5a6061]">{s.delta}</p>
                </div>
                <div className={`rounded-xl bg-[#f2f4f4] p-2.5 ${s.color}`}>
                  <s.icon size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick links */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#5a6061]">Admin Actions</h2>
            <div className="space-y-1">
              {[
                { label: "Review Fraud Queue", href: "/admin/review", icon: ClipboardCheck },
                { label: "Manage Users", href: "/admin/users", icon: Users },
                { label: "View Fraud Analytics", href: "/admin/fraud", icon: ShieldAlert },
                { label: "Platform Analytics", href: "/admin/analytics", icon: TrendingUp },
                { label: "System Config", href: "/admin/config", icon: AlertTriangle },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#2d3435] transition-colors hover:bg-[#f2f4f4]"
                >
                  <item.icon size={15} className="text-[#5a6061]" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#5a6061]">System Status</h2>
            <div className="space-y-3">
              <p className="text-sm text-[#5a6061]">
                Last updated: {analytics?.updatedAt ? new Date(analytics.updatedAt).toLocaleString() : 'N/A'}
              </p>
              <p className="text-sm text-[#5a6061]">
                Treasury Balance: {analytics?.totals.treasuryBalance ? `${(analytics.totals.treasuryBalance / 1e18).toLocaleString()} ECO` : '0 ECO'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
