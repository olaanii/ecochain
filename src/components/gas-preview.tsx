"use client";

import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface GasPreviewProps {
  gasPrice?: string;
  gasLimit?: string;
  estimatedFee?: string;
  currency?: string;
  className?: string;
}

export function GasPreview({
  gasPrice,
  gasLimit = "21000",
  estimatedFee,
  currency = "INIT",
  className,
}: GasPreviewProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <Activity className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">Gas:</span>
      {estimatedFee ? (
        <span className="font-medium">{estimatedFee} {currency}</span>
      ) : (
        <span className="text-muted-foreground">Calculating...</span>
      )}
      {gasPrice && (
        <span className="text-xs text-muted-foreground">
          ({gasPrice} Gwei)
        </span>
      )}
    </div>
  );
}
