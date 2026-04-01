'use client';

import { FraudIndicators } from '@/hooks/useFraudDetection';

interface FraudIndicatorsProps {
  fraudScore: number;
  indicators: FraudIndicators;
  isFlagged: boolean;
  reason?: string;
}

export function FraudIndicatorsDisplay({
  fraudScore,
  indicators,
  isFlagged,
  reason,
}: FraudIndicatorsProps) {
  const getFraudScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getFraudScoreBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-100';
    if (score >= 0.6) return 'bg-orange-100';
    if (score >= 0.4) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const getIndicatorStatus = (value: number | boolean | undefined) => {
    if (typeof value === 'boolean') {
      return value ? 'Detected' : 'Clear';
    }
    if (typeof value === 'number') {
      return `${(value * 100).toFixed(0)}%`;
    }
    return 'N/A';
  };

  const getIndicatorColor = (value: number | boolean | undefined) => {
    if (typeof value === 'boolean') {
      return value ? 'text-red-600' : 'text-green-600';
    }
    if (typeof value === 'number') {
      if (value >= 0.7) return 'text-red-600';
      if (value >= 0.5) return 'text-orange-600';
      return 'text-green-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      {/* Fraud Score Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Fraud Detection</h3>
          <p className="text-sm text-gray-600">
            {isFlagged
              ? 'This submission has been flagged for manual review'
              : 'This submission passed fraud checks'}
          </p>
        </div>
        <div
          className={`rounded-lg px-4 py-2 text-center ${getFraudScoreBgColor(
            fraudScore
          )}`}
        >
          <p className={`text-2xl font-bold ${getFraudScoreColor(fraudScore)}`}>
            {(fraudScore * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-600">Fraud Score</p>
        </div>
      </div>

      {/* Status Alert */}
      {isFlagged && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Flagged for Review
          </p>
          {reason && (
            <p className="mt-1 text-sm text-yellow-700">{reason}</p>
          )}
          <p className="mt-2 text-xs text-yellow-600">
            An admin will review this submission within 24 hours.
          </p>
        </div>
      )}

      {/* Fraud Indicators */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Fraud Indicators</h4>

        <div className="space-y-2">
          {/* Duplicate Similarity */}
          {indicators.duplicateSimilarity !== undefined && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Duplicate Similarity
                </p>
                <p className="text-xs text-gray-600">
                  Similarity to recent submissions
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${getIndicatorColor(
                  indicators.duplicateSimilarity
                )}`}
              >
                {getIndicatorStatus(indicators.duplicateSimilarity)}
              </p>
            </div>
          )}

          {/* Submission Velocity */}
          {indicators.submissionVelocity !== undefined && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Submission Velocity
                </p>
                <p className="text-xs text-gray-600">
                  Submissions in last 24 hours
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${getIndicatorColor(
                  indicators.submissionVelocity
                )}`}
              >
                {getIndicatorStatus(indicators.submissionVelocity)}
              </p>
            </div>
          )}

          {/* Geolocation Anomaly */}
          {indicators.geolocationAnomaly !== undefined && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Geolocation Anomaly
                </p>
                <p className="text-xs text-gray-600">
                  Unusual location pattern detected
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${getIndicatorColor(
                  indicators.geolocationAnomaly
                )}`}
              >
                {getIndicatorStatus(indicators.geolocationAnomaly)}
              </p>
            </div>
          )}

          {/* Metadata Inconsistency */}
          {indicators.metadataInconsistency !== undefined && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Metadata Inconsistency
                </p>
                <p className="text-xs text-gray-600">
                  Device or system information mismatch
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${getIndicatorColor(
                  indicators.metadataInconsistency
                )}`}
              >
                {getIndicatorStatus(indicators.metadataInconsistency)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Fraud detection uses multiple indicators to
          identify suspicious submissions. A high fraud score doesn't necessarily
          mean the submission is fraudulent—it will be reviewed by an admin.
        </p>
      </div>
    </div>
  );
}
