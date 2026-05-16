-- ════════════════════════════════════════════════════════════════════════
-- Multi-tier pricing: Free, Basic, Premium + Day Pass
--
-- Replaces single 'month' plan с тремя уровнями. Каждый юзер имеет
-- неявный 'free' тариф (нет записи в subscriptions). Платные тарифы
-- создают запись в subscriptions с plan IN ('basic_month','premium_month').
-- Day Pass — отдельная сущность (one-time 24h boost к текущему тиру).
-- ════════════════════════════════════════════════════════════════════════

-- ─── 1. Расширяем subscriptions.plan ────────────────────────────────────
-- SQLite не позволяет ALTER CHECK напрямую. Стандартный приём — пересоздать
-- таблицу с тем же содержимым. Делаем атомарно в одной транзакции.
--
-- Старая схема: plan TEXT NOT NULL, CHECK (plan IN ('month'))
-- Новая схема:  plan TEXT NOT NULL, CHECK (plan IN ('basic_month','premium_month'))
--
-- Миграция данных: существующие 'month' → 'basic_month' (был дефолтный план).

CREATE TABLE subscriptions_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id INTEGER NOT NULL,
  plan TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  is_trial INTEGER NOT NULL DEFAULT 0,
  cancelled_at INTEGER,
  telegram_payment_charge_id TEXT,
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  CHECK (plan IN ('basic_month','premium_month'))
);

INSERT INTO subscriptions_new (
  id, telegram_user_id, plan, started_at, expires_at, is_trial,
  cancelled_at, telegram_payment_charge_id, payment_id
)
SELECT
  id, telegram_user_id,
  CASE WHEN plan = 'month' THEN 'basic_month' ELSE plan END AS plan,
  started_at, expires_at, is_trial,
  cancelled_at, telegram_payment_charge_id, payment_id
FROM subscriptions;

DROP TABLE subscriptions;
ALTER TABLE subscriptions_new RENAME TO subscriptions;

-- Восстанавливаем индексы (они сбрасываются при DROP TABLE).
CREATE INDEX idx_subscriptions_user_active ON subscriptions(telegram_user_id, expires_at DESC);
CREATE INDEX idx_subscriptions_payment ON subscriptions(payment_id);

-- ─── 2. Day Pass — отдельная таблица ────────────────────────────────────
-- Day Pass = one-time покупка (без recurring), даёт 24h без daily-cap
-- в текущем тире юзера. Если у юзера НЕТ активной подписки — день-пасс
-- бесполезен (free-tier — это безлимит 5 msg/день и Day Pass их не снимает,
-- но мы это разруливаем на уровне check в код).
--
-- TG-сторонне Day Pass — обычная Stars-покупка без subscription_period.
CREATE TABLE day_passes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id INTEGER NOT NULL,
  purchased_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,                         -- purchased_at + 24h
  telegram_payment_charge_id TEXT NOT NULL UNIQUE,    -- идемпотентный ключ
  payment_id INTEGER,
  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);
CREATE INDEX idx_day_passes_user_active ON day_passes(telegram_user_id, expires_at DESC);

-- ─── 3. payments.plan расширяем такой же логикой ───────────────────────
-- В payments хранится plan для всех платежей включая Day Pass.
-- Старая схема не имела этого поля; добавляем как nullable (старые ряды NULL).
--
-- ВНИМАНИЕ: в server.js payments.plan читается из invoice_payload (наш формат
-- v1:userId:nonce). Здесь добавляем столбец для прямого выборки.
ALTER TABLE payments ADD COLUMN plan TEXT
  CHECK (plan IS NULL OR plan IN ('basic_month','premium_month','day_pass'));

-- ─── 4. invoices_outstanding.plan расширяем ────────────────────────────
-- Старое CHECK (plan IN ('month')) → разрешаем три значения.
-- Те же приёмы пересоздания таблицы.
CREATE TABLE invoices_outstanding_new (
  invoice_payload TEXT PRIMARY KEY,
  telegram_user_id INTEGER NOT NULL,
  amount_stars INTEGER NOT NULL,
  plan TEXT NOT NULL,
  attributed_partner_id INTEGER,
  revenue_share_bps_snapshot INTEGER,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  consumed_at INTEGER,
  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id) ON DELETE RESTRICT,
  CHECK (status IN ('pending','consumed','expired')),
  CHECK (plan IN ('basic_month','premium_month','day_pass'))
);
INSERT INTO invoices_outstanding_new
SELECT
  invoice_payload, telegram_user_id, amount_stars,
  CASE WHEN plan = 'month' THEN 'basic_month' ELSE plan END AS plan,
  attributed_partner_id, revenue_share_bps_snapshot,
  created_at, status, consumed_at
FROM invoices_outstanding;
DROP TABLE invoices_outstanding;
ALTER TABLE invoices_outstanding_new RENAME TO invoices_outstanding;
CREATE INDEX idx_invoices_pending ON invoices_outstanding(created_at) WHERE status='pending';
