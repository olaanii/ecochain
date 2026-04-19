"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Leaf, TrendingDown } from "lucide-react";

const categories = [
  { name: "Transportation", amount: 0.8, percentage: 33, color: "bg-emerald-400" },
  { name: "Energy", amount: 0.6, percentage: 25, color: "bg-teal-400" },
  { name: "Food", amount: 0.5, percentage: 21, color: "bg-cyan-400" },
  { name: "Waste", amount: 0.3, percentage: 13, color: "bg-blue-400" },
  { name: "Other", amount: 0.2, percentage: 8, color: "bg-indigo-400" },
];

const monthlyTrend = [
  { month: "Jan", value: 2.8 },
  { month: "Feb", value: 2.6 },
  { month: "Mar", value: 2.4 },
  { month: "Apr", value: 2.2 },
  { month: "May", value: 2.0 },
  { month: "Jun", value: 1.8 },
];

export function CO2Breakdown() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <Leaf className="h-10 w-10 text-emerald-300" />
          <h1 className="text-4xl font-bold text-white">CO2 Offset Breakdown</h1>
        </div>
        <p className="text-slate-300">
          Detailed analysis of your carbon offset contributions across all categories.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Total Offset</p>
            <p className="text-3xl font-bold text-emerald-300">2.4 tons</p>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">-15% emissions</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">This Month</p>
            <p className="text-3xl font-bold text-white">0.4 tons</p>
            <p className="text-xs text-slate-500">On track for goal</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Goal Progress</p>
            <p className="text-3xl font-bold text-amber-300">48%</p>
            <p className="text-xs text-slate-500">5.0 tons target</p>
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="Category Breakdown">
          <div className="mb-6">
            <div className="flex h-8 overflow-hidden rounded-full">
              {categories.map((cat, index) => (
                <div
                  key={cat.name}
                  className={`${cat.color} ${index === 0 ? "rounded-l-full" : ""} ${index === categories.length - 1 ? "rounded-r-full" : ""}`}
                  style={{ width: `${cat.percentage}%` }}
                  title={`${cat.name}: ${cat.amount} tons (${cat.percentage}%)`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded ${cat.color}`} />
                  <span className="text-sm text-white">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{cat.amount} tons</p>
                  <p className="text-xs text-slate-400">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Monthly Trend">
          <div className="mb-4 flex h-48 items-end justify-between gap-2">
            {monthlyTrend.map((month, index) => {
              const maxValue = Math.max(...monthlyTrend.map((m) => m.value));
              const height = (month.value / maxValue) * 100;
              return (
                <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex-1">
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-emerald-400 to-teal-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{month.month}</p>
                  <p className="text-xs font-semibold text-white">{month.value}</p>
                </div>
              );
            })}
          </div>
          <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            -36% reduction over 6 months
          </Badge>
        </Card>
      </div>

      <Card title="Impact Details">
        <div className="grid gap-4 lg:grid-cols-2">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white">{cat.name}</h3>
                <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                  {cat.amount} tons
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cat.color}
                    style={{ width: `${cat.percentage}%`, height: "100%" }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {cat.percentage}% of total offset
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
