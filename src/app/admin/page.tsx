"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { Users, ClipboardCheck, ShieldAlert, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Total Users", value: "3,841", delta: "+124 this week", icon: Users, color: "text-[#2d6fa6]", href: "/admin/users" },
  { label: "Pending Reviews", value: "47", delta: "12 high-fraud", icon: ClipboardCheck, color: "text-[#a05c1a]", href: "/admin/review" },
  { label: "Fraud Alerts", value: "9", delta: "3 critical", icon: ShieldAlert, color: "text-red-600", href: "/admin/fraud" },
  { label: "Daily Active Users", value: "612", delta: "+8% vs yesterday", icon: Activity, color: "text-[#3b6934]", href: "/admin/analytics" },
];

const recentAlerts = [
  { id: "1", severity: "critical", msg: "User @anon92 flagged: fraud score 0.96", time: "5 min ago" },
  { id: "2", severity: "warning", msg: "Spike in rejected verifications — Recycling tasks", time: "32 min ago" },
  { id: "3", severity: "info", msg: "New sponsor registered: GreenFleet Ltd", time: "1 hr ago" },
  { id: "4", severity: "warning", msg: "Pool balance low for 'Earth Month' campaign", time: "2 hr ago" },
  { id: "5", severity: "info", msg: "DAO proposal #14 passed quorum", time: "3 hr ago" },
];

const severityStyle: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
};

export default function AdminDashboard() {
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

          {/* Recent alerts */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#5a6061]">Recent Alerts</h2>
            <div className="divide-y divide-[#f2f4f4]">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between py-3">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${severityStyle[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <p className="text-sm text-[#2d3435]">{alert.msg}</p>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-[#5a6061]">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
