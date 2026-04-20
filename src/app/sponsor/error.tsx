"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, LayoutDashboard, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function SponsorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const diagnosticId = error.digest ?? null;

  useEffect(() => {
    console.error("[Sponsor] Route error:", error);
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
      <section className="surface-card w-full max-w-lg rounded-2xl p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
          <AlertCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="mb-2 text-xl font-bold text-[var(--color-text-dark)]">
          Sponsor portal error
        </h1>

        <p className="mb-5 text-sm text-[var(--color-text-muted)]">
          Something went wrong in the sponsor portal. No data was permanently
          affected. Please try again or contact support.
        </p>

        {diagnosticId && (
          <div className="mb-5 flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
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
          <Link
            href="/sponsor"
            className="btn-outline inline-flex items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Sponsor overview
          </Link>
        </div>
      </section>
    </main>
  );
}
