/**
 * EcoVerifier off-chain oracle signer (server-only).
 *
 * The hardened `EcoVerifier.submitProof()` only accepts claims accompanied by
 * an EIP-712 signature from an address holding `ORACLE_ROLE`. This module
 * produces those signatures. It must NEVER be imported from client code —
 * the private key lives in a server env var (`ORACLE_SIGNER_PRIVATE_KEY`).
 *
 * Domain / type definitions MUST stay in lockstep with
 * `contracts/src/EcoVerifier.sol`:
 *
 *   name      = "EcoVerifier"
 *   version   = "1"
 *   chainId   = deployment chain id
 *   verifyingContract = address(EcoVerifier)
 *
 *   Attestation(
 *     address user,
 *     bytes32 taskId,
 *     bytes32 proofHash,
 *     uint256 reward,
 *     uint256 nonce,
 *     uint256 deadline
 *   )
 */

import {
  getAddress,
  keccak256,
  toBytes,
  toHex,
  type Hex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Attestation {
  user: Address;
  taskId: Hex;
  proofHash: Hex;
  reward: bigint;
  nonce: bigint;
  deadline: bigint;
}

export interface SignedAttestation extends Attestation {
  signature: Hex;
  signer: Address;
  domain: EcoVerifierDomain;
}

export interface EcoVerifierDomain {
  name: "EcoVerifier";
  version: "1";
  chainId: number;
  verifyingContract: Address;
}

// EIP-712 TypedData structure for viem's `signTypedData`.
export const ATTESTATION_TYPES = {
  Attestation: [
    { name: "user", type: "address" },
    { name: "taskId", type: "bytes32" },
    { name: "proofHash", type: "bytes32" },
    { name: "reward", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

// ---------------------------------------------------------------------------
// Config / account bootstrap
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`[oracle-signer] missing required env: ${name}`);
  }
  return v;
}

/** Default TTL for a fresh attestation if the caller doesn't specify. */
export const DEFAULT_SIGNATURE_TTL_SECONDS = 60 * 60;

/**
 * Resolve the oracle signer account from env. Cached so we don't re-derive
 * the public key on every request. Exported so tests can reset it.
 */
let _cachedAccount: ReturnType<typeof privateKeyToAccount> | null = null;

export function getOracleAccount() {
  if (_cachedAccount) return _cachedAccount;
  const raw = requireEnv("ORACLE_SIGNER_PRIVATE_KEY").trim();
  const pk = (raw.startsWith("0x") ? raw : `0x${raw}`) as Hex;
  if (pk.length !== 66) {
    throw new Error(
      `[oracle-signer] ORACLE_SIGNER_PRIVATE_KEY must be a 32-byte hex string (got length ${pk.length})`,
    );
  }
  _cachedAccount = privateKeyToAccount(pk);
  return _cachedAccount;
}

/** Test hook: clears the memoized account so env changes take effect. */
export function __resetOracleSignerForTests() {
  _cachedAccount = null;
}

/**
 * Build the EIP-712 domain. The verifying contract address must match the
 * deployed `EcoVerifier`; the chain id must match the chain the user will
 * broadcast on — otherwise the on-chain `_hashTypedDataV4` check fails.
 */
export function getEcoVerifierDomain(): EcoVerifierDomain {
  const chainId = Number(
    process.env.ECO_VERIFIER_CHAIN_ID ??
      process.env.NEXT_PUBLIC_INITIA_EVM_CHAIN_ID ??
      process.env.NEXT_PUBLIC_CHAIN_ID_PROD ??
      "0",
  );
  if (!Number.isFinite(chainId) || chainId <= 0) {
    throw new Error(
      "[oracle-signer] could not resolve chainId — set ECO_VERIFIER_CHAIN_ID",
    );
  }

  const verifyingContract = (
    process.env.ECO_VERIFIER_ADDRESS ??
    process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDR ??
    ""
  ).trim();
  if (!verifyingContract) {
    throw new Error(
      "[oracle-signer] could not resolve EcoVerifier address — set ECO_VERIFIER_ADDRESS",
    );
  }

  return {
    name: "EcoVerifier",
    version: "1",
    chainId,
    verifyingContract: getAddress(verifyingContract),
  };
}

// ---------------------------------------------------------------------------
// Hashing helpers
// ---------------------------------------------------------------------------

/**
 * Derive the on-chain `bytes32 taskId` for a human-readable slug. Must match
 * the slug used by `deploy.s.sol` / `verifier.setTask(keccak256(slug), ...)`.
 */
export function taskIdFromSlug(slug: string): Hex {
  if (!slug || typeof slug !== "string") {
    throw new Error("[oracle-signer] taskIdFromSlug: slug is required");
  }
  return keccak256(toBytes(slug));
}

/**
 * Normalize an arbitrary proof identifier (SHA-256 hex, IPFS CID, etc.) into
 * a `bytes32` suitable for on-chain uniqueness tracking. If the input is
 * already a 32-byte hex string we pass it through; otherwise we keccak256 it.
 */
export function normalizeProofHash(input: string): Hex {
  const trimmed = input.trim();
  const hexLike = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (/^0x[0-9a-fA-F]{64}$/.test(hexLike)) {
    return hexLike.toLowerCase() as Hex;
  }
  return keccak256(toBytes(trimmed));
}

// ---------------------------------------------------------------------------
// Signing
// ---------------------------------------------------------------------------

export interface SignAttestationInput {
  user: string;
  /** Either pre-hashed bytes32 or a human-readable slug (prefix `slug:`). */
  taskId: string;
  /** SHA-256 hex, bytes32 hex, or an opaque id — always normalized. */
  proofHash: string;
  reward: bigint | string | number;
  nonce: bigint | number;
  /** Unix seconds. If omitted, `now + DEFAULT_SIGNATURE_TTL_SECONDS`. */
  deadline?: bigint | number;
}

/**
 * Sign an Attestation on behalf of the oracle. Returns both the raw fields
 * (so the client can forward them verbatim to `submitProof`) and the
 * EIP-712 signature.
 */
export async function signAttestation(
  input: SignAttestationInput,
): Promise<SignedAttestation> {
  const account = getOracleAccount();
  const domain = getEcoVerifierDomain();

  const reward = BigInt(input.reward);
  if (reward <= BigInt(0)) {
    throw new Error("[oracle-signer] reward must be > 0");
  }

  const nonce = BigInt(input.nonce);
  if (nonce < BigInt(0)) {
    throw new Error("[oracle-signer] nonce must be >= 0");
  }

  const ttlSeconds = Number(
    process.env.ORACLE_SIGNATURE_TTL_SECONDS ?? DEFAULT_SIGNATURE_TTL_SECONDS,
  );
  const deadline =
    input.deadline !== undefined
      ? BigInt(input.deadline)
      : BigInt(Math.floor(Date.now() / 1000) + ttlSeconds);

  // Support `slug:foo` shorthand to make call sites resilient to DB-stored
  // human slugs (tasks table) vs raw bytes32 hashes.
  let taskIdHex: Hex;
  if (input.taskId.startsWith("slug:")) {
    taskIdHex = taskIdFromSlug(input.taskId.slice("slug:".length));
  } else if (/^0x[0-9a-fA-F]{64}$/.test(input.taskId)) {
    taskIdHex = input.taskId.toLowerCase() as Hex;
  } else {
    // Treat as slug for convenience.
    taskIdHex = taskIdFromSlug(input.taskId);
  }

  const proofHashHex = normalizeProofHash(input.proofHash);
  const user = getAddress(input.user);

  const message = {
    user,
    taskId: taskIdHex,
    proofHash: proofHashHex,
    reward,
    nonce,
    deadline,
  };

  const signature = await account.signTypedData({
    domain,
    types: ATTESTATION_TYPES,
    primaryType: "Attestation",
    message,
  });

  return {
    ...message,
    signature,
    signer: account.address,
    domain,
  };
}

/**
 * Serialize a signed attestation into a JSON-friendly shape (bigints → dec
 * strings). Useful for API responses since `JSON.stringify` chokes on bigint.
 */
export function serializeSignedAttestation(s: SignedAttestation) {
  return {
    user: s.user,
    taskId: s.taskId,
    proofHash: s.proofHash,
    reward: s.reward.toString(),
    nonce: s.nonce.toString(),
    deadline: s.deadline.toString(),
    signature: s.signature,
    signer: s.signer,
    domain: {
      ...s.domain,
      chainId: s.domain.chainId,
    },
  };
}

// Re-exported so API callers don't need a second viem import just to encode
// a reward as hex for debug logs.
export { toHex };
