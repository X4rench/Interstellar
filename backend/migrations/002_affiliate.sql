-- ════════════════════════════════════════════════════════════════════════
-- Affiliate program + Stars payments + audit log
-- ════════════════════════════════════════════════════════════════════════

-- ─── partners ────────────────────────────────────────────────────────────
-- Один partner = одна строка. Telegram_user_id одновременно FK на users
-- и primary key (partner unique per user). При revoke роли запись НЕ удаляем
-- (для audit и финансовой истории) — просто status='revoked'.
--
-- PII полей: храним AES-256-GCM-зашифрованным. Для каждого PII-поля три
-- BLOB: ciphertext, iv (12 байт), tag (16 байт). Ключ — env PAYOUT_ENCRYPTION_KEY.
-- При компрометации SQLite-файла без ключа атакующий не получит PII.
--
-- ИНН партнёра (самозанятый: 12 цифр) нужен чтобы партнёр выставлял нам
-- чек через "Мой налог" — мы как плательщик должны видеть его номер.
-- Реквизиты счёта — для банк-перевода.
CREATE TABLE partners (
  telegram_user_id          INTEGER PRIMARY KEY,
  blogger_slug              TEXT NOT NULL UNIQUE COLLATE NOCASE,
  revenue_share_bps         INTEGER NOT NULL DEFAULT 5000,   -- 50% по умолчанию
  status                    TEXT NOT NULL DEFAULT 'active',

  -- ── PII (AES-256-GCM) ──────────────────────────────────────────────────
  full_name_ciphertext      BLOB,
  full_name_iv              BLOB,
  full_name_tag             BLOB,

  inn_ciphertext            BLOB,                            -- ИНН 12 цифр
  inn_iv                    BLOB,
  inn_tag                   BLOB,

  email_ciphertext          BLOB,
  email_iv                  BLOB,
  email_tag                 BLOB,

  phone_ciphertext          BLOB,
  phone_iv                  BLOB,
  phone_tag                 BLOB,

  bank_details_ciphertext   BLOB,                            -- JSON {account, bik, bank_name}
  bank_details_iv           BLOB,
  bank_details_tag          BLOB,

  pii_provided              INTEGER NOT NULL DEFAULT 0,      -- 1 = все обязательные поля заполнены
  pii_consent_at            INTEGER,                          -- timestamp принятия согласия на обработку ПД (152-ФЗ)
  pii_consent_version       TEXT,                             -- версия согласия на момент acceptance

  granted_by_admin_id       INTEGER NOT NULL,
  granted_at                INTEGER NOT NULL,
  revoked_at                INTEGER,
  revoke_reason             TEXT,
  notes                     TEXT,                              -- админский коммент, НЕ PII

  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id) ON DELETE RESTRICT,
  CHECK (revenue_share_bps BETWEEN 0 AND 10000),
  CHECK (status IN ('active','revoked')),
  CHECK (length(blogger_slug) BETWEEN 3 AND 32)
);
-- Lookup партнёра по slug при создании инвойса (атрибуция → revenue split).
CREATE INDEX idx_partners_slug_active ON partners(blogger_slug) WHERE status='active';

-- ─── payments ────────────────────────────────────────────────────────────
-- Источник истины для финансов. Каждый ряд = ОДИН успешный платёж от TG.
-- UNIQUE(telegram_payment_charge_id) — единственный механизм идемпотентности
-- webhook'а: повторная доставка от TG падает на CONSTRAINT и обрабатывается
-- как replay (без повторной активации подписки).
CREATE TABLE payments (
  id                            INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id              INTEGER NOT NULL,
  telegram_payment_charge_id    TEXT NOT NULL UNIQUE,         -- идемпотентный ключ
  provider_payment_charge_id    TEXT,                          -- TG присылает в SuccessfulPayment
  invoice_payload               TEXT NOT NULL,                 -- наш payload pro:{userId}:{nonce}
  amount_stars                  INTEGER NOT NULL,
  currency                      TEXT NOT NULL DEFAULT 'XTR',
  status                        TEXT NOT NULL,                 -- paid | refunded | failed
  attributed_partner_id         INTEGER,                       -- snapshot на момент create-invoice
  revenue_share_bps_snapshot    INTEGER,                       -- зафиксировано на момент create-invoice
  partner_revenue_stars         INTEGER NOT NULL DEFAULT 0,    -- floor(amount * bps / 10000)
  is_first_recurring            INTEGER,                       -- из SuccessfulPayment
  is_recurring                  INTEGER,
  subscription_id               INTEGER,                       -- FK после активации
  paid_at                       INTEGER NOT NULL,
  refunded_at                   INTEGER,
  raw_update_json               TEXT,                          -- полный TG-апдейт, forensics
  source                        TEXT NOT NULL DEFAULT 'webhook', -- webhook | reconciliation | manual_recovery
  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id) ON DELETE RESTRICT,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  FOREIGN KEY (attributed_partner_id) REFERENCES partners(telegram_user_id) ON DELETE SET NULL,
  CHECK (status IN ('paid','refunded','failed')),
  CHECK (amount_stars > 0)
);
CREATE INDEX idx_payments_user ON payments(telegram_user_id, paid_at DESC);
CREATE INDEX idx_payments_partner_paid ON payments(attributed_partner_id, paid_at) WHERE status='paid';
CREATE INDEX idx_payments_payload ON payments(invoice_payload);

-- ─── invoices_outstanding ────────────────────────────────────────────────
-- Создаётся ДО openInvoice(): фиксируем намерение юзера + snapshot атрибуции.
-- Без этого мы не знаем, какой юзер ожидал какой инвойс при reconciliation,
-- и не можем привязать платёж к конкретному партнёру если slug сменился
-- после создания инвойса.
CREATE TABLE invoices_outstanding (
  invoice_payload              TEXT PRIMARY KEY,
  telegram_user_id             INTEGER NOT NULL,
  amount_stars                 INTEGER NOT NULL,
  plan                         TEXT NOT NULL,
  attributed_partner_id        INTEGER,
  revenue_share_bps_snapshot   INTEGER,
  created_at                   INTEGER NOT NULL,
  status                       TEXT NOT NULL DEFAULT 'pending',  -- pending | consumed | expired
  consumed_at                  INTEGER,
  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id) ON DELETE RESTRICT,
  CHECK (status IN ('pending','consumed','expired'))
);
CREATE INDEX idx_invoices_pending ON invoices_outstanding(created_at) WHERE status='pending';

-- ─── partner_payouts ────────────────────────────────────────────────────
-- Полный lifecycle выплаты партнёру-самозанятому:
--
--   1. requested        — партнёр кликнул "запросить выплату" из кабинета
--   2. awaiting_receipt — мы попросили выставить чек через "Мой налог",
--                         партнёр загружает номер чека
--   3. approved         — админ проверил чек, готов перевести деньги
--   4. paid             — деньги ушли с банк-клиента, external_payout_ref заполнен
--   5. rejected         — отказ с reason
--
-- Sum-инвариант: для каждого партнёра баланс = SUM(payments.partner_revenue_stars
-- where attributed_partner_id=P and status=paid) - SUM(partner_payouts.amount_stars
-- where partner_telegram_user_id=P and status in requested|awaiting_receipt|approved|paid).
-- При запросе новой выплаты проверяем что баланс >= запрашиваемая сумма.
CREATE TABLE partner_payouts (
  id                              INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_telegram_user_id        INTEGER NOT NULL,
  amount_stars                    INTEGER NOT NULL,
  status                          TEXT NOT NULL DEFAULT 'requested',

  -- Чек ФНС от самозанятого
  receipt_number                  TEXT,                      -- номер чека из "Мой налог"
  receipt_uploaded_at             INTEGER,

  -- Наш платёж партнёру через банк
  external_payout_ref             TEXT,                      -- номер платёжки из банк-клиента
  external_payout_at              INTEGER,
  external_payout_amount_rub      INTEGER,                   -- сумма в рублях (для бухгалтерии)

  requested_at                    INTEGER NOT NULL,
  decided_at                      INTEGER,
  decided_by_admin_id             INTEGER,
  rejection_reason                TEXT,
  FOREIGN KEY (partner_telegram_user_id) REFERENCES partners(telegram_user_id) ON DELETE RESTRICT,
  CHECK (status IN ('requested','awaiting_receipt','approved','paid','rejected')),
  CHECK (amount_stars > 0)
);
CREATE INDEX idx_payouts_partner ON partner_payouts(partner_telegram_user_id, requested_at DESC);
CREATE INDEX idx_payouts_pending ON partner_payouts(status, requested_at) WHERE status IN ('requested','awaiting_receipt','approved');

-- ─── audit_log (append-only с hash-цепочкой) ─────────────────────────────
-- Каждая запись содержит prev_hash + this_hash = SHA256(canonical(row)).
-- Если кто-то редактирует прошлое — цепочка рвётся, verify-job детектит.
--
-- Запрещено DELETE из audit_log в коде (только retention-cron). Запрещено
-- UPDATE — нет SET'ов в Express коде. Защита code-side: код-ревью + grep.
CREATE TABLE audit_log (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at       INTEGER NOT NULL,
  actor_user_id     INTEGER NOT NULL,
  actor_role        TEXT NOT NULL,                -- admin | partner | regular | system
  action            TEXT NOT NULL,
  target_user_id    INTEGER,
  target_resource   TEXT,                          -- partners | payouts | subscriptions | ...
  target_id         TEXT,
  payload_json      TEXT NOT NULL,                 -- без PII; before/after значения
  ip                TEXT,
  user_agent        TEXT,
  request_id        TEXT,
  prev_hash         TEXT,                          -- SHA256 hex предыдущей записи (или '')
  this_hash         TEXT NOT NULL                  -- SHA256(prev_hash || canonical(row))
);
CREATE INDEX idx_audit_actor ON audit_log(actor_user_id, occurred_at DESC);
CREATE INDEX idx_audit_target ON audit_log(target_user_id, occurred_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action, occurred_at DESC);

-- ─── изменения существующих таблиц ───────────────────────────────────────
-- attributions: матчинг с партнёром (опциональный — slug может быть от
-- бывшего партнёра, тогда matched_partner_id остаётся NULL, но атрибуция
-- остаётся ради аналитики).
ALTER TABLE attributions ADD COLUMN matched_partner_id INTEGER
  REFERENCES partners(telegram_user_id) ON DELETE SET NULL;

-- subscriptions: связь с платежом, который её породил.
ALTER TABLE subscriptions ADD COLUMN payment_id INTEGER
  REFERENCES payments(id) ON DELETE SET NULL;
CREATE INDEX idx_subscriptions_payment ON subscriptions(payment_id);
