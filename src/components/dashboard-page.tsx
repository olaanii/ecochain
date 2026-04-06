"use client";

import { useState } from "react";
import { ChartLine, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { InterwovenKit, useInterwovenKit } from "@initia/interwovenkit-react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { fallbackDashboard, type EcoDataResponse } from "@/lib/dashboard-data";
import {
  hasClerkSetup,
  runtimeConfig,
  setupChecklist,
} from "@/lib/runtime-config";

const fetchEcoData = async () =>
  fetch("/api/tasks").then((response) => response.json() as Promise<EcoDataResponse>);

export function DashboardPage() {
  const { data, refetch } = useQuery({
    queryKey: ["ecoData"],
    queryFn: fetchEcoData,
    staleTime: 1000 * 60,
    initialData: fallbackDashboard,
  });

  const { address, openConnect, openWallet } = useInterwovenKit();
  const walletConnected = !!address;
  const walletReady = hasClerkSetup && walletConnected;
  const missingSetup = setupChecklist.filter((item) => !item.value);

  const [formValues, setFormValues] = useState({
    taskId: "transit-commute",
    proof: "",
    geo: "",
    proofType: "photo",
  });
  const [verifyStatus, setVerifyStatus] = useState("");
  const [redeemStatus, setRedeemStatus] = useState("");
  const [ledger, setLedger] = useState<
    Array<{ id: string; taskId: string; reward: number; mintedAt: string }>
  >([]);

  const dashboard = data ?? fallbackDashboard;
  const tasks = dashboard.tasks;
  const rewards = dashboard.rewards;
  const leaderboard = dashboard.leaderboard;
  const proposals = dashboard.proposals;
  const analytics = dashboard.analytics;
  const mission = dashboard.mission;
  const content = dashboard.content;
  const compliance = dashboard.compliance;
  const chainStatus = dashboard.chainStatus;
  const bridgeHistory = dashboard.bridgeHistory;
  const economics = dashboard.economics;

  const missionSummary = mission.join(" - ");

  const handleVerify = async () => {
    if (!walletReady) {
      setVerifyStatus("Connect your Initia wallet to unlock verification services.");
      return;
    }

    if (!formValues.taskId || !formValues.proof) {
      setVerifyStatus("Select a task and attach proof before verifying.");
      return;
    }

    setVerifyStatus("Verifying proof...");
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: formValues.taskId,
        proofHash: formValues.proof,
        geoHash: formValues.geo,
        submittedAt: Date.now(),
        proofType: formValues.proofType,
        oracleSource: "demo-oracle",
        oracleConfidence: 0.92,
        proofDetails:
          formValues.proofType === "transit"
            ? { tapId: formValues.proof }
            : formValues.proofType === "weight"
              ? { weight: Number(formValues.proof || "0") }
              : { imageHash: formValues.proof },
      }),
    });

    const payload = await response.json();
    if (payload.result?.verified) {
      setVerifyStatus(
        `Verified ${payload.result.taskName} - minted ${payload.result.rewardDelta} INITIA.`,
      );
      setLedger(payload.ledger);
      await refetch();
    } else {
      setVerifyStatus(payload.result?.reason ?? "Verification failed.");
    }
  };

  const handleRedeem = async (rewardId: string) => {
    if (!walletReady) {
      setRedeemStatus("Wallet connection required to redeem rewards.");
      return;
    }

    setRedeemStatus("Redeeming reward...");
    const response = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rewardId,
        initiaAddress: address || "not-connected",
        initiaUsername: "eco-builder",
        displayName: "EcoLoop Builder",
        region: "Global",
      }),
    });

    const payload = await response.json();
    if (payload.success) {
      setRedeemStatus(`Redeemed ${payload.reward.title} - balance ${payload.balanceAfter} INITIA.`);
      await refetch();
    } else {
      setRedeemStatus(payload.reason ?? "Redemption failed.");
    }
  };

  const heroStats = [
    { label: "Initia revenue captured", value: "100%", detail: "No sequencer cut" },
    { label: "Block time", value: "100ms", detail: "Instant bridging" },
    { label: "Auto-sign", value: "Enabled", detail: "Session UX ready" },
  ];

  return (
    <main className="app-shell mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-6 lg:px-6 lg:py-8">
      <TopNavBar variant="app" />
      <div className="hero-orb" />
      <div className="hero-orb alt" />
      {missingSetup.length > 0 && (
        <section className="surface relative overflow-hidden rounded-4xl border border-amber-400/20 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300">
                Setup required
              </p>
              <h2 className="text-lg font-semibold text-white">
                Application setup in progress.
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">
                The dashboard load, but the core features require the platform environment configuration.
                Add the required keys to `.env` to fully unlock the experience.
              </p>
            </div>
            <div className="grid gap-2 text-xs text-slate-200">
              {missingSetup.map((item) => (
                <div
                  key={item.env}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="font-mono text-[11px] text-amber-200">{item.env}</p>
                  <p className="text-[11px] text-slate-400">
                    {item.required
                      ? "Required for secure user sessions."
                      : "Optional configuration for enhanced services."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <header className="surface relative overflow-hidden rounded-[2.5rem] px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300/90">
              Initia Hackathon - Season 1
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
              EcoLoop - verified eco-actions, appchain-owned revenue
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              Launch a sustainability-native appchain with Auto-sign, instant bridging, DAO
              governance, and a marketplace for eco-rewards. Everything runs on Initia
              infrastructure, so builders can focus on UX and go-to-market while we keep every
              transaction in-house.
              <a
                href="https://docs.initia.xyz/hackathon/get-started"
                target="_blank"
                rel="noreferrer"
                className="ml-2 font-semibold text-emerald-300 underline decoration-emerald-300/60 underline-offset-4"
              >
                Initia hackathon guide
              </a>
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {hasClerkSetup ? (
                <ClerkActionSlot />
              ) : (
                <Button type="button" className="cursor-not-allowed opacity-70" disabled>
                  Clerk setup required
                </Button>
              )}
              {walletConnected ? <WalletActionSlot /> : <WalletActionFallbackSlot onConnect={openConnect} />}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "Proof -> reward -> redemption -> bridge",
                "Auto-sign ready",
                "Oracle-backed verification",
              ].map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {heroStats.map((stat) => (
              <div key={stat.label} className="surface-muted rounded-3xl px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-200/90">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card title="Initia network">
          <div className="space-y-2 text-sm text-gray-200">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              {chainStatus?.status ?? "Loading status"}
            </p>
            <p className="font-semibold text-white">
              Chain: {chainStatus?.chainId ?? runtimeConfig.initiaChainId}
            </p>
            <p className="text-xs text-gray-400">Block time: {chainStatus?.blockTime ?? "100ms"}</p>
            <p className="text-xs text-gray-400">Auto-sign: {chainStatus?.autoSign ?? "Enabled"}</p>
            <p className="break-all text-xs text-gray-400">
              Tx evidence: {chainStatus?.txnEvidence ?? "pending"}
            </p>
            <a
              href={chainStatus?.deploymentLink ?? "https://docs.initia.xyz/hackathon/get-started"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-xs font-semibold text-emerald-300 underline"
            >
              Deployment link
            </a>
          </div>
        </Card>
        <Card title="Reward economics">
          <div className="space-y-3 text-sm text-gray-200">
            <p className="text-2xl font-semibold text-white">{economics?.minted ?? "0 INITIA"}</p>
            <p className="text-xs text-gray-400">Minted rewards retained on Initia</p>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Reclaimed: {economics?.redemptions ?? "0 INITIA"}
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Rebate pool: {economics?.rebatePool ?? "0 INITIA"}
            </p>
            <p className="text-xs text-gray-400">
              Staking snapshot: {economics?.stakingSnapshot ?? "No live data yet"}
            </p>
          </div>
        </Card>
        <Card title="Bridge history">
          <div className="space-y-3 text-sm text-gray-200">
            {bridgeHistory.length > 0 ? (
              bridgeHistory.slice(0, 3).map((entry) => (
                <div key={entry.id} className="space-y-1 rounded-xl border border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">
                      {entry.amount} {entry.denom}
                    </p>
                    <Badge>{entry.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    {entry.builder} - {entry.targetChain}
                  </p>
                  <a
                    href={entry.transactionLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-300 underline"
                  >
                    View txn
                  </a>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">
                Bridge requests will appear here after deposit or withdraw actions.
              </p>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card title="Auto-sign & bridging">
          {walletConnected ? (
            <WalletBridgeSlot missionSummary={missionSummary} />
          ) : (
            <WalletBridgeFallback missionSummary={missionSummary} onConnect={openConnect} />
          )}
        </Card>
        <Card title="Verify and redeem">
          <div className="space-y-3">
            <div className="flex flex-col gap-3">
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                value={formValues.taskId}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    taskId: event.target.value,
                  }))
                }
              >
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                value={formValues.proofType}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    proofType: event.target.value,
                  }))
                }
              >
                <option value="photo">Photo proof</option>
                <option value="transit">Transit tap</option>
                <option value="weight">Weight proof</option>
              </select>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Proof hash, URL, or tap ID"
                value={formValues.proof}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, proof: event.target.value }))
                }
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Geo hash or witness code"
                value={formValues.geo}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, geo: event.target.value }))
                }
              />
            </div>
            <Button onClick={handleVerify}>Submit proof</Button>
            <p className="text-xs text-emerald-200">{verifyStatus}</p>
            <p className="text-xs text-sky-200">{redeemStatus}</p>
            {ledger.length > 0 && (
              <div className="space-y-2 text-xs text-gray-400">
                <p className="text-xs text-emerald-200">Latest minted rewards</p>
                {ledger.slice(0, 3).map((entry) => (
                  <p key={entry.id}>
                    {entry.taskId} - {entry.reward} INITIA -{" "}
                    {new Date(entry.mintedAt).toLocaleTimeString()}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Live eco tasks</h2>
        <div className="page-grid">
          {tasks.map((task) => (
            <div key={task.id} className="glass-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                <Badge>{task.category}</Badge>
              </div>
              <p className="text-sm text-gray-300">{task.description}</p>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-emerald-300">
                <Sparkles size={14} />
                <span>
                  Base {task.baseReward} INITIA - x{task.bonusMultiplier.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">{task.verificationHint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card title="Leaderboard">
          <div className="space-y-3 text-sm text-gray-100">
            {leaderboard.map((entry) => (
              <div key={entry.name} className="space-y-1 rounded-xl border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{entry.name}</p>
                  <Badge>{entry.region}</Badge>
                </div>
                <p className="text-xs text-gray-400">
                  {entry.points} points - {entry.streakDays} day streak
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Rewards catalog">
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="space-y-1 text-sm text-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{reward.title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
                    {reward.cost} INITIA
                  </span>
                </div>
                <p className="text-xs text-gray-400">{reward.subtitle}</p>
                <p className="text-[11px] text-gray-500">Partner: {reward.partner}</p>
                <Button className="mt-2" onClick={() => handleRedeem(reward.id)}>
                  Redeem
                </Button>
              </div>
            ))}
          </div>
        </Card>
        <Card title="DAO and governance">
          <div className="space-y-4 text-sm text-gray-200">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="space-y-1 rounded-xl border border-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                  {proposal.status}
                </p>
                <h3 className="text-base font-semibold text-white">{proposal.title}</h3>
                <p className="text-[12px] text-gray-400">{proposal.description}</p>
                <p className="text-[11px] text-gray-500">
                  For {proposal.votesFor} - Against {proposal.votesAgainst}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-6 lg:grid lg:grid-cols-3">
        <div className="panel space-y-3">
          <div className="flex items-center gap-3">
            <Leaf className="text-emerald-300" />
            <h3 className="text-lg font-semibold">Impact analytics</h3>
          </div>
          <div className="space-y-4">
            {analytics.map((point) => (
              <div key={point.label} className="space-y-1">
                <p className="text-sm font-semibold text-white">{point.label}</p>
                <p className="text-2xl font-bold text-emerald-300">{point.value}</p>
                <p className="text-[11px] text-gray-400">{point.trend}</p>
                <p className="text-xs text-gray-500">{point.insight}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel space-y-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-300" />
            <h3 className="text-lg font-semibold">Fairness and compliance</h3>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
            {compliance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel space-y-3">
          <div className="flex items-center gap-3">
            <ChartLine className="text-emerald-300" />
            <h3 className="text-lg font-semibold">Education and community</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-100">
            {content.map((row) => (
              <div key={row.title} className="space-y-1 rounded-xl border border-emerald-400/20 p-3">
                <p className="text-sm font-semibold text-white">{row.title}</p>
                <p className="text-xs text-gray-300">{row.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ClerkActionSlot() {
  const { isLoaded, user } = useUser();

  if (!hasClerkSetup) {
    return (
      <Button type="button" className="cursor-not-allowed opacity-70" disabled>
        Clerk setup required
      </Button>
    );
  }

  if (!isLoaded) {
    return (
      <Button type="button" className="cursor-progress" disabled>
        Loading auth...
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {user ? (
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-3 py-2">
          <UserButton />
          <span className="max-w-44 truncate text-sm text-slate-200">
            {user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "Signed in"}
          </span>
        </div>
      ) : (
        <>
        <SignInButton mode="modal">
          <Button>Sign in with Clerk</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button>Sign up</Button>
        </SignUpButton>
        </>
      )}
    </div>
  );
}

function WalletActionSlot() {
  const { openBridge, openWallet, openDeposit, openWithdraw } = useInterwovenKit();

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={openWallet}>
        Manage wallet
      </Button>
      <Button type="button" onClick={() => openBridge({ srcChainId: runtimeConfig.initiaChainId })}>
        Open bridge
      </Button>
      <Button type="button" onClick={() => openDeposit({ denoms: ["INITIA"] })}>
        Deposit
      </Button>
      <Button type="button" onClick={() => openWithdraw({ denoms: ["INITIA"] })}>
        Withdraw
      </Button>
    </div>
  );
}

function WalletActionFallbackSlot({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={onConnect}>
        Connect Initia wallet
      </Button>
      <Button type="button" className="cursor-not-allowed opacity-70" disabled title="Connect wallet to unlock bridge">
        Bridge locked
      </Button>
    </div>
  );
}

function WalletBridgeSlot({ missionSummary }: { missionSummary: string }) {
  const { openBridge, openWallet, openDeposit, openWithdraw, address, username } =
    useInterwovenKit();

  return (
    <>
      <div className="space-y-3 text-sm text-gray-200">
        <p>
          Connected wallet:{" "}
          <span className="font-mono text-white">
            {username || address || runtimeConfig.initiaChainId}
          </span>
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{missionSummary}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openWallet()}>Open wallet</Button>
          <Button onClick={() => openBridge({ srcChainId: runtimeConfig.initiaChainId })}>
            Open Interwoven bridge
          </Button>
          <Button onClick={() => openDeposit({ denoms: ["INITIA"] })}>Deposit</Button>
          <Button onClick={() => openWithdraw({ denoms: ["INITIA"] })}>Withdraw</Button>
        </div>
      </div>
      <div className="mt-6">
        <InterwovenKit bridge={{}} />
      </div>
    </>
  );
}

function WalletBridgeFallback({ missionSummary, onConnect }: { missionSummary: string; onConnect: () => void }) {
  return (
    <>
      <div className="space-y-3 text-sm text-gray-200">
        <p>
          Connected wallet: <span className="font-mono text-emerald-400">Wallet connection required</span>
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{missionSummary}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onConnect}>
            Connect
          </Button>
          <Button className="cursor-not-allowed opacity-70" disabled>
            Open Interwoven bridge
          </Button>
          <Button className="cursor-not-allowed opacity-70" disabled>
            Deposit
          </Button>
          <Button className="cursor-not-allowed opacity-70" disabled>
            Withdraw
          </Button>
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5 text-xs text-slate-300">
        Interwoven bridge widgets appear here once you connect your Initia wallet.
      </div>
    </>
  );
}
