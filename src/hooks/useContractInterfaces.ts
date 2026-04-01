"use client";

import { useMemo } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import {
  createEcoRewardInterface,
  type EcoRewardInterface,
} from "@/lib/contracts/eco-reward";
import {
  createEcoVerifierInterface,
  type EcoVerifierInterface,
} from "@/lib/contracts/eco-verifier";

export interface ContractInterfaces {
  ecoReward: EcoRewardInterface | null;
  ecoVerifier: EcoVerifierInterface | null;
  isReady: boolean;
}

/**
 * Hook to access contract interfaces
 * Provides read and write functions for EcoReward and EcoVerifier contracts
 */
export function useContractInterfaces(): ContractInterfaces {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const interfaces = useMemo(() => {
    if (!publicClient || !walletClient) {
      return {
        ecoReward: null,
        ecoVerifier: null,
        isReady: false,
      };
    }

    return {
      ecoReward: createEcoRewardInterface(publicClient, walletClient),
      ecoVerifier: createEcoVerifierInterface(publicClient, walletClient),
      isReady: true,
    };
  }, [publicClient, walletClient]);

  return interfaces;
}

/**
 * Hook to access EcoReward contract interface only
 */
export function useEcoRewardContract(): EcoRewardInterface | null {
  const { ecoReward } = useContractInterfaces();
  return ecoReward;
}

/**
 * Hook to access EcoVerifier contract interface only
 */
export function useEcoVerifierContract(): EcoVerifierInterface | null {
  const { ecoVerifier } = useContractInterfaces();
  return ecoVerifier;
}
