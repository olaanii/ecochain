import * as Sentry from "@sentry/nextjs";

// Edge runtime: keep the init surface minimal — no profiling, no session
// replay, no node-only integrations.
const tracesSampleRate = Number(
  process.env.SENTRY_TRACES_SAMPLE_RATE ??
    (process.env.NODE_ENV === "production" ? "0.1" : "1.0"),
);

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  release: process.env.NEXT_PUBLIC_VERSION || process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate,
});
