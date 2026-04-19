"use client";

import { ArrowRightLeft, ArrowUpRight, Coins, MoveUpRight, Wallet } from "lucide-react";
import { useInterwovenKit } from "@initia/interwovenkit-react";

import { ProductShell } from "@/components/layout/product-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWallet } from "@/contexts/wallet-context";
import { fallbackDashboard } from "@/lib/dashboard-data";
import { runtimeConfig } from "@/lib/runtime-config";

type InterwovenKitActions = {
  openConnect?: () => void;
  openWallet?: () => void;
  openBridge?: (options?: { srcChainId?: string }) => void;
  openDeposit?: (options?: { denoms?: string[] }) => void;
  openWithdraw?: (options?: { denoms?: string[] }) => void;
};

const transferRails = [
  {
    title: "Instant appchain top-up",
    description: "Fund operator sessions and reward pools directly from the wallet drawer.",
    action: "Deposit",
    color: "text-emerald-300",
  },
  {
    title: "Merchant settlement",
    description: "Route completed redemptions back through the treasury with clear status checkpoints.",
    action: "Withdraw",
    color: "text-sky-300",
  },
  {
    title: "Cross-chain routing",
    description: "Move value between Initia and partner ecosystems without leaving the workspace.",
    action: "Bridge",
    color: "text-amber-300",
  },
];

export default function BridgePage() {
  const { initiaAddress } = useWallet();
  const kit = useInterwovenKit() as unknown as InterwovenKitActions;

  return (
    <ProductShell
      title="Bridge operations"
      subtitle="A cleaner liquidity workspace for deposits, withdrawals, and cross-chain treasury movement."
    >
      <div className="space-y-8">
        <section className="surface overflow-hidden rounded-[2rem] px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <Badge>Bridge workspace</Badge>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Treat bridging like product infrastructure, not a disconnected modal flow.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  The new bridge view focuses on three operator outcomes: get liquidity in fast,
                  move value across chains with confidence, and keep settlement visible to the team
                  managing rewards and merchant redemptions.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    initiaAddress
                      ? kit.openBridge?.({ srcChainId: runtimeConfig.initiaChainId })
                      : kit.openConnect?.()
                  }
                >
                  {initiaAddress ? "Launch bridge" : "Connect to bridge"}
                  <ArrowUpRight size={15} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (initiaAddress ? kit.openWallet?.() : kit.openConnect?.())}
                >
                  Wallet overview
                  <Wallet size={15} />
                </Button>
              </div>
            </div>

            <Card title="Network readiness">
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                    Active source chain
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {fallbackDashboard.chainStatus.chainId}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Native Initia routing with {fallbackDashboard.chainStatus.blockTime} block time
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">ETA</p>
                    <p className="mt-3 text-lg font-semibold text-white">~ 2 minutes</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                      Fee estimate
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">$1.42</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {transferRails.map((rail) => (
            <Card key={rail.title}>
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white">
                  <ArrowRightLeft size={18} />
                </span>
                <span className={`text-sm font-semibold ${rail.color}`}>{rail.action}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{rail.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{rail.description}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card title="Quick bridge actions">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => (initiaAddress ? kit.openDeposit?.({ denoms: ["INITIA"] }) : kit.openConnect?.())}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
              >
                <Coins className="text-emerald-300" size={18} />
                <p className="mt-5 text-lg font-semibold text-white">Deposit liquidity</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Move fresh assets into the appchain treasury or operator wallet.
                </p>
              </button>
              <button
                type="button"
                onClick={() => (initiaAddress ? kit.openWithdraw?.({ denoms: ["INITIA"] }) : kit.openConnect?.())}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/10"
              >
                <MoveUpRight className="text-sky-300" size={18} />
                <p className="mt-5 text-lg font-semibold text-white">Withdraw funds</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Settle treasury movements, merchant payouts, or operator reimbursements.
                </p>
              </button>
            </div>
          </Card>

          <Card title="Recent liquidity events">
            <div className="space-y-3">
              {fallbackDashboard.bridgeHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {entry.amount} {entry.denom}
                      </p>
                      <p className="text-sm text-slate-400">{entry.builder}</p>
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
                      View proof
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </ProductShell>
  );
}
