"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Home, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const diagnosticId = error.digest ?? null;

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  async function copyDiagnosticId() {
    if (!diagnosticId) return;
    try {
      await navigator.clipboard.writeText(diagnosticId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <section className="surface-card w-full max-w-xl rounded-2xl p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="heading-2 mb-4 text-[var(--color-text-dark)]">
          Something went wrong
        </h1>

        <p className="text-body mb-6 text-[var(--color-text-muted)]">
          An unexpected error occurred. Please try again or contact support if
          the issue persists.
        </p>

        {diagnosticId && (
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="font-mono text-xs text-[var(--color-text-muted)]">
              ID: {diagnosticId}
            </span>
            <button
              type="button"
              onClick={copyDiagnosticId}
              aria-label="Copy diagnostic ID"
              className="rounded p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-dark)]"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
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
          <Link href="/" className="btn-outline inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
