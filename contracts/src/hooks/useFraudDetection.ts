'use client';

import { useCallback, useEffect, useState } from 'react';

export interface FraudIndicators {
  duplicateSimilarity?: number;
  submissionVelocity?: number;
  geolocationAnomaly?: boolean;
  metadataInconsistency?: boolean;
}

export interface FraudDetectionResult {
  fraudScore: number;
  isFlagged: boolean;
  indicators: FraudIndicators;
  reason?: string;
  reviewId?: string;
}

export interface ReviewQueueItem {
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  taskId: string;
  taskName: string;
  taskCategory: string;
  fraudScore: number;
  proofHash: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ReviewQueueResponse {
  success: boolean;
  data: ReviewQueueItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    pages: number;
  };
}

/**
 * Hook for fraud detection operations
 * Provides methods to check fraud, fetch review queue, and manage reviews
 */
export function useFraudDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check proof submission for fraud indicators
   */
  const checkFraud = useCallback(
    async (
      taskId: string,
      proofHash: string,
      metadata?: Record<string, any>
    ): Promise<FraudDetectionResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/verification/fraud-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            proofHash,
            metadata,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Fraud check failed');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch pending fraud reviews (admin only)
   */
  const fetchReviewQueue = useCallback(
    async (
      limit: number = 50,
      offset: number = 0
    ): Promise<ReviewQueueResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(
          `/api/admin/review-queue?${params.toString()}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch review queue');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Approve a fraud review
   */
  const approveReview = useCallback(
    async (reviewId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/review-queue/${reviewId}/approve`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to approve review');
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Reject a fraud review
   */
  const rejectReview = useCallback(
    async (reviewId: string, reason: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/admin/review-queue/${reviewId}/reject`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reject review');
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    checkFraud,
    fetchReviewQueue,
    approveReview,
    rejectReview,
  };
}
