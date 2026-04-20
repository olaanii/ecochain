"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, RefreshCw, LayoutDashboard, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const diagnosticId = error.digest ?? null;

  useEffect(() => {
    console.error("[Admin] Route error:", error);
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
      <section className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-lg dark:border-red-800 dark:bg-red-950/30">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <ShieldAlert className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="mb-2 text-xl font-bold text-red-900 dark:text-red-100">
          Admin panel error
        </h1>

        <p className="mb-5 text-sm text-red-700 dark:text-red-300">
          An error occurred in the admin interface. Your action may not have
          completed. Check the audit log and try again.
        </p>

        {diagnosticId && (
          <div className="mb-5 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-100/50 px-3 py-2 dark:border-red-800 dark:bg-red-900/30">
            <span className="font-mono text-xs text-red-700 dark:text-red-300">
              Diagnostic ID: {diagnosticId}
            </span>
            <button
              type="button"
              onClick={copyDiagnosticId}
              aria-label="Copy diagnostic ID"
              className="rounded p-1 text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
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
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
