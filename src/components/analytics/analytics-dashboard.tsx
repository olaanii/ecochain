"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";

import { AreaChart, BarChart, LineChart, PieChart, type SeriesPoint } from "@/components/charts";
import { useServerEvents } from "@/hooks/use-server-events";

interface MetricsResponse {
  totals: {
    co2OffsetKg: number;
    totalUsers: number;
    activeUsers30d: number;
    verificationsThisMonth: number;
    treasuryBalance: number;
    activeTasks: number;
  };
  trends: {
    co2Offset: SeriesPoint[];
    userGrowth: SeriesPoint[];
    categoryBreakdown: SeriesPoint[];
    dailyActivity: SeriesPoint[];
  };
  updatedAt: string;
}

const formatNumber = (n: number) => n.toLocaleString();
const formatCompact = (n: number) =>
  Math.abs(n) >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : Math.abs(n) >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n);

export function AnalyticsDashboard() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/metrics", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "load_failed");
      setData(json.data as MetricsResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useServerEvents({
    channels: ["analytics.updated", "proposal.voted", "leaderboard.updated"],
    onEvent: () => load(),
  });

  const updatedLabel = useMemo(() => {
    if (!data?.updatedAt) return "";
    const d = new Date(data.updatedAt);
    return d.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", month: "short", day: "2-digit" });
  }, [data?.updatedAt]);

  const downloadReport = useCallback(() => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecochain-metrics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return (
    <div className="flex flex-col gap-16 max-w-[1600px] mx-auto px-8 md:px-16 py-16">
      <header className="flex flex-col gap-6 max-w-[720px]">
        <h1
          className="text-[#2d3435]"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "56px",
            fontWeight: 600,
            lineHeight: "61.6px",
            letterSpacing: "-1.12px",
          }}
        >
          Impact Metrics
        </h1>
        <p className="text-[#5a6061]" style={{ fontFamily: "var(--font-body)", fontSize: 16, lineHeight: "26px" }}>
          A quiet observation of our collective progress. Every small action aggregates into significant change.
        </p>
      </header>

      {error ? (
        <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Couldn&apos;t load metrics: {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <MetricCard
          className="lg:col-span-2 surface-card"
          label="TOTAL CO2 OFFSET"
          value={loading ? "—" : formatNumber(data?.totals.co2OffsetKg ?? 0)}
          unit="kg"
        >
          <div className="pt-6">
            <LineChart data={data?.trends.co2Offset ?? []} height={160} yFormatter={formatCompact} />
          </div>
        </MetricCard>

        <MetricCard
          className="surface-secondary"
          label="COMMUNITY"
          value={loading ? "—" : formatNumber(data?.totals.activeUsers30d ?? 0)}
          unit="members"
        >
          <div className="pt-6">
            <AreaChart data={data?.trends.userGrowth ?? []} height={120} yFormatter={formatCompact} />
          </div>
        </MetricCard>

        <MetricCard
          className="surface-card"
          label="ACTIVE ACTIONS"
          value={loading ? "—" : formatNumber(data?.totals.verificationsThisMonth ?? 0)}
          unit="this month"
        >
          <div className="pt-6">
            <BarChart data={data?.trends.dailyActivity ?? []} height={120} yFormatter={formatCompact} />
          </div>
        </MetricCard>

        <MetricCard
          className="surface-card"
          label="TREASURY"
          value={loading ? "—" : formatCompact(data?.totals.treasuryBalance ?? 0)}
          unit="ECO"
        >
          <p
            className="pt-4 text-[#3b6934]"
            style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: "20px" }}
          >
            Healthy reserves for upcoming grants.
          </p>
        </MetricCard>

        <MetricCard
          className="surface-card"
          label="CATEGORY BREAKDOWN"
          value=""
          unit=""
        >
          <div className="pt-4">
            <PieChart data={data?.trends.categoryBreakdown ?? []} height={180} />
          </div>
        </MetricCard>
      </section>

      <footer className="border-t border-[rgba(173,179,180,0.25)] flex items-center justify-between pt-10">
        <p className="text-[#adb3b4]" style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>
          {loading ? "Loading…" : `Data updated: ${updatedLabel}`}
        </p>
        <button
          type="button"
          onClick={downloadReport}
          disabled={!data}
          className="flex items-center gap-2 text-[#2d3435] disabled:opacity-40"
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.36px",
              textTransform: "uppercase",
            }}
          >
            Download report
          </span>
          <Download className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}

function MetricCard({
  className = "",
  label,
  value,
  unit,
  children,
}: {
  className?: string;
  label: string;
  value: string;
  unit?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`${className} flex flex-col justify-between p-10 rounded-sm`}>
      <div className="flex flex-col gap-3">
        <p
          className="text-[#adb3b4]"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.36px",
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>
        {value ? (
          <div className="flex items-baseline gap-2">
            <span
              className="text-[#2d3435]"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 40,
                fontWeight: 600,
                lineHeight: "44px",
                letterSpacing: "-0.8px",
              }}
            >
              {value}
            </span>
            {unit ? (
              <span className="text-[#5a6061]" style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>
                {unit}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
