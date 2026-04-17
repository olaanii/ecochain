"use client";

import React from "react";
import { useWallet } from "@/contexts/wallet-context";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Wallet Status Component
 * 
 * Requirement 16.4, 16.5
 * - Displays wallet connection status
 * - Shows chain validation status
 * - Displays wallet address and username
 */
export function WalletStatus() {
  const { isConnected, isCorrectChain, initiaAddress, username, chainId } = useWallet();

  if (!isConnected) {
    return null;
  }

  const shortenAddress = (address: string) => {
    if (address.length < 14) return address;
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isCorrectChain ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        )}
        <span className="text-sm font-medium">
          {isCorrectChain ? "Connected to Initia Appchain" : "Wrong Chain"}
        </span>
      </div>

      {initiaAddress && (
        <div className="text-sm text-slate-400">
          <div>Address: {shortenAddress(initiaAddress)}</div>
          {username && <div>Username: {username}</div>}
          {chainId && <div>Chain ID: {chainId}</div>}
        </div>
      )}

      {!isCorrectChain && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          Please switch to the Initia appchain to continue.
        </div>
      )}
    </div>
  );
}
