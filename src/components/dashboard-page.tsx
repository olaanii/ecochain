"use client";

import { ArrowUpRight, Coins, ShieldCheck, Sparkles, Wallet, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useInterwovenKit } from "@initia/interwovenkit-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductShell } from "@/components/layout/product-shell";
import { useWallet } from "@/contexts/wallet-context";
import { fallbackDashboard, type EcoDataResponse } from "@/lib/dashboard-data";
import { runtimeConfig } from "@/lib/runtime-config";

const fetchEcoData = async () =>
  fetch("/api/tasks").then((response) => response.json() as Promise<EcoDataResponse>);

type InterwovenKitActions = {
  openConnect?: () => void;
  openWallet?: () => void;
  openBridge?: (options?: { srcChainId?: string }) => void;
  openDeposit?: (options?: { denoms?: string[] }) => void;
  openWithdraw?: (options?: { denoms?: string[] }) => void;
};

function formatAddress(address?: string, username?: string) {
  if (username) return username;
  if (!address) return "Wallet session required";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["ecoData"],
    queryFn: fetchEcoData,
    staleTime: 1000 * 60,
    initialData: fallbackDashboard,
  });

  const dashboard = data ?? fallbackDashboard;
  const { initiaAddress, username } = useWallet();
  const kit = useInterwovenKit() as unknown as InterwovenKitActions;
  const requireWallet = (callback?: () => void) => {
    if (!initiaAddress) {
      kit.openConnect?.();
      return;
    }

    callback?.();
  };

  const workspaceStats = [
    {
      label: "Revenue retained",
      value: dashboard.economics.minted,
      detail: "Every reward and redemption flows through the appchain treasury.",
    },
    {
      label: "Bridge requests",
      value: dashboard.economics.bridgeRequests,
      detail: "Cross-chain liquidity stays close to the operator workflow.",
    },
    {
      label: "Verification uptime",
      value: "99.98%",
      detail: "Proof routing, oracle checks, and fraud screening remain online.",
    },
    {
      label: "Wallet mode",
      value: dashboard.chainStatus.autoSign,
      detail: "Session-based signing keeps repeat actions fast and predictable.",
    },
  ];

  const operatorActions = [
    {
      label: "Wallet",
      description: "Review balances, assets, and account state.",
      onClick: () => (initiaAddress ? kit.openWallet?.() : kit.openConnect?.()),
      icon: Wallet,
    },
    {
      label: "Bridge",
      description: "Route value between Initia and partner ecosystems.",
      onClick: () => requireWallet(() => kit.openBridge?.({ srcChainId: runtimeConfig.initiaChainId })),
      icon: ArrowUpRight,
    },
    {
      label: "Deposit",
      description: "Move fresh liquidity into the operating treasury.",
      onClick: () => requireWallet(() => kit.openDeposit?.({ denoms: ["INITIA"] })),
      icon: Coins,
    },
    {
      label: "Withdraw",
      description: "Settle rewards or treasury transfers back to users.",
      onClick: () => requireWallet(() => kit.openWithdraw?.({ denoms: ["INITIA"] })),
      icon: Zap,
    },
  ];

  return (
    <ProductShell
      title="Operator dashboard"
      subtitle="A modern Initia-native workspace for verification, rewards, merchants, and bridge liquidity."
    >
      <div className="space-y-8">
        <section className="surface relative overflow-hidden rounded-[2rem] px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>Appchain-owned revenue</Badge>
                <Badge variant="info">Season 1 build</Badge>
              </div>

              <div className="space-y-4">
                <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  One control plane for verified eco-actions, settlement, and treasury growth.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  EcoChain turns proof submission, reward minting, merchant redemption, and
                  bridging into one SaaS-style workspace so operators can manage the whole climate
                  economy without jumping between fragmented tools.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {operatorActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      className="group rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-emerald-300/30 hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/12 text-emerald-200">
                          <Icon size={18} />
                        </span>
                        <ArrowUpRight
                          size={16}
                          className="text-slate-500 transition group-hover:text-white"
                        />
                      </div>
                      <p className="mt-5 text-base font-semibold text-white">{action.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{action.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4">
              <Card title="Operator session" className="h-full">
                <div className="space-y-5">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">
                      Connected identity
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {formatAddress(initiaAddress, username)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {initiaAddress
                        ? "Wallet session active and ready for bridge, redemption, and proof flows."
                        : "Connect an Initia wallet to unlock operator controls and bridge actions."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                        Chain
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {dashboard.chainStatus.chainId}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                        Block time
                      </p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {dashboard.chainStatus.blockTime}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      if (initiaAddress) {
                        kit.openWallet?.();
                        return;
                      }

                      kit.openConnect?.();
                    }}
                  >
                    {initiaAddress ? "Open wallet workspace" : "Connect Initia wallet"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {workspaceStats.map((stat) => (
            <Card key={stat.label}>
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{stat.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{stat.detail}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card title="Verification pipeline">
            <div className="space-y-4">
              {dashboard.tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-white">{task.name}</p>
                      <Badge>{task.category}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{task.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.28em] text-emerald-300">
                      {task.verificationHint}
                    </p>
                  </div>
                  <div className="min-w-40 rounded-[1.25rem] border border-emerald-300/15 bg-emerald-300/8 p-4 text-left">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                      Reward profile
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {task.baseReward} INITIA
                    </p>
                    <p className="mt-2 text-sm text-emerald-300">
                      Multiplier x{task.bonusMultiplier.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Bridge and redemption">
            <div className="space-y-4">
              {dashboard.bridgeHistory.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {entry.amount} {entry.denom}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">{entry.builder}</p>
                    </div>
                    <Badge variant="success">{entry.status}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                    <span>{entry.targetChain}</span>
                    <a
                      href={entry.transactionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-emerald-300"
                    >
                      View transaction
                    </a>
                  </div>
                </div>
              ))}

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">
                  Merchant catalog snapshot
                </p>
                <div className="mt-4 space-y-3">
                  {dashboard.rewards.slice(0, 3).map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{reward.title}</p>
                        <p className="text-sm text-slate-400">{reward.partner}</p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-300">
                        {reward.cost} ECO
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card title="Ecosystem momentum">
            <div className="space-y-4">
              {dashboard.analytics.map((point) => (
                <div key={point.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{point.label}</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-2xl font-semibold text-white">{point.value}</p>
                    <p className="text-sm font-medium text-emerald-300">{point.trend}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{point.insight}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card title="Governance queue">
              <div className="space-y-3">
                {dashboard.proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-semibold text-white">{proposal.title}</p>
                      <Badge variant="warning">{proposal.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {proposal.description}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                      For {proposal.votesFor} / Against {proposal.votesAgainst}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Leaderboard">
              <div className="space-y-3">
                {dashboard.leaderboard.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{entry.name}</p>
                        <p className="text-sm text-slate-400">{entry.region}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{entry.points}</p>
                      <p className="text-sm text-emerald-300">{entry.streakDays} day streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {dashboard.compliance.map((item) => (
            <div
              key={item}
              className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                  <ShieldCheck size={18} />
                </span>
                <p className="text-sm font-medium leading-6 text-slate-200">{item}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </ProductShell>
  );
}
