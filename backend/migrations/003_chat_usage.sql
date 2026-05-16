-- ─── chat_usage ─────────────────────────────────────────────────────────
-- Server-side трекинг лимита free-tier (30 msg/day). Заменяет клиентскую
-- проверку которая обходится через прямой curl к /chat.
--
-- Структура: (user_id, day_bucket=YYYY-MM-DD) → count. При новом дне
-- создаётся новая строка; старые можно архивировать по retention-крону.
CREATE TABLE chat_usage (
  telegram_user_id   INTEGER NOT NULL,
  day_bucket         TEXT NOT NULL,            -- 'YYYY-MM-DD' в UTC
  count              INTEGER NOT NULL DEFAULT 0,
  last_used_at       INTEGER NOT NULL,
  PRIMARY KEY (telegram_user_id, day_bucket)
);
CREATE INDEX idx_chat_usage_day ON chat_usage(day_bucket);
