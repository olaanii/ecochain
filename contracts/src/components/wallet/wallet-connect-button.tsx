"use client";

import React from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useInterwovenKit } from "@initia/interwovenkit-react";

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
  const { openWallet } = useInterwovenKit();

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
        <Button
          type="button"
          onClick={openWallet}
          className="gap-2 px-3 py-2 text-sm font-medium"
          variant="primary"
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {shortenAddress(initiaAddress)}
          </span>
        </Button>
        <button
          onClick={handleCopyAddress}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
          title="Click to copy address"
        >
          Copy
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
