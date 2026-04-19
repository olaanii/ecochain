'use client';

import { useState } from 'react';

interface FraudConfig {
  duplicateSimilarityThreshold: number;
  duplicatePenalty: number;
  velocityThreshold: number;
  velocityPenalty: number;
  geolocationPenalty: number;
  metadataPenalty: number;
  fraudScoreThreshold: number;
  cooldownHours: number;
}

/**
 * System Configuration Component
 * Allows admins to configure fraud detection parameters
 */
export function SystemConfig() {
  const [config, setConfig] = useState<FraudConfig>({
    duplicateSimilarityThreshold: 0.9,
    duplicatePenalty: 0.3,
    velocityThreshold: 10,
    velocityPenalty: 0.2,
    geolocationPenalty: 0.15,
    metadataPenalty: 0.25,
    fraudScoreThreshold: 0.5,
    cooldownHours: 24,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof FraudConfig, value: number) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // In a real implementation, this would POST to an API endpoint
      // For now, we'll just simulate the save
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSaveMessage('Configuration saved successfully');
      setHasChanges(false);

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      duplicateSimilarityThreshold: 0.9,
      duplicatePenalty: 0.3,
      velocityThreshold: 10,
      velocityPenalty: 0.2,
      geolocationPenalty: 0.15,
      metadataPenalty: 0.25,
      fraudScoreThreshold: 0.5,
      cooldownHours: 24,
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Fraud Detection Configuration
        </h2>

        <div className="space-y-6">
          {/* Duplicate Detection */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Duplicate Detection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Similarity Threshold
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={config.duplicateSimilarityThreshold}
                    onChange={(e) =>
                      handleChange(
                        'duplicateSimilarityThreshold',
                        parseFloat(e.target.value)
                      )
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-gray-900">
                    {config.duplicateSimilarityThreshold.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Submissions with similarity above this threshold are flagged
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fraud Score Penalty
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.duplicatePenalty}
                    onChange={(e) =>
                      handleChange('duplicatePenalty', parseFloat(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-gray-900">
                    +{config.duplicatePenalty.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Velocity Detection */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Velocity Detection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Submission Threshold (24h)
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={config.velocityThreshold}
                    onChange={(e) =>
                      handleChange('velocityThreshold', parseInt(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-gray-900">
                    {config.velocityThreshold}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Submissions exceeding this count in 24h are flagged
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fraud Score Penalty
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.velocityPenalty}
                    onChange={(e) =>
                      handleChange('velocityPenalty', parseFloat(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-gray-900">
                    +{config.velocityPenalty.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Geolocation Detection */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Geolocation Detection
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fraud Score Penalty
              </label>
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.geolocationPenalty}
                  onChange={(e) =>
                    handleChange('geolocationPenalty', parseFloat(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm font-medium text-gray-900">
                  +{config.geolocationPenalty.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Applied when geolocation anomalies are detected
              </p>
            </div>
          </div>

          {/* Metadata Detection */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Metadata Detection
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fraud Score Penalty
              </label>
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.metadataPenalty}
                  onChange={(e) =>
                    handleChange('metadataPenalty', parseFloat(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm font-medium text-gray-900">
                  +{config.metadataPenalty.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Applied when metadata inconsistencies are detected
              </p>
            </div>
          </div>

          {/* Review Thresholds */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Review Thresholds
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fraud Score Threshold for Review
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.fraudScoreThreshold}
                    onChange={(e) =>
                      handleChange('fraudScoreThreshold', parseFloat(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-gray-900">
                    {config.fraudScoreThreshold.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Submissions with fraud score above this are flagged for review
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cooldown Period (hours)
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="168"
                    step="1"
                    value={config.cooldownHours}
                    onChange={(e) =>
                      handleChange('cooldownHours', parseInt(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-gray-900">
                    {config.cooldownHours}h
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Time before user can resubmit after rejection
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-blue-900">
              Configuration Summary
            </h4>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>
                • Max fraud score: {(config.duplicatePenalty + config.velocityPenalty + config.geolocationPenalty + config.metadataPenalty).toFixed(2)} (capped at 1.0)
              </li>
              <li>
                • Submissions flagged when score &gt; {config.fraudScoreThreshold.toFixed(2)}
              </li>
              <li>
                • Users can resubmit after {config.cooldownHours} hour
                {config.cooldownHours !== 1 ? 's' : ''}
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
        </div>

        {saveMessage && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm ${
              saveMessage.includes('successfully')
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}
