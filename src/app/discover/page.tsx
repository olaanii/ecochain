"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, Sparkles } from "lucide-react";

import { ProductShell } from "@/components/layout/product-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Task = {
  id: string;
  name: string;
  description: string;
  category: string;
  baseReward: number;
  bonusMultiplier: number;
  verificationHint: string;
};

type CategoryFilter = "all" | "Transport" | "Recycling" | "Energy" | "Community";

const categories: CategoryFilter[] = ["all", "Transport", "Recycling", "Energy", "Community"];

export default function DiscoverPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    void fetchTasks();
  }, []);

  const filteredTasks = useMemo(
    () =>
      selectedCategory === "all"
        ? tasks
        : tasks.filter((task) => task.category === selectedCategory),
    [selectedCategory, tasks],
  );

  const featuredTask = filteredTasks[0] ?? tasks[0];

  return (
    <ProductShell
      title="Discover eco-actions"
      subtitle="Browse verified missions, compare reward profiles, and route operators into the proof workflow."
    >
      <div className="space-y-8">
        <section className="surface overflow-hidden rounded-[2rem] px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <Badge>Mission discovery</Badge>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Turn verified sustainability work into a pipeline operators can actually manage.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  Task discovery is no longer a generic card grid. Operators can scan category,
                  proof requirements, reward yield, and verification readiness in one place before
                  sending users into the submission flow.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Featured mission</p>
                <Sparkles className="text-emerald-300" size={18} />
              </div>
              {featuredTask ? (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold text-white">{featuredTask.name}</h3>
                    <Badge>{featuredTask.category}</Badge>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">{featuredTask.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                        Base reward
                      </p>
                      <p className="mt-3 text-xl font-semibold text-white">
                        {featuredTask.baseReward} INITIA
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                        Yield multiplier
                      </p>
                      <p className="mt-3 text-xl font-semibold text-emerald-300">
                        x{featuredTask.bonusMultiplier.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/verification?taskId=${featuredTask.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"
                  >
                    Open verification flow
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">Loading mission profile...</p>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <div className="mr-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <Filter size={15} />
            Filter by category
          </div>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-emerald-300 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {category === "all" ? "All missions" : category}
            </button>
          ))}
        </section>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-300/20 border-t-emerald-300" />
          </div>
        )}

        {error && (
          <div className="rounded-[1.75rem] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && (
          <section className="grid gap-5 xl:grid-cols-2">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.28)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-semibold text-white">{task.name}</h3>
                      <Badge>{task.category}</Badge>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                      {task.description}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-emerald-300/20 bg-emerald-300/8 px-4 py-3 text-right">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                      Reward
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">{task.baseReward}</p>
                    <p className="text-sm text-emerald-300">x{task.bonusMultiplier.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-5">
                  <p className="max-w-xl text-xs uppercase tracking-[0.28em] text-emerald-300">
                    {task.verificationHint}
                  </p>
                  <Link href={`/verification?taskId=${task.id}`}>
                    <Button size="sm">
                      Start verification
                      <ArrowRight size={15} />
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </ProductShell>
  );
}
