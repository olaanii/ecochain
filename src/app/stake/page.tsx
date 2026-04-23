"use client";

import { useState } from "react";
import { Lock, TrendingUp, AlertCircle, Check } from "lucide-react";
import { ProductShell } from "@/components/layout/product-shell";

const TIERS = [
  { days: 30, apy: 5, label: "30 Days" },
  { days: 90, apy: 8, label: "90 Days" },
  { days: 180, apy: 12, label: "180 Days" },
  { days: 365, apy: 18, label: "365 Days" },
];

const MINIMUM_STAKE = 100;

export default function StakePage() {
  const [selectedTier, setSelectedTier] = useState(TIERS[0]);
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const isValidAmount = amountNum >= MINIMUM_STAKE;
  const estimatedReward = (amountNum * selectedTier.apy * selectedTier.days) / (365 * 100);

  const handleStake = async () => {
    if (!isValidAmount) return;
    setIsStaking(true);
    // Simulate staking transaction
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsStaking(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <ProductShell>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold tracking-[-0.75px] text-[var(--color-text-dark)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Stake ECO Tokens
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Lock your tokens to earn rewards. Longer lock periods offer higher APY.
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-6 rounded-2xl bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <label className="mb-2 block text-sm font-medium text-[var(--color-text-dark)]">
            Stake Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min 100 ECO)"
              className="w-full rounded-xl border border-[var(--color-surface-muted)] bg-[var(--color-surface)] px-4 py-3 text-lg font-semibold text-[var(--color-text-dark)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-secondary)] focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--color-text-muted)]">
              ECO
            </span>
          </div>
          {!isValidAmount && amount !== "" && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
              <AlertCircle size={16} />
              <span>Minimum stake is {MINIMUM_STAKE} ECO</span>
            </div>
          )}
        </div>

        {/* Duration Tiers */}
        <div className="mb-6 rounded-2xl bg-[var(--color-surface-elevated)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <label className="mb-4 block text-sm font-medium text-[var(--color-text-dark)]">
            Select Lock Period
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TIERS.map((tier) => (
              <button
                key={tier.days}
                onClick={() => setSelectedTier(tier)}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  selectedTier.days === tier.days
                    ? "border-[var(--color-brand-secondary)] bg-[var(--color-brand-secondary)]/5"
                    : "border-[var(--color-surface-muted)] hover:border-[var(--color-brand-secondary)]/50"
                }`}
              >
                <Lock
                  size={20}
                  className={`mx-auto mb-2 ${
                    selectedTier.days === tier.days
                      ? "text-[var(--color-brand-secondary)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                />
                <p className="text-sm font-semibold text-[var(--color-text-dark)]">
                  {tier.label}
                </p>
                <p
                  className={`text-sm font-bold ${
                    selectedTier.days === tier.days
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-brand-tertiary)]"
                  }`}
                >
                  {tier.apy}% APY
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Estimate */}
        {isValidAmount && (
          <div className="mb-6 rounded-2xl bg-[var(--color-success)]/5 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-[var(--color-success)]" />
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Estimated Reward</p>
                <p className="text-xl font-semibold text-[var(--color-success)]">
                  +{estimatedReward.toFixed(2)} ECO
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  After {selectedTier.days} days at {selectedTier.apy}% APY
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stake Button */}
        <button
          onClick={handleStake}
          disabled={!isValidAmount || isStaking}
          className={`w-full rounded-xl py-4 text-base font-semibold transition-all ${
            isValidAmount && !isStaking
              ? "bg-[var(--color-text-dark)] text-[var(--color-text-inverse)] hover:opacity-90"
              : "cursor-not-allowed bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
          }`}
        >
          {isStaking ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Confirming...
            </span>
          ) : showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <Check size={20} />
              Stake Successful!
            </span>
          ) : (
            `Stake ${amountNum > 0 ? amountNum : ""} ECO`
          )}
        </button>

        {/* Info */}
        <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          By staking, you agree to lock your tokens for the selected period. Early withdrawal incurs a 10% penalty.
        </p>
      </div>
    </ProductShell>
  );
}
