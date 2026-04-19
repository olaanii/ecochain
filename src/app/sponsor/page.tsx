"use client";

import { SponsorShell } from "@/components/layout/sponsor-shell";
import {
  ListTodo,
  Users,
  Coins,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Active Tasks", value: "12", delta: "+2 this week", icon: ListTodo, color: "text-[#3b6934]" },
  { label: "Users Engaged", value: "1,284", delta: "+87 this month", icon: Users, color: "text-[#2d6fa6]" },
  { label: "Rewards Distributed", value: "48,300 ECO", delta: "+5,200 this week", icon: Coins, color: "text-[#7a3b9c]" },
  { label: "Completion Rate", value: "74%", delta: "+3% vs last month", icon: TrendingUp, color: "text-[#a05c1a]" },
];

const recentActivity = [
  { id: "1", type: "Task Completed", desc: "Tree Planting Drive — 23 completions today", time: "2 min ago" },
  { id: "2", type: "Campaign Launched", desc: "Urban Cycling Challenge went live", time: "1 hr ago" },
  { id: "3", type: "Reward Paid", desc: "1,200 ECO distributed to 12 users", time: "3 hr ago" },
  { id: "4", type: "Task Approved", desc: "Beach Cleanup Task passed review", time: "Yesterday" },
];

export default function SponsorDashboard() {
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

          {/* Recent activity */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#5a6061]">
              Recent Activity
            </h2>
            <div className="divide-y divide-[#f2f4f4]">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start justify-between py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#3b6934]">
                      {item.type}
                    </p>
                    <p className="mt-0.5 text-sm text-[#2d3435]">{item.desc}</p>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-[#5a6061]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SponsorShell>
  );
}
