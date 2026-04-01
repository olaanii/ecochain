"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  Leaf,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useInterwovenKit } from "@initia/interwovenkit-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { fallbackDashboard, type EcoDataResponse } from "@/lib/dashboard-data";
import { initiaSubmission } from "@/lib/initia/submission";
import { hasClerkSetup, hasWalletDemoSetup } from "@/lib/runtime-config";
import { useEcoContracts } from "@/hooks/use-eco-contracts";
import { useState } from "react";


const fetchEcoData = async () =>
  fetch("/api/tasks").then((response) => response.json() as Promise<EcoDataResponse>);

export default function Home() {
  const { ecoBalance, submitProof, isSubmitting } = useEcoContracts();
  const [lastSubmissionTx, setLastSubmissionTx] = useState<string | null>(null);

  const handleVerifyFeatured = async () => {
    try {
      // Mock proof submission for the featured task
      const taskId = "low_impact_commute";
      const mockProofHash = `proof_${Date.now()}`;
      const timestamp = Math.floor(Date.now() / 1000);
      
      submitProof(taskId, mockProofHash, timestamp);
      setLastSubmissionTx("Transaction initiated...");
    } catch (e) {
      console.error("Verification failed", e);
    }
  };

  const { data } = useQuery({
    queryKey: ["landingData"],
    queryFn: fetchEcoData,
    staleTime: 1000 * 60,
    initialData: fallbackDashboard,
  });

  const dashboard = data ?? fallbackDashboard;
  const featuredTask = dashboard.tasks[0];
  const proofFeed = dashboard.bridgeHistory.slice(0, 3);
  const stats = [
    {
      label: "Total ECO impact",
      value: dashboard.analytics[0]?.value ?? "1.2M+ actions",
      detail: dashboard.analytics[0]?.trend ?? "Live mission growth",
    },
    {
      label: "Active verifiers",
      value: (dashboard.leaderboard.length * 10725).toLocaleString(),
      detail: "Across transit, recycling, energy, and community pilots",
    },
    {
      label: "Rewards retained",
      value: dashboard.economics.minted,
      detail: "Revenue stays inside the appchain economy",
    },
  ];

  return (
    <main className="landing-shell">
      <div className="landing-backdrop" />
      <TopNavBar variant="landing" brandName="EcoLoop" />

      <section
        id="discover"
        className="landing-section relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 pb-20 pt-32 lg:px-8"
      >
        <div className="landing-grid">
          <div className="max-w-3xl space-y-7">
            <Badge className="landing-pill">
              Live on Initia - Auto-sign - Bridge enabled
            </Badge>
            <div className="space-y-5">
              <h1 className="landing-headline text-balance">
                Verified climate action with an appchain that keeps the upside.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                EcoLoop turns real-world sustainability work into on-chain proof, instant rewards,
                and community-owned governance. Builders get Initia’s fast block times, bridge
                flows, and wallet UX while users earn for transit, recycling, and restoration.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {hasWalletDemoSetup ? <LandingWalletActions /> : <LandingWalletFallback />}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open demo dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {dashboard.mission.slice(0, 4).map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>

          <div className="landing-planet-card">
            <div className="landing-planet-glow" />
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-lime-200">
                  Chain status
                </p>
                <span className="rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-lime-100">
                  {dashboard.chainStatus.status}
                </span>
              </div>
              <div>
                <p className="text-4xl font-black tracking-tight text-white">
                  {dashboard.chainStatus.chainId}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  100ms block time, wallet sessions, and native bridging give EcoLoop a full-stack
                  product feel without exposing users to infra complexity.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricChip
                  label="Block time"
                  value={dashboard.chainStatus.blockTime}
                />
                <MetricChip
                  label="Auto-sign"
                  value={dashboard.chainStatus.autoSign}
                />
                <MetricChip
                  label="Bridge requests"
                  value={dashboard.economics.bridgeRequests}
                />
                <MetricChip
                  label="Rebate pool"
                  value={dashboard.economics.rebatePool}
                />
              </div>
              <a
                href={dashboard.chainStatus.txnEvidence}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-lime-200 underline decoration-lime-200/60 underline-offset-4"
              >
                View live transaction evidence
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section border-y border-white/8 bg-black/20 px-5 py-10 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="landing-stat-card">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{stat.label}</p>
              <p className="mt-3 text-4xl font-black tracking-tight text-white">{stat.value}</p>
              <p className="mt-3 text-sm text-lime-200">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="verify" className="landing-section px-5 py-24 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="landing-kicker">Proof of restoration</p>
            <h2 className="landing-title">Connect, verify, earn</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              EcoLoop compresses the full sustainability loop into a product judges can grasp in
              seconds: connect a wallet, submit proof, mint rewards, and keep the value inside the
              Initia economy.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <FlowCard
              icon={<Wallet size={30} />}
              title="Connect"
              description="Use InterwovenKit for wallet sessions, Auto-sign, and native Initia onboarding."
            />
            <FlowCard
              icon={<ShieldCheck size={30} />}
              title="Verify"
              description="Submit sensor, transit, image, or weight evidence through verifiable proof routes."
            />
            <FlowCard
              icon={<Coins size={30} />}
              title="Earn"
              description="Mint rewards on the appchain and redeem them across missions, rebates, and local partners."
            />
          </div>
        </div>
      </section>

      <section id="stake" className="landing-section bg-black/20 px-5 py-24 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="landing-kicker">Utility layer</p>
              <h2 className="landing-title">A token economy built for climate coordination</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Rewards, staking, governance, and redemptions all reinforce the same loop: verify
                impact, route value through the chain, and give the community a reason to keep
                contributing.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-lime-200 transition hover:text-white"
            >
              Explore the live dashboard
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="landing-bento-grid">
            <article className="landing-feature-card lg:col-span-2 lg:row-span-2">
              <div className="landing-feature-overlay" />
              <div className="relative z-10 max-w-xl space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-lime-300/30 bg-lime-300/10 text-lime-100">
                    Featured mission
                  </Badge>
                  <Badge className="border-white/15 bg-black/20 text-white">High yield</Badge>
                </div>
                <h3 className="text-3xl font-black tracking-tight text-white">
                  {featuredTask?.name ?? "Amazon Basin Sensor Array"}
                </h3>
                <p className="text-base leading-7 text-slate-200">
                  {featuredTask?.description ??
                    "Verify carbon and biodiversity progress with multi-source field data."}
                </p>
                <p className="text-sm text-lime-200">
                  {featuredTask?.verificationHint ??
                    "Oracle-backed submissions connect imagery, weights, and transit data."}
                </p>
                <Button
                  onClick={handleVerifyFeatured}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:translate-x-1"
                >
                  {isSubmitting ? "Verifying..." : "Verify on-chain"}
                  <ArrowRight size={16} />
                </Button>
                {lastSubmissionTx && (
                  <p className="mt-3 text-xs text-lime-400">
                    Last update: {lastSubmissionTx}
                  </p>
                )}
              </div>
            </article>

            <article className="landing-panel-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white">
                    Redemption catalog
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Turn rewards into transport credits, eco-market vouchers, and partner perks.
                  </p>
                </div>
                <Sparkles className="text-lime-200" />
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {dashboard.rewards.slice(0, 3).map((reward) => (
                  <div
                    key={reward.id}
                    className="rounded-2xl border border-white/10 bg-black/25 px-3 py-6 text-center"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lime-100">
                      {reward.cost} ECO
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{reward.title}</p>
                  </div>
                ))}
              </div>
            </article>


            <article className="landing-panel-card">
              <ShieldCheck className="mb-4 text-lime-200" />
              <h3 className="text-xl font-black tracking-tight text-white">Privacy shield</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Hashes and audit trails stay public while identity-sensitive data remains tightly
                controlled.
              </p>
            </article>

            <article className="landing-panel-card">
              <Leaf className="mb-4 text-lime-200" />
              <h3 className="text-xl font-black tracking-tight text-white">DAO governance</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Token holders shape rebates, new regional missions, and treasury-backed growth
                campaigns.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="leaderboard" className="landing-section px-5 py-24 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div className="landing-proof-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-lime-200">
                    Live proof feed
                  </p>
                  <p className="mt-2 font-mono text-xs text-slate-400">
                    CHAIN_ID: {dashboard.chainStatus.chainId}
                  </p>
                </div>
                <Badge className="border-lime-300/30 bg-lime-300/10 text-lime-100">
                  stable
                </Badge>
              </div>
              <div className="space-y-3 font-mono text-xs">
                {proofFeed.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                    style={{ opacity: 1 - index * 0.14 }}
                  >
                    <span className="text-lime-200">
                      TX_{item.id.slice(0, 4).toUpperCase()}...{item.id.slice(-3).toUpperCase()}
                    </span>
                    <span className="text-slate-300">{item.builder}</span>
                    <span className="text-white">
                      {item.amount} {item.denom}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="landing-kicker">On-chain proof</p>
            <h2 className="landing-title">
              Transparent rewards. No greenwashing.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Every proof, bridge event, and reward distribution has a visible anchor on Initia.
              We combine oracle-backed checks, community oversight, and appchain-native economics so
              sustainability claims become something people can inspect instead of just trust.
            </p>

            <div className="mt-10 space-y-6">
              <FeatureRow
                title="Satellite and IoT oracles"
                description="Transit taps, recycling weights, and field imagery can all feed into the verification layer."
              />
              <FeatureRow
                title="Community consensus"
                description="Leaderboard momentum and DAO coordination turn verification into an active social loop."
              />
              <FeatureRow
                title="Reusable economic primitives"
                description="Rebates, staking, bridge flows, and catalog redemptions reinforce long-term participation."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section relative overflow-hidden bg-black/30 px-5 py-24 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <p className="landing-kicker">Ready for demo day</p>
          <h2 className="mt-2 text-balance text-4xl font-black tracking-tight text-white md:text-6xl">
            Open the dashboard, submit proof, and let Initia carry the infrastructure.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            EcoLoop is designed to feel like a polished product first and a chain deployment second.
            The demo route stays live, the landing page tells the story, and the proof loop is ready
            when judges click through.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {hasWalletDemoSetup ? <LandingWalletActions /> : <LandingWalletFallback />}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#090b08] px-5 py-10 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-2xl font-black tracking-tight text-lime-100">EcoLoop</p>
            <p className="mt-2 text-sm text-slate-400">
              Initia-native coordination for verified climate action.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-300">
            <Link href="/dashboard" className="transition hover:text-white">
              Dashboard
            </Link>
            <a
              href="https://docs.initia.xyz/hackathon/get-started"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Initia docs
            </a>
            <a
              href={initiaSubmission.deploymentLink}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Github
            </a>
            <a
              href={initiaSubmission.demoVideo}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Demo video
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function LandingWalletActions() {
  const { openConnect } = useInterwovenKit();

  return (
    <Button className="landing-primary-button px-6 py-3 text-sm" onClick={() => openConnect()}>
      Launch wallet session
    </Button>
  );
}

function LandingWalletFallback() {
  return (
    <Button className="landing-primary-button cursor-not-allowed px-6 py-3 text-sm opacity-70" disabled>
      Wallet setup required
    </Button>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function FlowCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="landing-step-card">
      <div className="landing-step-icon">{icon}</div>
      <h3 className="mt-6 text-2xl font-black tracking-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
    </article>
  );
}

function FeatureRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Sparkles className="text-lime-200" size={20} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
      </div>
    </div>
  );
}
