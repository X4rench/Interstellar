import * as Sentry from '@sentry/react-native';

/**
 * Инициализация Sentry. Вызывается один раз при старте приложения (см. App.tsx).
 *
 * ⚠️ ПЕРЕД РЕЛИЗОМ:
 *   1. Создать аккаунт на sentry.io
 *   2. Создать проект для React Native
 *   3. Скопировать DSN
 *   4. Положить в .env как EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
 *   5. Если используется EAS — подключить sentry-expo / sentry-cli
 *      для автозагрузки sourcemap'ов на каждый билд
 *
 * Если DSN не задан — Sentry в no-op режиме, ошибок не падает.
 */
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  if (!SENTRY_DSN) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[sentry] DSN not set, telemetry disabled. См. sentryInit.ts.');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // В DEV — не шлём в Sentry, чтобы не засорять events.
    enabled: !__DEV__,
    // Tracking ошибок: 100% sample rate. Performance — 10% (если нужно).
    tracesSampleRate: 0.1,
    // Не отправляем PII по умолчанию.
    sendDefaultPii: false,
    // Отрезаем длинные текстовые поля если случайно попадут.
    maxBreadcrumbs: 50,
    // beforeSend — финальный фильтр. Дополнительная защита от утечки PII.
    beforeSend(event) {
      // Удаляем User-context кроме id (девайс-id уже хешируется на бэке).
      if (event.user) {
        event.user = { id: event.user.id };
      }
      return event;
    },
  });
}

/**
 * Wrap App-компонент в Sentry HOC для автоматического трекинга навигации
 * и неотловленных ошибок. Используется в App.tsx.
 */
export const wrapWithSentry: <T>(Component: T) => T =
  // Sentry.wrap безопасно работает даже без init — просто возвращает компонент.
  Sentry.wrap as any;
