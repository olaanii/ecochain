"use client";

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

const completionsData = [
  { week: "W1", completions: 42 },
  { week: "W2", completions: 78 },
  { week: "W3", completions: 95 },
  { week: "W4", completions: 61 },
  { week: "W5", completions: 110 },
  { week: "W6", completions: 134 },
  { week: "W7", completions: 102 },
  { week: "W8", completions: 148 },
];

const rewardSpendData = [
  { month: "Jan", eco: 12000 },
  { month: "Feb", eco: 18500 },
  { month: "Mar", eco: 22000 },
  { month: "Apr", eco: 31000 },
];

const topPerformers = [
  { rank: 1, name: "eco_alex", completions: 24, earned: 4200 },
  { rank: 2, name: "green_mara", completions: 19, earned: 3400 },
  { rank: 3, name: "treerunner", completions: 17, earned: 2900 },
  { rank: 4, name: "recycleking", completions: 15, earned: 2600 },
  { rank: 5, name: "bikecommuter", completions: 13, earned: 2100 },
];

export default function SponsorAnalyticsPage() {
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
            { label: "Total Completions", value: "770" },
            { label: "Unique Participants", value: "412" },
            { label: "Avg. Reward / User", value: "117 ECO" },
            { label: "Repeat Rate", value: "38%" },
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
          <h2 className="mb-4 text-sm font-semibold text-[#2d3435]">Top Performers</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f2f4f4] text-left">
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">#</th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">User</th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Completions</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-[#5a6061]">ECO Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f4]">
              {topPerformers.map((p) => (
                <tr key={p.rank}>
                  <td className="py-3 font-semibold text-[#5a6061]">{p.rank}</td>
                  <td className="py-3 font-medium text-[#2d3435]">@{p.name}</td>
                  <td className="py-3 text-[#5a6061]">{p.completions}</td>
                  <td className="py-3 text-right text-[#5a6061]">{p.earned.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SponsorShell>
  );
}
