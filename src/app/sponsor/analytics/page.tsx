"use client";

import { useState, useEffect } from "react";
import { SponsorShell } from "@/components/layout/sponsor-shell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Loader2 } from "lucide-react";

interface AnalyticsData {
  totals: {
    co2OffsetKg: number;
    totalUsers: number;
    activeUsers30d: number;
    verificationsThisMonth: number;
    treasuryBalance: number;
    activeTasks: number;
  };
  trends: {
    co2Offset: { label: string; value: number }[];
    userGrowth: { label: string; value: number }[];
    categoryBreakdown: { label: string; value: number }[];
    dailyActivity: { label: string; value: number }[];
  };
  updatedAt: string;
}

export default function SponsorAnalyticsPage() {
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

  if (loading) {
    return (
      <SponsorShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
        </div>
      </SponsorShell>
    );
  }

  const completionsData = analytics?.trends.dailyActivity || [];
  const rewardSpendData = analytics?.trends.co2Offset || [];
  const topPerformers = analytics?.trends.categoryBreakdown || [];

  return (
    <SponsorShell>
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Analytics
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Performance insights across your tasks and campaigns.
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Total Completions", value: analytics?.totals.verificationsThisMonth?.toLocaleString() || "0" },
            { label: "Unique Participants", value: analytics?.totals.activeUsers30d?.toLocaleString() || "0" },
            { label: "Avg. Reward / User", value: analytics?.totals.treasuryBalance ? `${((analytics.totals.treasuryBalance / 1e18) / Math.max(1, analytics.totals.activeUsers30d)).toFixed(0)} ECO` : "0 ECO" },
            { label: "Active Tasks", value: analytics?.totals.activeTasks?.toString() || "0" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-medium uppercase tracking-wider text-[#5a6061]">{kpi.label}</p>
              <p
                className="mt-2 text-2xl font-semibold tracking-[-0.5px] text-[#2d3435]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Completions over time */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold text-[#2d3435]">Weekly Completions</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={completionsData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f4" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 12 }}
                />
                <Bar dataKey="completions" fill="#3b6934" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Reward spend */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold text-[#2d3435]">Monthly Reward Spend (ECO)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rewardSpendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="eco" stroke="#2d6fa6" strokeWidth={2} dot={{ r: 4, fill: "#2d6fa6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top performers */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-[#2d3435] mb-4">Category Breakdown</h2>
          <div className="space-y-3">
            {topPerformers.length === 0 ? (
              <p className="text-sm text-[#5a6061]">No data available</p>
            ) : (
              topPerformers.map((p, i) => (
                <div key={p.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f4f4] text-sm font-semibold text-[#2d3435]">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-[#2d3435]">{p.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#2d3435]">{p.value} tasks</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SponsorShell>
  );
}
