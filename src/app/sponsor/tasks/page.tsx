"use client";

import { useState, useEffect } from "react";
import { SponsorShell } from "@/components/layout/sponsor-shell";
import { Plus, Search, MoreHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

interface Task {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  baseReward: number;
  verificationMethod: string;
  active: boolean;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  ended: "bg-[#e4e9ea] text-[#5a6061]",
};

export default function SponsorTasksPage() {
  const params = useSearchParams();
  const filter = params.get("status") ?? "active";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks?limit=50');
        const data = await res.json();
        if (data.success) {
          setTasks(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filtered = tasks.filter((t) =>
    filter === "active" ? t.active : !t.active
  );

  if (loading) {
    return (
      <SponsorShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
        </div>
      </SponsorShell>
    );
  }

  return (
    <SponsorShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Tasks
            </h1>
            <p className="mt-1 text-sm text-[#5a6061]">
              Manage your rewarding eco-actions.
            </p>
          </div>
          <Link
            href="/sponsor/tasks/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2d3435] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            <Plus size={15} />
            New Task
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6061]" />
          <input
            type="text"
            placeholder="Search tasks…"
            className="w-full rounded-xl border border-[#e4e9ea] bg-white py-2.5 pl-9 pr-4 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f2f4f4] text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Task</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Category</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Reward</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Completions</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Ends</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#5a6061]">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f4]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#5a6061]">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#2d3435]">{task.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-[#5a6061]">{task.category}</td>
                    <td className="px-6 py-4 font-medium text-[#2d3435]">{task.baseReward} ECO</td>
                    <td className="px-6 py-4 text-[#5a6061]">—</td>
                    <td className="px-6 py-4 text-[#5a6061]">{new Date(task.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          task.active ? statusColor.active : statusColor.ended
                        )}
                      >
                        {task.active ? "active" : "ended"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#5a6061] hover:text-[#2d3435]">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-[#5a6061]">No tasks found.</p>
          )}
        </div>
      </div>
    </SponsorShell>
  );
}
