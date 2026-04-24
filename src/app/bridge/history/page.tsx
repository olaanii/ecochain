"use client";

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, Clock, AlertCircle, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { ProductShell } from "@/components/layout/product-shell";

interface BridgeTransaction {
  id: string;
  amount: number;
  denom: string;
  status: string;
  targetChain?: string;
  transactionLink?: string;
  timestamp: string;
  builder?: string;
}

const STATUS_ICONS: Record<string, any> = {
  completed: CheckCircle,
  queued: Clock,
  failed: AlertCircle,
};

const STATUS_STYLES: Record<string, string> = {
  completed: "text-[var(--color-success)] bg-[var(--color-success)]/10",
  queued: "text-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/10",
  failed: "text-red-600 bg-red-50",
};

export default function BridgeHistoryPage() {
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/bridge');
        const data = await res.json();
        if (data.history) {
          setTransactions(data.history);
        }
      } catch (err) {
        console.error('Failed to fetch bridge history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "completed").length,
    pending: transactions.filter((t) => t.status === "queued").length,
    totalVolume: transactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
  };

  if (loading) {
    return (
      <ProductShell>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
          </div>
        </div>
      </ProductShell>
    );
  }

  return (
    <ProductShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Bridge History
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Track your cross-chain transfers and bridge transactions.
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
        <div className="space-y-4">
          {transactions.length === 0 ? (
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
          ) : (
            transactions.map((tx) => {
              const StatusIcon = STATUS_ICONS[tx.status] || Clock;
              const statusStyle = STATUS_STYLES[tx.status] || STATUS_STYLES.queued;

              return (
                <div
                  key={tx.id}
                  className="rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 ${statusStyle}`}>
                          <StatusIcon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-dark)]">
                            {tx.denom} → {tx.targetChain || 'Unknown'}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[var(--color-text-dark)]">
                          {tx.amount.toLocaleString()} {tx.denom}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] capitalize">{tx.status}</p>
                      </div>
                    </div>
                    {tx.transactionLink && (
                      <a
                        href={tx.transactionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[var(--color-brand-secondary)] hover:underline"
                      >
                        <ExternalLink size={12} />
                        View Transaction
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ProductShell>
  );
}
