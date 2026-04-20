/**
 * smoke-testnet.ts  (C-9)
 *
 * Verifies the hardened EcoChain contracts are live and correctly configured
 * on the Initia EVM testnet.
 *
 * Reads addresses + RPC from environment variables.
 *
 * Usage:
 *   npx ts-node -P tsconfig.seed.json scripts/smoke-testnet.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_INITIA_JSON_RPC   — EVM JSON-RPC endpoint
 *   NEXT_PUBLIC_ECO_TOKEN_ADDR    — deployed EcoReward address
 *   NEXT_PUBLIC_ECO_VERIFIER_ADDR — deployed EcoVerifier address
 *   NEXT_PUBLIC_ECO_STAKING_ADDR  — deployed Staking address (optional)
 */

import { createPublicClient, http, getAddress, type PublicClient } from "viem";

// ── Minimal ABI fragments ─────────────────────────────────────────────────────

const erc20Abi = [
  { name: "name",        type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol",      type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "paused",      type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
] as const;

const accessControlAbi = [
  {
    name: "hasRole",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const verifierAbi = [
  ...accessControlAbi,
  { name: "paused",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "getNonce",  type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "domainSeparator", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  {
    name: "tasks",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "string" }],
    outputs: [{ name: "baseReward", type: "uint256" }, { name: "exists", type: "bool" }],
  },
  { name: "ecoToken",  type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
] as const;

const stakingAbi = [
  ...accessControlAbi,
  { name: "paused",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { name: "ecoToken",  type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "MINIMUM_STAKE", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const MINTER_ROLE  = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6" as `0x${string}`;
const ORACLE_ROLE  = "0x68e79a7bf1e0bc45d0a330c573bc367f9cf464fd326078812f301165fbda4ef1" as `0x${string}`;
const PAUSER_ROLE  = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a" as `0x${string}`;
const DEFAULT_ADMIN = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

let passed = 0;
let failed = 0;

function check(label: string, value: unknown, expected: unknown) {
  const ok = JSON.stringify(value) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    console.error(`       expected: ${JSON.stringify(expected)}`);
    console.error(`       actual  : ${JSON.stringify(value)}`);
    failed++;
  }
}

function checkTruthy(label: string, value: unknown) {
  if (value) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}: got ${JSON.stringify(value)}`);
    failed++;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const rpcUrl     = process.env.NEXT_PUBLIC_INITIA_JSON_RPC;
  const tokenAddr  = process.env.NEXT_PUBLIC_ECO_TOKEN_ADDR;
  const verifierAddr = process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDR;
  const stakingAddr  = process.env.NEXT_PUBLIC_ECO_STAKING_ADDR ?? null;

  if (!rpcUrl || !tokenAddr || !verifierAddr) {
    console.error("Missing required env vars: NEXT_PUBLIC_INITIA_JSON_RPC, NEXT_PUBLIC_ECO_TOKEN_ADDR, NEXT_PUBLIC_ECO_VERIFIER_ADDR");
    process.exit(1);
  }

  const chainId = parseInt(process.env.NEXT_PUBLIC_INITIA_EVM_CHAIN_ID ?? "1337");
  const client: PublicClient = createPublicClient({
    chain: { id: chainId, name: "EcoChain", nativeCurrency: { name: "INIT", symbol: "INIT", decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } },
    transport: http(rpcUrl),
  });

  const token    = { address: getAddress(tokenAddr),    abi: [...erc20Abi, ...accessControlAbi] as const };
  const verifier = { address: getAddress(verifierAddr), abi: verifierAbi };

  console.log("\n━━━ EcoChain Smoke Test ━━━");
  console.log(`RPC    : ${rpcUrl}`);
  console.log(`Chain  : ${chainId}`);
  console.log(`Token  : ${tokenAddr}`);
  console.log(`Verify : ${verifierAddr}`);
  if (stakingAddr) console.log(`Staking: ${stakingAddr}`);
  console.log("");

  // ── 1. Connectivity ────────────────────────────────────────────────────────
  console.log("[ Connectivity ]");
  const block = await client.getBlockNumber();
  checkTruthy("JSON-RPC responds (block > 0)", block > 0n);

  // ── 2. EcoReward (ERC-20 + AccessControl + Pausable) ──────────────────────
  console.log("\n[ EcoReward ]");

  const bytecode = await client.getCode({ address: token.address });
  checkTruthy("Contract deployed (bytecode exists)", bytecode && bytecode.length > 2);

  const name     = await client.readContract({ ...token, functionName: "name" });
  const symbol   = await client.readContract({ ...token, functionName: "symbol" });
  const decimals = await client.readContract({ ...token, functionName: "decimals" });
  const paused   = await client.readContract({ ...token, functionName: "paused" });

  check("name()    = 'Ecochain Token'", name,     "Ecochain Token");
  check("symbol()  = 'ECO'",           symbol,   "ECO");
  check("decimals()= 18",              decimals, 18);
  check("paused()  = false",           paused,   false);

  const verifierHasMinter = await client.readContract({
    ...token, functionName: "hasRole",
    args: [MINTER_ROLE, getAddress(verifierAddr)],
  });
  checkTruthy("EcoVerifier has MINTER_ROLE on EcoReward", verifierHasMinter);

  // ── 3. EcoVerifier ─────────────────────────────────────────────────────────
  console.log("\n[ EcoVerifier ]");

  const vCode = await client.getCode({ address: verifier.address });
  checkTruthy("Contract deployed (bytecode exists)", vCode && vCode.length > 2);

  const vPaused   = await client.readContract({ ...verifier, functionName: "paused" });
  const vEcoToken = await client.readContract({ ...verifier, functionName: "ecoToken" });
  const domSep    = await client.readContract({ ...verifier, functionName: "domainSeparator" });
  const nonce     = await client.readContract({ ...verifier, functionName: "getNonce", args: [token.address] });

  check("paused() = false",                    vPaused,   false);
  check("ecoToken() = EcoReward",              vEcoToken.toLowerCase(), tokenAddr.toLowerCase());
  checkTruthy("domainSeparator() is non-zero", domSep !== "0x" + "0".repeat(64));
  checkTruthy("getNonce() returns uint256",    typeof nonce === "bigint");

  const taskExists = await client.readContract({
    ...verifier, functionName: "tasks", args: ["low_impact_commute"],
  });
  checkTruthy("Task 'low_impact_commute' exists", taskExists[1]);
  checkTruthy("Task 'low_impact_commute' reward > 0", taskExists[0] > 0n);

  // ── 4. Staking (optional) ──────────────────────────────────────────────────
  if (stakingAddr) {
    console.log("\n[ Staking ]");
    const staking = { address: getAddress(stakingAddr), abi: stakingAbi };

    const sCode = await client.getCode({ address: staking.address });
    checkTruthy("Contract deployed (bytecode exists)", sCode && sCode.length > 2);

    const sPaused   = await client.readContract({ ...staking, functionName: "paused" });
    const sEcoToken = await client.readContract({ ...staking, functionName: "ecoToken" });
    const minStake  = await client.readContract({ ...staking, functionName: "MINIMUM_STAKE" });

    check("paused() = false", sPaused, false);
    check("ecoToken() = EcoReward", sEcoToken.toLowerCase(), tokenAddr.toLowerCase());
    checkTruthy("MINIMUM_STAKE = 100 ECO", minStake === BigInt("100000000000000000000"));

    const stakingHasMinter = await client.readContract({
      ...token, functionName: "hasRole",
      args: [MINTER_ROLE, getAddress(stakingAddr)],
    });
    checkTruthy("Staking has MINTER_ROLE on EcoReward", stakingHasMinter);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n━━━ Results ━━━");
  console.log(`  Passed: ${passed}`);
  if (failed > 0) {
    console.error(`  Failed: ${failed}`);
    process.exit(1);
  } else {
    console.log("  All checks passed ✓");
  }
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
