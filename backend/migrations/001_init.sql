-- ─── users ────────────────────────────────────────────────────────────────
-- telegram_user_id — int, приходит из initData.user.id, primary key.
-- first_seen_at сохраняется один раз; last_seen_at обновляется при каждом /me.
CREATE TABLE users (
  telegram_user_id INTEGER PRIMARY KEY,
  username TEXT,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT,
  language_code TEXT,
  is_telegram_premium INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  first_seen_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

-- ─── subscriptions ────────────────────────────────────────────────────────
-- Одна строка = один период подписки. На каждый платёж — новая запись.
-- Текущая активная определяется как expires_at > now().
-- На Stars-recurring TG продлевает автоматически — мы получим webhook
-- successful_payment с тем же charge_id-prefix; вставляем новую строку.
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id INTEGER NOT NULL,
  plan TEXT NOT NULL,                              -- 'month' (на старте один тариф)
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  is_trial INTEGER NOT NULL DEFAULT 0,
  cancelled_at INTEGER,                            -- ISO-секунды от epoch если отменена
  telegram_payment_charge_id TEXT,                 -- id транзакции из TG webhook
  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id) ON DELETE CASCADE
);
CREATE INDEX idx_subscriptions_user_active ON subscriptions(telegram_user_id, expires_at DESC);

-- ─── attributions ─────────────────────────────────────────────────────────
-- Атрибуция блогеров через start_param. Один юзер — одна запись (первая).
-- Если в будущем перейдёт по ссылке другого блогера — НЕ перезатираем,
-- иначе атрибуция плывёт. ON CONFLICT DO NOTHING на upsert'е в коде.
CREATE TABLE attributions (
  telegram_user_id INTEGER PRIMARY KEY,
  start_param TEXT NOT NULL,
  first_seen_at INTEGER NOT NULL,
  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id) ON DELETE CASCADE
);
CREATE INDEX idx_attributions_param ON attributions(start_param);
