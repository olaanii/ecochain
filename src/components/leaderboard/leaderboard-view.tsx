"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Flame, Share2 } from "lucide-react";

import { useServerEvents } from "@/hooks/use-server-events";

type Scope = "all" | "weekly" | "monthly";

interface LeaderRow {
  rank: number;
  userId: string;
  name: string;
  score: number;
  level: number;
  streakDays: number;
  region: string | null;
}

interface LeaderboardResponse {
  scope: Scope;
  region: string | null;
  page: number;
  limit: number;
  rows: LeaderRow[];
  userRank?: LeaderRow | null;
}

interface LeaderboardViewProps {
  currentUserId?: string;
}

const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

export function LeaderboardView({ currentUserId }: LeaderboardViewProps) {
  const [scope, setScope] = useState<Scope>("all");
  const [region, setRegion] = useState<string>("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ scope, page: String(page), limit: "50" });
      if (region) params.set("region", region);
      if (currentUserId) params.set("userId", currentUserId);
      const res = await fetch(`/api/leaderboard?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "load_failed");
      setData(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown");
    } finally {
      setLoading(false);
    }
  }, [scope, region, page, currentUserId]);

  useEffect(() => {
    load();
  }, [load]);

  useServerEvents({
    channels: ["leaderboard.updated", "proposal.voted"],
    onEvent: () => load(),
  });

  const top = useMemo(() => data?.rows.slice(0, 3) ?? [], [data?.rows]);
  const rest = useMemo(() => data?.rows.slice(3) ?? [], [data?.rows]);

  const share = useCallback(() => {
    if (!data?.userRank) return;
    const text = `I'm ranked #${data.userRank.rank} on EcoChain with ${data.userRank.score.toLocaleString()} points!`;
    if (navigator.share) {
      navigator.share({ title: "EcoChain Leaderboard", text });
    } else {
      navigator.clipboard?.writeText(text);
    }
  }, [data?.userRank]);

  return (
    <div className="flex flex-col gap-16 max-w-[1280px] mx-auto px-6 md:px-12 py-16">
      <header className="flex flex-col gap-6 max-w-[768px]">
        <h1
          className="text-[#2d3435]"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "56px",
            fontWeight: 600,
            lineHeight: "67.2px",
            letterSpacing: "-1.12px",
          }}
        >
          Collective Impact
        </h1>
        <p
          className="text-[#5a6061] max-w-[672px]"
          style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: "26px" }}
        >
          Every action resonates. Here we acknowledge the quiet dedication of our community — not a competition, but a
          shared pursuit of a sustainable equilibrium.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-sm bg-[#f2f4f4] p-1">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setScope(s.value);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm rounded-sm transition ${
                scope === s.value ? "bg-white text-[#2d3435] shadow-sm" : "text-[#5a6061]"
              }`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setPage(1);
          }}
          className="rounded-sm border border-[rgba(45,52,53,0.08)] bg-white px-3 py-2 text-sm text-[#2d3435]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <option value="">All regions</option>
          <option value="na">North America</option>
          <option value="eu">Europe</option>
          <option value="apac">Asia-Pacific</option>
          <option value="latam">Latin America</option>
          <option value="mea">Middle East & Africa</option>
        </select>
        {data?.userRank ? (
          <button
            onClick={share}
            className="ml-auto inline-flex items-center gap-2 text-sm text-[#3b6934]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Share2 className="h-4 w-4" /> Share my rank
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn&apos;t load leaderboard: {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="surface-card flex flex-col gap-6 p-10 rounded-sm shadow-lg">
            {loading && !data ? (
              <SkeletonRows count={3} big />
            ) : top.length === 0 ? (
              <EmptyState />
            ) : (
              top.map((r) => (
                <div key={r.userId} className="flex items-center justify-between">
                  <div className="flex items-baseline gap-6">
                    <span
                      className={r.rank === 1 ? "text-[#3b6934]" : "text-[#757c7d]"}
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 32,
                        fontWeight: 500,
                        opacity: r.rank === 1 ? 0.9 : r.rank === 2 ? 0.65 : 0.45,
                      }}
                    >
                      {String(r.rank).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[#2d3435]"
                      style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 500 }}
                    >
                      {r.name}
                    </span>
                    {r.streakDays > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#5a6061]">
                        <Flame className="h-3 w-3 text-[#d7b66b]" />
                        {r.streakDays}d
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={r.rank === 1 ? "text-[#3b6934]" : "text-[#2d3435]"}
                      style={{ fontFamily: "var(--font-body)", fontSize: 22, fontWeight: 500 }}
                    >
                      {r.score.toLocaleString()}
                    </span>
                    <span
                      className="text-[#5a6061]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.36px",
                        textTransform: "uppercase",
                      }}
                    >
                      Level {r.level}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-6 px-2">
            {loading && !data
              ? <SkeletonRows count={10} />
              : rest.map((r) => (
                  <div key={r.userId} className="flex items-center justify-between">
                    <div className="flex items-baseline gap-8">
                      <span className="text-[#757c7d] w-8" style={{ fontFamily: "var(--font-body)" }}>
                        {String(r.rank).padStart(2, "0")}
                      </span>
                      <span className="text-[#2d3435]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                        {r.name}
                      </span>
                    </div>
                    <span className="text-[#5a6061]" style={{ fontFamily: "var(--font-body)" }}>
                      {r.score.toLocaleString()}
                    </span>
                  </div>
                ))}

            {data?.userRank ? (
              <div className="pt-6">
                <div className="surface-muted flex items-center justify-between p-6 rounded-sm">
                  <div className="flex items-center gap-8">
                    <span className="text-[#3b6934] w-8" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                      #{data.userRank.rank}
                    </span>
                    <span className="text-[#2d3435]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                      You
                    </span>
                  </div>
                  <span className="text-[#3b6934]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                    {data.userRank.score.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-sm border border-[rgba(45,52,53,0.08)] bg-white px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-[#5a6061]">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || (data?.rows.length ?? 0) < 50}
                className="rounded-sm border border-[rgba(45,52,53,0.08)] bg-white px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-10">
          <div className="surface-card flex flex-col gap-6 p-10 rounded-sm">
            <h3 className="text-[#2d3435]" style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 500 }}>
              Community<br />Milestone
            </h3>
            <div>
              <span
                className="text-[#3b6934]"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 56,
                  fontWeight: 600,
                  letterSpacing: "-1.12px",
                }}
              >
                {data?.rows.reduce((s, r) => s + r.score, 0).toLocaleString() ?? "—"}
              </span>
              <p
                className="pt-2 text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.36px",
                  textTransform: "uppercase",
                }}
              >
                Top {data?.rows.length ?? 0} impact score
              </p>
            </div>
            <p className="text-[#5a6061]" style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: "24px" }}>
              Together, we are shifting the balance. Every point represents a tangible reduction in our collective
              footprint.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SkeletonRows({ count, big = false }: { count: number; big?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-sm bg-[#f2f4f4] ${big ? "h-12" : "h-6"}`}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-[#5a6061] text-sm py-6" style={{ fontFamily: "var(--font-body)" }}>
      No ranking data yet — be the first to take an action.
    </div>
  );
}
