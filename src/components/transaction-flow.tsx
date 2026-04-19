"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactionStore, TransactionStatus } from "@/stores/transaction-store";
import { useToast } from "@/components/ui/use-toast";

interface TransactionFlowProps {
  txId?: string;
  txHash?: string;
  onRetry?: () => void;
  explorerUrl?: string;
}

export function TransactionFlow({ txId, txHash, onRetry, explorerUrl }: TransactionFlowProps) {
  const { transactions, updateTransaction } = useTransactionStore();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<TransactionStatus>("pending");

  const transaction = txId
    ? transactions.find((t) => t.id === txId)
    : txHash
    ? transactions.find((t) => t.hash === txHash)
    : transactions[0];

  useEffect(() => {
    if (transaction) {
      setCurrentStatus(transaction.status);
    }
  }, [transaction]);

  const steps = [
    { key: "pending" as TransactionStatus, label: "Signing", icon: Clock },
    { key: "confirming" as TransactionStatus, label: "Pending", icon: Clock },
    { key: "confirmed" as TransactionStatus, label: "Confirmed", icon: CheckCircle2 },
    { key: "failed" as TransactionStatus, label: "Failed", icon: AlertCircle },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStatus);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      toast({
        title: "Retry",
        description: "Transaction retry initiated",
        variant: "default",
      });
    }
  };

  if (!transaction) {
    return null;
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Transaction Status</h3>
        {transaction.status === "failed" && onRetry && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isActive
                      ? transaction.status === "failed" && isCurrent
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "text-xs mt-1",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Transaction Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium capitalize">{transaction.type}</span>
        </div>
        {transaction.amount && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{transaction.amount}</span>
          </div>
        )}
        {transaction.hash && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Hash:</span>
            <a
              href={`${explorerUrl}/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <span className="font-mono text-xs">
                {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-6)}
              </span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        {transaction.error && transaction.status === "failed" && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded mt-2">
            <p className="text-xs text-destructive">{transaction.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
