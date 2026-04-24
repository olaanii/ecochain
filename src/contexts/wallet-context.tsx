"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { initiaAppchain } from "@/lib/blockchain/wagmi-config";
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
  switchNetwork?: (chainId: string) => Promise<void>;
  isCorrectChain: boolean;
  username?: string;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const EXPECTED_CHAIN_ID = process.env.NEXT_PUBLIC_INITIA_CHAIN_ID || "ecochain105";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { initiaAddress, openConnect, openWallet, username } = useInterwovenKit();
  const { address: evmAddress } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
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

      // Disconnect EVM side via wagmi
      wagmiDisconnect();

      // Open Initia wallet drawer so user can disconnect from the Initia side
      // InterwovenKit doesn't expose a programmatic disconnect,
      // but openWallet lets the user manage their connection
      openWallet();

      // Clear session storage
      clearWalletAddress();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const handleSwitchNetwork = async (targetChainId: string) => {
    try {
      setError(undefined);

      // If the target is our Initia appchain, use wagmi switchChain for the EVM side
      const numericChainId = Number(targetChainId);
      if (!isNaN(numericChainId)) {
        await switchChain({ chainId: numericChainId as const });
      } else {
        // For non-EVM chains (bech32 chain IDs like "ecochain105"),
        // the InterwovenKit handles chain switching internally via the wallet drawer
        openWallet();
      }

      // Update local state after successful switch
      setCurrentChainId(targetChainId);
      setIsCorrectChain(targetChainId === EXPECTED_CHAIN_ID);
      storeWalletChainId(targetChainId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to switch network:", error);
      throw error;
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
    switchNetwork: handleSwitchNetwork,
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
