"use client";

import React from "react";

interface ContractErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ContractErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ContractErrorBoundary extends React.Component<
  ContractErrorBoundaryProps,
  ContractErrorBoundaryState
> {
  constructor(props: ContractErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ContractErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Contract interaction error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="surface-card p-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Contract Interaction Error
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {this.state.error?.message || "An error occurred while interacting with the smart contract."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
