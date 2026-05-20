/**
 * broadcast.js — логика рассылок в Telegram.
 *
 * Рассылка отправляется асинхронно в фоне (setImmediate-батчинг), не держа
 * HTTP-соединение. Прогресс пишется в broadcast_messages.
 *
 * Rate: 30 сообщений / секунду (лимит Telegram Bot API на приватные чаты).
 * Реализация: батчи по BATCH_SIZE, пауза BATCH_DELAY_MS между батчами.
 */

import { tgCall, TgApiError } from './bot-api.js'

const BATCH_SIZE     = 25   // сообщений за раз (немного ниже лимита TG)
const BATCH_DELAY_MS = 1100 // задержка между батчами (ms) → ~22 msg/sec — ниже лимита

// ─── Создать запись рассылки ───────────────────────────────────────────────

/**
 * Создаёт запись в broadcast_messages со статусом 'pending'.
 * Сразу считает total_users из таблицы users.
 *
 * @returns {{ id: number, total_users: number }}
 */
export function createBroadcast(db, { adminUserId, text, parseMode = 'HTML', buttonText = null, buttonUrl = null }) {
  const now        = Date.now()
  const totalUsers = db.prepare('SELECT COUNT(*) AS cnt FROM users').get().cnt

  const result = db.prepare(`
    INSERT INTO broadcast_messages
      (admin_user_id, text, parse_mode, button_text, button_url, total_users, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(adminUserId, text, parseMode, buttonText, buttonUrl, totalUsers, now)

  return { id: Number(result.lastInsertRowid), total_users: totalUsers }
}

// ─── Запустить рассылку (async, не блокирует HTTP) ─────────────────────────

/**
 * Запускает рассылку в фоне. Возвращает Promise который резолвится сразу
 * (фактическая отправка идёт через setImmediate/setTimeout батчинг).
 *
 * Безопасно вызывать без await — ошибки внутри пишутся в логи и в статус БД.
 */
export async function startBroadcastAsync(db, broadcastId) {
  // Небольшая задержка чтобы HTTP-ответ ушёл раньше чем начнём работу.
  setImmediate(() => {
    _runBroadcast(db, broadcastId).catch((err) => {
      console.error('[broadcast] unhandled error in runBroadcast:', err)
      try {
        db.prepare("UPDATE broadcast_messages SET status = 'done', finished_at = ? WHERE id = ?")
          .run(Date.now(), broadcastId)
      } catch (_) { /* ignore */ }
    })
  })
}

async function _runBroadcast(db, broadcastId) {
  // Помечаем как sending
  db.prepare("UPDATE broadcast_messages SET status = 'sending', started_at = ? WHERE id = ?")
    .run(Date.now(), broadcastId)

  const bc = db.prepare('SELECT * FROM broadcast_messages WHERE id = ?').get(broadcastId)
  if (!bc) {
    console.error(`[broadcast] #${broadcastId} not found`)
    return
  }

  // Строим reply_markup если задана кнопка
  const replyMarkup = bc.button_text && bc.button_url
    ? { inline_keyboard: [[{ text: bc.button_text, url: bc.button_url }]] }
    : undefined

  let offset = 0
  let sentCount   = 0
  let failedCount = 0
  let blockedCount = 0

  // Препарируем стейтменты один раз
  const getUsersBatch = db.prepare('SELECT telegram_user_id FROM users ORDER BY first_seen_at LIMIT ? OFFSET ?')
  const checkStatus   = db.prepare('SELECT status FROM broadcast_messages WHERE id = ?')
  const updateProgress = db.prepare(`
    UPDATE broadcast_messages
    SET sent_count = ?, failed_count = ?, blocked_count = ?
    WHERE id = ?
  `)

  while (true) {
    // Проверяем не отменена ли рассылка
    const fresh = checkStatus.get(broadcastId)
    if (!fresh || fresh.status === 'cancelled') {
      console.log(`[broadcast] #${broadcastId} cancelled, stopping`)
      break
    }

    const users = getUsersBatch.all(BATCH_SIZE, offset)
    if (users.length === 0) break

    // Параллельная отправка батча (Promise.allSettled — не прерываемся на ошибках)
    const results = await Promise.allSettled(
      users.map((u) => {
        const params = {
          chat_id: u.telegram_user_id,
          text: bc.text,
          parse_mode: bc.parse_mode,
          disable_web_page_preview: true,
        }
        if (replyMarkup) params.reply_markup = JSON.stringify(replyMarkup)
        return tgCall('sendMessage', params)
      })
    )

    for (const r of results) {
      if (r.status === 'fulfilled') {
        sentCount++
      } else {
        // TgApiError с code=403 → юзер заблокировал бота (не ошибка сети)
        if (r.reason instanceof TgApiError && r.reason.code === 403) {
          blockedCount++
        } else {
          failedCount++
          console.warn('[broadcast] send failed:', r.reason?.message)
        }
      }
    }

    // Обновляем прогресс в БД после каждого батча
    updateProgress.run(sentCount, failedCount, blockedCount, broadcastId)

    offset += users.length
    if (users.length < BATCH_SIZE) break

    // Пауза между батчами
    await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
  }

  // Финальный апдейт
  db.prepare(`
    UPDATE broadcast_messages
    SET status = 'done', finished_at = ?, sent_count = ?, failed_count = ?, blocked_count = ?
    WHERE id = ?
  `).run(Date.now(), sentCount, failedCount, blockedCount, broadcastId)

  console.log(`[broadcast] #${broadcastId} done: sent=${sentCount} failed=${failedCount} blocked=${blockedCount}`)
}

// ─── Отменить рассылку ─────────────────────────────────────────────────────

export function cancelBroadcast(db, broadcastId) {
  const bc = db.prepare('SELECT status FROM broadcast_messages WHERE id = ?').get(broadcastId)
  if (!bc) return { ok: false, error: 'NOT_FOUND' }
  if (bc.status === 'done' || bc.status === 'cancelled') {
    return { ok: false, error: 'ALREADY_FINISHED' }
  }
  db.prepare("UPDATE broadcast_messages SET status = 'cancelled', finished_at = ? WHERE id = ?")
    .run(Date.now(), broadcastId)
  return { ok: true }
}

// ─── Геттеры ──────────────────────────────────────────────────────────────

export function listBroadcasts(db, { limit = 20, offset = 0 } = {}) {
  const items = db.prepare(`
    SELECT * FROM broadcast_messages
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset)

  const total = db.prepare('SELECT COUNT(*) AS cnt FROM broadcast_messages').get().cnt

  return { broadcasts: items, total }
}

export function getBroadcast(db, id) {
  return db.prepare('SELECT * FROM broadcast_messages WHERE id = ?').get(id) ?? null
}
