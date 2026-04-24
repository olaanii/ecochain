"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

export default function AdminAnalyticsPage() {
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
      <AdminShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
        </div>
      </AdminShell>
    );
  }

  const dauData = analytics?.trends.dailyActivity || [];
  const taskCompletions = analytics?.trends.categoryBreakdown || [];
  const bridgeData = analytics?.trends.co2Offset || [];

  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Platform Analytics
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Platform-wide metrics across users, tasks, and bridge activity.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Total Users", value: analytics?.totals.totalUsers?.toLocaleString() || "0" },
            { label: "Task Completions (MTD)", value: analytics?.totals.verificationsThisMonth?.toLocaleString() || "0" },
            { label: "ECO Minted (MTD)", value: analytics?.totals.treasuryBalance ? `${(analytics.totals.treasuryBalance / 1e18).toLocaleString()}` : "0" },
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
          {/* DAU chart */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold text-[#2d3435]">Daily Active Users (7d)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dauData}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6fa6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2d6fa6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 12 }} />
                <Area type="monotone" dataKey="dau" stroke="#2d6fa6" strokeWidth={2} fill="url(#dauGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Task completions by category */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-sm font-semibold text-[#2d3435]">Completions by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskCompletions} layout="vertical" barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 12 }} />
                <Bar dataKey="completions" fill="#3b6934" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bridge volume */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-[#2d3435]">Bridge Volume (ECO)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bridgeData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f4" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 12 }} />
                <Bar dataKey="volume" fill="#7a3b9c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
