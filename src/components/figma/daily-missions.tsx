"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Flame } from "lucide-react";

const missions = [
  {
    id: 1,
    title: "Morning Commute",
    description: "Use public transit or bike to work",
    reward: 25,
    difficulty: "easy",
    timeLeft: "2h 30m",
    completed: false,
    category: "Transport",
  },
  {
    id: 2,
    title: "Recycling Run",
    description: "Drop off recyclables at collection point",
    reward: 15,
    difficulty: "easy",
    timeLeft: "5h 15m",
    completed: true,
    category: "Waste",
  },
  {
    id: 3,
    title: "Energy Saver",
    description: "Reduce energy consumption by 20%",
    reward: 30,
    difficulty: "medium",
    timeLeft: "8h 45m",
    completed: false,
    category: "Energy",
  },
  {
    id: 4,
    title: "Water Conservation",
    description: "Save 50 liters of water today",
    reward: 20,
    difficulty: "medium",
    timeLeft: "12h 00m",
    completed: false,
    category: "Water",
  },
  {
    id: 5,
    title: "Plant-Based Meal",
    description: "Prepare a vegetarian or vegan meal",
    reward: 18,
    difficulty: "easy",
    timeLeft: "6h 30m",
    completed: true,
    category: "Food",
  },
  {
    id: 6,
    title: "Community Clean-up",
    description: "Participate in local environmental event",
    reward: 50,
    difficulty: "hard",
    timeLeft: "15h 20m",
    completed: false,
    category: "Community",
  },
];

const difficultyColors = {
  easy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  hard: "border-red-400/30 bg-red-400/10 text-red-300",
};

export function DailyMissions() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <Flame className="h-10 w-10 text-emerald-300" />
          <h1 className="text-4xl font-bold text-white">Daily Missions</h1>
        </div>
        <p className="text-slate-300">
          Complete daily environmental tasks to earn rewards and maintain your streak.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Today's Progress</p>
            <p className="text-3xl font-bold text-white">2/6</p>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 bg-emerald-400" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Streak</p>
            <p className="text-3xl font-bold text-amber-300">15 days</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Today's Earnings</p>
            <p className="text-3xl font-bold text-emerald-300">33 ECO</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Potential</p>
            <p className="text-3xl font-bold text-white">158 ECO</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {missions.map((mission) => (
          <Card key={mission.id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-semibold text-white">{mission.title}</h3>
                    {mission.completed && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{mission.description}</p>
                </div>
                <Badge className={difficultyColors[mission.difficulty as keyof typeof difficultyColors]}>
                  {mission.difficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{mission.timeLeft}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Reward:</span>
                  <span className="font-semibold text-emerald-300">+{mission.reward} ECO</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className="border-white/20 bg-white/5 text-white">
                  {mission.category}
                </Badge>
                <Button
                  className={mission.completed ? "opacity-50" : ""}
                  disabled={mission.completed}
                >
                  {mission.completed ? "Completed" : "Start Mission"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Card title="Bonus Challenges">
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-white">Weekend Warrior</h3>
                <span className="text-sm font-semibold text-emerald-300">+100 ECO</span>
              </div>
              <p className="text-sm text-slate-300">
                Complete all daily missions for 2 consecutive days
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 bg-emerald-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
