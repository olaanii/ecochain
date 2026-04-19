import { AlertTriangle, Shield, Info } from "lucide-react";
import { getTransactionWarning, isRiskyTransaction } from "@/lib/transaction-safety";
import { clsx } from "clsx";

interface TransactionSafetyWarningProps {
  to: string;
  value: string;
  className?: string;
}

export function TransactionSafetyWarning({ to, value, className }: TransactionSafetyWarningProps) {
  const warning = getTransactionWarning(to, value);
  const isRisky = isRiskyTransaction(to, value);

  if (!warning && !isRisky) {
    return null;
  }

  return (
    <div
      className={clsx(
        "rounded-lg border p-4",
        isRisky
          ? "border-red-500/30 bg-red-500/5"
          : "border-yellow-500/30 bg-yellow-500/5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={clsx("mt-0.5", isRisky ? "text-red-400" : "text-yellow-400")}>
          {isRisky ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <h4
            className={clsx(
              "font-semibold",
              isRisky ? "text-red-300" : "text-yellow-300"
            )}
          >
            {isRisky ? "⚠️ Risky Transaction Detected" : "Transaction Notice"}
          </h4>
          <p className="mt-1 text-sm text-slate-300">{warning}</p>
          
          {isRisky && (
            <div className="mt-3 rounded-md bg-slate-800/50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-400">Safety Tips:</span>
              </div>
              <ul className="mt-2 ml-6 list-disc space-y-1 text-sm text-slate-400">
                <li>Verify the recipient address carefully</li>
                <li>Check that you recognize the contract</li>
                <li>Consider starting with a smaller test amount</li>
                <li>Review the transaction details before confirming</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ContractVerificationBadgeProps {
  address: string;
  contractName?: string;
  verified?: boolean;
  className?: string;
}

export function ContractVerificationBadge({
  address,
  contractName,
  verified = false,
  className,
}: ContractVerificationBadgeProps) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        verified
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-orange-500/30 bg-orange-500/10 text-orange-300",
        className
      )}
    >
      {verified ? (
        <Shield className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      <span>
        {verified ? "Verified Contract" : "Unverified Contract"}
        {contractName && ` (${contractName})`}
      </span>
    </div>
  );
}

interface SlippageWarningProps {
  slippagePercent: number;
  className?: string;
}

export function SlippageWarning({ slippagePercent, className }: SlippageWarningProps) {
  const isHighSlippage = slippagePercent > 1.0;
  const isMediumSlippage = slippagePercent > 0.5;

  if (slippagePercent <= 0.5) {
    return null;
  }

  return (
    <div
      className={clsx(
        "rounded-lg border p-3",
        isHighSlippage
          ? "border-red-500/30 bg-red-500/5"
          : "border-yellow-500/30 bg-yellow-500/5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle
          className={clsx(
            "h-4 w-4",
            isHighSlippage ? "text-red-400" : "text-yellow-400"
          )}
        />
        <span
          className={clsx(
            "text-sm font-medium",
            isHighSlippage ? "text-red-300" : "text-yellow-300"
          )}
        >
          {isHighSlippage ? "High Slippage Warning" : "Slippage Notice"}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Your transaction may fail if price moves by more than {slippagePercent.toFixed(2)}%.
        {isHighSlippage && " Consider increasing your slippage tolerance."}
      </p>
    </div>
  );
}
