"use client";

/**
 * Read-only wiring for the EcoReward / EcoVerifier contracts.
 *
 * Writes (claiming rewards) live in `use-eco-claim.ts` which drives the
 * hardened oracle-signed flow end-to-end. This hook intentionally does NOT
 * expose a `submitProof` writer any more — the old unauthenticated path
 * was removed in the contract hardening pass.
 */

import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";
import { formatUnits } from "viem";
import ecoRewardAbi from "@/lib/initia/EcoReward_abi.json";
import ecoVerifierAbi from "@/lib/initia/EcoVerifier_abi.json";

const ECO_TOKEN_ADDR = process.env
  .NEXT_PUBLIC_ECO_TOKEN_ADDR as `0x${string}` | undefined;
const ECO_VERIFIER_ADDR = process.env
  .NEXT_PUBLIC_ECO_VERIFIER_ADDR as `0x${string}` | undefined;

export function useEcoContracts() {
  const { address } = useAccount();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: ECO_TOKEN_ADDR,
    abi: ecoRewardAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!ECO_TOKEN_ADDR },
  });

  // Refresh balance whenever a ProofSubmitted event fires for this user.
  useWatchContractEvent({
    address: ECO_VERIFIER_ADDR,
    abi: ecoVerifierAbi,
    eventName: "ProofSubmitted",
    enabled: !!ECO_VERIFIER_ADDR,
    onLogs() {
      refetchBalance();
    },
  });

  return {
    ecoBalance: balance ? formatUnits(balance as bigint, 18) : "0",
    refetchBalance,
  };
}

