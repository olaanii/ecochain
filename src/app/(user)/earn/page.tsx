"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Clock,
  Coins,
  CheckCircle2,
  Flame,
  TreePine,
  Bike,
  Recycle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";

const categories = [
  { key: "all", label: "All" },
  { key: "trending", label: "Trending" },
  { key: "new", label: "New" },
  { key: "ending_soon", label: "Ending Soon" },
];

const tasks = [
  {
    id: "1",
    title: "Tree Planting Drive",
    category: "community",
    reward: 150,
    completions: 234,
    endsIn: "3 days",
    difficulty: "easy",
    icon: TreePine,
  },
  {
    id: "2",
    title: "Urban Cycling Challenge",
    category: "transit",
    reward: 200,
    completions: 89,
    endsIn: "2 weeks",
    difficulty: "medium",
    icon: Bike,
  },
  {
    id: "3",
    title: "Home Energy Audit",
    category: "energy",
    reward: 300,
    completions: 12,
    endsIn: "1 month",
    difficulty: "hard",
    icon: Lightbulb,
  },
  {
    id: "4",
    title: "Recycling Sprint",
    category: "recycling",
    reward: 120,
    completions: 301,
    endsIn: "5 days",
    difficulty: "easy",
    icon: Recycle,
  },
  {
    id: "5",
    title: "Beach Cleanup",
    category: "community",
    reward: 100,
    completions: 512,
    endsIn: "Completed",
    difficulty: "easy",
    icon: TreePine,
  },
  {
    id: "6",
    title: "Carbon Offset Pledge",
    category: "energy",
    reward: 250,
    completions: 45,
    endsIn: "3 weeks",
    difficulty: "medium",
    icon: Flame,
  },
];

const difficultyStyle: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

const categoryStyle: Record<string, string> = {
  transit: "bg-blue-100 text-blue-700",
  recycling: "bg-emerald-100 text-emerald-700",
  energy: "bg-amber-100 text-amber-700",
  community: "bg-purple-100 text-purple-700",
};

export default function EarnPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? tasks
      : activeCategory === "trending"
        ? tasks.filter((t) => t.completions > 100)
        : activeCategory === "new"
          ? tasks.filter((t) => t.completions < 50)
          : tasks.filter((t) => t.endsIn.includes("day") || t.endsIn.includes("Completed"));

  const totalPotential = tasks.reduce((sum, t) => sum + t.reward, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Earn
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Complete eco-actions and earn ECO rewards.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <Coins size={16} className="text-[#3b6934]" />
          <span className="text-sm text-[var(--color-text-muted)]">Potential:</span>
          <span className="text-sm font-semibold text-[var(--color-text-dark)]">
            {totalPotential.toLocaleString()} ECO
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Available Tasks", value: "6", icon: Zap, color: "text-[#3b6934]" },
          { label: "Your Completions", value: "14", icon: CheckCircle2, color: "text-[#2d6fa6]" },
          { label: "Earned This Week", value: "1,200 ECO", icon: Coins, color: "text-[#7a3b9c]" },
          { label: "Streak", value: "5 days", icon: Flame, color: "text-[#a05c1a]" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  {s.label}
                </p>
                <p
                  className="mt-2 text-2xl font-semibold tracking-[-0.5px] text-[var(--color-text-dark)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {s.value}
                </p>
              </div>
              <div className={`rounded-xl bg-[#f2f4f4] p-2.5 ${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 border-b border-[var(--color-surface-muted,#e4e9ea)]">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={clsx(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === c.key
                ? "border-b-2 border-[var(--color-text-dark)] text-[var(--color-text-dark)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)]",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Task cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((task) => {
          const Icon = task.icon;
          return (
            <Link
              key={task.id}
              href={`/discover/${task.id}`}
              className="group flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#f2f4f4] p-2.5 text-[var(--color-text-muted)]">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-dark)]">{task.title}</h3>
                    <span
                      className={clsx(
                        "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                        categoryStyle[task.category],
                      )}
                    >
                      {task.category}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-[#3b6934]">
                  <Coins size={14} />
                  <span className="font-semibold">{task.reward} ECO</span>
                </div>
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    difficultyStyle[task.difficulty],
                  )}
                >
                  {task.difficulty}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {task.completions} completions
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {task.endsIn}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white py-16 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <Zap size={32} className="mx-auto text-[#c8d0d1]" />
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            No tasks match this filter.
          </p>
        </div>
      )}
    </div>
  );
}
