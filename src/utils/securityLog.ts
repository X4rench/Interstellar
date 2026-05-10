/**
 * Структурный логер security-событий (D3).
 *
 * Цель: при инциденте на проде иметь телеметрию, чтобы понять что произошло.
 * Без этого «у пользователя пропала подписка» / «не открывается чат» —
 * чёрный ящик.
 *
 * В DEV пишет в console с тегом. В prod — TODO для Sentry / Yandex
 * AppMetrica / Crashlytics. Подключение делается в одном месте (sendToProvider).
 */

export type SecurityEventType =
  /** Sanity-check на длительность подписки fail → потенциальный тампер. */
  | 'tamper_subscription_duration'
  /** Subscription JSON parse fail → corrupted SecureStore. */
  | 'tamper_subscription_corrupt'
  /** apiFetch получил 401 INVALID_SESSION → токен инвалидирован сервером. */
  | 'session_invalidated'
  /** /identify вызван повторно после 401 — auto-recovery. */
  | 'session_auto_recovered'
  /** deleteAccountFully не смог достучаться до бэка, локально всё стёр. */
  | 'delete_account_offline'
  /** Vault decrypt fail при загрузке чатов → ключ потерян или blob повреждён. */
  | 'vault_decrypt_fail'
  /** App lock fail (биометрия отклонена / не настроена). */
  | 'app_lock_fail'
  /** Юзер активировал триал. Не security-инцидент, но полезный signal. */
  | 'trial_started';

export interface SecurityEvent {
  type: SecurityEventType;
  /** Свободные данные. НЕ кладите сюда PII (имена, текст сообщений, persona). */
  meta?: Record<string, string | number | boolean>;
  timestamp: string;
}

/**
 * Главный entry-point. Вызывать при каждом security-релевантном событии.
 * Не throws — даже если provider упал, основная логика приложения не должна
 * падать из-за лога.
 */
export function logSecurityEvent(
  type: SecurityEventType,
  meta?: SecurityEvent['meta'],
): void {
  const event: SecurityEvent = {
    type,
    meta,
    timestamp: new Date().toISOString(),
  };

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn('[security]', type, meta ?? '');
  }

  try {
    sendToProvider(event);
  } catch {
    // никогда не пробрасываем
  }
}

/**
 * Заглушка для интеграции с провайдером телеметрии.
 *
 * ⚠️ Перед релизом подключить один из:
 *   - Sentry: `Sentry.captureMessage(event.type, { extra: event.meta })`
 *   - Yandex AppMetrica: `AppMetrica.reportEvent(event.type, event.meta)`
 *   - Crashlytics: `crashlytics().log(JSON.stringify(event))`
 *
 * Особое внимание:
 *   - НЕ отправлять PII (см. doc на meta выше)
 *   - rate-limit события одного типа (max 1/min на устройство)
 */
function sendToProvider(_event: SecurityEvent): void {
  // TODO: подключить провайдер телеметрии. См. док выше.
}
