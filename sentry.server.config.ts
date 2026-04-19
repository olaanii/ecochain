import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Release version
  release: process.env.NEXT_PUBLIC_VERSION || "1.0.0",
  
  // Set beforeSend to filter out sensitive data
  beforeSend(event, hint) {
    // Filter out any sensitive information
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
  
  // Integrations
  integrations: [
    // Add HTTP request tracking
    new Sentry.HttpIntegration({
      tracing: true,
    }),
  ],
  
  // Performance monitoring
  profilesSampleRate: 1.0,
});
