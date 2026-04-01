"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Activity, Award, Target, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Carbon Offset", value: "2.4 tons", change: "+12%", trend: "up" },
  { label: "Water Saved", value: "1,200 L", change: "+8%", trend: "up" },
  { label: "Energy Efficiency", value: "94%", change: "+5%", trend: "up" },
  { label: "Waste Reduction", value: "85 kg", change: "-3%", trend: "down" },
];

const categories = [
  { name: "Transportation", score: 92, max: 100 },
  { name: "Energy", score: 88, max: 100 },
  { name: "Waste", score: 76, max: 100 },
  { name: "Water", score: 85, max: 100 },
  { name: "Food", score: 79, max: 100 },
];

export function EfficiencyScore() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold text-white">Efficiency Score Card</h1>
        <p className="text-slate-300">
          Real-time analytics dashboard tracking your environmental performance across all
          categories.
        </p>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-6 text-center">
            <p className="mb-2 text-sm uppercase tracking-wider text-slate-400">
              Overall Efficiency
            </p>
            <div className="relative mx-auto h-48 w-48">
              <svg className="h-full w-full -rotate-90 transform">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgb(16, 185, 129)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(86 / 100) * 553} 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-bold text-white">86</p>
                <p className="text-sm text-slate-400">out of 100</p>
              </div>
            </div>
            <Badge className="mt-4 border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              Excellent Performance
            </Badge>
          </div>
        </Card>

        <Card title="Performance Metrics">
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div>
                  <p className="text-sm text-slate-400">{metric.label}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`flex items-center gap-1 ${metric.trend === "up" ? "text-emerald-400" : "text-red-400"}`}
                  >
                    <TrendingUp
                      className={`h-4 w-4 ${metric.trend === "down" ? "rotate-180" : ""}`}
                    />
                    <span className="text-sm font-semibold">{metric.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Category Breakdown">
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{category.name}</p>
                <p className="text-sm text-slate-400">
                  {category.score}/{category.max}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  style={{ width: `${(category.score / category.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-emerald-300" />
            <div>
              <p className="text-2xl font-bold text-white">247</p>
              <p className="text-sm text-slate-400">Actions Completed</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-amber-300" />
            <div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-sm text-slate-400">Achievements Unlocked</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-purple-300" />
            <div>
              <p className="text-2xl font-bold text-white">94%</p>
              <p className="text-sm text-slate-400">Goal Progress</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
