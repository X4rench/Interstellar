-- Migration 007: user-referral system
--
-- referral_code     — random 8-char code, unique per user, generated lazily
-- referred_by       — who invited this user (written once, never changed)
-- referral_rewards  — log of every reward paid out;
--                     UNIQUE(referred_user_id) ensures one reward per
--                     referred user, ever (double-fire protection)

ALTER TABLE users ADD COLUMN referral_code        TEXT;
ALTER TABLE users ADD COLUMN referred_by_user_id  INTEGER REFERENCES users(telegram_user_id);

-- Partial unique index: only rows where referral_code IS NOT NULL participate,
-- so NULL rows (users who haven't generated a code yet) don't conflict.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code
  ON users(referral_code) WHERE referral_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS referral_rewards (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_user_id    INTEGER NOT NULL REFERENCES users(telegram_user_id),
  referred_user_id    INTEGER NOT NULL REFERENCES users(telegram_user_id),
  plan_purchased      TEXT    NOT NULL,   -- 'basic_month' | 'premium_month'
  reward_tier         TEXT    NOT NULL,   -- 'basic' | 'premium'
  reward_days         INTEGER NOT NULL DEFAULT 3,
  created_at          INTEGER NOT NULL,
  UNIQUE(referred_user_id)               -- one reward per referred user, ever
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer
  ON referral_rewards(referrer_user_id);
