"use client";

import { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Wifi, WifiOff, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface NetworkStateProps {
  className?: string;
  showLabel?: boolean;
  showBanner?: boolean;
}

interface RpcStatus {
  latency: number;
  isHealthy: boolean;
  lastCheck: number;
}

const EXPECTED_CHAIN_ID = "ecochain105";

export function NetworkState({ className, showLabel = false, showBanner = true }: NetworkStateProps) {
  const { isCorrectChain, chainId, isConnected, switchNetwork } = useWallet();
  const { toast } = useToast();
  const [isSwitching, setIsSwitching] = useState(false);
  const [rpcStatus, setRpcStatus] = useState<RpcStatus>({
    latency: 0,
    isHealthy: true,
    lastCheck: Date.now(),
  });
  const [showDetails, setShowDetails] = useState(false);

  if (!isConnected) {
    return null;
  }

  const isHealthy = isCorrectChain;

  const handleSwitchNetwork = async () => {
    try {
      setIsSwitching(true);
      await switchNetwork?.(EXPECTED_CHAIN_ID);
      toast({
        title: "Network Switched",
        description: "Successfully switched to EcoChain network.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const checkRpcStatus = async () => {
    const start = performance.now();
    try {
      // Mock RPC health check - replace with actual RPC ping
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 50));
      const latency = Math.round(performance.now() - start);
      setRpcStatus({
        latency,
        isHealthy: latency < 1000,
        lastCheck: Date.now(),
      });
    } catch (error) {
      setRpcStatus({
        latency: 0,
        isHealthy: false,
        lastCheck: Date.now(),
      });
    }
  };

  return (
    <>
      {/* Wrong Network Banner */}
      {showBanner && !isCorrectChain && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Wrong Network</span>
              <span className="text-yellow-700 dark:text-yellow-300">
                Please switch to EcoChain to continue
              </span>
            </div>
            <Button
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              {isSwitching ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Switching...
                </>
              ) : (
                "Switch Network"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Network State Indicator */}
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "flex items-center justify-center w-2 h-2 rounded-full",
            isHealthy ? "bg-green-500" : "bg-yellow-500"
          )}
        />
        {showLabel && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {isHealthy ? (
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {chainId || "Connected"}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-3 w-3" />
                Wrong Network
              </span>
            )}
            {showDetails ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Network Details Panel */}
      {showDetails && showLabel && (
        <div className="absolute top-full left-0 mt-2 bg-card border rounded-lg shadow-lg p-3 min-w-[200px] z-50">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className={cn("font-medium", isHealthy ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400")}>
                {chainId || "Unknown"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={cn("font-medium", isHealthy ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400")}>
                {isHealthy ? "Correct" : "Wrong"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">RPC Latency:</span>
              <span className={cn("font-medium", rpcStatus.isHealthy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {rpcStatus.latency}ms
              </span>
            </div>
            <button
              onClick={checkRpcStatus}
              className="w-full flex items-center justify-center gap-1 text-primary hover:underline mt-2"
            >
              <RefreshCw className="h-3 w-3" />
              Check RPC
            </button>
            {!isCorrectChain && (
              <Button
                onClick={handleSwitchNetwork}
                disabled={isSwitching}
                size="sm"
                className="w-full mt-2"
              >
                {isSwitching ? "Switching..." : "Switch Network"}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
