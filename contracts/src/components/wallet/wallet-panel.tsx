"use client";

import React from "react";
import { useWallet } from "@/contexts/wallet-context";
import { WalletConnectButton } from "./wallet-connect-button";
import { WalletStatus } from "./wallet-status";
import { WalletDisconnectButton } from "./wallet-disconnect-button";
import { AutosignToggle } from "./autosign-toggle";
import { Card } from "@/components/ui/card";

/**
 * Wallet Panel Component
 * 
 * Requirement 16.1, 16.2, 16.3, 16.4, 16.5, 16.7, 16.8
 * - Comprehensive wallet connection management interface
 * - Displays wallet status and connection details
 * - Provides connect/disconnect functionality
 * - Manages auto-sign settings
 * - Handles wallet connection errors
 */
export function WalletPanel() {
  const { isConnected } = useWallet();

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Wallet Connection
        </h3>

        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Connect your Initia wallet to get started with the Eco Rewards platform.
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Wallet Status */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <WalletStatus />
            </div>

            {/* Auto-sign Settings */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                Transaction Signing
              </div>
              <AutosignToggle />
            </div>

            {/* Disconnect Button */}
            <div className="pt-2 border-t border-slate-200">
              <WalletDisconnectButton />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
