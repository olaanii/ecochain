"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function UserRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("User route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6" role="alert" aria-live="assertive">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface-elevated)] p-8 shadow-[var(--shadow-base)]">
        <div className="flex flex-col items-center text-center">
          <div 
            className="mb-4 rounded-full p-3"
            style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
          >
            <AlertTriangle className="h-8 w-8" style={{ color: "var(--color-error)" }} />
          </div>
          
          <h2 
            className="mb-2 text-2xl font-semibold"
            style={{ color: "var(--color-text-dark)" }}
          >
            Page Error
          </h2>
          
          <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Something went wrong loading this page. We&apos;ve logged the error and are working on it.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-brand-primary)",
                color: "white",
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-dark)",
              }}
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
