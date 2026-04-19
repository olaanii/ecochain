/**
 * Unit tests for the off-chain oracle signer.
 *
 * These tests are self-contained: they set a deterministic private key via
 * env, sign an Attestation, and recover the signer from the EIP-712 digest
 * to confirm it matches the derived oracle address. No database, no chain.
 */

import {
  keccak256,
  recoverAddress,
  hashTypedData,
  toBytes,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Deterministic Anvil test key — NEVER use in production.
const TEST_PK =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const EXPECTED_ADDRESS = privateKeyToAccount(TEST_PK as Hex).address;
const VERIFIER_ADDRESS = "0x1111111111111111111111111111111111111111";

describe("oracle-signer", () => {
  beforeEach(() => {
    process.env.ORACLE_SIGNER_PRIVATE_KEY = TEST_PK;
    process.env.ECO_VERIFIER_ADDRESS = VERIFIER_ADDRESS;
    process.env.ECO_VERIFIER_CHAIN_ID = "31337";
    // Force-reload so cached account/domain pick up fresh env.
    jest.resetModules();
  });

  afterEach(() => {
    delete process.env.ORACLE_SIGNER_PRIVATE_KEY;
    delete process.env.ECO_VERIFIER_ADDRESS;
    delete process.env.ECO_VERIFIER_CHAIN_ID;
  });

  test("signAttestation produces a signature recoverable to the oracle", async () => {
    const mod = await import("../src/lib/blockchain/oracle-signer");
    const { signAttestation, ATTESTATION_TYPES } = mod;

    const user: Address = "0x2222222222222222222222222222222222222222";
    const proofHashRaw =
      "0x33333333333333333333333333333333333333333333333333333333333333ab";

    const signed = await signAttestation({
      user,
      taskId: "slug:recycling_pickup",
      proofHash: proofHashRaw,
      reward: BigInt(5) * BigInt(10) ** BigInt(18),
      nonce: 0,
      deadline: BigInt(2_000_000_000), // far future, stable
    });

    // Signer identity.
    expect(signed.signer.toLowerCase()).toBe(EXPECTED_ADDRESS.toLowerCase());

    // Domain is bound correctly.
    expect(signed.domain.chainId).toBe(31337);
    expect(signed.domain.name).toBe("EcoVerifier");
    expect(signed.domain.version).toBe("1");
    expect(signed.domain.verifyingContract.toLowerCase()).toBe(
      VERIFIER_ADDRESS.toLowerCase(),
    );

    // taskId matches keccak256("recycling_pickup").
    expect(signed.taskId).toBe(keccak256(toBytes("recycling_pickup")));

    // proofHash passed through (already 32 bytes).
    expect(signed.proofHash).toBe(proofHashRaw.toLowerCase());

    // Recover signer from the EIP-712 digest — this is what the on-chain
    // contract will do in `_hashTypedDataV4` + `ECDSA.recover`.
    const digest = hashTypedData({
      domain: signed.domain,
      types: ATTESTATION_TYPES,
      primaryType: "Attestation",
      message: {
        user: signed.user,
        taskId: signed.taskId,
        proofHash: signed.proofHash,
        reward: signed.reward,
        nonce: signed.nonce,
        deadline: signed.deadline,
      },
    });
    const recovered = await recoverAddress({
      hash: digest,
      signature: signed.signature,
    });
    expect(recovered.toLowerCase()).toBe(EXPECTED_ADDRESS.toLowerCase());
  });

  test("rejects reward <= 0", async () => {
    const { signAttestation } = await import(
      "../src/lib/blockchain/oracle-signer"
    );
    await expect(
      signAttestation({
        user: "0x2222222222222222222222222222222222222222",
        taskId: "slug:x",
        proofHash: "0x" + "ab".repeat(32),
        reward: 0,
        nonce: 0,
      }),
    ).rejects.toThrow(/reward must be > 0/);
  });

  test("normalizeProofHash: short strings are keccak256'd into bytes32", async () => {
    const { normalizeProofHash } = await import(
      "../src/lib/blockchain/oracle-signer"
    );
    const out = normalizeProofHash("some-ipfs-cid");
    expect(out).toBe(keccak256(toBytes("some-ipfs-cid")));
  });

  test("taskIdFromSlug matches on-chain keccak256(slug)", async () => {
    const { taskIdFromSlug } = await import(
      "../src/lib/blockchain/oracle-signer"
    );
    expect(taskIdFromSlug("low_impact_commute")).toBe(
      keccak256(toBytes("low_impact_commute")),
    );
  });

  test("missing ORACLE_SIGNER_PRIVATE_KEY surfaces a clear error", async () => {
    delete process.env.ORACLE_SIGNER_PRIVATE_KEY;
    jest.resetModules();
    const { signAttestation } = await import(
      "../src/lib/blockchain/oracle-signer"
    );
    await expect(
      signAttestation({
        user: "0x2222222222222222222222222222222222222222",
        taskId: "slug:x",
        proofHash: "0x" + "ab".repeat(32),
        reward: 1,
        nonce: 0,
      }),
    ).rejects.toThrow(/ORACLE_SIGNER_PRIVATE_KEY/);
  });
});
