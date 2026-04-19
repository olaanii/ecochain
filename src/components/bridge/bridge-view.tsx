"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";

import { useServerEvents } from "@/hooks/use-server-events";

interface BridgeEntry {
  id: string;
  amount: number;
  denom: string;
  status: string;
  targetChain?: string;
  transactionLink?: string;
  timestamp: string;
  builder?: string;
}

const TARGET_CHAINS = [
  { value: "initiation-2", label: "Initia Testnet" },
  { value: "mahalo-3", label: "Mahalo-3" },
  { value: "ethereum-1", label: "Ethereum" },
  { value: "cosmoshub-4", label: "Cosmos Hub" },
];

export function BridgeView() {
  const [history, setHistory] = useState<BridgeEntry[]>([]);
  const [amount, setAmount] = useState("");
  const [denom, setDenom] = useState("INITIA");
  const [targetChain, setTargetChain] = useState(TARGET_CHAINS[0].value);
  const [recipient, setRecipient] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bridge", { cache: "no-store" });
      const json = await res.json();
      setHistory(json.history ?? []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useServerEvents({ channels: ["bridge.updated"], onEvent: () => load() });

  const total = useMemo(() => {
    return history.reduce((sum, h) => {
      if (h.status === "completed" || h.status === "confirmed") return sum + h.amount;
      return sum;
    }, 0);
  }, [history]);

  const active = useMemo(
    () => history.find((h) => ["queued", "pending", "confirming"].includes(h.status)) ?? null,
    [history],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (recipient && !/^(0x[0-9a-fA-F]{40}|init[a-z0-9]{8,})$/.test(recipient)) {
      setError("Recipient address doesn't look valid.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          denom,
          targetChain,
          recipient,
          slippage,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? "bridge_failed");
      setNotice(json.message ?? "Bridge request submitted.");
      setAmount("");
      setRecipient("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown");
    } finally {
      setBusy(false);
    }
  };

  const estFee = useMemo(() => {
    const amt = Number(amount) || 0;
    return { networkFee: 0.25, bridgeFee: amt * 0.001, eta: "~2-5 min" };
  }, [amount]);

  return (
    <div className="flex flex-col gap-20 max-w-[960px] mx-auto px-6 py-20">
      <section className="flex flex-col items-center">
        <p
          className="pb-5 text-[#5a6061]"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.42px",
            textTransform: "uppercase",
          }}
        >
          Total Bridged
        </p>
        <h1
          className="pb-4 text-[#2d3435]"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 56,
            fontWeight: 600,
            lineHeight: "67.2px",
            letterSpacing: "-1.12px",
          }}
        >
          {total.toLocaleString()} <span className="text-[#5a6061] text-2xl font-normal">{denom}</span>
        </h1>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <form onSubmit={submit} className="lg:col-span-3 surface-card rounded-sm p-10 flex flex-col gap-5">
          <h2 className="text-[#2d3435]" style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 500 }}>
            Move funds
          </h2>

          <label className="flex flex-col gap-1.5 text-xs text-[#5a6061]">
            <span className="font-semibold uppercase tracking-wider">Amount</span>
            <div className="flex gap-2">
              <input
                required
                type="number"
                step="0.0001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
              />
              <select
                value={denom}
                onChange={(e) => setDenom(e.target.value)}
                className="rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
              >
                <option>INITIA</option>
                <option>ECO</option>
                <option>USDC</option>
              </select>
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-[#5a6061]">
            <span className="font-semibold uppercase tracking-wider">Destination chain</span>
            <select
              value={targetChain}
              onChange={(e) => setTargetChain(e.target.value)}
              className="rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
            >
              {TARGET_CHAINS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-[#5a6061]">
            <span className="font-semibold uppercase tracking-wider">Recipient (optional)</span>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="init1... or 0x..."
              className="rounded-sm border border-[rgba(45,52,53,0.12)] px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-[#5a6061]">
            <span className="font-semibold uppercase tracking-wider">Slippage tolerance</span>
            <div className="flex gap-2">
              {[0.1, 0.5, 1].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlippage(s)}
                  className={`rounded-sm border px-3 py-1.5 text-xs ${
                    slippage === s
                      ? "border-[#3b6934] bg-[rgba(59,105,52,0.1)] text-[#3b6934]"
                      : "border-[rgba(45,52,53,0.12)] text-[#5a6061]"
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </label>

          <div className="rounded-sm bg-[#f2f4f4] p-4 text-xs text-[#5a6061] flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Network fee</span>
              <span>{estFee.networkFee.toFixed(2)} {denom}</span>
            </div>
            <div className="flex justify-between">
              <span>Bridge fee (0.1%)</span>
              <span>{estFee.bridgeFee.toFixed(4)} {denom}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated arrival</span>
              <span>{estFee.eta}</span>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="text-sm text-[#3b6934]">{notice}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-white disabled:opacity-50"
          >
            <ArrowUpRight className="h-4 w-4 text-[#e6ffdb]" />
            <span className="text-[#e6ffdb]" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
              {busy ? "Submitting…" : "Initiate bridge"}
            </span>
          </button>
        </form>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="surface-card rounded-sm p-8">
            <h3 className="pb-3 text-[#2d3435]" style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>
              Active movement
            </h3>
            {active ? (
              <div className="flex flex-col gap-2">
                <p className="text-[#2d3435]" style={{ fontFamily: "var(--font-body)", fontSize: 14 }}>
                  {active.amount.toLocaleString()} {active.denom} → {active.targetChain}
                </p>
                <p className="text-xs text-[#5a6061]">Status: {active.status}</p>
                <div className="h-1.5 bg-[#e4e9ea] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b6934] animate-pulse"
                    style={{ width: active.status === "confirming" ? "80%" : "40%" }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#5a6061]">No active bridge transactions.</p>
            )}
          </div>

          <div className="surface-card rounded-sm p-8">
            <h3 className="pb-3 text-[#2d3435]" style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>
              Bridge limits
            </h3>
            <ul className="flex flex-col gap-2 text-xs text-[#5a6061]">
              <li>Min: 1 {denom}</li>
              <li>Max per tx: 100,000 {denom}</li>
              <li>Daily cap: 500,000 {denom}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="text-[#2d3435]" style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 500 }}>
          Recent activity
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-[#5a6061]">No bridge transactions yet.</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {history.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="surface-muted flex h-10 w-10 items-center justify-center rounded-lg">
                    {tx.status === "completed" ? (
                      <ArrowDownLeft className="h-4 w-4 text-[#3b6934]" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-[#5a6061]" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#2d3435]">
                      {tx.amount.toLocaleString()} {tx.denom} → {tx.targetChain}
                    </span>
                    <span className="text-xs text-[#5a6061]">
                      {new Date(tx.timestamp).toLocaleString()} · {tx.status}
                    </span>
                  </div>
                </div>
                {tx.transactionLink ? (
                  <a
                    href={tx.transactionLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#3b6934]"
                  >
                    Track <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
