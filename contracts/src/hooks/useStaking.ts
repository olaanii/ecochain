/**
 * useStaking Hook
 * 
 * React hook for managing staking operations
 * Handles stake creation, transaction monitoring, and state management
 */

import { useState, useCallback } from "react";
import { useBalance } from "./useBalance";

export interface StakeRequest {
  amount: string;
  durationDays: 30 | 90 | 180 | 365;
}

export interface StakeResponse {
  id: string;
  amount: string;
  duration: number;
  apy: number;
  startTime: string;
  endTime: string;
  expectedRewards: string;
  status: string;
}

export interface StakeError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export function useStaking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StakeError | null>(null);
  const [stake, setStake] = useState<StakeResponse | null>(null);
  const { balance, refresh: refetchBalance } = useBalance();

  const createStake = useCallback(
    async (request: StakeRequest) => {
      setLoading(true);
      setError(null);

      try {
        // Validate amount
        const amountBigInt = BigInt(request.amount);
        const minimumStake = BigInt(100) * BigInt(10) ** BigInt(18);

        if (amountBigInt < minimumStake) {
          throw {
            code: "INVALID_AMOUNT",
            message: `Minimum stake is 100 ECO`,
          };
        }

        // Validate duration
        const validDurations = [30, 90, 180, 365];
        if (!validDurations.includes(request.durationDays)) {
          throw {
            code: "INVALID_DURATION",
            message: `Valid durations are: ${validDurations.join(", ")} days`,
          };
        }

        // Check balance
        if (balance) {
          const balanceAmount = typeof balance === "string" ? BigInt(balance) : BigInt(0);
          if (balanceAmount < amountBigInt) {
            throw {
              code: "INSUFFICIENT_BALANCE",
              message: "Insufficient balance for staking",
            };
          }
        }

        // Submit stake request
        const response = await fetch("/api/stake", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: request.amount,
            durationDays: request.durationDays.toString(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw errorData.error || { code: "UNKNOWN_ERROR", message: "Failed to create stake" };
        }

        const data = await response.json();
        setStake(data.data.stake);

        // Refetch balance after staking
        await refetchBalance();

        return data.data.stake;
      } catch (err: any) {
        const errorObj = err as StakeError;
        setError(errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [balance, refetchBalance]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearStake = useCallback(() => {
    setStake(null);
  }, []);

  return {
    loading,
    error,
    stake,
    createStake,
    clearError,
    clearStake,
  };
}
