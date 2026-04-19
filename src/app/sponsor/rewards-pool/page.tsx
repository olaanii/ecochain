"use client";

import { useState } from "react";
import { SponsorShell } from "@/components/layout/sponsor-shell";
import { Coins, TrendingDown, AlertCircle } from "lucide-react";

const payoutHistory = [
  { id: "1", task: "Tree Planting Drive", users: 23, amount: 3450, date: "Apr 18, 2026" },
  { id: "2", task: "Urban Cycling Challenge", users: 14, amount: 2800, date: "Apr 17, 2026" },
  { id: "3", task: "Beach Cleanup Q1", users: 58, amount: 5800, date: "Mar 31, 2026" },
  { id: "4", task: "Recycling Sprint", users: 41, amount: 4920, date: "Feb 28, 2026" },
];

export default function RewardsPoolPage() {
  const [fundAmount, setFundAmount] = useState("");

  const poolBalance = 124500;
  const weeklyBurn = 8200;
  const weeksRemaining = Math.floor(poolBalance / weeklyBurn);
  const lowBalance = weeksRemaining < 4;

  return (
    <SponsorShell>
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Rewards Pool
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Fund and monitor your ECO reward budget.
          </p>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#5a6061]">Pool Balance</p>
                <p
                  className="mt-2 text-2xl font-semibold tracking-[-0.5px] text-[#2d3435]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {poolBalance.toLocaleString()} ECO
                </p>
              </div>
              <div className="rounded-xl bg-[#f2f4f4] p-2.5 text-[#3b6934]">
                <Coins size={18} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#5a6061]">Weekly Burn Rate</p>
                <p
                  className="mt-2 text-2xl font-semibold tracking-[-0.5px] text-[#2d3435]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {weeklyBurn.toLocaleString()} ECO
                </p>
              </div>
              <div className="rounded-xl bg-[#f2f4f4] p-2.5 text-[#a05c1a]">
                <TrendingDown size={18} />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${lowBalance ? "bg-amber-50" : "bg-white"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#5a6061]">Runway</p>
                <p
                  className={`mt-2 text-2xl font-semibold tracking-[-0.5px] ${lowBalance ? "text-amber-700" : "text-[#2d3435]"}`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {weeksRemaining} weeks
                </p>
              </div>
              {lowBalance && (
                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                  <AlertCircle size={18} />
                </div>
              )}
            </div>
            {lowBalance && (
              <p className="mt-2 text-xs text-amber-700">Low balance — consider topping up soon.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Fund pool */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-base font-semibold text-[#2d3435]">Add Funds</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#2d3435]">Amount (ECO)</label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  min={1}
                  className="w-full rounded-xl border border-[#e4e9ea] bg-[#f9f9f9] px-4 py-2.5 text-sm text-[#2d3435] placeholder:text-[#5a6061] focus:outline-none focus:ring-2 focus:ring-[#2d3435]/10"
                />
              </div>
              <div className="rounded-xl bg-[#f2f4f4] p-3 text-sm text-[#5a6061]">
                New balance after funding:{" "}
                <span className="font-semibold text-[#2d3435]">
                  {fundAmount
                    ? (poolBalance + parseInt(fundAmount || "0")).toLocaleString()
                    : poolBalance.toLocaleString()}{" "}
                  ECO
                </span>
              </div>
              <button className="w-full rounded-xl bg-[#2d3435] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80">
                Fund Pool
              </button>
            </div>
          </div>

          {/* Recent payouts */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-base font-semibold text-[#2d3435]">Recent Payouts</h2>
            <div className="divide-y divide-[#f2f4f4]">
              {payoutHistory.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-[#2d3435]">{p.task}</p>
                    <p className="text-xs text-[#5a6061]">{p.users} users · {p.date}</p>
                  </div>
                  <span className="font-semibold text-[#a05c1a]">−{p.amount.toLocaleString()} ECO</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SponsorShell>
  );
}
