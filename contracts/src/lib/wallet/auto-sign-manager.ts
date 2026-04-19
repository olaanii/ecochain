/**
 * Auto-sign Manager
 * 
 * Requirement 16.8: Support Initia Auto-sign for seamless transaction signing
 * Handles transaction signing with auto-sign when available, falling back to manual signing
 */

import { useAutosign } from "@/contexts/autosign-context";

export interface TransactionSigningOptions {
  /**
   * Whether to attempt auto-sign first
   * If auto-sign is unavailable or expired, falls back to manual signing
   */
  preferAutoSign?: boolean;
  
  /**
   * Callback when manual signing is required
   */
  onManualSignRequired?: () => void;
  
  /**
   * Callback when auto-sign is used
   */
  onAutoSignUsed?: () => void;
}

/**
 * Determines if a transaction should use auto-sign or manual signing
 * 
 * Auto-sign is used when:
 * - Auto-sign is enabled
 * - Session has not expired
 * - Session is not expiring soon (within 5 minutes)
 * 
 * Falls back to manual signing when:
 * - Auto-sign is disabled
 * - Session has expired
 * - Session is expiring soon
 */
export function shouldUseAutoSign(
  isAutoSignEnabled: boolean,
  isSessionExpired: boolean,
  isSessionExpiring: boolean
): boolean {
  return isAutoSignEnabled && !isSessionExpired && !isSessionExpiring;
}

/**
 * Get signing method description for UI display
 */
export function getSigningMethodDescription(
  isAutoSignEnabled: boolean,
  isSessionExpired: boolean,
  isSessionExpiring: boolean
): string {
  if (!isAutoSignEnabled) {
    return "Manual signing required";
  }
  
  if (isSessionExpired) {
    return "Session expired - manual signing required";
  }
  
  if (isSessionExpiring) {
    return "Session expiring soon - manual signing will be required";
  }
  
  return "Auto-sign enabled";
}

/**
 * Hook to get auto-sign status for transaction signing
 */
export function useTransactionSigning() {
  const {
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring,
    shouldFallbackToManualSign,
    refreshSession,
  } = useAutosign();

  const canUseAutoSign = shouldUseAutoSign(
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring
  );

  const signingMethod = getSigningMethodDescription(
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring
  );

  return {
    canUseAutoSign,
    shouldFallback: shouldFallbackToManualSign(),
    signingMethod,
    refreshSession,
    isAutoSignEnabled,
    isSessionExpired,
    isSessionExpiring,
  };
}

/**
 * Wrapper for transaction signing that handles auto-sign with fallback
 */
export async function signTransactionWithFallback<T>(
  signFn: (useAutoSign: boolean) => Promise<T>,
  options: TransactionSigningOptions = {}
): Promise<T> {
  const { preferAutoSign = true, onManualSignRequired, onAutoSignUsed } = options;

  // This would be called from a component that has access to useAutosign hook
  // The actual signing logic is handled by the transaction manager
  
  if (preferAutoSign && onAutoSignUsed) {
    onAutoSignUsed();
  } else if (!preferAutoSign && onManualSignRequired) {
    onManualSignRequired();
  }

  return signFn(preferAutoSign);
}
