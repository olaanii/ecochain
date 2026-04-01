"use client";

import React from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";

/**
 * Wallet Connect Button Component
 * 
 * Requirement 16.2, 16.5, 16.7
 * - Displays wallet connection status
 * - Provides connect/disconnect functionality
 * - Shows wallet address with copy functionality
 * - Handles connection errors with user-friendly messages
 */
export function WalletConnectButton() {
  const { isConnected, isConnecting, error, connect, initiaAddress } = useWallet();

  const handleCopyAddress = () => {
    if (initiaAddress) {
      navigator.clipboard.writeText(initiaAddress);
    }
  };

  const shortenAddress = (address: string) => {
    if (address.length < 14) return address;
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  if (isConnected && initiaAddress) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyAddress}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-100 transition-colors"
          title="Click to copy address"
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {shortenAddress(initiaAddress)}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="gap-2"
        variant="primary"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error.message}
        </div>
      )}
    </div>
  );
}
