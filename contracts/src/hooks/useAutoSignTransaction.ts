/**
 * Auto-sign Transaction Hook
 * 
 * Requirement 16.8: Support Initia Auto-sign for seamless transaction signing
 * Provides transaction signing with automatic fallback to manual signing
 */

import { useCallback, useState } from "react";
import { useAutosign } from "@/contexts/autosign-context";
import { useWallet } from "@/contexts/wallet-context";
import { shouldUseAutoSign, getSigningMethodDescription } from "@/lib/wallet/auto-sign-manager";

export interface UseAutoSignTransactionOptions {
  /**
   * Callback when manual signing is required
   */
  onManualSignRequired?: () => void;
  
  /**
   * Callback when auto-sign is used
   */
  onAutoSignUsed?: () => void;
  
  /**
   * Callback when session is about to expire
   */
  onSessionExpiring?: () => void;
}

export interface TransactionSigningState {
  canUseAutoSign: boolean;
  shouldFallbackToManual: boolean;
  signingMethod: string;
  isAutoSignEnabled: boolean;
  isSessionExpired: boolean;
  isSessionExpiring: boolean;
  timeUntilExpiry: number; // in minutes
}

/**
 * Hook for handling transaction signing with auto-sign support
 * 
 * Usage:
 * ```tsx
 * const { canUseAutoSign, shouldFallbackToManual, signingMethod, refreshSession } = 
 *   useAutoSignTransaction({
 *     onManualSignRequired: () => console.log("Manual signing needed"),
 *     onSessionExpiring: () => console.log("Session expiring soon")
 *   });
 * 
 * // In transaction handler:
 * if (shouldFallbackToManual) {
 *   // Use manual signing
 * } else {
 *   // Use auto-sign
 * }
 * ```
 */
export function useAutoSignTransaction(
  options: UseAutoSignTransactionOptions = {}
) {
  const { onManualSignRequired, onAutoSignUsed, onSessionExpiring } = options;
  const { isConnected } = useWallet();
  const {
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring,
    autoSignSessionExpiry,
    shouldFallbackToManualSign,
    refreshSession,
  } = useAutosign();

  const [hasNotifiedExpiring, setHasNotifiedExpiring] = useState(false);

  // Notify when session is expiring
  if (
    isSessionExpiring &&
    !hasNotifiedExpiring &&
    onSessionExpiring &&
    isConnected
  ) {
    setHasNotifiedExpiring(true);
    onSessionExpiring();
  }

  // Reset notification flag when session is refreshed
  if (!isSessionExpiring && hasNotifiedExpiring) {
    setHasNotifiedExpiring(false);
  }

  const canUseAutoSign = shouldUseAutoSign(
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring
  );

  const shouldFallback = shouldFallbackToManualSign();

  const signingMethod = getSigningMethodDescription(
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring
  );

  const timeUntilExpiry = autoSignSessionExpiry
    ? Math.max(0, Math.floor((autoSignSessionExpiry.getTime() - Date.now()) / 60000))
    : 0;

  const handleSignTransaction = useCallback(
    async <T,>(
      signFn: (useAutoSign: boolean) => Promise<T>
    ): Promise<T> => {
      try {
        if (shouldFallback) {
          onManualSignRequired?.();
          return signFn(false);
        } else {
          onAutoSignUsed?.();
          return signFn(true);
        }
      } catch (error) {
        // If auto-sign fails, fall back to manual signing
        if (canUseAutoSign && !shouldFallback) {
          console.warn("Auto-sign failed, falling back to manual signing:", error);
          onManualSignRequired?.();
          return signFn(false);
        }
        throw error;
      }
    },
    [shouldFallback, canUseAutoSign, onManualSignRequired, onAutoSignUsed]
  );

  const state: TransactionSigningState = {
    canUseAutoSign,
    shouldFallbackToManual: shouldFallback,
    signingMethod,
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring,
    timeUntilExpiry,
  };

  return {
    ...state,
    handleSignTransaction,
    refreshSession,
  };
}
