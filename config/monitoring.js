// Optional error monitoring. Completely inert unless SENTRY_DSN is set, so the
// app runs unchanged in dev / for anyone without a Sentry account.
import * as Sentry from '@sentry/node';

let enabled = false;

/** Initialise Sentry once, only when a DSN is configured. Safe to call always. */
export function initMonitoring() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || enabled) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'production',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0),
  });
  enabled = true;
  console.log('[monitoring] Sentry enabled');
}

/** Report an error to Sentry when enabled; a no-op otherwise. */
export function captureError(err, context) {
  if (!enabled) return;
  try {
    Sentry.captureException(err, context ? { extra: context } : undefined);
  } catch {
    // never let monitoring break the request
  }
}
