'use client';

import { useCallback, useState } from 'react';
import { useProofSubmission } from '@/hooks/useProofSubmission';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Proof Uploader Component
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 3.7, 29.8, 29.9
 */

interface ProofUploaderProps {
  taskId: string;
  proofType: 'photo' | 'transit' | 'weight' | 'sensor' | 'api';
  requiresGeolocation?: boolean;
  onSuccess?: (verificationId: string) => void;
  onError?: (error: string) => void;
}

export function ProofUploader({
  taskId,
  proofType,
  requiresGeolocation = false,
  onSuccess,
  onError,
}: ProofUploaderProps) {
  const { submitProof, isLoading, error, verificationId } = useProofSubmission();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [geolocation, setGeolocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        onError?.('File size exceeds 10MB limit');
        return;
      }

      setSelectedFile(file);
    }
  }, [onError]);

  /**
   * Get user's geolocation
   */
  const getGeolocation = useCallback(async () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }, []);

  /**
   * Handle proof submission
   */
  const handleSubmit = useCallback(async () => {
    if (!selectedFile) {
      onError?.('Please select a file');
      return;
    }

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const proofData = event.target?.result as string;

        // Get geolocation if required
        let geo: { latitude: number; longitude: number } | undefined;
        if (requiresGeolocation) {
          try {
            geo = await getGeolocation();
          } catch (error) {
            onError?.('Failed to get geolocation');
            return;
          }
        }

        // Submit proof
        try {
          const result = await submitProof({
            taskId,
            proofType,
            proofData,
            timestamp: Math.floor(Date.now() / 1000),
            geolocation: geo,
            metadata: {
              fileName: selectedFile.name,
              fileSize: selectedFile.size,
              fileType: selectedFile.type,
            },
          });

          onSuccess?.(result.verificationId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          onError?.(errorMessage);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMessage);
    }
  }, [selectedFile, taskId, proofType, requiresGeolocation, submitProof, getGeolocation, onSuccess, onError]);

  if (verificationId) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">Proof Submitted Successfully</h3>
            <p className="text-sm text-green-700 mt-1">
              Verification ID: {verificationId.slice(0, 8)}...
            </p>
            <p className="text-xs text-green-600 mt-2">
              Your proof is being verified. You'll be notified when verification is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-700">
            {selectedFile ? selectedFile.name : 'Click to select proof file'}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Max 10MB • {proofType === 'photo' ? 'JPG, PNG' : 'Any format'}
          </span>
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={isLoading}
            className="hidden"
            accept={proofType === 'photo' ? 'image/*' : undefined}
          />
        </label>
      </div>

      {/* Geolocation Info */}
      {requiresGeolocation && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-sm text-blue-700">
            📍 Geolocation will be captured when you submit this proof
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        className="w-full rounded-lg bg-blue-600 text-white font-medium py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Submit Proof
          </>
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        Your proof will be verified using AI and blockchain technology
      </p>
    </div>
  );
}
