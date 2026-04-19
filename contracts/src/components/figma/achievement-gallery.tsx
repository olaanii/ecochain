"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Award, Lock, Star } from "lucide-react";

const achievements = [
  {
    id: 1,
    title: "Eco Warrior",
    description: "Complete 100 verified eco-actions",
    icon: "🌟",
    unlocked: true,
    progress: 100,
    rarity: "legendary",
  },
  {
    id: 2,
    title: "Transit Champion",
    description: "Use public transit 50 times",
    icon: "🚇",
    unlocked: true,
    progress: 100,
    rarity: "epic",
  },
  {
    id: 3,
    title: "Solar Pioneer",
    description: "Generate 1000 kWh solar energy",
    icon: "☀️",
    unlocked: true,
    progress: 100,
    rarity: "rare",
  },
  {
    id: 4,
    title: "Water Guardian",
    description: "Save 5000 liters of water",
    icon: "💧",
    unlocked: true,
    progress: 100,
    rarity: "epic",
  },
  {
    id: 5,
    title: "Recycling Master",
    description: "Recycle 200 kg of materials",
    icon: "♻️",
    unlocked: false,
    progress: 75,
    rarity: "rare",
  },
  {
    id: 6,
    title: "Carbon Neutral",
    description: "Offset 10 tons of CO2",
    icon: "🌍",
    unlocked: false,
    progress: 45,
    rarity: "legendary",
  },
];

const rarityColors = {
  legendary: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  epic: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  rare: "border-blue-400/30 bg-blue-400/10 text-blue-300",
};

export function AchievementGallery() {
  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <Award className="h-10 w-10 text-emerald-300" />
          <h1 className="text-4xl font-bold text-white">Achievement Gallery</h1>
        </div>
        <p className="text-slate-300">
          Showcase your environmental accomplishments and unlock exclusive badges.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Total Achievements</p>
            <p className="text-3xl font-bold text-white">24</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Unlocked</p>
            <p className="text-3xl font-bold text-emerald-300">18</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">In Progress</p>
            <p className="text-3xl font-bold text-amber-300">6</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Completion</p>
            <p className="text-3xl font-bold text-white">75%</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <Card key={achievement.id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                    achievement.unlocked
                      ? "bg-emerald-400/20"
                      : "bg-white/5 grayscale"
                  }`}
                >
                  {achievement.unlocked ? achievement.icon : <Lock className="h-8 w-8 text-slate-600" />}
                </div>
                <Badge className={rarityColors[achievement.rarity as keyof typeof rarityColors]}>
                  {achievement.rarity}
                </Badge>
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-white">{achievement.title}</h3>
                <p className="text-sm text-slate-400">{achievement.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progress</span>
                  <span className="font-semibold text-white">{achievement.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full ${achievement.unlocked ? "bg-emerald-400" : "bg-amber-400"}`}
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              </div>
              {achievement.unlocked && (
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <Star className="h-4 w-4 fill-current" />
                  <span>Unlocked</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
