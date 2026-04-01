'use client';

import { useEffect, useState } from 'react';
import { useFraudDetection, ReviewQueueItem } from '@/hooks/useFraudDetection';
import { formatDistanceToNow } from 'date-fns';

interface ReviewQueueProps {
  limit?: number;
}

export function ReviewQueue({ limit = 50 }: ReviewQueueProps) {
  const { fetchReviewQueue, approveReview, rejectReview, isLoading, error } =
    useFraudDetection();
  const [reviews, setReviews] = useState<ReviewQueueItem[]>([]);
  const [pagination, setPagination] = useState({
    limit,
    offset: 0,
    total: 0,
    pages: 0,
  });
  const [selectedReview, setSelectedReview] = useState<ReviewQueueItem | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Fetch reviews on mount and when pagination changes
  useEffect(() => {
    loadReviews();
  }, [pagination.offset]);

  const loadReviews = async () => {
    const result = await fetchReviewQueue(pagination.limit, pagination.offset);
    if (result) {
      setReviews(result.data);
      setPagination(result.pagination);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setActionLoading(true);
    const success = await approveReview(reviewId);
    setActionLoading(false);

    if (success) {
      setSelectedReview(null);
      await loadReviews();
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    const success = await rejectReview(reviewId, rejectReason);
    setActionLoading(false);

    if (success) {
      setSelectedReview(null);
      setRejectReason('');
      setShowRejectForm(false);
      await loadReviews();
    }
  };

  const handlePreviousPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const getFraudScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getFraudScoreBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-100';
    if (score >= 0.6) return 'bg-orange-100';
    return 'bg-yellow-100';
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Fraud Review Queue</h2>
        <span className="text-sm text-gray-600">
          Total: {pagination.total} items
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No pending reviews</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  selectedReview?.id === review.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedReview(review)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{review.userName}</h3>
                      <span className="text-xs text-gray-500">
                        {review.userAddress.slice(0, 10)}...
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.taskName}</p>
                    <p className="text-xs text-gray-500">
                      {review.taskCategory} •{' '}
                      {formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-1 text-right ${getFraudScoreBgColor(
                      review.fraudScore
                    )}`}
                  >
                    <p className={`text-sm font-semibold ${getFraudScoreColor(review.fraudScore)}`}>
                      {(review.fraudScore * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-600">Fraud Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedReview && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-3 font-semibold">Review Details</h3>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-gray-700">User</p>
                  <p className="text-gray-600">{selectedReview.userName}</p>
                  <p className="text-xs text-gray-500">
                    {selectedReview.userAddress}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Task</p>
                  <p className="text-gray-600">{selectedReview.taskName}</p>
                  <p className="text-xs text-gray-500">
                    {selectedReview.taskCategory}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Fraud Score</p>
                  <p className={`text-lg font-bold ${getFraudScoreColor(selectedReview.fraudScore)}`}>
                    {(selectedReview.fraudScore * 100).toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Proof Hash</p>
                  <p className="break-all font-mono text-xs text-gray-600">
                    {selectedReview.proofHash}
                  </p>
                </div>

                {selectedReview.metadata && (
                  <div>
                    <p className="font-medium text-gray-700">Metadata</p>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                      {JSON.stringify(selectedReview.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <p className="font-medium text-gray-700">Submitted</p>
                  <p className="text-gray-600">
                    {new Date(selectedReview.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!showRejectForm ? (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(selectedReview.id)}
                    disabled={actionLoading}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={actionLoading}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(selectedReview.id)}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectReason('');
                      }}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <button
              onClick={handlePreviousPage}
              disabled={pagination.offset === 0 || isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {Math.floor(pagination.offset / pagination.limit) + 1} of{' '}
              {pagination.pages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={
                pagination.offset + pagination.limit >= pagination.total ||
                isLoading
              }
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
