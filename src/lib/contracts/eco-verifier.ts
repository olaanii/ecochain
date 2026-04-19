/**
 * EcoVerifier client wrapper (hardened-contract revision)
 *
 * After the contract hardening pass, `submitProof` is only callable with an
 * EIP-712 oracle signature. The server produces the signature via
 * `/api/verification/:id/attestation`; this wrapper is the thin read/write
 * surface used by higher-level hooks (see `use-eco-claim.ts`).
 *
 * What changed vs the old wrapper:
 *  - `taskId` is now `0x${string}` (bytes32) instead of `bigint`.
 *  - `submitProof` takes the full (taskId, proofHash, reward, nonce,
 *    deadline, signature) tuple.
 *  - `tasks()` returns the `{baseReward, maxReward, active, exists}` struct.
 *  - Removed legacy helpers (`validateTimestampRange`, `createProofSubmission`)
 *    — all replay/timestamp logic lives in the contract + oracle signer now.
 *
 * Requirements (post-hardening): 2.3, 2.4, 2.5, 5.5, 5.6, 29.8.
 */

import type { PublicClient, WalletClient, Hex } from "viem";
import { getAddress, keccak256, toBytes } from "viem";
import { EcoVerifierContract } from "@/lib/blockchain/contracts";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface TaskData {
  /** On-chain bytes32 id (usually `keccak256(slug)`). */
  id: Hex;
  baseReward: bigint;
  maxReward: bigint;
  active: boolean;
  exists: boolean;
}

export interface ProofSubmissionData {
  taskId: Hex;
  proofHash: Hex;
  reward: bigint;
  nonce: bigint;
  deadline: bigint;
  signature: Hex;
}

export interface EcoVerifierInterface {
  // Reads
  tasks(taskId: Hex): Promise<TaskData>;
  usedProofHashes(proofHash: Hex): Promise<boolean>;
  nonces(user: `0x${string}`): Promise<bigint>;
  isOracle(account: `0x${string}`): Promise<boolean>;

  // Writes
  submitProof(data: ProofSubmissionData): Promise<Hex>;
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/** Derive the on-chain bytes32 taskId from a human-readable slug. */
export function taskIdFromSlug(slug: string): Hex {
  if (!slug) throw new Error("taskIdFromSlug: slug is required");
  return keccak256(toBytes(slug));
}

/**
 * Validate that a string looks like a bytes32 hex value. Accepts both
 * `0x`-prefixed and unprefixed inputs and normalizes to lowercase `0x…`.
 */
export function toBytes32(input: string): Hex {
  const hex = input.startsWith("0x") ? input : `0x${input}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(`Not a valid bytes32 value: ${input}`);
  }
  return hex.toLowerCase() as Hex;
}

// --------------------------------------------------------------------------
// Factory
// --------------------------------------------------------------------------

/**
 * Build a thin EcoVerifier interface over a viem public + wallet client.
 * Read-only methods use `publicClient`; writes use `walletClient`'s account.
 */
export function createEcoVerifierInterface(
  publicClient: PublicClient,
  walletClient: WalletClient,
): EcoVerifierInterface {
  const address = EcoVerifierContract.address;
  const abi = EcoVerifierContract.abi;

  async function tasks(taskId: Hex): Promise<TaskData> {
    const normalized = toBytes32(taskId);
    const raw = (await publicClient.readContract({
      address,
      abi,
      functionName: "tasks",
      args: [normalized],
    })) as readonly [bigint, bigint, boolean, boolean];
    return {
      id: normalized,
      baseReward: raw[0],
      maxReward: raw[1],
      active: raw[2],
      exists: raw[3],
    };
  }

  async function usedProofHashes(proofHash: Hex): Promise<boolean> {
    return (await publicClient.readContract({
      address,
      abi,
      functionName: "usedProofHashes",
      args: [toBytes32(proofHash)],
    })) as boolean;
  }

  async function nonces(user: `0x${string}`): Promise<bigint> {
    return (await publicClient.readContract({
      address,
      abi,
      functionName: "nonces",
      args: [getAddress(user)],
    })) as bigint;
  }

  async function isOracle(account: `0x${string}`): Promise<boolean> {
    const role = (await publicClient.readContract({
      address,
      abi,
      functionName: "ORACLE_ROLE",
    })) as Hex;
    return (await publicClient.readContract({
      address,
      abi,
      functionName: "hasRole",
      args: [role, getAddress(account)],
    })) as boolean;
  }

  async function submitProof(data: ProofSubmissionData): Promise<Hex> {
    if (!walletClient.account) {
      throw new Error("EcoVerifier.submitProof: wallet account missing");
    }
    return (await walletClient.writeContract({
      account: walletClient.account,
      chain: walletClient.chain,
      address,
      abi,
      functionName: "submitProof",
      args: [
        toBytes32(data.taskId),
        toBytes32(data.proofHash),
        data.reward,
        data.nonce,
        data.deadline,
        data.signature,
      ],
    })) as Hex;
  }

  return { tasks, usedProofHashes, nonces, isOracle, submitProof };
}

// Legacy named-export aliases — kept so the module still satisfies the
// `src/lib/contracts/index.ts` re-exports while we phase out callers.
// These throw loudly so nobody accidentally invokes the removed legacy flow.

export function generateProofHash(): never {
  throw new Error(
    "generateProofHash has moved — use @/lib/verification/proof-hash or oracle-signer.normalizeProofHash",
  );
}

export function validateProofHashFormat(hash: string): boolean {
  // Keep this as a pure-format check; callers may still validate input shape.
  return /^0x[0-9a-fA-F]{64}$/.test(hash) || /^[0-9a-fA-F]{64}$/.test(hash);
}

export function validateTimestampRange(): never {
  throw new Error(
    "validateTimestampRange is obsolete — the contract enforces `deadline` directly",
  );
}

export function createProofSubmission(): never {
  throw new Error(
    "createProofSubmission is obsolete — request a signed attestation from /api/verification/:id/attestation",
  );
}
