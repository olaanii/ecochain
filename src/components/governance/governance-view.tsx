"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Plus, Search, XCircle } from "lucide-react";

import { useServerEvents } from "@/hooks/use-server-events";

type Status = "all" | "active" | "completed" | "failed";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  quorum: number;
  quorumPct: number;
  approvePct: number;
  rejectPct: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  endsInMs: number;
  isOpen: boolean;
}

interface GovernanceViewProps {
  currentUserId?: string;
  defaultProposer?: string;
}

const STATUS_TABS: { value: Status; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

function formatCountdown(ms: number, status: string): string {
  if (status && !["active", "pending"].includes(status)) return status.replace(/^./, (c) => c.toUpperCase());
  if (ms <= 0) return "Ended";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days >= 1) return `Ends in ${days}d`;
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 1) return `Ends in ${hours}h`;
  const minutes = Math.floor(ms / (60 * 1000));
  return `Ends in ${minutes}m`;
}

export function GovernanceView({ currentUserId, defaultProposer = "" }: GovernanceViewProps) {
  const [status, setStatus] = useState<Status>("active");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<Proposal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, limit: "50" });
      if (debounced) params.set("search", debounced);
      const res = await fetch(`/api/governance/proposals?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "load_failed");
      const data = json.data as Proposal[];
      setItems(data);
      setError(null);
      setSelectedId((prev) => (prev && data.some((d) => d.id === prev) ? prev : data[0]?.id ?? null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown");
    } finally {
      setLoading(false);
    }
  }, [status, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  useServerEvents({
    channels: ["proposal.created", "proposal.voted", "proposal.executed"],
    onEvent: () => load(),
  });

  const selected = useMemo(() => items.find((p) => p.id === selectedId) ?? null, [items, selectedId]);

  const castVote = useCallback(
    async (support: "for" | "against" | "abstain") => {
      if (!selected) return;
      if (!currentUserId) {
        setError("sign_in_required");
        return;
      }
      setVoting(true);
      try {
        const res = await fetch("/api/governance/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposalId: selected.id, userId: currentUserId, support }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "vote_failed");
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "unknown");
      } finally {
        setVoting(false);
      }
    },
    [selected, currentUserId, load],
  );

  return (
    <div className="flex flex-col gap-16 max-w-[1200px] mx-auto px-6 md:px-8 py-20">
      <header className="flex flex-col gap-6">
        <h1
          className="text-[#2d3435]"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 56,
            fontWeight: 600,
            lineHeight: "61.6px",
            letterSpacing: "-1.12px",
          }}
        >
          Governance
        </h1>
        <p
          className="text-[#5a6061] max-w-[672px]"
          style={{ fontFamily: "var(--font-body)", fontSize: 20, fontWeight: 500, lineHeight: "30px" }}
        >
          Shape the future of our ecosystem. Review active proposals and cast your vote on treasury allocations.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-sm bg-[#f2f4f4] p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatus(t.value)}
              className={`px-4 py-2 text-sm rounded-sm transition ${
                status === t.value ? "bg-white text-[#2d3435] shadow-sm" : "text-[#5a6061]"
              }`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#adb3b4]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposals…"
            className="w-full rounded-sm border border-[rgba(45,52,53,0.08)] bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-[#3b6934]"
            style={{ fontFamily: "var(--font-body)" }}
          />
        </label>
        <button
          onClick={() => setShowCreate(true)}
          className="ml-auto inline-flex items-center gap-2 rounded-sm bg-[#3b6934] px-4 py-2 text-sm text-white"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Plus className="h-4 w-4" /> New proposal
        </button>
      </div>

      {error ? (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error === "sign_in_required"
            ? "Connect your wallet to vote."
            : error === "already_voted"
              ? "You've already voted on this proposal."
              : error === "voting_closed"
                ? "Voting has closed for this proposal."
                : `Something went wrong (${error}).`}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 flex flex-col gap-10">
          <h2
            className="text-[#2d3435]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
            }}
          >
            {loading ? "Loading…" : `${items.length} proposal${items.length === 1 ? "" : "s"}`}
          </h2>

          {items.length === 0 && !loading ? (
            <div className="text-sm text-[#5a6061]" style={{ fontFamily: "var(--font-body)" }}>
              No proposals match this filter.
            </div>
          ) : null}

          {items.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              selected={p.id === selectedId}
              onSelect={() => setSelectedId(p.id)}
            />
          ))}
        </div>

        <aside className="lg:col-span-5">
          <div className="surface-card p-10 rounded-sm sticky top-6">
            {selected ? (
              <ProposalDetail proposal={selected} onVote={castVote} voting={voting} canVote={!!currentUserId} />
            ) : (
              <p className="text-sm text-[#5a6061]" style={{ fontFamily: "var(--font-body)" }}>
                Select a proposal to view details.
              </p>
            )}
          </div>
        </aside>
      </div>

      {showCreate ? (
        <CreateProposalModal
          onClose={() => setShowCreate(false)}
          defaultProposer={defaultProposer || currentUserId || ""}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      ) : null}
    </div>
  );
}

function ProposalCard({
  proposal,
  selected,
  onSelect,
}: {
  proposal: Proposal;
  selected: boolean;
  onSelect: () => void;
}) {
  const endsLabel = formatCountdown(proposal.endsInMs, proposal.isOpen ? "active" : proposal.status);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`surface-card text-left overflow-hidden p-10 rounded-sm transition ${
        selected ? "border-2 border-[#3b6934]" : "border border-transparent"
      }`}
    >
      <div className="flex items-start justify-between">
        <StatusPill status={proposal.status} isOpen={proposal.isOpen} />
        <p className="text-[#5a6061]" style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>
          {endsLabel}
        </p>
      </div>
      <h3
        className="pt-3 text-[#2d3435]"
        style={{ fontFamily: "var(--font-body)", fontSize: 26, fontWeight: 500, lineHeight: "32px" }}
      >
        {proposal.title}
      </h3>
      <p
        className="pt-2 text-[#5a6061] line-clamp-2"
        style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: "24px" }}
      >
        {proposal.description}
      </p>

      <div className="pt-5 flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#2d3435]">Approve ({proposal.approvePct}%)</span>
          <span className="text-[#5a6061]">Reject ({proposal.rejectPct}%)</span>
        </div>
        <div className="h-2 bg-[#e4e9ea] rounded-full overflow-hidden flex">
          <div className="bg-[#3b6934]" style={{ width: `${proposal.approvePct}%` }} />
          <div className="bg-[#adb3b4]" style={{ width: `${proposal.rejectPct}%` }} />
        </div>
        <div className="flex justify-between pt-1 text-xs text-[#5a6061]">
          <span>
            <CheckCircle2 className="inline h-3 w-3 text-[#3b6934] mr-1" />
            {proposal.votesFor.toLocaleString()} for
          </span>
          <span>
            <XCircle className="inline h-3 w-3 text-[#adb3b4] mr-1" />
            {proposal.votesAgainst.toLocaleString()} against
          </span>
          <span>Quorum: {proposal.quorumPct}%</span>
        </div>
      </div>
    </button>
  );
}

function StatusPill({ status, isOpen }: { status: string; isOpen: boolean }) {
  const label = isOpen ? "VOTING OPEN" : (status || "").toUpperCase() || "CLOSED";
  return (
    <span
      className={`px-3 py-1 rounded-lg text-xs ${
        isOpen ? "bg-[rgba(59,105,52,0.1)] text-[#3b6934]" : "bg-[#f2f4f4] text-[#5a6061]"
      }`}
      style={{ fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.36px" }}
    >
      {label}
    </span>
  );
}

function ProposalDetail({
  proposal,
  onVote,
  voting,
  canVote,
}: {
  proposal: Proposal;
  onVote: (s: "for" | "against" | "abstain") => void;
  voting: boolean;
  canVote: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h4
          className="text-[#2d3435]"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.42px",
            textTransform: "uppercase",
          }}
        >
          Rationale
        </h4>
        <p
          className="text-[#5a6061] whitespace-pre-line"
          style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: "26px" }}
        >
          {proposal.description}
        </p>
        <p className="text-xs text-[#5a6061]" style={{ fontFamily: "var(--font-body)" }}>
          Proposed by {proposal.proposer}
        </p>
      </div>

      <div>
        <h4
          className="text-[#2d3435] pb-3"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.42px",
            textTransform: "uppercase",
          }}
        >
          Quorum Progress
        </h4>
        <div className="h-2 bg-[#e4e9ea] rounded-full overflow-hidden">
          <div className="h-full bg-[#3b6934]" style={{ width: `${proposal.quorumPct}%` }} />
        </div>
        <p className="pt-2 text-xs text-[#5a6061]" style={{ fontFamily: "var(--font-body)" }}>
          {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()} voting power ({proposal.quorumPct}%)
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h4
          className="text-[#2d3435] text-center"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.42px",
            textTransform: "uppercase",
          }}
        >
          Cast your vote
        </h4>
        <button
          type="button"
          disabled={!proposal.isOpen || voting || !canVote}
          onClick={() => onVote("for")}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-sm disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4 text-[#e6ffdb]" />
          <span className="text-[#e6ffdb]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
            {voting ? "Submitting…" : "Approve Proposal"}
          </span>
        </button>
        <button
          type="button"
          disabled={!proposal.isOpen || voting || !canVote}
          onClick={() => onVote("against")}
          className="surface-secondary flex items-center justify-center gap-2 px-6 py-3 rounded-sm disabled:opacity-50"
        >
          <XCircle className="h-4 w-4 text-[#2d3435]" />
          <span className="text-[#2d3435]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
            Reject Proposal
          </span>
        </button>
        <button
          type="button"
          disabled={!proposal.isOpen || voting || !canVote}
          onClick={() => onVote("abstain")}
          className="text-[#5a6061] text-sm underline disabled:opacity-50"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Abstain
        </button>
        {!canVote ? (
          <p className="text-center text-xs text-[#5a6061]" style={{ fontFamily: "var(--font-body)" }}>
            Connect your wallet to cast a vote.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CreateProposalModal({
  onClose,
  onCreated,
  defaultProposer,
}: {
  onClose: () => void;
  onCreated: () => void;
  defaultProposer: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposer, setProposer] = useState(defaultProposer);
  const [quorum, setQuorum] = useState(1000);
  const [durationDays, setDurationDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/governance/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, proposer, quorum, durationDays }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "create_failed");
      onCreated();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "unknown");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-xl rounded-sm bg-white p-8 shadow-lg flex flex-col gap-5"
      >
        <h3
          className="text-[#2d3435]"
          style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 600 }}
        >
          Create proposal
        </h3>
        <Field label="Title">
          <input
            required
            minLength={6}
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            minLength={20}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
          />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Proposer">
            <input
              required
              value={proposer}
              onChange={(e) => setProposer(e.target.value)}
              className="w-full rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Quorum">
            <input
              type="number"
              min={1}
              value={quorum}
              onChange={(e) => setQuorum(Number(e.target.value))}
              className="w-full rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Duration (days)">
            <input
              type="number"
              min={1}
              max={30}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
            />
          </Field>
        </div>
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-sm px-4 py-2 text-sm text-[#5a6061]">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-sm bg-[#3b6934] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create proposal"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-[#5a6061]" style={{ fontFamily: "var(--font-body)" }}>
      <span className="font-semibold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}
