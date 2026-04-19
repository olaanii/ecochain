"use client";

import { SponsorShell } from "@/components/layout/sponsor-shell";
import { Plus, CalendarDays, Users, Coins } from "lucide-react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

const campaigns = [
  {
    id: "1",
    name: "Earth Month 2026",
    tasks: 5,
    participants: 892,
    budget: 120000,
    spent: 78400,
    status: "active",
    start: "Apr 1, 2026",
    end: "Apr 30, 2026",
  },
  {
    id: "2",
    name: "Clean Commute Q2",
    tasks: 3,
    participants: 310,
    budget: 60000,
    spent: 18200,
    status: "active",
    start: "Apr 15, 2026",
    end: "Jun 30, 2026",
  },
  {
    id: "3",
    name: "Summer Recycling Push",
    tasks: 4,
    participants: 0,
    budget: 80000,
    spent: 0,
    status: "scheduled",
    start: "Jul 1, 2026",
    end: "Aug 31, 2026",
  },
  {
    id: "4",
    name: "Green January",
    tasks: 6,
    participants: 1240,
    budget: 150000,
    spent: 150000,
    status: "completed",
    start: "Jan 1, 2026",
    end: "Jan 31, 2026",
  },
];

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-[#e4e9ea] text-[#5a6061]",
};

export default function SponsorCampaignsPage() {
  const params = useSearchParams();
  const filter = params.get("status") ?? "active";

  const filtered = campaigns.filter((c) => c.status === filter);

  return (
    <SponsorShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Campaigns
            </h1>
            <p className="mt-1 text-sm text-[#5a6061]">
              Group your tasks into campaigns and track performance.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#2d3435] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80">
            <Plus size={15} />
            New Campaign
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
            return (
              <div
                key={c.id}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-base font-semibold text-[#2d3435]">{c.name}</h2>
                  <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusColor[c.status])}>
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-[#f2f4f4] px-3 py-2.5">
                    <ListTodo size={13} className="text-[#5a6061]" />
                    <span className="font-semibold text-[#2d3435]">{c.tasks}</span>
                    <span className="text-[#5a6061]">Tasks</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-[#f2f4f4] px-3 py-2.5">
                    <Users size={13} className="text-[#5a6061]" />
                    <span className="font-semibold text-[#2d3435]">{c.participants.toLocaleString()}</span>
                    <span className="text-[#5a6061]">Users</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-[#f2f4f4] px-3 py-2.5">
                    <Coins size={13} className="text-[#5a6061]" />
                    <span className="font-semibold text-[#2d3435]">{(c.spent / 1000).toFixed(1)}k</span>
                    <span className="text-[#5a6061]">ECO paid</span>
                  </div>
                </div>

                {/* Budget progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#5a6061]">
                    <span>Budget used</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e4e9ea]">
                    <div
                      className="h-full rounded-full bg-[#3b6934] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#5a6061]">
                    <span>{c.spent.toLocaleString()} ECO spent</span>
                    <span>{c.budget.toLocaleString()} ECO total</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#5a6061]">
                  <CalendarDays size={12} />
                  {c.start} → {c.end}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl bg-white py-16 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-[#5a6061]">No {filter} campaigns.</p>
          </div>
        )}
      </div>
    </SponsorShell>
  );
}

function ListTodo({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
