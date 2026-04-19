"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb, Sparkles, TrendingUp } from "lucide-react";

const recommendations = [
  {
    id: 1,
    title: "Switch to Bike Commute",
    description: "Replace 3 car trips per week with cycling",
    impact: {
      carbon: "-12 kg CO2",
      earnings: "+45 ECO",
      health: "+30 min exercise",
    },
    confidence: 92,
    difficulty: "medium",
    timeframe: "Weekly",
  },
  {
    id: 2,
    title: "Solar Panel Optimization",
    description: "Adjust panel angles for 15% efficiency gain",
    impact: {
      carbon: "-8 kg CO2",
      earnings: "+30 ECO",
      savings: "$25/month",
    },
    confidence: 88,
    difficulty: "easy",
    timeframe: "One-time",
  },
  {
    id: 3,
    title: "Meal Prep Sundays",
    description: "Batch cook plant-based meals to reduce waste",
    impact: {
      carbon: "-5 kg CO2",
      earnings: "+20 ECO",
      savings: "$40/week",
    },
    confidence: 85,
    difficulty: "easy",
    timeframe: "Weekly",
  },
  {
    id: 4,
    title: "Smart Thermostat Schedule",
    description: "Optimize heating/cooling based on occupancy",
    impact: {
      carbon: "-15 kg CO2",
      earnings: "+35 ECO",
      savings: "$50/month",
    },
    confidence: 90,
    difficulty: "easy",
    timeframe: "One-time setup",
  },
];

const difficultyColors = {
  easy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  hard: "border-red-400/30 bg-red-400/10 text-red-300",
};

export function ActionOptimization() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-10 w-10 text-emerald-300" />
          <h1 className="text-4xl font-bold text-white">Action Optimization</h1>
        </div>
        <p className="text-slate-300">
          AI-powered recommendations to maximize your environmental impact and earnings.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Potential Impact</p>
            <p className="text-3xl font-bold text-emerald-300">-40 kg CO2</p>
            <p className="text-xs text-slate-500">Per week</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Potential Earnings</p>
            <p className="text-3xl font-bold text-white">+130 ECO</p>
            <p className="text-xs text-slate-500">Per week</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Cost Savings</p>
            <p className="text-3xl font-bold text-amber-300">$115</p>
            <p className="text-xs text-slate-500">Per week</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-300" />
                    <h3 className="text-lg font-semibold text-white">{rec.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400">{rec.description}</p>
                </div>
                <Badge className={difficultyColors[rec.difficulty as keyof typeof difficultyColors]}>
                  {rec.difficulty}
                </Badge>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                {Object.entries(rec.impact).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="mb-1 text-xs uppercase tracking-wider text-slate-400">
                      {key}
                    </p>
                    <p className="font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>AI Confidence: {rec.confidence}%</span>
                  </div>
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="border-white/20 bg-white/5 text-white">
                    {rec.timeframe}
                  </Badge>
                  <Button>Activate</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Card title="Optimization Insights">
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
              <p className="mb-1 font-semibold text-white">High Impact Opportunity</p>
              <p className="text-sm text-slate-300">
                Combining bike commute with meal prep can increase your weekly impact by 65%
              </p>
            </div>
            <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-4">
              <p className="mb-1 font-semibold text-white">Quick Win</p>
              <p className="text-sm text-slate-300">
                Smart thermostat setup takes 15 minutes and provides ongoing benefits
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
