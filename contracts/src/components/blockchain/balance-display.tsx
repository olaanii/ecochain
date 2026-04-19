'use client';

import { useBalance } from '@/hooks/useBalance';
import { Address } from 'viem';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Balance Display Components
 * 
 * Requirement 7.1, 7.2, 7.3, 7.4, 7.5
 */

interface BalanceDisplayProps {
  address?: Address;
  showBreakdown?: boolean;
  className?: string;
}

/**
 * Main Balance Display Component
 */
export function BalanceDisplay({
  address,
  showBreakdown = true,
  className = '',
}: BalanceDisplayProps) {
  const { balance, isLoading, error, refresh } = useBalance(address);

  if (isLoading && !balance) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-sm text-gray-600">Loading balance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        No balance data available
      </div>
    );
  }

  const formatBalance = (value: bigint) => {
    const num = Number(value) / 1e18; // Assuming 18 decimals
    return num.toFixed(2);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatBalance(balance.total)} ECO
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {showBreakdown && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600">Available</p>
            <p className="font-semibold text-gray-900">
              {formatBalance(balance.available)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Staked</p>
            <p className="font-semibold text-gray-900">
              {formatBalance(balance.staked)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Pending</p>
            <p className="font-semibold text-gray-900">
              {formatBalance(balance.pending)}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Updated {new Date(balance.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}

/**
 * Compact Balance Display
 */
export function BalanceCompact({ address, className = '' }: BalanceDisplayProps) {
  const { balance, isLoading, error } = useBalance(address);

  if (isLoading && !balance) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
        <span className="text-xs text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <span className={`text-xs text-gray-600 ${className}`}>
        --
      </span>
    );
  }

  const formatBalance = (value: bigint) => {
    const num = Number(value) / 1e18;
    return num.toFixed(2);
  };

  return (
    <span className={`text-sm font-semibold text-gray-900 ${className}`}>
      {formatBalance(balance.available)} ECO
    </span>
  );
}

/**
 * Balance Card Component
 */
export function BalanceCard({ address, className = '' }: BalanceDisplayProps) {
  const { balance, isLoading, error, refresh } = useBalance(address);

  if (isLoading && !balance) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Loading balance...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Balance Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
        <p className="text-sm text-gray-600">No balance data available</p>
      </div>
    );
  }

  const formatBalance = (value: bigint) => {
    const num = Number(value) / 1e18;
    return num.toFixed(2);
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">Your Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatBalance(balance.total)}
            <span className="text-lg text-gray-600 ml-2">ECO</span>
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
          title="Refresh balance"
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide">Available</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {formatBalance(balance.available)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide">Staked</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {formatBalance(balance.staked)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide">Pending</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {formatBalance(balance.pending)}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Last updated: {new Date(balance.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}
