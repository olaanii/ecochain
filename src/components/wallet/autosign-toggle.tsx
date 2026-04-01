"use client";

import React, { useState } from "react";
import { useAutosign } from "@/contexts/autosign-context";
import { useWallet } from "@/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";

/**
 * Auto-sign Toggle Component
 * 
 * Requirement 16.8: Support Initia Auto-sign for seamless transaction signing
 * Provides UI for enabling/disabling auto-sign and managing session lifecycle
 */
export function AutosignToggle() {
  const { isConnected } = useWallet();
  const {
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring,
    autoSignSessionExpiry,
    enableAutoSign,
    disableAutoSign,
    refreshSession,
    shouldFallbackToManualSign,
    error,
  } = useAutosign();

  const [isLoading, setIsLoading] = useState(false);

  if (!isConnected) {
    return null;
  }

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isAutoSignEnabled) {
        await disableAutoSign();
      } else {
        await enableAutoSign(30); // 30 minute session
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshSession(30);
    } finally {
      setIsLoading(false);
    }
  };

  const timeUntilExpiry = autoSignSessionExpiry
    ? Math.max(0, Math.floor((autoSignSessionExpiry.getTime() - Date.now()) / 60000))
    : 0;

  const willFallbackToManual = shouldFallbackToManualSign();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleToggle}
          disabled={isLoading}
          variant={isAutoSignEnabled && !willFallbackToManual ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : isAutoSignEnabled && !willFallbackToManual ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Auto-sign Enabled
            </>
          ) : (
            <>
              Enable Auto-sign
            </>
          )}
        </Button>

        {isAutoSignEnabled && !isSessionExpired && (
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        )}
      </div>

      {isAutoSignEnabled && autoSignSessionExpiry && (
        <div className="text-sm">
          {isSessionExpired ? (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Session expired - using manual signing
            </div>
          ) : isSessionExpiring ? (
            <div className="flex items-center gap-1 text-amber-600">
              <Clock className="h-4 w-4" />
              Session expiring soon ({timeUntilExpiry} minute{timeUntilExpiry !== 1 ? "s" : ""})
            </div>
          ) : (
            <div className="text-gray-600">
              Session expires in {timeUntilExpiry} minute{timeUntilExpiry !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error.message}
        </div>
      )}

      {willFallbackToManual && isAutoSignEnabled && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Transactions will require manual signing until session is refreshed
        </div>
      )}
    </div>
  );
}
