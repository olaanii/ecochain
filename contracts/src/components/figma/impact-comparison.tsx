"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Award, Globe, TrendingUp, Users } from "lucide-react";

const globalRankings = [
  { rank: 1, name: "EcoWarrior_2024", region: "North America", score: 12450, avatar: "🌟" },
  { rank: 2, name: "GreenChampion", region: "Europe", score: 11890, avatar: "🏆" },
  { rank: 3, name: "SustainableSam", region: "Asia", score: 11250, avatar: "🌱" },
  { rank: 4, name: "You", region: "North America", score: 10840, avatar: "👤", isUser: true },
  { rank: 5, name: "ClimateHero", region: "South America", score: 10320, avatar: "🌍" },
];

const regionalStats = [
  { region: "North America", avgScore: 8450, participants: 12500, growth: "+12%" },
  { region: "Europe", avgScore: 9120, participants: 15800, growth: "+18%" },
  { region: "Asia", avgScore: 7890, participants: 22300, growth: "+25%" },
  { region: "South America", avgScore: 7230, participants: 8900, growth: "+15%" },
];

const comparisons = [
  { metric: "Carbon Offset", you: "2.4 tons", average: "1.8 tons", percentile: 78 },
  { metric: "Water Saved", you: "1,200 L", average: "850 L", percentile: 82 },
  { metric: "Actions Completed", you: "247", average: "180", percentile: 75 },
  { metric: "Streak Days", you: "15", average: "8", percentile: 88 },
];

export function ImpactComparison() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="h-10 w-10 text-emerald-300" />
          <h1 className="text-4xl font-bold text-white">Impact Comparison</h1>
        </div>
        <p className="text-slate-300">
          See how your environmental impact compares to the global community.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Global Rank</p>
            <p className="text-3xl font-bold text-white">#4</p>
            <p className="text-xs text-emerald-300">Top 0.1%</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Regional Rank</p>
            <p className="text-3xl font-bold text-emerald-300">#2</p>
            <p className="text-xs text-slate-400">North America</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Your Score</p>
            <p className="text-3xl font-bold text-white">10,840</p>
            <p className="text-xs text-emerald-300">+8% this week</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Next Rank</p>
            <p className="text-3xl font-bold text-amber-300">410</p>
            <p className="text-xs text-slate-400">Points needed</p>
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card title="Global Leaderboard">
          <div className="space-y-3">
            {globalRankings.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between rounded-xl border p-4 ${
                  user.isUser
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl">
                    {user.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-300">{user.score}</p>
                  <Badge className="border-white/20 bg-white/5 text-white">
                    #{user.rank}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Performance Comparison">
          <div className="space-y-4">
            {comparisons.map((comp) => (
              <div key={comp.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{comp.metric}</p>
                  <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                    {comp.percentile}th percentile
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-white">You: {comp.you}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">Avg: {comp.average}</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${comp.percentile}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Regional Statistics">
        <div className="grid gap-4 lg:grid-cols-2">
          {regionalStats.map((stat) => (
            <div
              key={stat.region}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white">{stat.region}</h3>
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">{stat.growth}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">Avg Score</p>
                  <p className="text-lg font-bold text-white">{stat.avgScore}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Participants</p>
                  <p className="text-lg font-bold text-white">
                    {stat.participants.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-300" />
            <div>
              <p className="text-2xl font-bold text-white">59.4K</p>
              <p className="text-sm text-slate-400">Active Users</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-amber-300" />
            <div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-sm text-slate-400">Achievements</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-blue-300" />
            <div>
              <p className="text-2xl font-bold text-white">142</p>
              <p className="text-sm text-slate-400">Countries</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
