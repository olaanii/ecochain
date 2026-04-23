"use client";

import { CheckCircle, XCircle, Minus, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductShell } from "@/components/layout/product-shell";

const VOTING_HISTORY = [
  {
    id: "1",
    proposal: "Increase Staking Rewards by 2%",
    vote: "for" as const,
    votingPower: 500,
    date: "Apr 15, 2026",
    status: "active",
    outcome: null,
  },
  {
    id: "2",
    proposal: "Add New 730-Day Staking Tier",
    vote: "for" as const,
    votingPower: 500,
    date: "Apr 10, 2026",
    status: "passed",
    outcome: "passed",
  },
  {
    id: "3",
    proposal: "Reduce Early Withdrawal Penalty to 5%",
    vote: "abstain" as const,
    votingPower: 500,
    date: "Apr 5, 2026",
    status: "passed",
    outcome: "passed",
  },
  {
    id: "4",
    proposal: "Lower Minimum Stake to 50 ECO",
    vote: "against" as const,
    votingPower: 500,
    date: "Mar 28, 2026",
    status: "rejected",
    outcome: "rejected",
  },
];

const VOTE_ICONS = {
  for: CheckCircle,
  against: XCircle,
  abstain: Minus,
};

const VOTE_STYLES = {
  for: "text-[var(--color-success)] bg-[var(--color-success)]/10",
  against: "text-red-600 bg-red-50",
  abstain: "text-[var(--color-text-muted)] bg-[var(--color-surface-muted)]",
};

export default function VotingHistoryPage() {
  return (
    <ProductShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Voting History
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Your past votes on governance proposals.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-2xl font-semibold text-[var(--color-success)]">
              {VOTING_HISTORY.filter((v) => v.vote === "for").length}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Votes For</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-2xl font-semibold text-red-600">
              {VOTING_HISTORY.filter((v) => v.vote === "against").length}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Votes Against</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-surface-elevated)] p-4 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-2xl font-semibold text-[var(--color-text-muted)]">
              {VOTING_HISTORY.filter((v) => v.vote === "abstain").length}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Abstained</p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {VOTING_HISTORY.map((vote) => {
            const Icon = VOTE_ICONS[vote.vote];
            return (
              <div
                key={vote.id}
                className="rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${VOTE_STYLES[vote.vote]}`}>
                        <Icon size={12} />
                        <span className="capitalize">{vote.vote}</span>
                      </span>
                      {vote.status === "active" && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-brand-accent)]">
                          <Clock size={12} /> Active
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-medium text-[var(--color-text-dark)]">
                      {vote.proposal}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      Voted on {vote.date} · {vote.votingPower.toLocaleString()} voting power
                    </p>
                  </div>
                  <div className="text-right">
                    {vote.outcome && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          vote.outcome === "passed"
                            ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {vote.outcome === "passed" ? "Passed" : "Rejected"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Link to Active Proposals */}
        <div className="mt-8 text-center">
          <Link
            href="/governance"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand-secondary)] hover:underline"
          >
            View active proposals <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </ProductShell>
  );
}
