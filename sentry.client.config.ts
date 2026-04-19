import * as Sentry from "@sentry/nextjs";

// Sentry SDK v10: use functional integration helpers. `BrowserTracing` and
// `Replay` classes were removed; the replacements are
// `browserTracingIntegration()` and `replayIntegration()`.
const tracesSampleRate = Number(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ??
    (process.env.NODE_ENV === "production" ? "0.1" : "1.0"),
);
const replaysSessionSampleRate = Number(
  process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? "0.1",
);

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  release: process.env.NEXT_PUBLIC_VERSION,

  tracesSampleRate,
  replaysSessionSampleRate,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],

  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});
