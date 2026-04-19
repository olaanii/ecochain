import { useState, useEffect } from "react";
import type { GasSpeed } from "@/components/gas-estimator";

interface GasEstimation {
  gasLimit: string;
  gasPrice: string;
  estimatedFee: string;
  speed: GasSpeed;
}

export function useGasEstimation() {
  const [estimation, setEstimation] = useState<GasEstimation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimateGas = async (
    to: string,
    data?: string,
    value?: string,
    speed: GasSpeed = "average"
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock implementation - replace with actual blockchain gas estimation
      // In production, this would call the RPC endpoint
      const mockGasLimit = "21000";
      const gasPrices: Record<GasSpeed, number> = {
        slow: 15,
        average: 20,
        fast: 30,
      };
      
      const gasPrice = gasPrices[speed].toString();
      const estimatedFee = ((parseInt(mockGasLimit) * parseInt(gasPrice)) / 1e9).toFixed(6);

      const result: GasEstimation = {
        gasLimit: mockGasLimit,
        gasPrice,
        estimatedFee,
        speed,
      };

      setEstimation(result);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to estimate gas";
      setError(errorMessage);
      console.error("Gas estimation error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    estimation,
    isLoading,
    error,
    estimateGas,
  };
}
