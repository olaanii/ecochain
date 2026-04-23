"use client";

import { Lock, Unlock, Clock, TrendingUp, Coins } from "lucide-react";
import Link from "next/link";
import { ProductShell } from "@/components/layout/product-shell";

const STAKES = [
  {
    id: "1",
    amount: 500,
    apy: 8,
    days: 90,
    startDate: "Jan 15, 2026",
    endDate: "Apr 15, 2026",
    status: "matured",
    earned: 12.3,
    totalValue: 512.3,
  },
  {
    id: "2",
    amount: 1000,
    apy: 12,
    days: 180,
    startDate: "Feb 1, 2026",
    endDate: "Jul 31, 2026",
    status: "locked",
    earned: 45.2,
    totalValue: 1045.2,
  },
  {
    id: "3",
    amount: 200,
    apy: 5,
    days: 30,
    startDate: "Mar 20, 2026",
    endDate: "Apr 19, 2026",
    status: "locked",
    earned: 0.8,
    totalValue: 200.8,
  },
];

export default function StakesPage() {
  const totalStaked = STAKES.reduce((sum, s) => sum + s.amount, 0);
  const totalEarned = STAKES.reduce((sum, s) => sum + s.earned, 0);
  const maturedCount = STAKES.filter((s) => s.status === "matured").length;

  return (
    <ProductShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            My Stakes
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Manage your active staking positions and claim rewards.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--color-brand-tertiary)]/10 p-2.5 text-[var(--color-brand-tertiary)]">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Total Staked</p>
                <p className="text-xl font-semibold text-[var(--color-text-dark)]">
                  {totalStaked.toLocaleString()} ECO
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--color-success)]/10 p-2.5 text-[var(--color-success)]">
                <Coins size={18} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Total Earned</p>
                <p className="text-xl font-semibold text-[var(--color-success)]">
                  +{totalEarned.toFixed(2)} ECO
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--color-brand-accent)]/10 p-2.5 text-[var(--color-brand-accent)]">
                <Unlock size={18} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Ready to Unstake</p>
                <p className="text-xl font-semibold text-[var(--color-text-dark)]">
                  {maturedCount} position{maturedCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <Link
            href="/stake"
            className="flex-1 rounded-xl bg-[var(--color-text-dark)] py-3 text-center text-sm font-semibold text-[var(--color-text-inverse)] transition-opacity hover:opacity-90"
          >
            Stake More
          </Link>
          <Link
            href="/unstake"
            className="flex-1 rounded-xl border border-[var(--color-surface-muted)] py-3 text-center text-sm font-semibold text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            Unstake
          </Link>
        </div>

        {/* Stakes List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">
            Active Positions
          </h2>
          {STAKES.map((stake) => (
            <div
              key={stake.id}
              className="rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-xl p-2.5 ${
                      stake.status === "matured"
                        ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]"
                    }`}
                  >
                    {stake.status === "matured" ? <Unlock size={20} /> : <Lock size={20} />}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[var(--color-text-dark)]">
                      {stake.amount.toLocaleString()} ECO
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                      <TrendingUp size={14} />
                      <span>{stake.apy}% APY</span>
                      <span>·</span>
                      <Clock size={14} />
                      <span>{stake.days} days</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      stake.status === "matured"
                        ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]"
                    }`}
                  >
                    {stake.status === "matured" ? "Ready" : "Locked"}
                  </span>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Ends {stake.endDate}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[var(--color-surface-muted)] pt-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Principal</p>
                  <p className="text-sm font-medium text-[var(--color-text-dark)]">
                    {stake.amount.toLocaleString()} ECO
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Accrued Rewards</p>
                  <p className="text-sm font-medium text-[var(--color-success)]">
                    +{stake.earned.toFixed(2)} ECO
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Total Value</p>
                  <p className="text-sm font-medium text-[var(--color-text-dark)]">
                    {stake.totalValue.toFixed(2)} ECO
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProductShell>
  );
}
