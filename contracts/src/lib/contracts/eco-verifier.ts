import { PublicClient, WalletClient, keccak256, toHex } from "viem";
import { EcoVerifierContract } from "@/lib/blockchain/contracts";

/**
 * EcoVerifier Contract Interface
 * 
 * Requirement 6.3
 * - Create TypeScript interface for EcoVerifier contract
 * - Implement submitProof() write function
 * - Implement tasks() read function
 * - Implement usedProofHashes() read function
 * - Add proof hash uniqueness validation before submission
 * - Add timestamp validation (within 48 hours)
 * - Requirements: 2.3, 2.4, 2.5, 5.5, 5.6
 */

export interface TaskData {
  id: bigint;
  name: string;
  description: string;
  baseReward: bigint;
  verificationMethod: string;
  active: boolean;
}

export interface ProofSubmissionData {
  taskId: bigint;
  proofHash: string;
  timestamp: bigint;
}

export interface EcoVerifierInterface {
  // Read functions
  tasks(taskId: bigint): Promise<TaskData>;
  usedProofHashes(proofHash: string): Promise<boolean>;
  getTaskCount(): Promise<bigint>;

  // Write functions
  submitProof(
    taskId: bigint,
    proofHash: string,
    timestamp: bigint,
  ): Promise<`0x${string}`>;

  // Validation functions
  validateProofHash(proofHash: string): Promise<boolean>;
  validateTimestamp(timestamp: bigint): Promise<boolean>;
  validateProofUniqueness(proofHash: string): Promise<boolean>;

  // Gas estimation
  estimateSubmitProof(
    taskId: bigint,
    proofHash: string,
    timestamp: bigint,
  ): Promise<bigint>;
}

/**
 * Create EcoVerifier contract interface
 * @param publicClient - Viem public client for reads
 * @param walletClient - Viem wallet client for writes
 * @returns EcoVerifier contract interface
 */
export function createEcoVerifierInterface(
  publicClient: PublicClient,
  walletClient: WalletClient,
): EcoVerifierInterface {
  const contractAddress = EcoVerifierContract.address;
  const abi = EcoVerifierContract.abi;

  return {
    // Read functions
    async tasks(taskId: bigint): Promise<TaskData> {
      try {
        const task = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "tasks",
          args: [taskId],
        });

        // Parse task data based on contract structure
        const taskArray = task as any[];
        return {
          id: taskArray[0] as bigint,
          name: taskArray[1] as string,
          description: taskArray[2] as string,
          baseReward: taskArray[3] as bigint,
          verificationMethod: taskArray[4] as string,
          active: taskArray[5] as boolean,
        };
      } catch (error) {
        console.error("Failed to read task:", error);
        throw error;
      }
    },

    async usedProofHashes(proofHash: string): Promise<boolean> {
      try {
        const used = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "usedProofHashes",
          args: [proofHash],
        });
        return used as boolean;
      } catch (error) {
        console.error("Failed to check proof hash usage:", error);
        throw error;
      }
    },

    async getTaskCount(): Promise<bigint> {
      try {
        const count = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "getTaskCount",
          args: [],
        });
        return count as bigint;
      } catch (error) {
        console.error("Failed to get task count:", error);
        throw error;
      }
    },

    // Write functions
    async submitProof(
      taskId: bigint,
      proofHash: string,
      timestamp: bigint,
    ): Promise<`0x${string}`> {
      try {
        // Validate before submission
        await this.validateProofHash(proofHash);
        await this.validateTimestamp(timestamp);
        await this.validateProofUniqueness(proofHash);

        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi,
          functionName: "submitProof",
          args: [taskId, proofHash, timestamp],
        });

        return hash;
      } catch (error) {
        console.error("Failed to submit proof:", error);
        throw error;
      }
    },

    // Validation functions
    async validateProofHash(proofHash: string): Promise<boolean> {
      // Validate proof hash format (should be 64 hex characters)
      if (!/^0x[a-f0-9]{64}$/i.test(proofHash)) {
        throw new Error("Invalid proof hash format. Must be 64 hex characters.");
      }
      return true;
    },

    async validateTimestamp(timestamp: bigint): Promise<boolean> {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const fortyEightHoursAgo = now - BigInt(48 * 60 * 60);

      // Timestamp must be within 48 hours
      if (timestamp > now) {
        throw new Error("Timestamp cannot be in the future");
      }

      if (timestamp < fortyEightHoursAgo) {
        throw new Error("Timestamp must be within 48 hours");
      }

      return true;
    },

    async validateProofUniqueness(proofHash: string): Promise<boolean> {
      const used = await this.usedProofHashes(proofHash);

      if (used) {
        throw new Error("Proof hash already used. Duplicate proofs are not allowed.");
      }

      return true;
    },

    // Gas estimation
    async estimateSubmitProof(
      taskId: bigint,
      proofHash: string,
      timestamp: bigint,
    ): Promise<bigint> {
      try {
        const gas = await publicClient.estimateContractGas({
          address: contractAddress,
          abi,
          functionName: "submitProof",
          args: [taskId, proofHash, timestamp],
        });
        return gas;
      } catch (error) {
        console.error("Failed to estimate submitProof gas:", error);
        throw error;
      }
    },
  };
}

/**
 * Generate proof hash from proof data
 * @param proofData - Proof data (image, metadata, etc.)
 * @returns Proof hash (keccak256)
 */
export function generateProofHash(proofData: string | Buffer): string {
  const data = typeof proofData === "string" ? proofData : proofData.toString("hex");
  return keccak256(toHex(data));
}

/**
 * Validate proof hash format
 * @param proofHash - Proof hash to validate
 * @returns True if valid, throws error otherwise
 */
export function validateProofHashFormat(proofHash: string): boolean {
  if (!/^0x[a-f0-9]{64}$/i.test(proofHash)) {
    throw new Error("Invalid proof hash format. Must be 64 hex characters.");
  }
  return true;
}

/**
 * Validate timestamp is within 48 hours
 * @param timestamp - Timestamp in seconds
 * @returns True if valid, throws error otherwise
 */
export function validateTimestampRange(timestamp: number | bigint): boolean {
  const now = Math.floor(Date.now() / 1000);
  const fortyEightHoursAgo = now - 48 * 60 * 60;
  const timestampNum = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;

  if (timestampNum > now) {
    throw new Error("Timestamp cannot be in the future");
  }

  if (timestampNum < fortyEightHoursAgo) {
    throw new Error("Timestamp must be within 48 hours");
  }

  return true;
}

/**
 * Create proof submission data
 * @param taskId - Task ID
 * @param proofData - Proof data
 * @returns Proof submission data with hash and timestamp
 */
export function createProofSubmission(
  taskId: bigint,
  proofData: string | Buffer,
): ProofSubmissionData {
  const proofHash = generateProofHash(proofData);
  const timestamp = BigInt(Math.floor(Date.now() / 1000));

  validateProofHashFormat(proofHash);
  validateTimestampRange(timestamp);

  return {
    taskId,
    proofHash,
    timestamp,
  };
}
