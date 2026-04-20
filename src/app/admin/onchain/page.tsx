"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { useSearchParams } from "next/navigation";
import { Link2, Pause, Play, ArrowUpCircle, ExternalLink, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL_DEV ?? "";
const EXPLORER = "https://scan.testnet.initia.xyz/evm/tx";

const contracts = [
  {
    name: "EcoReward",
    envKey: "NEXT_PUBLIC_ECO_TOKEN_ADDR",
    address: process.env.NEXT_PUBLIC_ECO_TOKEN_ADDR ?? "—",
    description: "ERC-20 token. Mints ECO to verified users.",
  },
  {
    name: "EcoVerifier",
    envKey: "NEXT_PUBLIC_ECO_VERIFIER_ADDR",
    address: process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDR ?? "—",
    description: "Accepts EIP-712 oracle attestations and calls EcoReward.mint.",
  },
  {
    name: "Staking",
    envKey: "NEXT_PUBLIC_ECO_STAKING_ADDR",
    address: process.env.NEXT_PUBLIC_ECO_STAKING_ADDR ?? "—",
    description: "Linear interest staking pool with MINIMUM_STAKE and lock periods.",
  },
];

type Tab = "contracts" | "pause" | "upgrades";

const tabLabels: { key: Tab; label: string }[] = [
  { key: "contracts", label: "Contracts" },
  { key: "pause", label: "Pause" },
  { key: "upgrades", label: "Upgrades" },
];

export default function AdminOnchainPage() {
  const params = useSearchParams();
  const tab = (params.get("tab") ?? "contracts") as Tab;
  const [confirmPause, setConfirmPause] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[#2d3435]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            On-chain
          </h1>
          <p className="mt-1 text-sm text-[#5a6061]">
            Contract addresses, emergency pause controls, and upgrade queue.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#e4e9ea]">
          {tabLabels.map((t) => (
            <a
              key={t.key}
              href={`/admin/onchain?tab=${t.key}`}
              className={clsx(
                "px-4 py-2 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-b-2 border-[#2d3435] text-[#2d3435]"
                  : "text-[#5a6061] hover:text-[#2d3435]",
              )}
            >
              {t.label}
            </a>
          ))}
        </div>

        {tab === "contracts" && (
          <div className="space-y-4">
            {contracts.map((c) => (
              <div
                key={c.name}
                className="flex items-start justify-between rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-[#f2f4f4] p-2.5 text-[#5a6061]">
                    <Link2 size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#2d3435]">{c.name}</p>
                    <p className="mt-0.5 text-xs text-[#5a6061]">{c.description}</p>
                    <p className="mt-2 font-mono text-xs text-[#2d3435]">{c.address}</p>
                  </div>
                </div>
                {c.address !== "—" && (
                  <a
                    href={`${EXPLORER}/${c.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[#2d6fa6] hover:bg-[#f0f6fc]"
                  >
                    Explorer <ExternalLink size={11} />
                  </a>
                )}
              </div>
            ))}
            <div className="rounded-2xl bg-[#f9f9f9] p-4 text-xs text-[#5a6061]">
              RPC endpoint: <span className="font-mono">{RPC_URL || "(not set)"}</span>
            </div>
          </div>
        )}

        {tab === "pause" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-700">
                Pausing a contract halts all user interactions. This is an emergency measure.
                Confirm by typing the contract name below before proceeding.
              </p>
            </div>
            {contracts.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#2d3435]">{c.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-[#5a6061]">{c.address}</p>
                  </div>
                  <button
                    onClick={() => setConfirmPause(confirmPause === c.name ? null : c.name)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <Pause size={12} /> Pause contract
                  </button>
                </div>
                {confirmPause === c.name && (
                  <div className="mt-4 space-y-3 border-t border-[#f2f4f4] pt-4">
                    <p className="text-xs text-[#5a6061]">
                      Type <strong>{c.name}</strong> to confirm:
                    </p>
                    <input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={c.name}
                      className="w-full rounded-xl border border-[#e4e9ea] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                    <p className="text-xs text-[#5a6061]">
                      Pausing requires an on-chain transaction from the PAUSER_ROLE wallet.
                      Connect your wallet and execute via the contract directly, or use the
                      Foundry script{" "}
                      <code className="rounded bg-[#f2f4f4] px-1">forge script script/Pause.s.sol</code>.
                    </p>
                    <button
                      disabled={confirmText !== c.name}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
                    >
                      <Pause size={12} /> Confirm Pause {c.name}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "upgrades" && (
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-start gap-3">
              <ArrowUpCircle size={18} className="mt-0.5 text-[#7a3b9c]" />
              <div>
                <p className="font-semibold text-[#2d3435]">UUPS Proxy Upgrade</p>
                <p className="mt-1 text-sm text-[#5a6061]">
                  Contract upgrades are queued through a TimelockController (1h on testnet,
                  48h on mainnet). To queue an upgrade:
                </p>
                <ol className="mt-3 space-y-1.5 text-sm text-[#5a6061]" style={{ listStyle: "decimal", paddingLeft: "1.25rem" }}>
                  <li>Deploy the new implementation: <code className="rounded bg-[#f2f4f4] px-1 text-xs">forge script script/Upgrade.s.sol --broadcast</code></li>
                  <li>Queue via TimelockController with the new implementation address.</li>
                  <li>After the delay, execute the queued upgrade transaction.</li>
                  <li>Verify on explorer and update <code className="rounded bg-[#f2f4f4] px-1 text-xs">src/lib/contracts/config.ts</code>.</li>
                </ol>
                <div className="mt-4 rounded-xl bg-[#f9f9f9] p-3 text-xs text-[#5a6061]">
                  UUPS proxy + TimelockController scaffolding (C-2) is pending. Track in GitHub.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
