"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type GasSpeed = "slow" | "average" | "fast";

interface GasPrice {
  speed: GasSpeed;
  gwei: number;
  estimatedTime: string;
  price: string;
}

interface GasEstimatorProps {
  onGasSelect?: (gasSpeed: GasSpeed) => void;
  className?: string;
}

export function GasEstimator({ onGasSelect, className }: GasEstimatorProps) {
  const [selectedSpeed, setSelectedSpeed] = useState<GasSpeed>("average");
  const [gasPrices, setGasPrices] = useState<GasPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch gas prices from blockchain API
    const fetchGasPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/gas/prices');
        if (!response.ok) {
          throw new Error('Failed to fetch gas prices');
        }
        const data = await response.json();
        setGasPrices(data);
      } catch (err) {
        setError("Failed to fetch gas prices");
        console.error("Gas price fetch error:", err);
        // Set default values on error
        setGasPrices([
          { speed: "slow", gwei: 0, estimatedTime: "N/A", price: "0" },
          { speed: "average", gwei: 0, estimatedTime: "N/A", price: "0" },
          { speed: "fast", gwei: 0, estimatedTime: "N/A", price: "0" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGasPrices();
    // Refresh gas prices every 30 seconds
    const interval = setInterval(fetchGasPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGasSelect = (speed: GasSpeed) => {
    setSelectedSpeed(speed);
    onGasSelect?.(speed);
  };

  if (isLoading) {
    return (
      <div className={cn("p-4 border rounded-lg", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 animate-pulse" />
          <span>Loading gas prices...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4 border rounded-lg bg-destructive/10", className)}>
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-sm">Gas Fee</h3>
        <TrendingUp className="h-4 w-4 text-muted-foreground ml-auto" />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {gasPrices.map((gas) => (
          <button
            key={gas.speed}
            onClick={() => handleGasSelect(gas.speed)}
            className={cn(
              "p-3 rounded-lg border-2 transition-all",
              "hover:border-primary/50",
              selectedSpeed === gas.speed
                ? "border-primary bg-primary/5"
                : "border-border"
            )}
          >
            <div className="text-xs font-medium uppercase text-muted-foreground mb-1">
              {gas.speed}
            </div>
            <div className="text-lg font-bold">{gas.gwei}</div>
            <div className="text-xs text-muted-foreground">Gwei</div>
            <div className="text-xs text-muted-foreground mt-1">
              {gas.estimatedTime}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Estimated fee:</span>
          <span className="font-medium text-foreground">
            {gasPrices.find((g) => g.speed === selectedSpeed)?.price} INIT
          </span>
        </div>
      </div>
    </div>
  );
}
