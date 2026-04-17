'use client';

import { useCallback, useState } from 'react';
import { useBlockchainClients } from './useBlockchainClients';

/**
 * Hook for submitting task proofs
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 3.7, 29.8, 29.9
 */

export interface ProofSubmissionState {
  isLoading: boolean;
  error?: string;
  verificationId?: string;
  proofHash?: string;
  ipfsHash?: string;
  status?: string;
}

export function useProofSubmission() {
  const { account } = useBlockchainClients();
  const [state, setState] = useState<ProofSubmissionState>({
    isLoading: false,
  });

  /**
   * Submit proof for a task
   */
  const submitProof = useCallback(
    async (params: {
      taskId: string;
      proofType: 'photo' | 'transit' | 'weight' | 'sensor' | 'api';
      proofData: string;
      timestamp: number;
      geolocation?: {
        latitude: number;
        longitude: number;
      };
      metadata?: Record<string, unknown>;
    }) => {
      setState({
        isLoading: true,
        error: undefined,
      });

      try {
        const response = await fetch(`/api/tasks/${params.taskId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            proofType: params.proofType,
            proofData: params.proofData,
            timestamp: params.timestamp,
            geolocation: params.geolocation,
            metadata: params.metadata,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit proof');
        }

        const result = await response.json();

        setState({
          isLoading: false,
          verificationId: result.data.verificationId,
          proofHash: result.data.proofHash,
          ipfsHash: result.data.ipfsHash,
          status: result.data.status,
        });

        return result.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },
    []
  );

  /**
   * Get submission status
   */
  const getStatus = useCallback(async (verificationId: string) => {
    try {
      const response = await fetch(`/api/verify/${verificationId}`);

      if (!response.ok) {
        throw new Error('Failed to get verification status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw error;
    }
  }, []);

  /**
   * Get submission history
   */
  const getHistory = useCallback(
    async (limit = 50, offset = 0) => {
      try {
        const response = await fetch(
          `/api/verify/history?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
          throw new Error('Failed to get verification history');
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting verification history:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    submitProof,
    getStatus,
    getHistory,
    reset,
  };
}
