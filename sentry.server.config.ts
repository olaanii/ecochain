import * as Sentry from "@sentry/nextjs";

// Sentry SDK v10: class-based integrations (new Sentry.HttpIntegration, etc.)
// were removed in v8. Use the functional `httpIntegration()` helper instead.
// Sample rates default to 0 in production to avoid burning the free tier;
// raise via SENTRY_TRACES_SAMPLE_RATE / SENTRY_PROFILES_SAMPLE_RATE.
const tracesSampleRate = Number(
  process.env.SENTRY_TRACES_SAMPLE_RATE ??
    (process.env.NODE_ENV === "production" ? "0.1" : "1.0"),
);
const profilesSampleRate = Number(
  process.env.SENTRY_PROFILES_SAMPLE_RATE ??
    (process.env.NODE_ENV === "production" ? "0.1" : "1.0"),
);

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  release: process.env.NEXT_PUBLIC_VERSION || process.env.VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate,
  profilesSampleRate,

  integrations: [Sentry.httpIntegration()],

  // Strip PII / credentials from every event before upload.
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        const redacted = ["authorization", "cookie", "x-api-key", "x-vercel-token"];
        for (const key of Object.keys(event.request.headers)) {
          if (redacted.includes(key.toLowerCase())) {
            event.request.headers[key] = "[Filtered]";
          }
        }
      }
    }
    return event;
  },
});
