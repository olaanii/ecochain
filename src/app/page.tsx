"use client";

import Link from "next/link";
import { Leaf, ShieldCheck, Coins, ArrowRight, Users, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { useState, useEffect } from "react";

export default function Home() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [protocolStats, setProtocolStats] = useState({
    totalActions: 0,
    totalRewards: 0,
    activeUsers: 0,
    tvl: 0,
  });

  // Fetch live protocol stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/protocol');
        if (response.ok) {
          const data = await response.json();
          setProtocolStats(data);
        } else {
          // Fallback to zero values if API fails
          setProtocolStats({
            totalActions: 0,
            totalRewards: 0,
            activeUsers: 0,
            tvl: 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch protocol stats:', error);
        setProtocolStats({
          totalActions: 0,
          totalRewards: 0,
          activeUsers: 0,
          tvl: 0,
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--color-surface)]">
      <TopNavBar variant="landing" />

      {/* ── Main Canvas ──────────────────────────── */}
      <div className="mx-auto flex max-w-[1440px] flex-col gap-32 px-6 lg:px-24 pt-16">
        {/* ── Hero Section ───────────────────────── */}
        <section className="relative flex min-h-[600px] lg:min-h-[870px] flex-col justify-center pb-24 lg:pb-72 pt-32 lg:pt-64">
          {/* Decorative accent — right side */}
          <div className="absolute right-[-96px] top-16 hidden h-[400px] lg:h-[614px] w-[300px] lg:w-[427px] items-center justify-center overflow-hidden rounded-bl-3xl rounded-tl-3xl bg-[var(--color-secondary-alt)] opacity-80 lg:flex">
            <div className="green-blur-accent inset-0" />
          </div>

          {/* Hero text content */}
          <div className="relative max-w-[896px]">
            <h1 className="heading-display text-[var(--color-text-dark)]">
              Impact, Refined.
            </h1>

            <p className="text-body-lg mt-8 max-w-[718px]">
              Transform real-world actions into verified rewards on the Initia network.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                Connect Wallet
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/dashboard"
                className="btn-outline inline-flex"
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ── Process Section (Act / Verify / Earn) ─ */}
        <section className="grid grid-cols-1 gap-8 lg:gap-16 pb-12 lg:pb-24 md:grid-cols-3">
          {/* Step 1: Act */}
          <div className="pt-0">
            <ProcessStep
              icon={<Leaf className="h-6 w-6 text-[var(--color-primary)]" />}
              title="Act"
              description="Engage in verifiable ecological actions within your local environment."
            />
          </div>

          {/* Step 2: Verify — offset down */}
          <div className="pt-0 md:pt-16">
            <ProcessStep
              icon={<ShieldCheck className="h-6 w-6 text-[var(--color-primary)]" />}
              title="Verify"
              description="Our decentralized oracle network cryptographically proves your contribution."
            />
          </div>

          {/* Step 3: Earn — offset further */}
          <div className="pt-0 md:pt-32">
            <ProcessStep
              icon={<Coins className="h-6 w-6 text-[var(--color-primary)]" />}
              title="Earn"
              description="Receive protocol-native rewards directly to your sovereign wallet."
            />
          </div>
        </section>

        {/* ── Impact Metrics Section ─────────────── */}
        <section className="flex flex-col items-center rounded-lg bg-[var(--color-card)] px-8 py-24 lg:py-40 shadow-[0px_20px_40px_rgba(45,52,53,0.02)]">
          <h2 className="heading-2 pb-12 lg:pb-24 text-center">
            The collective weight of individual intent.
          </h2>

          <div className="grid w-full max-w-[1024px] grid-cols-1 gap-12 lg:gap-16 px-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-[var(--color-primary)]" />
                <p className="metric-value-lg text-[var(--color-text-dark)]">
                  {(protocolStats.totalActions / 1000000).toFixed(1)}M
                </p>
              </div>
              <p className="label-uppercase text-sm">ACTIONS VERIFIED</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-[var(--color-primary)]" />
                <p className="metric-value-lg text-[var(--color-text-dark)]">
                  ${(protocolStats.totalRewards / 1000000).toFixed(1)}M
                </p>
              </div>
              <p className="label-uppercase text-sm">REWARDS DISTRIBUTED</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-[var(--color-primary)]" />
                <p className="metric-value-lg text-[var(--color-text-dark)]">
                  {(protocolStats.activeUsers / 1000).toFixed(1)}K
                </p>
              </div>
              <p className="label-uppercase text-sm">ACTIVE USERS</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
                <p className="metric-value-lg text-[var(--color-text-dark)]">
                  ${(protocolStats.tvl / 1000000).toFixed(1)}M
                </p>
              </div>
              <p className="label-uppercase text-sm">TOTAL VALUE LOCKED</p>
            </div>
          </div>
        </section>

        {/* ── Social Proof Section ───────────────── */}
        <section className="flex flex-col items-center py-12 lg:py-24">
          <div className="text-center mb-12">
            <h3 className="heading-3 mb-4">Trusted by leading organizations</h3>
            <p className="text-body text-[var(--color-text-muted)] max-w-2xl">
              Join thousands of users and organizations making a measurable impact on climate action.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16 items-center opacity-70">
            {["Climate Corp", "EcoInit", "GreenDAO", "CarbonNeutral"].map((partner) => (
              <div key={partner} className="flex items-center justify-center">
                <div className="text-lg font-semibold text-[var(--color-text-muted)]">
                  {partner}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="mt-32 bg-[var(--color-secondary-alt)] px-8 py-16">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between flex-wrap gap-4">
          <span className="text-lg font-semibold tracking-[-0.9px] text-[var(--color-text-dark)]">
            The Quiet Earth
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            © 2024 The Quiet Earth Protocol. Built on Initia.
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ── Process Step Component ──────────────────────── */

function ProcessStep({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      {/* Icon */}
      <div className="mb-8 flex h-16 w-16 items-center justify-center bg-[var(--color-secondary-alt)] rounded-lg">
        {icon}
      </div>

      {/* Title */}
      <h3 className="heading-3 mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-body max-w-[300px]">
        {description}
      </p>
    </div>
  );
}
