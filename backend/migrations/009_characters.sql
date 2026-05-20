-- 009_characters.sql: Custom characters managed through the admin panel.
-- Admin can create/edit/delete characters with all fields, including photo uploads.
-- These DB characters are merged with BUILT_IN_CHARACTERS on the frontend,
-- with DB taking precedence when IDs collide (allows overriding built-in chars).

CREATE TABLE IF NOT EXISTS characters (
  id           TEXT PRIMARY KEY,                        -- 'freud', 'my-new-char', etc.
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'Другие',
  icon_type    TEXT,                                    -- SVG icon key (fallback when no photo)
  gradient_key TEXT NOT NULL DEFAULT 'default',        -- card gradient key
  photo_url    TEXT,                                    -- relative path: /uploads/characters/...
  first_message TEXT NOT NULL DEFAULT '',
  persona      TEXT NOT NULL DEFAULT '',               -- system prompt (full)
  era_json     TEXT,                                    -- JSON: CharacterEra
  signature    TEXT,
  opinions     TEXT,
  tags_json    TEXT NOT NULL DEFAULT '[]',             -- JSON string[]
  gender       TEXT CHECK (gender IN ('male', 'female', NULL)),
  is_nsfw      INTEGER NOT NULL DEFAULT 0,
  is_new       INTEGER NOT NULL DEFAULT 0,
  messages_count INTEGER NOT NULL DEFAULT 0,
  rating       REAL NOT NULL DEFAULT 4.5,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  created_by_admin_id INTEGER
);

CREATE INDEX IF NOT EXISTS idx_characters_active_sort
  ON characters(is_active, sort_order, created_at DESC);
