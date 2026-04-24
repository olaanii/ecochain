"use client";

import { useState, useEffect } from "react";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Lock,
  Unlock,
  TrendingUp,
  ExternalLink,
  Loader2,
  Wallet,
} from "lucide-react";
import clsx from "clsx";
import { useWallet } from "@/contexts/wallet-context";

type Tab = "history" | "staking";

interface Balance {
  total: string;
  available: string;
  staked: string;
  pending: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  source: string;
  transactionHash: string | null;
  metadata: unknown;
  createdAt: string;
}

interface Stake {
  id: string;
  amount: string;
  apy: string;
  startTime: string;
  duration: number;
  endTime: string;
  status: string;
  accruedRewards: string;
}

export default function WalletPage() {
  const { isConnected, initiaAddress, address } = useWallet();
  const [tab, setTab] = useState<Tab>("history");
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch balance
        const balanceRes = await fetch(`/api/balance?address=${address}`);
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          if (balanceData.success) {
            setBalance(balanceData.balance);
          }
        }

        // Fetch transactions
        const txRes = await fetch('/api/transactions?limit=20');
        if (txRes.ok) {
          const txData = await txRes.json();
          if (txData.success) {
            setTransactions(txData.data);
          }
        }

        // Fetch stakes
        const stakeRes = await fetch('/api/stake');
        if (stakeRes.ok) {
          const stakeData = await stakeRes.json();
          if (stakeData.success) {
            setStakes(stakeData.stakes || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Wallet className="mx-auto mb-4 h-12 w-12 text-[var(--color-text-muted)]" />
          <p className="text-lg font-medium text-[var(--color-text-dark)]">Connect your wallet</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Connect your Initia wallet to view your balance and transactions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const available = balance ? Number(balance.available) / 1e18 : 0;
  const staked = balance ? Number(balance.staked) / 1e18 : 0;
  const pendingRewards = balance ? Number(balance.pending) / 1e18 : 0;
  const total = balance ? Number(balance.total) / 1e18 : 0;

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
          { label: "Available", value: available, icon: Coins, color: "text-[var(--color-success)]" },
          { label: "Staked", value: staked, icon: Lock, color: "text-[var(--color-brand-tertiary)]" },
          { label: "Pending Rewards", value: pendingRewards, icon: Clock, color: "text-[var(--color-brand-accent)]" },
          { label: "Total Balance", value: total, icon: TrendingUp, color: "text-[var(--color-brand-secondary)]" },
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
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Source</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-surface-muted)]">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const amount = Number(tx.amount) / 1e18;
                  const isPositive = amount >= 0;
                  const typeStyle = isPositive
                    ? { icon: ArrowDownLeft, cls: "text-[var(--color-success)] bg-[var(--color-surface-muted)]", prefix: "+" }
                    : { icon: Lock, cls: "text-[var(--color-brand-tertiary)] bg-[var(--color-surface-muted)]", prefix: "" };
                  const Icon = typeStyle.icon;
                  return (
                    <tr key={tx.id} className="transition-colors hover:bg-[var(--color-surface)]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-lg p-1.5 ${typeStyle.cls}`}>
                            <Icon size={14} />
                          </div>
                          <span className="capitalize font-medium text-[var(--color-text-dark)]">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">{tx.source || '—'}</td>
                      <td className={`px-6 py-4 font-semibold ${isPositive ? "text-[var(--color-success)]" : "text-[var(--color-text-dark)]"}`}>
                        {typeStyle.prefix}{Math.abs(amount).toLocaleString()} ECO
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "staking" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-base font-semibold text-[var(--color-text-dark)]">Staking Position</h2>
            {stakes.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No active stakes.</p>
            ) : (
              <div className="space-y-4">
                {stakes.map((stake) => {
                  const amount = Number(stake.amount) / 1e18;
                  const apy = Number(stake.apy) / 100;
                  const earned = Number(stake.accruedRewards) / 1e18;
                  return (
                    <div key={stake.id} className="rounded-xl bg-[var(--color-surface-muted)] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">Staked Amount</span>
                        <span className="text-sm font-semibold text-[var(--color-text-dark)]">{amount.toLocaleString()} ECO</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">APY</span>
                        <span className="text-sm font-semibold text-[var(--color-success)]">{apy}%</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">Lock Period</span>
                        <span className="text-sm font-semibold text-[var(--color-text-dark)]">{stake.duration} days</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">Unlocks</span>
                        <span className="text-sm font-semibold text-[var(--color-text-dark)]">
                          {new Date(stake.endTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">Earned</span>
                        <span className="text-sm font-semibold text-[var(--color-success)]">+{earned.toFixed(2)} ECO</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <a
                href="/stake"
                className="flex-1 rounded-xl bg-[var(--color-text-dark)] py-2.5 text-center text-sm font-medium text-[var(--color-text-inverse)] transition-opacity hover:opacity-80"
              >
                Stake More
              </a>
              <a
                href="/unstake"
                className="flex-1 rounded-xl border border-[var(--color-surface-muted)] py-2.5 text-center text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-surface-muted)]"
              >
                Unstake
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <h2 className="mb-4 text-base font-semibold text-[var(--color-text-dark)]">Rewards</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">Earned (Pending)</span>
                <span className="text-sm font-semibold text-[var(--color-success)]">{pendingRewards.toFixed(2)} ECO</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-muted)]">Lifetime Staking Rewards</span>
                <span className="text-sm font-semibold text-[var(--color-text-dark)]">
                  {stakes.reduce((sum, s) => sum + Number(s.accruedRewards) / 1e18, 0).toFixed(2)} ECO
                </span>
              </div>
            </div>
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
