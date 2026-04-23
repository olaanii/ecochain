"use client";

import { ArrowRight, CheckCircle, Clock, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { ProductShell } from "@/components/layout/product-shell";

const BRIDGE_TRANSACTIONS = [
  {
    id: "1",
    from: "Initia",
    to: "Ethereum",
    amount: 1000,
    token: "ECO",
    status: "completed" as const,
    date: "Apr 18, 2026",
    txHash: "0x7a3f...9e2d",
    fee: 5,
    duration: "~5 mins",
  },
  {
    id: "2",
    from: "Ethereum",
    to: "Initia",
    amount: 500,
    token: "ECO",
    status: "pending" as const,
    date: "Apr 18, 2026",
    txHash: "0x4b8c...2a5f",
    fee: 8,
    duration: "~15 mins remaining",
  },
  {
    id: "3",
    from: "Initia",
    to: "Cosmos",
    amount: 250,
    token: "ECO",
    status: "completed" as const,
    date: "Apr 15, 2026",
    txHash: "0x9d2e...7c4b",
    fee: 3,
    duration: "~3 mins",
  },
  {
    id: "4",
    from: "Ethereum",
    to: "Initia",
    amount: 2000,
    token: "ECO",
    status: "failed" as const,
    date: "Apr 12, 2026",
    txHash: "0x1f3a...8b2e",
    fee: 0,
    duration: "Failed",
    error: "Insufficient gas",
  },
];

const STATUS_ICONS = {
  completed: CheckCircle,
  pending: Clock,
  failed: AlertCircle,
};

const STATUS_STYLES = {
  completed: "text-[var(--color-success)] bg-[var(--color-success)]/10",
  pending: "text-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/10",
  failed: "text-red-600 bg-red-50",
};

export default function BridgeHistoryPage() {
  const stats = {
    total: BRIDGE_TRANSACTIONS.length,
    completed: BRIDGE_TRANSACTIONS.filter((t) => t.status === "completed").length,
    pending: BRIDGE_TRANSACTIONS.filter((t) => t.status === "pending").length,
    totalVolume: BRIDGE_TRANSACTIONS.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <ProductShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Bridge History
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Track your cross-chain transfers and their status.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-xl font-semibold text-[var(--color-text-dark)]">{stats.total}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Total</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-xl font-semibold text-[var(--color-success)]">{stats.completed}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Completed</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-xl font-semibold text-[var(--color-brand-accent)]">{stats.pending}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Pending</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-xl font-semibold text-[var(--color-text-dark)]">
              {stats.totalVolume.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Volume</p>
          </div>
        </div>

        {/* Bridge Button */}
        <div className="mb-6">
          <Link
            href="/bridge"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-text-dark)] px-6 py-2.5 text-sm font-semibold text-[var(--color-text-inverse)] transition-opacity hover:opacity-90"
          >
            <RefreshCw size={16} />
            New Bridge Transfer
          </Link>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {BRIDGE_TRANSACTIONS.map((tx) => {
            const Icon = STATUS_ICONS[tx.status];
            return (
              <div
                key={tx.id}
                className="rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[tx.status]}`}>
                        <Icon size={12} />
                        <span className="capitalize">{tx.status}</span>
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">{tx.date}</span>
                    </div>

                    {/* Route */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-lg bg-[var(--color-surface-muted)] px-2 py-1 text-sm font-medium text-[var(--color-text-dark)]">
                        {tx.from}
                      </span>
                      <ArrowRight size={16} className="text-[var(--color-text-muted)]" />
                      <span className="rounded-lg bg-[var(--color-surface-muted)] px-2 py-1 text-sm font-medium text-[var(--color-text-dark)]">
                        {tx.to}
                      </span>
                    </div>

                    {/* Amount */}
                    <p className="mt-2 text-lg font-semibold text-[var(--color-text-dark)]">
                      {tx.amount.toLocaleString()} {tx.token}
                    </p>

                    {/* Details */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                      <span>Fee: {tx.fee} ECO</span>
                      <span>Duration: {tx.duration}</span>
                      <span className="font-mono">{tx.txHash}</span>
                    </div>

                    {tx.error && (
                      <p className="mt-2 text-xs text-red-600">
                        Error: {tx.error}
                      </p>
                    )}
                  </div>

                  <a
                    href="#"
                    className="ml-4 flex items-center gap-1 text-xs font-medium text-[var(--color-brand-secondary)] hover:underline"
                  >
                    View <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {BRIDGE_TRANSACTIONS.length === 0 && (
          <div className="py-12 text-center">
            <RefreshCw className="mx-auto mb-3 text-[var(--color-text-muted)]" size={32} />
            <p className="text-[var(--color-text-muted)]">No bridge transactions yet.</p>
            <Link
              href="/bridge"
              className="mt-2 inline-block text-sm font-medium text-[var(--color-brand-secondary)] hover:underline"
            >
              Start your first transfer
            </Link>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
