"use client";

import { useState } from "react";
import { CheckCircle, Clock, Leaf, Bike, Recycle, TreePine, Camera, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductShell } from "@/components/layout/product-shell";

const TASKS = [
  {
    id: "1",
    title: "Community Tree Planting",
    description: "Plant 5 trees in your local community",
    reward: 500,
    category: "environment",
    status: "available",
    icon: TreePine,
    difficulty: "Easy",
    timeEstimate: "2 hours",
  },
  {
    id: "2",
    title: "Urban Cycling Challenge",
    description: "Cycle 50km instead of driving this week",
    reward: 200,
    category: "transport",
    status: "available",
    icon: Bike,
    difficulty: "Medium",
    timeEstimate: "1 week",
  },
  {
    id: "3",
    title: "Recycling Sprint",
    description: "Recycle 10kg of waste materials",
    reward: 120,
    category: "waste",
    status: "available",
    icon: Recycle,
    difficulty: "Easy",
    timeEstimate: "1 day",
  },
  {
    id: "4",
    title: "Zero-Waste Groceries",
    description: "Shop with reusable bags and containers",
    reward: 300,
    category: "shopping",
    status: "available",
    icon: Leaf,
    difficulty: "Easy",
    timeEstimate: "30 mins",
  },
];

const COMPLETED_TASKS = [
  {
    id: "5",
    title: "Home Energy Audit",
    reward: 300,
    completedDate: "Apr 15, 2026",
    status: "completed",
  },
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<"available" | "completed">("available");

  return (
    <ProductShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Available Tasks
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Complete sustainability tasks to earn ECO rewards.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-[var(--color-surface-muted)]">
          {(["available", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-[var(--color-text-dark)] text-[var(--color-text-dark)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Available Tasks */}
        {activeTab === "available" && (
          <div className="space-y-4">
            {TASKS.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className="group rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5 transition-all hover:border-[var(--color-brand-secondary)]/50 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-[var(--color-brand-secondary)]/10 p-3 text-[var(--color-brand-secondary)]">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-[var(--color-text-dark)]">
                            {task.title}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            {task.description}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--color-success)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
                          +{task.reward} ECO
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.timeEstimate}
                        </span>
                        <span className="rounded bg-[var(--color-surface-muted)] px-2 py-0.5">
                          {task.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/verification?task=${task.id}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-text-dark)] py-2.5 text-sm font-semibold text-[var(--color-text-inverse)] transition-opacity hover:opacity-90"
                    >
                      <Camera size={16} />
                      Verify Task
                    </Link>
                    <button className="rounded-xl border border-[var(--color-surface-muted)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-surface-muted)]">
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Completed Tasks */}
        {activeTab === "completed" && (
          <div className="space-y-4">
            {COMPLETED_TASKS.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-[var(--color-success)]/10 p-3 text-[var(--color-success)]">
                    <CheckCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text-dark)]">
                      {task.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Completed on {task.completedDate}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--color-success)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
                    +{task.reward} ECO
                  </span>
                </div>
              </div>
            ))}
            {COMPLETED_TASKS.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-[var(--color-text-muted)]">No completed tasks yet.</p>
                <Link
                  href="/tasks"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-brand-secondary)] hover:underline"
                >
                  View available tasks <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </ProductShell>
  );
}
