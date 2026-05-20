-- ════════════════════════════════════════════════════════════════════════
-- Миграция 008: таблица рассылок (broadcast_messages)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS broadcast_messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id   INTEGER NOT NULL,           -- кто запустил рассылку

  -- Текст и форматирование
  text            TEXT NOT NULL,
  parse_mode      TEXT NOT NULL DEFAULT 'HTML',  -- 'HTML' | 'Markdown' | 'MarkdownV2'

  -- Опциональная кнопка (inline_keyboard под сообщением)
  button_text     TEXT,
  button_url      TEXT,

  -- Статистика отправки
  total_users     INTEGER NOT NULL DEFAULT 0,   -- сколько юзеров было в момент запуска
  sent_count      INTEGER NOT NULL DEFAULT 0,   -- успешно отправлено
  failed_count    INTEGER NOT NULL DEFAULT 0,   -- ошибки (сеть, INTERNAL)
  blocked_count   INTEGER NOT NULL DEFAULT 0,   -- юзер заблокировал бота (403)

  -- Жизненный цикл
  -- pending   → запись создана, ещё не запущена
  -- sending   → идёт отправка
  -- done      → завершена (успех или с ошибками)
  -- cancelled → прервана вручную
  status          TEXT NOT NULL DEFAULT 'pending',

  -- Таймстампы (Unix ms)
  created_at      INTEGER NOT NULL,
  started_at      INTEGER,
  finished_at     INTEGER,

  CHECK (status IN ('pending','sending','done','cancelled')),
  CHECK (parse_mode IN ('HTML','Markdown','MarkdownV2'))
);

CREATE INDEX IF NOT EXISTS idx_broadcast_status
  ON broadcast_messages(status, created_at DESC);
