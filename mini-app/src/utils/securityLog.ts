/**
 * Структурный логер security-событий.
 *
 * Цель: при инциденте на проде иметь телеметрию, чтобы понять что произошло.
 * Без этого «у пользователя пропала подписка» / «не открывается чат» —
 * чёрный ящик.
 *
 * В DEV пишет в console с тегом. В prod уходит в Sentry через
 * captureMessage (если DSN настроен в .env).
 */
import * as Sentry from '@sentry/react'

export type SecurityEventType =
  /** Sanity-check на длительность подписки fail → потенциальный тампер. */
  | 'tamper_subscription_duration'
  /** Subscription JSON parse fail → corrupted localStorage. */
  | 'tamper_subscription_corrupt'
  /** API вернул 401 — initData не приняли. */
  | 'init_data_rejected'
  /** Юзер активировал триал. Не security-инцидент, но полезный signal. */
  | 'trial_started'
  /** Юзер открыл NSFW персонажа без подтверждённого 18+. */
  | 'nsfw_blocked'
  /** Stars-инвойс не дотащился до successful_payment в течение 5 мин. */
  | 'invoice_pending_timeout';

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

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('[security]', type, meta ?? '');
  }

  try {
    Sentry.captureMessage(event.type, {
      level: 'warning',
      extra: { ...event.meta, timestamp: event.timestamp },
    });
  } catch {
    // никогда не пробрасываем
  }
}
