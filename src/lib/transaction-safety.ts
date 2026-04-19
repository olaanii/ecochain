import { validateAddress } from "./validation";

// Known contract addresses for the EcoChain protocol
export const KNOWN_CONTRACTS: Record<string, string> = {
  ECO_REWARD: process.env.NEXT_PUBLIC_ECO_REWARD_ADDRESS || "",
  ECO_VERIFIER: process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDRESS || "",
  STAKING: process.env.NEXT_PUBLIC_STAKING_ADDRESS || "",
};

// Slippage tolerance percentages
export const SLIPPAGE_TOLERANCE = {
  LOW: 0.1, // 0.1%
  MEDIUM: 0.5, // 0.5%
  HIGH: 1.0, // 1%
};

export function verifyContractAddress(address: string, contractType: keyof typeof KNOWN_CONTRACTS): boolean {
  const knownAddress = KNOWN_CONTRACTS[contractType];
  if (!knownAddress) {
    console.warn(`Unknown contract type: ${contractType}`);
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
  // Check if recipient is unknown
  const isKnownContract = Object.values(KNOWN_CONTRACTS).some(
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
