/**
 * characters-db.js — CRUD для персонажей, управляемых через админку.
 *
 * DB-персонажи мёрджатся на фронте с BUILT_IN_CHARACTERS:
 * если id совпадает — DB-версия перекрывает встроенного персонажа.
 *
 * Поля хранятся как TEXT/INTEGER. Сложные поля (era, tags) — JSON-строки.
 */

// ─── Конвертация DB-строки → клиентский формат ───────────────────────────

/**
 * Парсит строку из таблицы characters в объект, совместимый с
 * интерфейсом Character на фронте.
 *
 * @param {object} row  — строка из SELECT * FROM characters
 * @returns {object|null}
 */
export function parseDbCharacter(row) {
  if (!row) return null
  return {
    id:          row.id,
    name:        row.name,
    description: row.description,
    category:    row.category,
    iconType:    row.icon_type || 'brain',
    gradientKey: row.gradient_key || 'default',
    photo_url:   row.photo_url || null,
    firstMessage: row.first_message,
    persona:     row.persona,
    tags:        _parseJson(row.tags_json, []),
    messages:    row.messages_count,
    rating:      row.rating,
    isNew:       row.is_new === 1,
    isNSFW:      row.is_nsfw === 1,
    gender:      row.gender || undefined,
    era:         row.era_json ? _parseJson(row.era_json, undefined) : undefined,
    signature:   row.signature || undefined,
    opinions:    row.opinions || undefined,
    // Admin-only fields (not in frontend Character interface, returned for admin panel)
    sort_order:  row.sort_order,
    is_active:   row.is_active === 1,
    created_at:  row.created_at,
    updated_at:  row.updated_at,
    created_by_admin_id: row.created_by_admin_id,
  }
}

function _parseJson(str, fallback) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

// ─── Чтение ──────────────────────────────────────────────────────────────

/**
 * Возвращает список персонажей.
 * @param {{ activeOnly?: boolean, limit?: number, offset?: number }} opts
 */
export function listCharacters(db, { activeOnly = false, limit = 200, offset = 0 } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : ''
  const items = db.prepare(`
    SELECT * FROM characters ${where}
    ORDER BY sort_order ASC, created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset)

  const total = db.prepare(`SELECT COUNT(*) AS cnt FROM characters ${where}`).get().cnt

  return { characters: items.map(parseDbCharacter), total }
}

export function getCharacter(db, id) {
  const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id)
  return parseDbCharacter(row)
}

// ─── Создание ────────────────────────────────────────────────────────────

/**
 * Создаёт нового персонажа.
 *
 * @param {{ id, name, description?, category?, iconType?, gradientKey?,
 *           firstMessage?, persona?, era?, signature?, opinions?,
 *           tags?, gender?, isNSFW?, isNew?, sortOrder?,
 *           messagesCount?, rating? }} data
 * @param {number} adminUserId
 * @returns {{ ok: boolean, id?: string, error?: string }}
 */
export function createCharacter(db, data, adminUserId) {
  const now = Date.now()
  const id = _sanitizeId(data.id)
  if (!id) return { ok: false, error: 'BAD_ID' }
  if (!data.name?.trim()) return { ok: false, error: 'BAD_NAME' }

  const existing = db.prepare('SELECT id FROM characters WHERE id = ?').get(id)
  if (existing) return { ok: false, error: 'DUPLICATE_ID' }

  db.prepare(`
    INSERT INTO characters
      (id, name, description, category, icon_type, gradient_key,
       first_message, persona, era_json, signature, opinions,
       tags_json, gender, is_nsfw, is_new, messages_count, rating,
       sort_order, is_active, created_at, updated_at, created_by_admin_id)
    VALUES
      (?,  ?,    ?,           ?,        ?,         ?,
       ?,             ?,       ?,        ?,         ?,
       ?,         ?,      ?,       ?,       ?,              ?,
       ?,          ?,         ?,          ?,        ?)
  `).run(
    id,
    data.name.trim(),
    data.description?.trim() ?? '',
    data.category?.trim() || 'Другие',
    data.iconType?.trim() || null,
    data.gradientKey?.trim() || 'default',
    data.firstMessage?.trim() ?? '',
    data.persona?.trim() ?? '',
    data.era ? JSON.stringify(data.era) : null,
    data.signature?.trim() || null,
    data.opinions?.trim() || null,
    JSON.stringify(Array.isArray(data.tags) ? data.tags : []),
    data.gender || null,
    data.isNSFW ? 1 : 0,
    data.isNew ? 1 : 0,
    Number.isFinite(data.messagesCount) ? data.messagesCount : 0,
    Number.isFinite(data.rating) ? data.rating : 4.5,
    Number.isFinite(data.sortOrder) ? data.sortOrder : 0,
    1, // is_active
    now, now,
    adminUserId ?? null,
  )

  return { ok: true, id }
}

// ─── Обновление ─────────────────────────────────────────────────────────

/**
 * Обновляет поля персонажа (только переданные).
 * Запрещено менять id.
 */
export function updateCharacter(db, id, data) {
  const now = Date.now()
  const row = db.prepare('SELECT id FROM characters WHERE id = ?').get(id)
  if (!row) return { ok: false, error: 'NOT_FOUND' }

  // Собираем SET-части и параметры только для переданных полей.
  const sets = []
  const params = []

  const add = (col, val) => { sets.push(`${col} = ?`); params.push(val) }

  if (data.name        !== undefined) add('name',          data.name.trim())
  if (data.description !== undefined) add('description',   data.description.trim())
  if (data.category    !== undefined) add('category',      data.category.trim() || 'Другие')
  if (data.iconType    !== undefined) add('icon_type',     data.iconType?.trim() || null)
  if (data.gradientKey !== undefined) add('gradient_key',  data.gradientKey?.trim() || 'default')
  if (data.firstMessage!== undefined) add('first_message', data.firstMessage.trim())
  if (data.persona     !== undefined) add('persona',       data.persona.trim())
  if (data.era         !== undefined) add('era_json',      data.era ? JSON.stringify(data.era) : null)
  if (data.signature   !== undefined) add('signature',     data.signature?.trim() || null)
  if (data.opinions    !== undefined) add('opinions',      data.opinions?.trim() || null)
  if (data.tags        !== undefined) add('tags_json',     JSON.stringify(Array.isArray(data.tags) ? data.tags : []))
  if (data.gender      !== undefined) add('gender',        data.gender || null)
  if (data.isNSFW      !== undefined) add('is_nsfw',       data.isNSFW ? 1 : 0)
  if (data.isNew       !== undefined) add('is_new',        data.isNew ? 1 : 0)
  if (data.sortOrder   !== undefined) add('sort_order',    Number.isFinite(data.sortOrder) ? data.sortOrder : 0)
  if (data.isActive    !== undefined) add('is_active',     data.isActive ? 1 : 0)
  if (data.rating      !== undefined) add('rating',        Number.isFinite(data.rating) ? data.rating : 4.5)

  if (sets.length === 0) return { ok: true } // ничего не изменили

  sets.push('updated_at = ?')
  params.push(now, id)

  db.prepare(`UPDATE characters SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  return { ok: true }
}

// ─── Фото ────────────────────────────────────────────────────────────────

export function updateCharacterPhoto(db, id, photoUrl) {
  const now = Date.now()
  const info = db.prepare(
    'UPDATE characters SET photo_url = ?, updated_at = ? WHERE id = ?'
  ).run(photoUrl, now, id)
  return info.changes > 0 ? { ok: true } : { ok: false, error: 'NOT_FOUND' }
}

// ─── Удаление ────────────────────────────────────────────────────────────

/** Мягкое удаление: is_active = 0. */
export function deactivateCharacter(db, id) {
  const now = Date.now()
  const info = db.prepare(
    'UPDATE characters SET is_active = 0, updated_at = ? WHERE id = ?'
  ).run(now, id)
  return info.changes > 0 ? { ok: true } : { ok: false, error: 'NOT_FOUND' }
}

/** Жёсткое удаление (для тестов / отката миграции). */
export function hardDeleteCharacter(db, id) {
  const info = db.prepare('DELETE FROM characters WHERE id = ?').run(id)
  return info.changes > 0 ? { ok: true } : { ok: false, error: 'NOT_FOUND' }
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Нормализует id: строчные, только a-z0-9-_. */
function _sanitizeId(raw) {
  if (!raw || typeof raw !== 'string') return null
  const id = raw.trim().toLowerCase().replace(/[^a-z0-9\-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return id.length >= 1 && id.length <= 80 ? id : null
}
