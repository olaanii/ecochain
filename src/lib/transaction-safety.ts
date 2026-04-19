import { validateAddress } from "./validation";

export type KnownContractKey = "ECO_REWARD" | "ECO_VERIFIER" | "STAKING";

/**
 * Read contract addresses lazily so that env vars populated after module
 * initialization (e.g. in tests or edge/server boundary) are still honored.
 */
export function getKnownContracts(): Record<KnownContractKey, string> {
  return {
    ECO_REWARD: process.env.NEXT_PUBLIC_ECO_REWARD_ADDRESS || "",
    ECO_VERIFIER: process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDRESS || "",
    STAKING: process.env.NEXT_PUBLIC_STAKING_ADDRESS || "",
  };
}

// Kept as a getter-backed object for backwards compatibility with callers that
// imported the constant directly.
export const KNOWN_CONTRACTS = new Proxy({} as Record<string, string>, {
  get(_target, prop) {
    const contracts = getKnownContracts();
    return contracts[prop as KnownContractKey];
  },
  ownKeys() {
    return Object.keys(getKnownContracts());
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

// Slippage tolerance percentages
export const SLIPPAGE_TOLERANCE = {
  LOW: 0.1, // 0.1%
  MEDIUM: 0.5, // 0.5%
  HIGH: 1.0, // 1%
};

export function verifyContractAddress(address: string, contractType: KnownContractKey): boolean {
  const knownAddress = getKnownContracts()[contractType];
  if (!knownAddress) {
    console.warn(`[transaction-safety] contract address not configured: ${contractType}`);
    // Fail closed: if we don't know the real address, we can't verify anything.
    return false;
  }
  return address.toLowerCase() === knownAddress.toLowerCase();
}

export function calculateSlippage(amount: string, tolerance: number): string {
  const value = parseFloat(amount);
  const slippageAmount = value * (tolerance / 100);
  const minimumAmount = value - slippageAmount;
  return Math.max(0, minimumAmount).toFixed(6);
}

export function isRiskyTransaction(to: string, value: string): boolean {
  const contracts = getKnownContracts();
  const configuredAddresses = Object.values(contracts).filter((a) => a);

  // If no contract addresses are configured we can't reason about trust, so
  // treat every tx as risky instead of falsely marking them safe.
  if (configuredAddresses.length === 0) {
    return true;
  }

  const isKnownContract = configuredAddresses.some(
    (addr) => addr.toLowerCase() === to.toLowerCase()
  );

  // Check if value is unusually high
  const valueNum = parseFloat(value);
  const isHighValue = valueNum > 10000; // Arbitrary threshold

  return !isKnownContract && isHighValue;
}

export function getTransactionWarning(to: string, value: string): string | null {
  if (isRiskyTransaction(to, value)) {
    return "Warning: You are sending a large amount to an unknown address. Please verify the recipient address carefully.";
  }
  
  if (!validateAddress(to)) {
    return "Warning: Invalid recipient address format.";
  }
  
  return null;
}
