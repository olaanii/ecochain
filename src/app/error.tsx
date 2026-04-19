"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <section className="surface-card w-full max-w-xl rounded-2xl p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="heading-2 mb-4 text-[var(--color-text-dark)]">
          Something went wrong
        </h1>
        
        <p className="text-body text-[var(--color-text-muted)] mb-6">
          {error.message || "An unexpected error occurred. Please try again or contact support if the issue persists."}
        </p>
        
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="text-xs text-[var(--color-text-muted)] mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="btn-outline inline-flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
