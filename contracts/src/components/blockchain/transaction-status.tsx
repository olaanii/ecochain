'use client';

import { Hash } from 'viem';
import { TransactionStatus } from '@/lib/blockchain/transaction-manager';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

/**
 * Transaction Status Component
 * 
 * Requirement 17.5
 * - Create transaction pending indicator
 * - Build transaction success/failure notifications
 * - Add transaction tracking link to block explorer
 * - Display user-friendly error messages
 */

interface TransactionStatusProps {
  status: TransactionStatus | null;
  hash?: Hash;
  error?: string;
  blockExplorerUrl?: string;
}

export function TransactionStatusIndicator({
  status,
  hash,
  error,
  blockExplorerUrl = 'https://explorer.initia.xyz',
}: TransactionStatusProps) {
  if (!status) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case TransactionStatus.PENDING:
        return {
          icon: Clock,
          label: 'Transaction Pending',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case TransactionStatus.CONFIRMED:
        return {
          icon: CheckCircle,
          label: 'Transaction Confirmed',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case TransactionStatus.REVERTED:
        return {
          icon: XCircle,
          label: 'Transaction Reverted',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case TransactionStatus.FAILED:
        return {
          icon: AlertCircle,
          label: 'Transaction Failed',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown Status',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{config.label}</h3>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          {hash && (
            <div className="mt-2 flex items-center gap-2">
              <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </code>
              <a
                href={`${blockExplorerUrl}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                View on Explorer
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Transaction Pending Indicator Component
 * 
 * Requirement 17.5
 */
export function TransactionPendingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
      <span className="text-sm text-yellow-600">Transaction pending...</span>
    </div>
  );
}

/**
 * Transaction Success Notification Component
 * 
 * Requirement 17.5
 */
interface TransactionSuccessProps {
  hash: Hash;
  message?: string;
  blockExplorerUrl?: string;
  onDismiss?: () => void;
}

export function TransactionSuccess({
  hash,
  message = 'Transaction confirmed successfully!',
  blockExplorerUrl = 'https://explorer.initia.xyz',
  onDismiss,
}: TransactionSuccessProps) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">{message}</h3>
            <a
              href={`${blockExplorerUrl}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-sm text-green-600 hover:text-green-700 underline"
            >
              View transaction on explorer
            </a>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-400 hover:text-green-600"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Transaction Error Notification Component
 * 
 * Requirement 17.5
 */
interface TransactionErrorProps {
  error: string;
  hash?: Hash;
  blockExplorerUrl?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function TransactionError({
  error,
  hash,
  blockExplorerUrl = 'https://explorer.initia.xyz',
  onDismiss,
  onRetry,
}: TransactionErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900">Transaction Failed</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            {hash && (
              <a
                href={`${blockExplorerUrl}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                View transaction on explorer
              </a>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Retry transaction
              </button>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
