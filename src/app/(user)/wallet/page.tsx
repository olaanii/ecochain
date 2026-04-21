"use client";

import { useState } from "react";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Lock,
  Unlock,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";

type Tab = "history" | "staking";

const balance = {
  available: 4280,
  staked: 1200,
  pendingRewards: 84,
  total: 5564,
};

const transactions = [
  { id: "1", type: "earned", task: "Tree Planting Drive", amount: 150, date: "Apr 18, 2026", status: "confirmed" },
  { id: "2", type: "earned", task: "Urban Cycling Challenge", amount: 200, date: "Apr 17, 2026", status: "confirmed" },
  { id: "3", type: "staked", task: "Staking Deposit", amount: -500, date: "Apr 15, 2026", status: "confirmed" },
  { id: "4", type: "earned", task: "Recycling Sprint", amount: 120, date: "Apr 14, 2026", status: "confirmed" },
  { id: "5", type: "unstaked", task: "Staking Withdrawal", amount: 300, date: "Apr 12, 2026", status: "confirmed" },
  { id: "6", type: "earned", task: "Beach Cleanup", amount: 100, date: "Apr 10, 2026", status: "pending" },
  { id: "7", type: "staked", task: "Staking Deposit", amount: -700, date: "Apr 8, 2026", status: "confirmed" },
  { id: "8", type: "earned", task: "Home Energy Audit", amount: 300, date: "Apr 5, 2026", status: "confirmed" },
];

const typeStyle: Record<string, { icon: typeof ArrowUpRight; cls: string; prefix: string }> = {
  earned: { icon: ArrowDownLeft, cls: "text-[var(--color-success)] bg-[var(--color-surface-muted)]", prefix: "+" },
  staked: { icon: Lock, cls: "text-[var(--color-brand-tertiary)] bg-[var(--color-surface-muted)]", prefix: "" },
  unstaked: { icon: Unlock, cls: "text-[var(--color-brand-secondary)] bg-[var(--color-surface-muted)]", prefix: "+" },
};

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>("history");

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Wallet
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Your ECO balance, transactions, and staking position.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Available", value: balance.available, icon: Coins, color: "text-[var(--color-success)]" },
          { label: "Staked", value: balance.staked, icon: Lock, color: "text-[var(--color-brand-tertiary)]" },
          { label: "Pending Rewards", value: balance.pendingRewards, icon: Clock, color: "text-[var(--color-brand-accent)]" },
          { label: "Total Balance", value: balance.total, icon: TrendingUp, color: "text-[var(--color-brand-secondary)]" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
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
                  {s.value.toLocaleString()} ECO
                </p>
              </div>
              <div className={`rounded-xl bg-[var(--color-surface-muted)] p-2.5 ${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-surface-muted,#e4e9ea)]">
        {(["history", "staking"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "px-4 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-b-2 border-[var(--color-text-dark)] text-[var(--color-text-dark)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "history" && (
        <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-elevated)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-surface-muted)] text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Type</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Task</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Date</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-surface-muted)]">
              {transactions.map((tx) => {
                const style = typeStyle[tx.type];
                const Icon = style.icon;
                return (
                  <tr key={tx.id} className="transition-colors hover:bg-[var(--color-surface)]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg p-1.5 ${style.cls}`}>
                          <Icon size={14} />
                        </div>
                        <span className="capitalize font-medium text-[var(--color-text-dark)]">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{tx.task}</td>
                    <td className={`px-6 py-4 font-semibold ${tx.amount > 0 ? "text-[var(--color-success)]" : "text-[var(--color-text-dark)]"}`}>
                      {style.prefix}{Math.abs(tx.amount).toLocaleString()} ECO
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">{tx.date}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        tx.status === "confirmed" ? "bg-[var(--color-surface-muted)] text-[var(--color-success)]" : "bg-[var(--color-surface-muted)] text-[var(--color-brand-accent)]",
                      )}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "staking" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-base font-semibold text-[var(--color-text-dark)]">Staking Position</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">Staked Amount</span>
                <span className="text-sm font-semibold text-[var(--color-text-dark)]">{balance.staked.toLocaleString()} ECO</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">APY</span>
                <span className="text-sm font-semibold text-[var(--color-success)]">8.2%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">Lock Period</span>
                <span className="text-sm font-semibold text-[var(--color-text-dark)]">30 days</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">Unlocks</span>
                <span className="text-sm font-semibold text-[var(--color-text-dark)]">May 15, 2026</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 rounded-xl bg-[var(--color-text-dark)] py-2.5 text-sm font-medium text-[var(--color-text-inverse)] transition-opacity hover:opacity-80">
                Stake More
              </button>
              <button className="flex-1 rounded-xl border border-[var(--color-surface-muted)] py-2.5 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-surface-muted)]">
                Unstake
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-base font-semibold text-[var(--color-text-dark)]">Rewards</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">Earned (Pending)</span>
                <span className="text-sm font-semibold text-[var(--color-success)]">{balance.pendingRewards.toLocaleString()} ECO</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">Lifetime Staking Rewards</span>
                <span className="text-sm font-semibold text-[var(--color-text-dark)]">312 ECO</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">Next Payout</span>
                <span className="text-sm font-semibold text-[var(--color-text-dark)]">Apr 22, 2026</span>
              </div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-[var(--color-success)] py-2.5 text-sm font-medium text-[var(--color-text-inverse)] transition-opacity hover:opacity-80">
              Claim Rewards
            </button>
          </div>
        </div>
      )}

      {/* Bridge link */}
      <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text-dark)]">Bridge ECO Tokens</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Transfer ECO between Initia and other supported networks.
            </p>
          </div>
          <a
            href="/bridge"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-surface-muted)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-border-hover)]"
          >
            Open Bridge <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
