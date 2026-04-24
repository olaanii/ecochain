"use client";

import { useState, useEffect } from "react";
import { SponsorShell } from "@/components/layout/sponsor-shell";
import {
  ListTodo,
  Users,
  Coins,
  TrendingUp,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totals: {
    activeTasks: number;
    totalUsers: number;
    activeUsers30d: number;
    verificationsThisMonth: number;
    treasuryBalance: number;
  };
  updatedAt: string;
}

export default function SponsorDashboard() {
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
    { label: "Active Tasks", value: analytics.totals.activeTasks.toString(), delta: "Live", icon: ListTodo, color: "text-[#3b6934]" },
    { label: "Users Engaged", value: analytics.totals.activeUsers30d.toLocaleString(), delta: "Last 30 days", icon: Users, color: "text-[#2d6fa6]" },
    { label: "Rewards Distributed", value: `${(analytics.totals.treasuryBalance / 1e18).toLocaleString()} ECO`, delta: "Total treasury", icon: Coins, color: "text-[#7a3b9c]" },
    { label: "Total Users", value: analytics.totals.totalUsers.toLocaleString(), delta: "All time", icon: TrendingUp, color: "text-[#a05c1a]" },
  ] : [];

  if (loading) {
    return (
      <SponsorShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
        </div>
      </SponsorShell>
    );
  }

  return (
    <SponsorShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Sponsor Dashboard
            </h1>
            <p className="mt-1 text-sm text-[#5a6061]">
              Overview of your campaigns, tasks, and reward activity.
            </p>
          </div>
          <Link
            href="/sponsor/tasks/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d3435] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            <Plus size={15} />
            New Task
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#5a6061]">
                    {s.label}
                  </p>
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
            </div>
          ))}
        </div>

        {/* Quick links + Recent activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick links */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#5a6061]">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { label: "Create a New Task", href: "/sponsor/tasks/create" },
                { label: "View All Campaigns", href: "/sponsor/campaigns" },
                { label: "Check Analytics", href: "/sponsor/analytics" },
                { label: "Manage Rewards Pool", href: "/sponsor/rewards-pool" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#2d3435] transition-colors hover:bg-[#f2f4f4]"
                >
                  {item.label}
                  <ArrowRight size={14} className="text-[#5a6061]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[#2d3435] mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <p className="text-sm text-[#5a6061]">
                {analytics?.totals.verificationsThisMonth || 0} verifications this month
              </p>
              <p className="text-xs text-[#5a6061]">
                Last updated: {analytics?.updatedAt ? new Date(analytics.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SponsorShell>
  );
}
