"use client";

import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { formatUnits } from "viem";
import ecoRewardAbi from "@/lib/initia/EcoReward_abi.json";
import ecoVerifierAbi from "@/lib/initia/EcoVerifier_abi.json";

const ECO_TOKEN_ADDR = process.env.NEXT_PUBLIC_ECO_TOKEN_ADDR as `0x${string}`;
const ECO_VERIFIER_ADDR = process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDR as `0x${string}`;

export function useEcoContracts() {
  const { address } = useAccount();

  // ECO-Token Balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: ECO_TOKEN_ADDR,
    abi: ecoRewardAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Minting Submission
  const { writeContract: submitProofRaw, isPending: isSubmitting, data: txHash } = useWriteContract();

  const submitProof = (taskId: string, proofHash: string, timestamp: number) => {
    submitProofRaw({
      address: ECO_VERIFIER_ADDR,
      abi: ecoVerifierAbi,
      functionName: "submitProof",
      args: [taskId, proofHash, BigInt(timestamp)],
    });
    return txHash;
  };

  // Watch for new reward events
  useWatchContractEvent({
    address: ECO_VERIFIER_ADDR,
    abi: ecoVerifierAbi,
    eventName: "ProofSubmitted",
    onLogs(logs: any[]) {
      console.log("New proof submitted!", logs);
      refetchBalance(); // Refresh balance when proof is successfully processed
    },
  });

  return {
    ecoBalance: balance ? formatUnits(balance as bigint, 18) : "0",
    submitProof,
    isSubmitting,
    refetchBalance,
    txHash,
  };
}

