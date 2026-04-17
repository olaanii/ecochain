/**
 * Session Storage Utilities for Wallet Management
 * 
 * Requirement 16.5: Store wallet address in user session
 * Provides utilities to persist wallet address across page navigation
 */

const WALLET_ADDRESS_KEY = "wallet_address";
const WALLET_CHAIN_ID_KEY = "wallet_chain_id";
const WALLET_USERNAME_KEY = "wallet_username";

/**
 * Store wallet address in session storage
 * Requirement 16.5: Store wallet address in user session
 */
export function storeWalletAddress(address: string): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(WALLET_ADDRESS_KEY, address);
    }
  } catch (err) {
    console.warn("Failed to store wallet address in session:", err);
  }
}

/**
 * Retrieve wallet address from session storage
 * Requirement 16.6: Maintain wallet connection state across page navigation
 */
export function getStoredWalletAddress(): string | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return sessionStorage.getItem(WALLET_ADDRESS_KEY);
    }
  } catch (err) {
    console.warn("Failed to retrieve wallet address from session:", err);
  }
  return null;
}

/**
 * Clear wallet address from session storage
 * Requirement 16.5: Clear the wallet address from the session
 */
export function clearWalletAddress(): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.removeItem(WALLET_ADDRESS_KEY);
      sessionStorage.removeItem(WALLET_CHAIN_ID_KEY);
      sessionStorage.removeItem(WALLET_USERNAME_KEY);
    }
  } catch (err) {
    console.warn("Failed to clear wallet address from session:", err);
  }
}

/**
 * Store wallet chain ID in session storage
 */
export function storeWalletChainId(chainId: string): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(WALLET_CHAIN_ID_KEY, chainId);
    }
  } catch (err) {
    console.warn("Failed to store wallet chain ID in session:", err);
  }
}

/**
 * Retrieve wallet chain ID from session storage
 */
export function getStoredWalletChainId(): string | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return sessionStorage.getItem(WALLET_CHAIN_ID_KEY);
    }
  } catch (err) {
    console.warn("Failed to retrieve wallet chain ID from session:", err);
  }
  return null;
}

/**
 * Store wallet username in session storage
 */
export function storeWalletUsername(username: string): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(WALLET_USERNAME_KEY, username);
    }
  } catch (err) {
    console.warn("Failed to store wallet username in session:", err);
  }
}

/**
 * Retrieve wallet username from session storage
 */
export function getStoredWalletUsername(): string | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return sessionStorage.getItem(WALLET_USERNAME_KEY);
    }
  } catch (err) {
    console.warn("Failed to retrieve wallet username from session:", err);
  }
  return null;
}
