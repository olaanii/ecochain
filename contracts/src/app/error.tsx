"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <section className="surface w-full max-w-xl rounded-[2rem] p-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300">
          App surface error
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">We hit a runtime issue.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          The setup-gated UI caught a client-side error before it could take the whole page down.
          Check your Clerk and Initia env vars, then try again.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
          >
            Try again
          </button>
          <a
            href="https://docs.initia.xyz/hackathon/get-started"
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-300/60 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Initia docs
          </a>
        </div>
      </section>
    </main>
  );
}
