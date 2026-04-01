"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";

/**
 * Auto-sign Context Type
 * 
 * Requirement 16.8: Support Initia Auto-sign for seamless transaction signing
 * Manages auto-sign session lifecycle, expiration, and fallback to manual signing
 */
export type AutosignContextType = {
  isAutoSignEnabled: boolean;
  autoSignSessionExpiry?: Date;
  isSessionExpired: boolean;
  isSessionExpiring: boolean; // True when session is within 5 minutes of expiry
  enableAutoSign: (durationMinutes?: number) => Promise<void>;
  disableAutoSign: () => Promise<void>;
  refreshSession: (durationMinutes?: number) => Promise<void>;
  shouldFallbackToManualSign: () => boolean;
  error?: Error;
};

const AutosignContext = createContext<AutosignContextType | undefined>(undefined);

const DEFAULT_SESSION_DURATION = 30; // 30 minutes
const SESSION_CHECK_INTERVAL = 30000; // Check every 30 seconds
const SESSION_EXPIRY_WARNING_THRESHOLD = 5 * 60 * 1000; // Warn when 5 minutes left
const AUTOSIGN_SESSION_KEY = "autosign_session";

/**
 * Auto-sign Provider
 * 
 * Manages session-based transaction signing with:
 * - Session expiration tracking
 * - Automatic fallback to manual signing
 * - Session refresh capability
 * - Wallet disconnection handling
 */
export function AutosignProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isAutoSignEnabled, setIsAutoSignEnabled] = useState(false);
  const [autoSignSessionExpiry, setAutoSignSessionExpiry] = useState<Date | undefined>();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isSessionExpiring, setIsSessionExpiring] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  // Check session expiry periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoSignSessionExpiry && isAutoSignEnabled) {
        const now = new Date();
        const timeUntilExpiry = autoSignSessionExpiry.getTime() - now.getTime();
        const expired = timeUntilExpiry <= 0;
        const expiring = timeUntilExpiry > 0 && timeUntilExpiry <= SESSION_EXPIRY_WARNING_THRESHOLD;

        setIsSessionExpired(expired);
        setIsSessionExpiring(expiring);

        if (expired) {
          setIsAutoSignEnabled(false);
          // Clear session storage when expired
          try {
            sessionStorage.removeItem(AUTOSIGN_SESSION_KEY);
          } catch (err) {
            console.warn("Failed to clear expired auto-sign session:", err);
          }
        }
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [autoSignSessionExpiry, isAutoSignEnabled]);

  // Clear auto-sign when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setIsAutoSignEnabled(false);
      setAutoSignSessionExpiry(undefined);
      setIsSessionExpired(false);
      setIsSessionExpiring(false);
      try {
        sessionStorage.removeItem(AUTOSIGN_SESSION_KEY);
      } catch (err) {
        console.warn("Failed to clear auto-sign session on disconnect:", err);
      }
    }
  }, [isConnected]);

  const handleEnableAutoSign = useCallback(
    async (durationMinutes = DEFAULT_SESSION_DURATION) => {
      try {
        setError(undefined);

        if (!address) {
          throw new Error("Wallet not connected");
        }

        // Calculate expiry time
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + durationMinutes);

        // Store in session storage
        const sessionData = {
          address,
          enabledAt: new Date().toISOString(),
          expiresAt: expiry.toISOString(),
          durationMinutes,
        };

        try {
          sessionStorage.setItem(AUTOSIGN_SESSION_KEY, JSON.stringify(sessionData));
        } catch (err) {
          console.warn("Failed to store auto-sign session:", err);
        }

        setIsAutoSignEnabled(true);
        setAutoSignSessionExpiry(expiry);
        setIsSessionExpired(false);
        setIsSessionExpiring(false);

        console.log(`Auto-sign enabled until ${expiry.toISOString()}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("Failed to enable auto-sign:", error);
        throw error;
      }
    },
    [address]
  );

  const handleDisableAutoSign = useCallback(async () => {
    try {
      setError(undefined);

      // Clear session storage
      try {
        sessionStorage.removeItem(AUTOSIGN_SESSION_KEY);
      } catch (err) {
        console.warn("Failed to clear auto-sign session:", err);
      }

      setIsAutoSignEnabled(false);
      setAutoSignSessionExpiry(undefined);
      setIsSessionExpired(false);
      setIsSessionExpiring(false);

      console.log("Auto-sign disabled");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to disable auto-sign:", error);
      throw error;
    }
  }, []);

  const handleRefreshSession = useCallback(
    async (durationMinutes = DEFAULT_SESSION_DURATION) => {
      try {
        setError(undefined);

        if (!isAutoSignEnabled) {
          throw new Error("Auto-sign not enabled");
        }

        if (!address) {
          throw new Error("Wallet not connected");
        }

        // Calculate new expiry time
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + durationMinutes);

        // Update session storage
        const sessionData = {
          address,
          enabledAt: new Date().toISOString(),
          expiresAt: expiry.toISOString(),
          durationMinutes,
        };

        try {
          sessionStorage.setItem(AUTOSIGN_SESSION_KEY, JSON.stringify(sessionData));
        } catch (err) {
          console.warn("Failed to update auto-sign session:", err);
        }

        setAutoSignSessionExpiry(expiry);
        setIsSessionExpired(false);
        setIsSessionExpiring(false);

        console.log(`Auto-sign session refreshed until ${expiry.toISOString()}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("Failed to refresh auto-sign session:", error);
        throw error;
      }
    },
    [isAutoSignEnabled, address]
  );

  const shouldFallbackToManualSign = useCallback(() => {
    // Fallback to manual signing if:
    // 1. Auto-sign is not enabled
    // 2. Session has expired
    // 3. Session is expiring soon (within warning threshold)
    return !isAutoSignEnabled || isSessionExpired || isSessionExpiring;
  }, [isAutoSignEnabled, isSessionExpired, isSessionExpiring]);

  // Restore session on mount
  useEffect(() => {
    try {
      const sessionData = sessionStorage.getItem(AUTOSIGN_SESSION_KEY);
      if (sessionData) {
        const data = JSON.parse(sessionData);
        const expiry = new Date(data.expiresAt);
        const now = new Date();

        if (now < expiry && data.address === address) {
          setIsAutoSignEnabled(true);
          setAutoSignSessionExpiry(expiry);
          setIsSessionExpired(false);
          setIsSessionExpiring(false);
        } else {
          // Session expired or address changed
          sessionStorage.removeItem(AUTOSIGN_SESSION_KEY);
          setIsAutoSignEnabled(false);
          setAutoSignSessionExpiry(undefined);
          setIsSessionExpired(true);
          setIsSessionExpiring(false);
        }
      }
    } catch (err) {
      console.error("Failed to restore auto-sign session:", err);
      try {
        sessionStorage.removeItem(AUTOSIGN_SESSION_KEY);
      } catch (clearErr) {
        console.warn("Failed to clear corrupted auto-sign session:", clearErr);
      }
    }
  }, [address]);

  const value: AutosignContextType = {
    isAutoSignEnabled,
    autoSignSessionExpiry,
    isSessionExpired,
    isSessionExpiring,
    enableAutoSign: handleEnableAutoSign,
    disableAutoSign: handleDisableAutoSign,
    refreshSession: handleRefreshSession,
    shouldFallbackToManualSign,
    error,
  };

  return <AutosignContext.Provider value={value}>{children}</AutosignContext.Provider>;
}

export function useAutosign(): AutosignContextType {
  const context = useContext(AutosignContext);
  if (!context) {
    throw new Error("useAutosign must be used within AutosignProvider");
  }
  return context;
}
