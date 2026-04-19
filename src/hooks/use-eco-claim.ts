"use client";

/**
 * useEcoClaim — orchestrates the client half of the hardened reward claim
 * flow.
 *
 * Flow:
 *   1. Read the caller's current on-chain `nonces(address)` via viem/wagmi.
 *   2. POST /api/verification/:id/attestation with that nonce. The server
 *      validates ownership + approval status, then returns an EIP-712
 *      signature produced by the oracle signer (ORACLE_ROLE on-chain).
 *   3. writeContract EcoVerifier.submitProof(taskId, proofHash, reward,
 *      nonce, deadline, signature) — the contract verifies the signature
 *      against its ORACLE_ROLE set and mints if everything checks out.
 *
 * Errors are normalized so UI can just render `state.error`.
 */

import { useCallback, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import ecoVerifierAbi from "@/lib/initia/EcoVerifier_abi.json";

const ECO_VERIFIER_ADDR = process.env
  .NEXT_PUBLIC_ECO_VERIFIER_ADDR as `0x${string}` | undefined;

export type ClaimPhase =
  | "idle"
  | "reading-nonce"
  | "signing"
  | "submitting"
  | "success"
  | "error";

export interface ClaimState {
  phase: ClaimPhase;
  txHash?: `0x${string}`;
  error?: string;
}

interface AttestationResponse {
  success: boolean;
  error?: string;
  data?: {
    user: `0x${string}`;
    taskId: `0x${string}`;
    proofHash: `0x${string}`;
    reward: string; // decimal string
    nonce: string;
    deadline: string;
    signature: `0x${string}`;
    signer: `0x${string}`;
  };
}

export function useEcoClaim() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [state, setState] = useState<ClaimState>({ phase: "idle" });

  // Live on-chain nonce (re-fetched on demand inside claim()).
  const { refetch: refetchNonce } = useReadContract({
    address: ECO_VERIFIER_ADDR,
    abi: ecoVerifierAbi,
    functionName: "nonces",
    args: address ? [address] : undefined,
    query: { enabled: false }, // manual — claim() triggers the refetch.
  });

  const claim = useCallback(
    async (verificationId: string) => {
      if (!address) {
        const err = "Wallet not connected";
        setState({ phase: "error", error: err });
        throw new Error(err);
      }
      if (!ECO_VERIFIER_ADDR) {
        const err = "NEXT_PUBLIC_ECO_VERIFIER_ADDR is not set";
        setState({ phase: "error", error: err });
        throw new Error(err);
      }

      try {
        // 1. Read nonce.
        setState({ phase: "reading-nonce" });
        const nonceRes = await refetchNonce();
        if (nonceRes.error) throw nonceRes.error;
        const nonce = (nonceRes.data as bigint | undefined) ?? BigInt(0);

        // 2. Request signed attestation.
        setState({ phase: "signing" });
        const resp = await fetch(
          `/api/verification/${encodeURIComponent(verificationId)}/attestation`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nonce: nonce.toString() }),
          },
        );
        const payload = (await resp.json()) as AttestationResponse;
        if (!resp.ok || !payload.success || !payload.data) {
          throw new Error(
            payload.error || `Attestation request failed (${resp.status})`,
          );
        }
        const a = payload.data;

        // Defensive: the server-returned user should match the connected wallet.
        if (a.user.toLowerCase() !== address.toLowerCase()) {
          throw new Error(
            "Attestation is bound to a different address — reconnect your wallet",
          );
        }

        // 3. Broadcast on-chain claim.
        setState({ phase: "submitting" });
        const txHash = await writeContractAsync({
          address: ECO_VERIFIER_ADDR,
          abi: ecoVerifierAbi,
          functionName: "submitProof",
          args: [
            a.taskId,
            a.proofHash,
            BigInt(a.reward),
            BigInt(a.nonce),
            BigInt(a.deadline),
            a.signature,
          ],
        });

        setState({ phase: "success", txHash });
        return { txHash, attestation: a };
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Unknown claim failure";
        setState({ phase: "error", error: msg });
        throw error;
      }
    },
    [address, refetchNonce, writeContractAsync],
  );

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return {
    ...state,
    isLoading:
      state.phase === "reading-nonce" ||
      state.phase === "signing" ||
      state.phase === "submitting",
    claim,
    reset,
  };
}
