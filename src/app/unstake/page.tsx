"use client";

import { useState } from "react";
import { Unlock, AlertTriangle, Check, Clock, Coins } from "lucide-react";
import { ProductShell } from "@/components/layout/product-shell";

const MOCK_STAKES = [
  {
    id: "1",
    amount: 500,
    apy: 8,
    days: 90,
    startDate: "2026-01-15",
    endDate: "2026-04-15",
    status: "matured",
    earned: 12.3,
  },
  {
    id: "2",
    amount: 1000,
    apy: 12,
    days: 180,
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    status: "locked",
    earned: 45.2,
  },
];

export default function UnstakePage() {
  const [selectedStake, setSelectedStake] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const stake = MOCK_STAKES.find((s) => s.id === selectedStake);
  const isMatured = stake?.status === "matured";
  const penalty = !isMatured && stake ? stake.amount * 0.1 : 0;
  const receiveAmount = stake ? stake.amount - penalty : 0;

  const handleUnstake = async () => {
    if (!stake) return;
    setIsUnstaking(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsUnstaking(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setShowConfirm(false);
      setSelectedStake(null);
    }, 3000);
  };

  return (
    <ProductShell>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Unstake ECO Tokens
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Withdraw your staked tokens. Matured stakes have no penalty.
          </p>
        </div>

        {/* Stakes List */}
        <div className="mb-6 space-y-4">
          {MOCK_STAKES.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedStake(s.id);
                setShowConfirm(true);
              }}
              className={`cursor-pointer rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                selectedStake === s.id
                  ? "border-[var(--color-brand-secondary)] bg-[var(--color-brand-secondary)]/5"
                  : "border-[var(--color-surface-muted)] bg-[var(--color-surface-elevated)]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl p-2 ${
                      s.status === "matured"
                        ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]"
                    }`}
                  >
                    {s.status === "matured" ? <Unlock size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text-dark)]">
                      {s.amount.toLocaleString()} ECO
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {s.apy}% APY · {s.days} days
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      s.status === "matured"
                        ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                        : "bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]"
                    }`}
                  >
                    {s.status === "matured" ? "Ready" : "Locked"}
                  </span>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Ends {s.endDate}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 border-t border-[var(--color-surface-muted)] pt-3">
                <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
                  <Coins size={14} />
                  <span>+{s.earned} ECO earned</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && stake && (
          <div className="rounded-2xl border-2 border-[var(--color-brand-secondary)] bg-[var(--color-surface-elevated)] p-6">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-dark)]">
              Confirm Unstake
            </h3>

            {!isMatured && (
              <div className="mb-4 rounded-xl bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 text-red-500" size={18} />
                  <div>
                    <p className="font-medium text-red-700">Early Withdrawal Penalty</p>
                    <p className="text-sm text-red-600">
                      10% penalty applies ({penalty.toFixed(2)} ECO)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Staked Amount</span>
                <span className="font-medium text-[var(--color-text-dark)]">
                  {stake.amount.toLocaleString()} ECO
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">
                  {isMatured ? "No Penalty" : "Penalty (10%)"}
                </span>
                <span className={isMatured ? "text-[var(--color-success)]" : "text-red-500"}>
                  {isMatured ? "0 ECO" : `-${penalty.toFixed(2)} ECO`}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-surface-muted)] pt-2">
                <span className="font-medium text-[var(--color-text-dark)]">You Receive</span>
                <span className="font-bold text-[var(--color-success)]">
                  {receiveAmount.toFixed(2)} ECO
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-[var(--color-surface-muted)] py-3 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-surface-muted)]"
              >
                Cancel
              </button>
              <button
                onClick={handleUnstake}
                disabled={isUnstaking}
                className="flex-1 rounded-xl bg-[var(--color-text-dark)] py-3 text-sm font-semibold text-[var(--color-text-inverse)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isUnstaking ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </span>
                ) : showSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check size={16} />
                    Success!
                  </span>
                ) : (
                  "Confirm Unstake"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProductShell>
  );
}
