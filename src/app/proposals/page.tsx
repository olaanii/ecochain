"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Minus, Clock, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ProductShell } from "@/components/layout/product-shell";

const PROPOSALS = [
  {
    id: "1",
    title: "Increase Staking Rewards by 2%",
    description: "Proposal to increase APY rates across all duration tiers by 2% to incentivize long-term staking.",
    status: "active",
    votesFor: 1250,
    votesAgainst: 320,
    votesAbstain: 150,
    totalVotingPower: 1720,
    endDate: "May 5, 2026",
    timeRemaining: "12 days",
    author: "0x7a3f...9e2d",
    category: "Treasury",
    userVoted: null as "for" | "against" | "abstain" | null,
  },
  {
    id: "2",
    title: "Add New 730-Day Staking Tier",
    description: "Introduce a new 2-year staking option with 25% APY for maximum commitment.",
    status: "active",
    votesFor: 890,
    votesAgainst: 210,
    votesAbstain: 45,
    totalVotingPower: 1145,
    endDate: "May 8, 2026",
    timeRemaining: "15 days",
    author: "0x4b8c...2a5f",
    category: "Protocol",
    userVoted: "for",
  },
  {
    id: "3",
    title: "Reduce Early Withdrawal Penalty to 5%",
    description: "Lower the early unstaking penalty from 10% to 5% to improve user experience.",
    status: "passed",
    votesFor: 1500,
    votesAgainst: 200,
    votesAbstain: 80,
    totalVotingPower: 1780,
    endDate: "Apr 10, 2026",
    timeRemaining: "Ended",
    author: "0x9d2e...7c4b",
    category: "Protocol",
    userVoted: null,
  },
];

export default function ProposalsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "passed" | "rejected">("all");

  const filteredProposals = PROPOSALS.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <ProductShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Governance Proposals
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Review and vote on protocol changes. Your voting power is based on your staked ECO.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-1 border-b border-[var(--color-surface-muted)]">
          {(["all", "active", "passed", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "border-b-2 border-[var(--color-text-dark)] text-[var(--color-text-dark)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5"
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        proposal.status === "active"
                          ? "bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]"
                          : proposal.status === "passed"
                          ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {proposal.status === "active" ? (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Active
                        </span>
                      ) : proposal.status === "passed" ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} /> Passed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </span>
                    <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
                      {proposal.category}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold text-[var(--color-text-dark)]">
                    {proposal.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {proposal.description}
                  </p>
                </div>
              </div>

              {/* Voting Progress */}
              <div className="mb-4 space-y-2">
                <div className="flex h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-[var(--color-success)]"
                    style={{ width: `${calculatePercentage(proposal.votesFor, proposal.totalVotingPower)}%` }}
                  />
                  <div
                    className="bg-red-400"
                    style={{ width: `${calculatePercentage(proposal.votesAgainst, proposal.totalVotingPower)}%` }}
                  />
                  <div
                    className="bg-[var(--color-text-muted)]"
                    style={{ width: `${calculatePercentage(proposal.votesAbstain, proposal.totalVotingPower)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                  <span className="text-[var(--color-success)]">
                    For: {calculatePercentage(proposal.votesFor, proposal.totalVotingPower)}%
                  </span>
                  <span className="text-red-500">
                    Against: {calculatePercentage(proposal.votesAgainst, proposal.totalVotingPower)}%
                  </span>
                  <span>
                    Abstain: {calculatePercentage(proposal.votesAbstain, proposal.totalVotingPower)}%
                  </span>
                </div>
              </div>

              {/* Voting Info */}
              <div className="mb-4 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {proposal.totalVotingPower.toLocaleString()} votes
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {proposal.timeRemaining}
                </span>
              </div>

              {/* Vote Buttons */}
              {proposal.status === "active" && !proposal.userVoted && (
                <div className="flex gap-2">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-success)]/10 py-2.5 text-sm font-semibold text-[var(--color-success)] transition-colors hover:bg-[var(--color-success)]/20">
                    <ThumbsUp size={16} />
                    Vote For
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100">
                    <ThumbsDown size={16} />
                    Vote Against
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-muted)] py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-muted)]/80">
                    <Minus size={16} />
                    Abstain
                  </button>
                </div>
              )}

              {proposal.userVoted && (
                <div className="flex items-center gap-2 rounded-xl bg-[var(--color-success)]/10 py-2.5 text-center text-sm font-medium text-[var(--color-success)]">
                  <CheckCircle size={16} />
                  You voted: {proposal.userVoted}
                </div>
              )}
            </div>
          ))}

          {filteredProposals.length === 0 && (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto mb-2 text-[var(--color-text-muted)]" size={32} />
              <p className="text-[var(--color-text-muted)]">No proposals found.</p>
            </div>
          )}
        </div>
      </div>
    </ProductShell>
  );
}
