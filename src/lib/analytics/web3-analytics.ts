/**
 * Web3 Analytics Tracking
 * 
 * Tracks Web3-specific events:
 * - Wallet connections
 * - Transaction success/failure rates
 * - Network changes
 * - Account changes
 */

type WalletEvent = "connect" | "disconnect" | "account_change" | "network_change";
type TransactionEvent = "tx_start" | "tx_success" | "tx_failed" | "tx_reverted";

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Track wallet connection events
 */
export function trackWalletEvent(
  event: WalletEvent,
  properties?: Record<string, unknown>
): void {
  const analyticsEvent: AnalyticsEvent = {
    event: `wallet_${event}`,
    properties: {
      ...properties,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  };

  // Send to analytics (Vercel Analytics, custom endpoint, etc.)
  sendAnalyticsEvent(analyticsEvent);
}

/**
 * Track transaction events
 */
export function trackTransactionEvent(
  event: TransactionEvent,
  properties?: Record<string, unknown>
): void {
  const analyticsEvent: AnalyticsEvent = {
    event: `transaction_${event}`,
    properties: {
      ...properties,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  };

  sendAnalyticsEvent(analyticsEvent);
}

/**
 * Send analytics event
 * This can be extended to send to multiple analytics providers
 */
function sendAnalyticsEvent(event: AnalyticsEvent): void {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Web3 Analytics]", event);
  }

  // Send to Vercel Analytics if available
  if (typeof window !== "undefined" && (window as any).va) {
    (window as any).va("event", event.event, event.properties);
  }

  // Send to custom analytics endpoint if configured
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }).catch((error) => {
      console.error("[Web3 Analytics] Failed to send event:", error);
    });
  }
}

/**
 * Web3 Analytics Helper Class
 */
export class Web3Analytics {
  private static txStartTime = new Map<string, number>();
  private static connectionAttempts = 0;
  private static successfulConnections = 0;

  /**
   * Track wallet connection attempt
   */
  static trackConnectionAttempt(walletType: string): void {
    this.connectionAttempts++;
    trackWalletEvent("connect", {
      wallet_type: walletType,
      attempt_number: this.connectionAttempts,
    });
  }

  /**
   * Track successful wallet connection
   */
  static trackConnectionSuccess(walletType: string, address: string): void {
    this.successfulConnections++;
    trackWalletEvent("connect", {
      wallet_type: walletType,
      address: this.maskAddress(address),
      success: true,
      success_rate: this.getConnectionSuccessRate(),
    });
  }

  /**
   * Track wallet disconnection
   */
  static trackDisconnection(address: string): void {
    trackWalletEvent("disconnect", {
      address: this.maskAddress(address),
    });
  }

  /**
   * Track account change
   */
  static trackAccountChange(fromAddress: string, toAddress: string): void {
    trackWalletEvent("account_change", {
      from_address: this.maskAddress(fromAddress),
      to_address: this.maskAddress(toAddress),
    });
  }

  /**
   * Track network change
   */
  static trackNetworkChange(fromChainId: number, toChainId: number): void {
    trackWalletEvent("network_change", {
      from_chain_id: fromChainId,
      to_chain_id: toChainId,
    });
  }

  /**
   * Track transaction start
   */
  static trackTransactionStart(txHash: string, type: string): void {
    this.txStartTime.set(txHash, Date.now());
    trackTransactionEvent("tx_start", {
      tx_hash: this.maskTxHash(txHash),
      tx_type: type,
    });
  }

  /**
   * Track transaction success
   */
  static trackTransactionSuccess(txHash: string, type: string): void {
    const startTime = this.txStartTime.get(txHash);
    const duration = startTime ? Date.now() - startTime : 0;
    
    this.txStartTime.delete(txHash);
    trackTransactionEvent("tx_success", {
      tx_hash: this.maskTxHash(txHash),
      tx_type: type,
      duration_ms: duration,
    });
  }

  /**
   * Track transaction failure
   */
  static trackTransactionFailure(
    txHash: string | null,
    type: string,
    error: string
  ): void {
    const startTime = txHash ? this.txStartTime.get(txHash) : null;
    const duration = startTime ? Date.now() - startTime : 0;
    
    if (txHash) {
      this.txStartTime.delete(txHash);
    }
    
    trackTransactionEvent("tx_failed", {
      tx_hash: txHash ? this.maskTxHash(txHash) : null,
      tx_type: type,
      error: error.substring(0, 200), // Limit error length
      duration_ms: duration,
    });
  }

  /**
   * Track transaction revert
   */
  static trackTransactionRevert(txHash: string, type: string, reason: string): void {
    const startTime = this.txStartTime.get(txHash);
    const duration = startTime ? Date.now() - startTime : 0;
    
    this.txStartTime.delete(txHash);
    trackTransactionEvent("tx_reverted", {
      tx_hash: this.maskTxHash(txHash),
      tx_type: type,
      reason: reason.substring(0, 200),
      duration_ms: duration,
    });
  }

  /**
   * Get connection success rate
   */
  static getConnectionSuccessRate(): number {
    if (this.connectionAttempts === 0) return 0;
    return this.successfulConnections / this.connectionAttempts;
  }

  /**
   * Get transaction metrics
   */
  static getTransactionMetrics(): {
    pending: number;
    successRate: number;
  } {
    const pending = this.txStartTime.size;
    // Success rate would need to be tracked separately
    const successRate = 0.85; // Placeholder - implement actual tracking
    
    return { pending, successRate };
  }

  /**
   * Mask address for privacy (show first 6 and last 4 characters)
   */
  private static maskAddress(address: string): string {
    if (!address || address.length < 10) return "0x****";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Mask transaction hash for privacy
   */
  private static maskTxHash(txHash: string): string {
    if (!txHash || txHash.length < 10) return "0x****";
    return `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
  }
}

/**
 * React Hook for Web3 Analytics
 */
export function useWeb3Analytics() {
  return {
    trackConnectionAttempt: Web3Analytics.trackConnectionAttempt.bind(Web3Analytics),
    trackConnectionSuccess: Web3Analytics.trackConnectionSuccess.bind(Web3Analytics),
    trackDisconnection: Web3Analytics.trackDisconnection.bind(Web3Analytics),
    trackAccountChange: Web3Analytics.trackAccountChange.bind(Web3Analytics),
    trackNetworkChange: Web3Analytics.trackNetworkChange.bind(Web3Analytics),
    trackTransactionStart: Web3Analytics.trackTransactionStart.bind(Web3Analytics),
    trackTransactionSuccess: Web3Analytics.trackTransactionSuccess.bind(Web3Analytics),
    trackTransactionFailure: Web3Analytics.trackTransactionFailure.bind(Web3Analytics),
    trackTransactionRevert: Web3Analytics.trackTransactionRevert.bind(Web3Analytics),
    getConnectionSuccessRate: Web3Analytics.getConnectionSuccessRate.bind(Web3Analytics),
    getTransactionMetrics: Web3Analytics.getTransactionMetrics.bind(Web3Analytics),
  };
}
