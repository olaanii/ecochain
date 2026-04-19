"use client";

import { SponsorShell } from "@/components/layout/sponsor-shell";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

const tasks = [
  { id: "1", name: "Tree Planting Drive", category: "community", reward: 150, completions: 234, status: "active", ends: "May 12, 2026" },
  { id: "2", name: "Urban Cycling Challenge", category: "transit", reward: 200, completions: 89, status: "active", ends: "Jun 1, 2026" },
  { id: "3", name: "Home Energy Audit", category: "energy", reward: 300, completions: 12, status: "draft", ends: "—" },
  { id: "4", name: "Beach Cleanup Q1", category: "community", reward: 100, completions: 512, status: "ended", ends: "Mar 31, 2026" },
  { id: "5", name: "Recycling Sprint", category: "recycling", reward: 120, completions: 301, status: "ended", ends: "Feb 28, 2026" },
];

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  ended: "bg-[#e4e9ea] text-[#5a6061]",
};

export default function SponsorTasksPage() {
  const params = useSearchParams();
  const filter = params.get("status") ?? "active";

  const filtered = tasks.filter((t) =>
    filter === "active" ? t.status === "active" : t.status === filter
  );

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
              {filtered.map((task) => (
                <tr key={task.id} className="group transition-colors hover:bg-[#f9f9f9]">
                  <td className="px-6 py-4 font-medium text-[#2d3435]">{task.name}</td>
                  <td className="px-6 py-4 capitalize text-[#5a6061]">{task.category}</td>
                  <td className="px-6 py-4 text-[#5a6061]">{task.reward} ECO</td>
                  <td className="px-6 py-4 text-[#5a6061]">{task.completions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[#5a6061]">{task.ends}</td>
                  <td className="px-6 py-4">
                    <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusColor[task.status])}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-1 text-[#5a6061] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#e4e9ea]">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
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
