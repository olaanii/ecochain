'use client';

import { useEffect, useState } from 'react';

interface FraudMetrics {
  totalSubmissions: number;
  flaggedSubmissions: number;
  flagRate: number;
  averageFraudScore: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  topFraudIndicators: {
    duplicates: number;
    velocity: number;
    geolocation: number;
    metadata: number;
  };
  recentTrend: Array<{
    date: string;
    flagged: number;
    total: number;
  }>;
}

/**
 * Fraud Analytics Dashboard Component
 * Displays fraud detection metrics and trends
 */
export function FraudAnalytics() {
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, this would fetch from an analytics endpoint
      // For now, we'll show a placeholder structure
      const mockMetrics: FraudMetrics = {
        totalSubmissions: 1250,
        flaggedSubmissions: 87,
        flagRate: 0.0696,
        averageFraudScore: 0.32,
        highRiskCount: 12,
        mediumRiskCount: 35,
        lowRiskCount: 40,
        topFraudIndicators: {
          duplicates: 45,
          velocity: 28,
          geolocation: 10,
          metadata: 4,
        },
        recentTrend: [
          { date: '2024-01-01', flagged: 5, total: 120 },
          { date: '2024-01-02', flagged: 8, total: 135 },
          { date: '2024-01-03', flagged: 6, total: 128 },
          { date: '2024-01-04', flagged: 12, total: 142 },
          { date: '2024-01-05', flagged: 9, total: 138 },
          { date: '2024-01-06', flagged: 14, total: 155 },
          { date: '2024-01-07', flagged: 11, total: 148 },
        ],
      };

      setMetrics(mockMetrics);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load metrics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Total Submissions</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {metrics.totalSubmissions.toLocaleString()}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Flagged</div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {metrics.flaggedSubmissions}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {(metrics.flagRate * 100).toFixed(2)}% flag rate
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Avg Fraud Score</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {(metrics.averageFraudScore * 100).toFixed(0)}%
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">High Risk</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">
            {metrics.highRiskCount}
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Risk Distribution</h3>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600">High Risk (&gt;0.7)</span>
              <span className="font-medium text-gray-900">{metrics.highRiskCount}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-red-600"
                style={{
                  width: `${(metrics.highRiskCount / metrics.flaggedSubmissions) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600">Medium Risk (0.5-0.7)</span>
              <span className="font-medium text-gray-900">{metrics.mediumRiskCount}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-orange-600"
                style={{
                  width: `${(metrics.mediumRiskCount / metrics.flaggedSubmissions) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600">Low Risk (&lt;0.5)</span>
              <span className="font-medium text-gray-900">{metrics.lowRiskCount}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-yellow-600"
                style={{
                  width: `${(metrics.lowRiskCount / metrics.flaggedSubmissions) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Fraud Indicators */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Top Fraud Indicators
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duplicate Submissions</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{
                    width: `${(metrics.topFraudIndicators.duplicates / 50) * 100}%`,
                  }}
                />
              </div>
              <span className="w-12 text-right text-sm font-medium text-gray-900">
                {metrics.topFraudIndicators.duplicates}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">High Velocity</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{
                    width: `${(metrics.topFraudIndicators.velocity / 50) * 100}%`,
                  }}
                />
              </div>
              <span className="w-12 text-right text-sm font-medium text-gray-900">
                {metrics.topFraudIndicators.velocity}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Geolocation Anomaly</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-600"
                  style={{
                    width: `${(metrics.topFraudIndicators.geolocation / 50) * 100}%`,
                  }}
                />
              </div>
              <span className="w-12 text-right text-sm font-medium text-gray-900">
                {metrics.topFraudIndicators.geolocation}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Metadata Inconsistency</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-pink-600"
                  style={{
                    width: `${(metrics.topFraudIndicators.metadata / 50) * 100}%`,
                  }}
                />
              </div>
              <span className="w-12 text-right text-sm font-medium text-gray-900">
                {metrics.topFraudIndicators.metadata}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trend */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">7-Day Trend</h3>
        <div className="space-y-2">
          {metrics.recentTrend.map((day) => (
            <div key={day.date} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{day.date}</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">
                  {day.flagged} / {day.total}
                </span>
                <div className="h-2 w-32 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-red-600"
                    style={{ width: `${(day.flagged / day.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
