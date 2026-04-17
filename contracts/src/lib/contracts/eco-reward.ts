import { PublicClient, WalletClient, parseUnits, formatUnits } from "viem";
import { EcoRewardContract } from "@/lib/blockchain/contracts";

/**
 * EcoReward Contract Interface
 * 
 * Requirement 6.2
 * - Create TypeScript interface for EcoReward contract
 * - Implement balanceOf() read function
 * - Implement totalSupply() read function
 * - Implement approve() write function for staking
 * - Implement transfer() write function
 * - Add gas estimation for all write operations
 * - Requirements: 7.1, 7.2
 */

export interface EcoRewardInterface {
  // Read functions
  balanceOf(address: string): Promise<bigint>;
  totalSupply(): Promise<bigint>;
  allowance(owner: string, spender: string): Promise<bigint>;
  decimals(): Promise<number>;
  name(): Promise<string>;
  symbol(): Promise<string>;

  // Write functions
  approve(spender: string, amount: bigint): Promise<`0x${string}`>;
  transfer(to: string, amount: bigint): Promise<`0x${string}`>;
  transferFrom(from: string, to: string, amount: bigint): Promise<`0x${string}`>;

  // Gas estimation
  estimateApprove(spender: string, amount: bigint): Promise<bigint>;
  estimateTransfer(to: string, amount: bigint): Promise<bigint>;
  estimateTransferFrom(from: string, to: string, amount: bigint): Promise<bigint>;
}

/**
 * Create EcoReward contract interface
 * @param publicClient - Viem public client for reads
 * @param walletClient - Viem wallet client for writes
 * @returns EcoReward contract interface
 */
export function createEcoRewardInterface(
  publicClient: PublicClient,
  walletClient: WalletClient,
): EcoRewardInterface {
  const contractAddress = EcoRewardContract.address;
  const abi = EcoRewardContract.abi;

  return {
    // Read functions
    async balanceOf(address: string): Promise<bigint> {
      try {
        const balance = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "balanceOf",
          args: [address],
        });
        return balance as bigint;
      } catch (error) {
        console.error("Failed to read balance:", error);
        throw error;
      }
    },

    async totalSupply(): Promise<bigint> {
      try {
        const supply = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "totalSupply",
          args: [],
        });
        return supply as bigint;
      } catch (error) {
        console.error("Failed to read total supply:", error);
        throw error;
      }
    },

    async allowance(owner: string, spender: string): Promise<bigint> {
      try {
        const amount = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "allowance",
          args: [owner, spender],
        });
        return amount as bigint;
      } catch (error) {
        console.error("Failed to read allowance:", error);
        throw error;
      }
    },

    async decimals(): Promise<number> {
      try {
        const decimals = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "decimals",
          args: [],
        });
        return decimals as number;
      } catch (error) {
        console.error("Failed to read decimals:", error);
        throw error;
      }
    },

    async name(): Promise<string> {
      try {
        const name = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "name",
          args: [],
        });
        return name as string;
      } catch (error) {
        console.error("Failed to read name:", error);
        throw error;
      }
    },

    async symbol(): Promise<string> {
      try {
        const symbol = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "symbol",
          args: [],
        });
        return symbol as string;
      } catch (error) {
        console.error("Failed to read symbol:", error);
        throw error;
      }
    },

    // Write functions
    async approve(spender: string, amount: bigint): Promise<`0x${string}`> {
      try {
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi,
          functionName: "approve",
          args: [spender, amount],
        });
        return hash;
      } catch (error) {
        console.error("Failed to approve:", error);
        throw error;
      }
    },

    async transfer(to: string, amount: bigint): Promise<`0x${string}`> {
      try {
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi,
          functionName: "transfer",
          args: [to, amount],
        });
        return hash;
      } catch (error) {
        console.error("Failed to transfer:", error);
        throw error;
      }
    },

    async transferFrom(
      from: string,
      to: string,
      amount: bigint,
    ): Promise<`0x${string}`> {
      try {
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi,
          functionName: "transferFrom",
          args: [from, to, amount],
        });
        return hash;
      } catch (error) {
        console.error("Failed to transfer from:", error);
        throw error;
      }
    },

    // Gas estimation
    async estimateApprove(spender: string, amount: bigint): Promise<bigint> {
      try {
        const gas = await publicClient.estimateContractGas({
          address: contractAddress,
          abi,
          functionName: "approve",
          args: [spender, amount],
        });
        return gas;
      } catch (error) {
        console.error("Failed to estimate approve gas:", error);
        throw error;
      }
    },

    async estimateTransfer(to: string, amount: bigint): Promise<bigint> {
      try {
        const gas = await publicClient.estimateContractGas({
          address: contractAddress,
          abi,
          functionName: "transfer",
          args: [to, amount],
        });
        return gas;
      } catch (error) {
        console.error("Failed to estimate transfer gas:", error);
        throw error;
      }
    },

    async estimateTransferFrom(
      from: string,
      to: string,
      amount: bigint,
    ): Promise<bigint> {
      try {
        const gas = await publicClient.estimateContractGas({
          address: contractAddress,
          abi,
          functionName: "transferFrom",
          args: [from, to, amount],
        });
        return gas;
      } catch (error) {
        console.error("Failed to estimate transferFrom gas:", error);
        throw error;
      }
    },
  };
}

/**
 * Helper function to convert amount to contract units
 * @param amount - Amount in decimal format
 * @param decimals - Token decimals (default: 18)
 * @returns Amount in contract units (bigint)
 */
export function toContractUnits(amount: number | string, decimals = 18): bigint {
  return parseUnits(String(amount), decimals);
}

/**
 * Helper function to convert contract units to decimal format
 * @param amount - Amount in contract units (bigint)
 * @param decimals - Token decimals (default: 18)
 * @returns Amount in decimal format (string)
 */
export function fromContractUnits(amount: bigint, decimals = 18): string {
  return formatUnits(amount, decimals);
}
