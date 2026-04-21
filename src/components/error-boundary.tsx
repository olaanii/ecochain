"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6" role="alert" aria-live="assertive">
          <div className="max-w-md w-full text-center space-y-4 rounded-2xl bg-[var(--color-surface-elevated)] p-8 shadow-[var(--shadow-base)]">
            <div className="flex justify-center">
              <div className="p-3 rounded-full" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}>
                <AlertCircle className="h-8 w-8" style={{ color: "var(--color-error)" }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold" style={{ color: "var(--color-text-dark)" }}>
                Something went wrong
              </h2>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>

            <button 
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: "var(--color-surface-muted)",
                color: "var(--color-text-dark)"
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
