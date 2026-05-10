// URL бэкенда берётся из .env (EXPO_PUBLIC_API_URL).
// Для локальной разработки создай .env с нужным значением.
const RAW_API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * Production-assert: в release-сборке нельзя гонять трафик через cleartext HTTP.
 *  - iOS ATS заблокирует и так, но ассерт страхует от случайного allowance в Info.plist
 *  - Android: usesCleartextTraffic должен быть false (см. app.json), плюс ассерт
 *  - Web: HTTP допустимо только на localhost для отладки
 *
 * При нарушении — бросаем при импорте модуля. Это сразу видно в Sentry / краш-репортах,
 * хуже не запустить приложение, чем выпустить юзерские сообщения по cleartext.
 */
function assertSecureUrl(url: string) {
  if (__DEV__) return; // в dev допустим http://localhost
  if (url.startsWith('https://')) return;
  // Разрешим http://localhost / 10.0.2.2 / 192.168.* только если это явно dev-build,
  // что мы уже отсекли через __DEV__. Здесь — только https.
  throw new Error(
    `[config] EXPO_PUBLIC_API_URL must be HTTPS in production builds. Got: ${url}`,
  );
}

assertSecureUrl(RAW_API_URL);

export const API_BASE_URL = RAW_API_URL;

// Дневной лимит сообщений для free-юзеров — единая точка истины
// в `src/context/AppContext.tsx` (FREE_DAILY_MESSAGES). Не дублируем здесь.
