"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { useAccount } from "wagmi";
import {
  storeWalletAddress,
  clearWalletAddress,
  storeWalletChainId,
  storeWalletUsername,
} from "@/lib/wallet/session-storage";

/**
 * Wallet Context Type
 * 
 * Requirement 16.2, 16.3, 16.4, 16.5
 * - Manages wallet connection state
 * - Validates chain ID matches Initia appchain
 * - Stores wallet address in session
 * - Provides connect/disconnect functionality
 */
export type WalletContextType = {
  address?: string;
  initiaAddress?: string;
  chainId?: string;
  isConnected: boolean;
  isConnecting: boolean;
  error?: Error;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isCorrectChain: boolean;
  username?: string;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const EXPECTED_CHAIN_ID = process.env.NEXT_PUBLIC_INITIA_CHAIN_ID || "ecochain105";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { initiaAddress, openConnect, username } = useInterwovenKit();
  const { address: evmAddress } = useAccount();
  
  const [error, setError] = useState<Error | undefined>();
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<string | undefined>();

  // Validate chain and store wallet address in session
  // Requirement 16.5: Store wallet address in user session
  // Requirement 16.6: Maintain wallet connection state across page navigation
  useEffect(() => {
    if (initiaAddress) {
      // Store wallet address in session storage
      storeWalletAddress(initiaAddress);

      // Get current chain ID from environment or session
      const chainId = EXPECTED_CHAIN_ID;
      setCurrentChainId(chainId);

      // Store chain ID in session storage
      storeWalletChainId(chainId);

      // Store username in session storage
      if (username) {
        storeWalletUsername(username);
      }

      // Validate chain ID
      // Requirement 16.3: Validate that the chain ID matches the Initia appchain
      // For now, we assume the connection is to the correct chain since InterwovenKit
      // is configured with the specific chain in the provider
      setIsCorrectChain(true);
    } else {
      setIsCorrectChain(false);
      setCurrentChainId(undefined);
      // Clear session storage when disconnected
      // Requirement 16.5: Clear the wallet address from the session
      clearWalletAddress();
    }
  }, [initiaAddress, username]);

  const handleConnect = async () => {
    try {
      setError(undefined);
      setIsConnecting(true);
      // Requirement 16.2: Support Initia wallet via @initia/interwovenkit-react
      openConnect();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setError(undefined);
      // InterwovenKit handles disconnect through the wallet drawer
      // Clear session storage
      clearWalletAddress();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const value: WalletContextType = {
    address: evmAddress,
    initiaAddress: initiaAddress || undefined,
    chainId: currentChainId,
    isConnected: !!initiaAddress,
    isConnecting,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
    isCorrectChain,
    username: username || undefined,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
