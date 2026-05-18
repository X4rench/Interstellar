-- ────────────────────────────────────────────────────────────────────
-- Миграция 006: интеграция ЮКассы (API напрямую, с автопродлением)
--
-- Зачем отдельная таблица yk_payments вместо использования существующей
-- payments:
--   1. payments сейчас заточена под Telegram Stars (payload, charge_id,
--      tg_payment_charge_id) — другая семантика identifier'ов
--   2. ЮК даёт свой payment_id (UUID), нужно отдельно индексировать
--   3. Recurring у Stars нет — у ЮК есть payment_method_id, который надо
--      хранить долгосрочно для автосписаний
--
-- Связь с подписками — через колонку source ('stars' | 'yookassa') в
-- таблице subscriptions (добавим существующее поле).
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS yk_payments (
  -- ЮК-овский payment_id (UUID, primary key — гарантированно уникальный)
  yk_payment_id           TEXT PRIMARY KEY,

  -- Привязка к пользователю
  telegram_user_id        INTEGER NOT NULL,

  -- Тариф который покупается ('basic_month', 'premium_month', 'day_pass').
  -- Колонка-источник истины для активации подписки в webhook'е.
  plan                    TEXT NOT NULL,

  -- Сумма в КОПЕЙКАХ (внутреннее хранилище — целое число, без float-ошибок).
  -- 30000 копеек = 300 рублей.
  amount_kopecks          INTEGER NOT NULL,

  -- Статус по ЮК ('pending' | 'waiting_for_capture' | 'succeeded' | 'canceled').
  -- Обновляется webhook'ом или при ручной проверке через getPayment.
  status                  TEXT NOT NULL DEFAULT 'pending',

  -- Способ оплаты — тип (bank_card / sbp / yoo_money / tinkoff_bank / sberbank).
  -- Для UI: «Карта •• 1234», для аналитики.
  payment_method_type     TEXT,

  -- Сохранённый payment_method.id — для recurring автосписаний.
  -- NULL если юзер не разрешил сохранение или это разовая покупка (Day Pass).
  saved_payment_method_id TEXT,

  -- Последние 4 цифры карты (если bank_card) — для UI Profile.
  -- Маскированные данные, можно хранить без сертификации PCI.
  card_last4              TEXT,

  -- Признак авто-платежа: true если это recurring renewal (не первый платёж).
  is_recurring            INTEGER NOT NULL DEFAULT 0,

  -- При неудаче — код ошибки ЮК (для дебага и saved_card cleanup'а).
  -- Например 'insufficient_funds', 'expired_card', '3ds_failed'.
  error_code              TEXT,

  -- Метаданные (отправляем при create, возвращаются в webhook).
  -- Для idempotency: например {paywall_source: 'profile_banner'}.
  metadata_json           TEXT,

  -- Сырой JSON последнего webhook-update (для forensics при спорах).
  -- Максимум 8KB, обрезается при записи.
  last_webhook_json       TEXT,

  -- Таймстампы (Unix seconds)
  created_at              INTEGER NOT NULL,
  updated_at              INTEGER NOT NULL,
  succeeded_at            INTEGER,
  refunded_at             INTEGER,

  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_yk_payments_user
  ON yk_payments(telegram_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_yk_payments_status
  ON yk_payments(status, created_at DESC);

-- Для cron автопродления: быстро находим валидные saved cards.
CREATE INDEX IF NOT EXISTS idx_yk_payments_recurring
  ON yk_payments(telegram_user_id, saved_payment_method_id)
  WHERE saved_payment_method_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────
-- Recurring-настройки на уровне подписки
-- ────────────────────────────────────────────────────────────────────
-- auto_renew — флаг автопродления (юзер может отключить в Profile).
-- yk_payment_method_id — ссылка на yk_payments.saved_payment_method_id,
-- но в денормализованном виде для быстрого доступа в cron.
-- source — откуда подписка: 'stars' (legacy), 'yookassa' (новая).

ALTER TABLE subscriptions ADD COLUMN auto_renew INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN yk_payment_method_id TEXT;
ALTER TABLE subscriptions ADD COLUMN source TEXT NOT NULL DEFAULT 'stars';

-- ────────────────────────────────────────────────────────────────────
-- day_passes: добавляем source, чтобы различать Stars vs YooKassa.
-- telegram_payment_charge_id оставляем как есть — для YooKassa туда
-- пишется yk_payment_id (формально не Stars-charge, но UNIQUE-семантика
-- сохраняется и поле уже есть в схеме).
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE day_passes ADD COLUMN source TEXT NOT NULL DEFAULT 'stars';

-- Индекс для cron: найди подписки которые истекают завтра и имеют
-- auto_renew + saved card.
CREATE INDEX IF NOT EXISTS idx_subs_renewal_due
  ON subscriptions(expires_at, auto_renew)
  WHERE auto_renew = 1 AND yk_payment_method_id IS NOT NULL;
