"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, Leaf, Bike, Recycle, TreePine, Camera, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ProductShell } from "@/components/layout/product-shell";
import { useWallet } from "@/contexts/wallet-context";

interface Task {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  baseReward: number;
  verificationMethod: string;
  active: boolean;
}

interface Verification {
  id: string;
  taskId: string;
  status: string;
  createdAt: string;
  task?: Task;
}

const CATEGORY_ICONS: Record<string, any> = {
  environment: TreePine,
  transit: Bike,
  recycling: Recycle,
  energy: Leaf,
  community: Camera,
};

export default function TasksPage() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<"available" | "completed">("available");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await fetch('/api/tasks?limit=20');
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          if (tasksData.success) {
            setTasks(tasksData.data);
          }
        }

        if (isConnected) {
          const verificationsRes = await fetch('/api/verifications');
          if (verificationsRes.ok) {
            const verificationsData = await verificationsRes.json();
            if (verificationsData.success) {
              setCompletedTasks(verificationsData.data || []);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isConnected]);

  if (loading) {
    return (
      <ProductShell>
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
          </div>
        </div>
      </ProductShell>
    );
  }

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

        {/* Tasks List */}
        <div className="space-y-4">
          {activeTab === "available" ? (
            tasks.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                No available tasks.
              </div>
            ) : (
              tasks.map((task) => {
                const Icon = CATEGORY_ICONS[task.category] || Leaf;
                return (
                  <div
                    key={task.id}
                    className="group rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5 transition-all hover:border-[var(--color-brand-secondary)]/50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-[var(--color-brand-tertiary)]/10 p-2.5 text-[var(--color-brand-tertiary)]">
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[var(--color-text-dark)]">
                            {task.name}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            {task.description}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                            <span className="capitalize">{task.category}</span>
                            <span>·</span>
                            <span>{task.verificationMethod}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--color-success)]">
                          +{task.baseReward} ECO
                        </p>
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
              })
            )
          ) : (
            completedTasks.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                No completed tasks yet.
              </div>
            ) : (
              completedTasks.map((task) => (
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
                        {task.task?.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Completed on {task.createdAt}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--color-success)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
                      +{task.task?.baseReward} ECO
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </ProductShell>
  );
}
