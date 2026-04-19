"use client";

import React, { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { LogOut, AlertCircle, Loader2 } from "lucide-react";

/**
 * Wallet Disconnect Button Component
 * 
 * Requirement 16.1, 16.5, 16.7
 * - Provides wallet disconnection functionality
 * - Shows confirmation dialog before disconnecting
 * - Handles disconnection errors with user-friendly messages
 * - Clears session data on successful disconnect
 */
export function WalletDisconnectButton() {
  const { isConnected, disconnect, error } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isConnected) {
    return null;
  }

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await disconnect();
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Disconnect wallet?
            </p>
            <p className="text-xs text-amber-700 mt-1">
              You'll need to reconnect to continue using the platform.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="danger"
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Disconnect
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {error.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      Disconnect
    </Button>
  );
}
