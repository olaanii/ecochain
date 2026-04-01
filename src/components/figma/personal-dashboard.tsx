"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity, Award, Leaf, TrendingUp, Zap } from "lucide-react";

const stats = [
  { label: "Total Impact Score", value: "8,450", change: "+12%", icon: Activity },
  { label: "ECO Earned", value: "1,250", change: "+8%", icon: Zap },
  { label: "Carbon Offset", value: "2.4 tons", change: "+15%", icon: Leaf },
  { label: "Achievements", value: "18", change: "+3", icon: Award },
];

const recentActivity = [
  { action: "Transit Commute", time: "2 hours ago", points: "+25 ECO", status: "verified" },
  { action: "Solar Energy", time: "5 hours ago", points: "+50 ECO", status: "verified" },
  { action: "Recycling", time: "1 day ago", points: "+15 ECO", status: "verified" },
  { action: "Bike Commute", time: "1 day ago", points: "+30 ECO", status: "pending" },
];

const weeklyProgress = [
  { day: "Mon", value: 85 },
  { day: "Tue", value: 92 },
  { day: "Wed", value: 78 },
  { day: "Thu", value: 95 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 70 },
  { day: "Sun", value: 82 },
];

export function PersonalDashboard() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold text-white">Personal Impact Dashboard</h1>
        <p className="text-slate-300">
          Your comprehensive environmental impact analytics and performance metrics.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">{stat.change}</span>
                  </div>
                </div>
                <Icon className="h-10 w-10 text-emerald-300/50" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="Impact Score">
          <div className="mb-6 flex items-center justify-center">
            <div className="relative h-48 w-48">
              <svg className="h-full w-full -rotate-90 transform">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(86 / 100) * 553} 553`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(16, 185, 129)" />
                    <stop offset="100%" stopColor="rgb(45, 212, 191)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-bold text-white">86</p>
                <p className="text-sm text-slate-400">Excellent</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-300">A+</p>
              <p className="text-xs text-slate-400">Grade</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">#4</p>
              <p className="text-xs text-slate-400">Rank</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-300">15</p>
              <p className="text-xs text-slate-400">Streak</p>
            </div>
          </div>
        </Card>

        <Card title="Weekly Activity">
          <div className="flex h-48 items-end justify-between gap-2">
            {weeklyProgress.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full flex-1">
                  <div className="absolute bottom-0 w-full overflow-hidden rounded-t-lg bg-gradient-to-t from-emerald-400 to-teal-500"
                    style={{ height: `${day.value}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">{day.day}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-400">Average: 84 points</span>
            <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              +8% vs last week
            </Badge>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Recent Activity" className="lg:col-span-2">
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="font-semibold text-white">{activity.action}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-emerald-300">{activity.points}</p>
                  <Badge
                    className={
                      activity.status === "verified"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quick Stats">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 text-sm text-slate-400">This Week</p>
              <p className="text-2xl font-bold text-white">247 ECO</p>
              <p className="text-xs text-emerald-300">+18% from last week</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 text-sm text-slate-400">This Month</p>
              <p className="text-2xl font-bold text-white">1,050 ECO</p>
              <p className="text-xs text-emerald-300">+12% from last month</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 text-sm text-slate-400">All Time</p>
              <p className="text-2xl font-bold text-white">8,450 ECO</p>
              <p className="text-xs text-slate-400">Since Jan 2024</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
