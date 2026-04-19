"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, Zap } from "lucide-react";

const insights = [
  {
    id: 1,
    title: "Peak Performance Window",
    description: "Your eco-actions are 40% more effective between 7-9 AM",
    impact: "high",
  },
  {
    id: 2,
    title: "Streak Opportunity",
    description: "Complete 3 more transit commutes to unlock 2x multiplier",
    impact: "medium",
  },
  {
    id: 3,
    title: "Community Challenge",
    description: "Join the weekend recycling drive for bonus rewards",
    impact: "high",
  },
];

const recommendations = [
  { action: "Switch to bike commute", potential: "+45 ECO", confidence: 92 },
  { action: "Solar panel optimization", potential: "+30 ECO", confidence: 88 },
  { action: "Water usage reduction", potential: "+20 ECO", confidence: 85 },
];

export function AICoach() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <Brain className="h-10 w-10 text-emerald-300" />
          <h1 className="text-4xl font-bold text-white">AI Coach: Aura Hub</h1>
        </div>
        <p className="text-slate-300">
          Your personal AI assistant analyzes patterns and suggests optimized eco-actions for
          maximum impact.
        </p>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="Neural Network Insights">
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-white">{insight.title}</h3>
                  <Badge
                    className={
                      insight.impact === "high"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    }
                  >
                    {insight.impact}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="AI Recommendations">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-300" />
                    <p className="font-semibold text-white">{rec.action}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-300">{rec.potential}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{rec.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-emerald-300" />
            <div>
              <p className="text-2xl font-bold text-white">+28%</p>
              <p className="text-sm text-slate-400">Impact Growth</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-amber-300" />
            <div>
              <p className="text-2xl font-bold text-white">15</p>
              <p className="text-sm text-slate-400">Active Streaks</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-300" />
            <div>
              <p className="text-2xl font-bold text-white">94%</p>
              <p className="text-sm text-slate-400">AI Accuracy</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Personalized Action Plan">
          <p className="mb-4 text-sm text-slate-300">
            Based on your patterns, here's your optimized weekly plan:
          </p>
          <div className="space-y-2">
            {["Monday: Bike commute + recycling", "Tuesday: Transit + water conservation", "Wednesday: Solar optimization", "Thursday: Community challenge", "Friday: Bike commute + meal prep"].map((day, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-sm font-semibold text-emerald-300">
                  {i + 1}
                </div>
                <p className="text-sm text-white">{day}</p>
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full">Activate AI Coach</Button>
        </Card>
      </div>
    </main>
  );
}
