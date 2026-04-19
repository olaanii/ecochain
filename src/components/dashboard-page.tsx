"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { Leaf, Zap, Recycle, ArrowUpRight, ArrowDownRight, Lock, Send, RefreshCw, Plus } from "lucide-react";

import { ProductShell } from "@/components/layout/product-shell";
import { useWallet } from "@/contexts/wallet-context";
import { useWalletStore } from "@/stores/wallet-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { useUserStore } from "@/stores/user-store";
import { BalanceDisplay } from "@/components/balance-display";
import { TransactionFlow } from "@/components/transaction-flow";
import { ExplorerWidget } from "@/components/explorer-widget";
import { DashboardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";

type InterwovenKitActions = {
  openConnect?: () => void;
  openWallet?: () => void;
};

const activityIcons: Record<string, React.ReactNode> = {
  stake: <Leaf className="h-5 w-5 text-green-600" />,
  unstake: <ArrowDownRight className="h-5 w-5 text-yellow-600" />,
  claim: <Zap className="h-5 w-5 text-blue-600" />,
  verify: <Recycle className="h-5 w-5 text-purple-600" />,
  other: <ArrowUpRight className="h-5 w-5 text-gray-600" />,
};

export function DashboardPage() {
  const { initiaAddress, username, isConnected } = useWallet();
  const { balance } = useWalletStore();
  const { transactions, getRecentTransactions } = useTransactionStore();
  const { profile } = useUserStore();
  const kit = useInterwovenKit() as unknown as InterwovenKitActions;
  const [isLoading, setIsLoading] = useState(true);

  // Calculate impact metrics from user profile or use defaults
  const impactScore = profile.impactScore || 0;
  const totalRewards = profile.totalRewards || "0";

  // Staking metrics - fetch from API or contract
  const stakedAmount = "0.00";
  const stakingRewards = "0.00";
  const stakingAPY = "0.0";

  // Get recent transactions from store
  const recentActivities = getRecentTransactions(5).map((tx) => ({
    id: tx.id,
    title: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} transaction`,
    time: new Date(tx.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).toUpperCase(),
    amount: tx.amount || "0",
    type: tx.type,
    isPositive: tx.type === "claim" || tx.type === "verify",
    hash: tx.hash,
  }));

  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ProductShell>
        <DashboardSkeleton />
      </ProductShell>
    );
  }

  return (
    <ProductShell>
      <div className="flex flex-col gap-8 lg:gap-12">
        {/* Welcome Section */}
        <div className="max-w-[768px] pt-6 lg:pt-12">
          <h1 className="heading-1 text-[var(--color-text-dark)]">
            {isConnected && username ? (
              <>Welcome back, {username}.</>
            ) : (
              <>Quiet progress.<br />Meaningful impact.</>
            )}
          </h1>
          {isConnected && initiaAddress && (
            <p className="text-body mt-4 text-[var(--color-text-muted)]">
              {initiaAddress.slice(0, 8)}...{initiaAddress.slice(-6)}
            </p>
          )}
        </div>

        {/* Metric Cards Grid */}
        <div className="grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
          {/* Your Impact Card */}
          <div className="surface-card lg:col-span-4 flex min-h-[280px] flex-col items-start justify-end p-6 lg:p-8">
            <div className="mb-6 w-full">
              <p className="label-uppercase w-full">YOUR IMPACT</p>
            </div>
            <div className="mb-2 w-full">
              <p className="metric-value text-[56px] lg:text-[64px]">
                {impactScore.toLocaleString()}
              </p>
            </div>
            <div className="w-full">
              <p className="text-body">kg CO2 saved</p>
            </div>
          </div>

          {/* Current Balance Card */}
          <div className="lg:col-span-5">
            <div className="surface-secondary flex min-h-[280px] flex-col items-start justify-end overflow-hidden p-6 lg:p-8 relative">
              <div className="green-blur-accent bottom-[-128px] right-[-128px]" />
              <div className="flex flex-col gap-2 w-full">
                <div className="w-full">
                  <p className="label-uppercase w-full">CURRENT BALANCE</p>
                </div>
                <div className="w-full pt-4">
                  <BalanceDisplay 
                    showChange={true} 
                    className="metric-value-green text-[56px] lg:text-[64px]" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Staking Overview Card */}
          <div className="surface-card lg:col-span-3 flex min-h-[280px] flex-col items-start justify-between p-6 lg:p-8">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-[var(--color-primary)]" />
                <p className="label-uppercase w-full">STAKING</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Staked</p>
                  <p className="text-2xl font-bold">{stakedAmount} INIT</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Rewards</p>
                  <p className="text-lg font-bold text-[var(--color-primary)]">+{stakingRewards} INIT</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">APY</p>
                  <p className="text-lg font-bold">{stakingAPY}%</p>
                </div>
              </div>
            </div>
            <Link href="/staking" className="w-full">
              <Button variant="outline" className="w-full">
                Manage Staking
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Stake</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Unstake</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Send</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Recent Activity & Transaction Status */}
        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-12">
          {/* Recent Activity Section */}
          <div className="lg:col-span-8 flex flex-col gap-6 pb-12">
            <div className="w-full">
              <h2 className="heading-2 text-[var(--color-text-dark)]">
                Recent Activity
              </h2>
            </div>

            {recentActivities.length > 0 ? (
              <div className="flex flex-col gap-4 w-full">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="activity-item p-4 surface-card rounded-lg">
                    <div className="activity-icon">
                      <div className="icon-bg">
                        {activityIcons[activity.type] || activityIcons.other}
                      </div>
                    </div>
                    <div className="activity-content">
                      <div className="flex flex-col gap-1">
                        <p className="text-[var(--color-text-dark)] text-lg">
                          {activity.title}
                        </p>
                        <p className="label-uppercase">{activity.time}</p>
                      </div>
                      <p className={`font-medium ${activity.isPositive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`}>
                        {activity.isPositive ? "+" : "-"}{activity.amount} INIT
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="surface-card p-8 text-center">
                <p className="text-[var(--color-text-muted)]">
                  No recent activity. Start by making a transaction!
                </p>
              </div>
            )}

            <div className="flex flex-col items-start pt-4">
              <Link
                href="/rewards"
                className="text-[var(--color-primary)] label-action hover:opacity-80 transition-opacity"
              >
                VIEW FULL HISTORY
              </Link>
            </div>
          </div>

          {/* Transaction Status Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="heading-3 text-[var(--color-text-dark)]">
              Transaction Status
            </h2>
            <TransactionFlow />
          </div>
        </div>

        {/* Mobile Explorer */}
        <div className="lg:hidden">
          <ExplorerWidget />
        </div>
      </div>
    </ProductShell>
  );
}
