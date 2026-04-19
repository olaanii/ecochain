"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useState } from "react";

const goalCategories = [
  { id: "carbon", label: "Carbon Offset", unit: "tons", current: 2.4, target: 5.0, max: 10 },
  { id: "water", label: "Water Saved", unit: "kL", current: 1.2, target: 3.0, max: 5 },
  { id: "energy", label: "Energy Efficiency", unit: "%", current: 85, target: 95, max: 100 },
  { id: "waste", label: "Waste Reduction", unit: "kg", current: 45, target: 100, max: 200 },
  { id: "transport", label: "Green Transport", unit: "km", current: 120, target: 250, max: 500 },
];

export function GoalSetting() {
  const [goals, setGoals] = useState(
    goalCategories.reduce(
      (acc, cat) => ({ ...acc, [cat.id]: cat.target }),
      {} as Record<string, number>,
    ),
  );

  const handleSliderChange = (id: string, value: number) => {
    setGoals((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <main className="app-shell mx-auto min-h-screen w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
      <div className="hero-orb" />
      <div className="hero-orb alt" />

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <Target className="h-10 w-10 text-emerald-300" />
          <h1 className="text-4xl font-bold text-white">Goal Setting</h1>
        </div>
        <p className="text-slate-300">
          Calibrate your environmental impact targets and track progress toward your goals.
        </p>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Active Goals</p>
            <p className="text-3xl font-bold text-white">5</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Average Progress</p>
            <p className="text-3xl font-bold text-emerald-300">68%</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Goals Achieved</p>
            <p className="text-3xl font-bold text-amber-300">12</p>
          </div>
        </Card>
      </div>

      <Card title="Impact Calibration">
        <div className="space-y-6">
          {goalCategories.map((category) => {
            const progress = (category.current / goals[category.id]) * 100;
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{category.label}</h3>
                    <p className="text-sm text-slate-400">
                      Current: {category.current} {category.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-300">
                      {goals[category.id]} {category.unit}
                    </p>
                    <p className="text-xs text-slate-400">Target</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min={category.current}
                    max={category.max}
                    step={category.unit === "%" ? 1 : 0.1}
                    value={goals[category.id]}
                    onChange={(e) =>
                      handleSliderChange(category.id, Number(e.target.value))
                    }
                    className="h-3 w-full cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      {category.current} {category.unit}
                    </span>
                    <span>
                      {category.max} {category.unit}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-semibold text-white">
                      {Math.min(progress, 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1">Save Goals</Button>
          <Button className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10">
            Reset to Defaults
          </Button>
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Goal Insights">
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
              <p className="mb-1 font-semibold text-white">On Track</p>
              <p className="text-sm text-slate-300">
                You're making excellent progress on your carbon offset goal. Keep it up!
              </p>
            </div>
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
              <p className="mb-1 font-semibold text-white">Needs Attention</p>
              <p className="text-sm text-slate-300">
                Your waste reduction goal requires more focus. Consider increasing recycling
                efforts.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
