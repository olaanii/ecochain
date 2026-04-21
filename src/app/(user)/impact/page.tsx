"use client";

import {
  TreePine,
  Droplets,
  Wind,
  Recycle,
  TrendingUp,
  BarChart3,
  Award,
  Leaf,
} from "lucide-react";
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

const impactMetrics = [
  { label: "CO₂ Offset", value: "1.24t", delta: "+0.18t this month", icon: Wind, color: "text-[#3b6934]" },
  { label: "Trees Planted", value: "23", delta: "+5 this week", icon: TreePine, color: "text-[#2d6fa6]" },
  { label: "Water Saved", value: "12,400L", delta: "+2,100L this month", icon: Droplets, color: "text-[#7a3b9c]" },
  { label: "Waste Diverted", value: "340kg", delta: "+45kg this month", icon: Recycle, color: "text-[#a05c1a]" },
];

const carbonHistory = [
  { month: "Nov", co2: 0.42 },
  { month: "Dec", co2: 0.58 },
  { month: "Jan", co2: 0.71 },
  { month: "Feb", co2: 0.89 },
  { month: "Mar", co2: 1.06 },
  { month: "Apr", co2: 1.24 },
];

const categoryBreakdown = [
  { category: "Transit", kg: 480 },
  { category: "Recycling", kg: 310 },
  { category: "Energy", kg: 250 },
  { category: "Community", kg: 200 },
];

const badges = [
  { name: "Early Adopter", earned: true, description: "Joined in the first month" },
  { name: "Carbon Crusher", earned: true, description: "Offset over 1t of CO₂" },
  { name: "Streak Master", earned: true, description: "7-day activity streak" },
  { name: "Community Hero", earned: false, description: "Complete 50 community tasks" },
  { name: "Eco Whale", earned: false, description: "Stake over 10,000 ECO" },
  { name: "Tree Hugger", earned: false, description: "Plant 100 trees" },
];

export default function ImpactPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Impact
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Your environmental footprint and sustainability metrics.
        </p>
      </div>

      {/* Impact metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {impactMetrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  {m.label}
                </p>
                <p
                  className="mt-2 text-2xl font-semibold tracking-[-0.5px] text-[var(--color-text-dark)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {m.value}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{m.delta}</p>
              </div>
              <div className={`rounded-xl bg-[#f2f4f4] p-2.5 ${m.color}`}>
                <m.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Carbon offset over time */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-dark)]">
            Cumulative CO₂ Offset (tonnes)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={carbonHistory}>
              <defs>
                <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b6934" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b6934" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Area type="monotone" dataKey="co2" stroke="#3b6934" strokeWidth={2} fill="url(#carbonGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-dark)]">
            CO₂ Offset by Category (kg)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryBreakdown} layout="vertical" barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f4" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#5a6061" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Bar dataKey="kg" fill="#2d6fa6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-dark)]">Badges</h2>
          <span className="text-xs text-[var(--color-text-muted)]">
            {badges.filter((b) => b.earned).length}/{badges.length} earned
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <div
              key={badge.name}
              className={`flex items-center gap-3 rounded-xl p-4 transition-colors ${
                badge.earned
                  ? "bg-[#f2f4f4]"
                  : "bg-[#f9f9f9] opacity-50"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  badge.earned
                    ? "bg-[#3b6934] text-white"
                    : "bg-[#e4e9ea] text-[#5a6061]"
                }`}
              >
                <Award size={18} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${badge.earned ? "text-[var(--color-text-dark)]" : "text-[var(--color-text-muted)]"}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global comparison */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-dark)]">Your Rank</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Carbon Offset", rank: "#142", percentile: "Top 4%" },
            { label: "Tasks Completed", rank: "#89", percentile: "Top 3%" },
            { label: "ECO Earned", rank: "#201", percentile: "Top 6%" },
          ].map((r) => (
            <div key={r.label} className="rounded-xl bg-[#f2f4f4] px-4 py-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">{r.label}</p>
              <p
                className="mt-2 text-2xl font-semibold text-[var(--color-text-dark)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {r.rank}
              </p>
              <p className="mt-1 text-xs text-[#3b6934]">{r.percentile}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
