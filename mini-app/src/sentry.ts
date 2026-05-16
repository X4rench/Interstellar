import * as Sentry from '@sentry/react'

/**
 * Минимальная инициализация Sentry. Tracing/Replay выключены — на MVP
 * нужен только error-tracking, чтобы не раздувать bundle (~+150kb с replay).
 *
 * Если VITE_SENTRY_DSN пустой — Sentry не запускается (DEV-окружение).
 * В этом случае ErrorBoundary всё равно работает, но события не уходят
 * в облако — fallback-UI показывается, ошибка просто логируется в консоль.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    environment: import.meta.env.DEV ? 'development' : 'production',
  })
}

export const SentryErrorBoundary = Sentry.ErrorBoundary
