"use client";

import React from "react";

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  fallback?: React.ReactNode;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class FeatureErrorBoundary extends React.Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Feature error (${this.props.featureName}):`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="surface-card p-8 rounded-lg border border-gray-200 dark:border-gray-800 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {this.props.featureName} Unavailable
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {this.state.error?.message || "This feature is currently unavailable. Please try again later."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-80 transition-opacity text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
