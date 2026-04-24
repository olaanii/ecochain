"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Minus, Clock, Users, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { ProductShell } from "@/components/layout/product-shell";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  startTime: string;
  endTime: string;
  executionTime: string | null;
  createdAt: string;
  totalVotes: number;
  quorumPct: number;
  approvePct: number;
  rejectPct: number;
  endsInMs: number;
  isOpen: boolean;
}

export default function ProposalsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "passed" | "rejected">("all");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await fetch('/api/governance/proposals');
        const data = await res.json();
        if (data.success) {
          setProposals(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch proposals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const filteredProposals = proposals.filter((p) => {
    if (filter === "all") return true;
    if (filter === "active") return p.isOpen;
    if (filter === "passed") return p.status === "passed" || p.status === "executed";
    if (filter === "rejected") return p.status === "failed" || p.status === "rejected";
    return true;
  });

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  if (loading) {
    return (
      <ProductShell>
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
          </div>
        </div>
      </ProductShell>
    );
  }

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
          {filteredProposals.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              No proposals found.
            </div>
          ) : (
            filteredProposals.map((proposal) => {
              const StatusIcon =
                proposal.status === "passed" || proposal.status === "executed" ? CheckCircle : proposal.status === "failed" || proposal.status === "rejected" ? XCircle : Clock;
              const statusColor =
                proposal.status === "passed" || proposal.status === "executed"
                  ? "text-[var(--color-success)] bg-[var(--color-success)]/10"
                  : proposal.status === "failed" || proposal.status === "rejected"
                    ? "text-red-600 bg-red-50"
                    : "text-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/10";
              const timeRemaining = proposal.endsInMs > 0 ? `${Math.floor(proposal.endsInMs / (1000 * 60 * 60 * 24))} days` : "Ended";
              const isEnded = !proposal.isOpen;

              return (
                <div
                  key={proposal.id}
                  className="rounded-2xl border border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)] p-5"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                        >
                          <StatusIcon size={12} />
                          <span className="capitalize">{proposal.status}</span>
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">{new Date(proposal.endTime).toLocaleDateString()}</span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-[var(--color-text-dark)]">
                        {proposal.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                        {proposal.description}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-xs text-[var(--color-text-muted)]">by {proposal.proposer.slice(0, 8)}...</p>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="mb-4 space-y-2">
                    <div className="flex h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-[var(--color-success)]"
                        style={{ width: `${proposal.approvePct}%` }}
                      />
                      <div
                        className="bg-red-400"
                        style={{ width: `${proposal.rejectPct}%` }}
                      />
                      <div
                        className="bg-[var(--color-text-muted)]"
                        style={{ width: `${100 - proposal.approvePct - proposal.rejectPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                      <span className="text-[var(--color-success)]">
                        For: {proposal.approvePct}%
                      </span>
                      <span className="text-red-500">
                        Against: {proposal.rejectPct}%
                      </span>
                      <span>
                        Quorum: {proposal.quorumPct}%
                      </span>
                    </div>
                  </div>

                  {/* Voting Info */}
                  <div className="mb-4 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {proposal.totalVotes.toLocaleString()} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {timeRemaining}
                    </span>
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
