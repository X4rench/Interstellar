/**
 * analytics.js — запросы аналитики для Admin Panel.
 *
 * Все функции принимают `db` (better-sqlite3) и возвращают
 * синхронный результат. Никаких async/await — SQLite синхронный.
 *
 * Источники данных:
 *   users           → регистрации, DAU
 *   subscriptions   → активные подписки, конверсия
 *   payments        → доход от Telegram Stars (XTR)
 *   yk_payments     → доход от ЮКассы (RUB / копейки)
 */

const MS_PER_DAY = 86_400_000

// ─── Утилиты ──────────────────────────────────────────────────────────────

/** YYYY-MM-DD для timestamp (UTC) */
function tsToDay(tsMs) {
  return new Date(tsMs).toISOString().slice(0, 10)
}

/** Заполняем пропущенные дни нулями в массиве {day, value} */
function fillDays(rows, startMs, endMs, key = 'cnt') {
  const byDay = {}
  for (const r of rows) byDay[r.day] = r[key]
  const result = []
  let cur = startMs
  while (cur <= endMs) {
    const d = tsToDay(cur)
    result.push({ day: d, value: byDay[d] ?? 0 })
    cur += MS_PER_DAY
  }
  return result
}

// ─── Summary (карточки над графиком) ──────────────────────────────────────

/**
 * Сводные метрики для дашборда:
 *   - Пользователи (total, new today/week/month, DAU)
 *   - Активные подписки (total + по планам)
 *   - Доход Stars (today/week/month/all)
 *   - Доход ЮКасса RUB (today/week/month/all)
 */
export function getAnalyticsSummary(db) {
  const now = Date.now()
  const todayStart = now - MS_PER_DAY
  const weekStart  = now - 7  * MS_PER_DAY
  const monthStart = now - 30 * MS_PER_DAY

  // ── Пользователи ──
  const totalUsers      = db.prepare('SELECT COUNT(*) AS cnt FROM users').get().cnt
  const newUsersToday   = db.prepare('SELECT COUNT(*) AS cnt FROM users WHERE first_seen_at > ?').get(todayStart).cnt
  const newUsersWeek    = db.prepare('SELECT COUNT(*) AS cnt FROM users WHERE first_seen_at > ?').get(weekStart).cnt
  const newUsersMonth   = db.prepare('SELECT COUNT(*) AS cnt FROM users WHERE first_seen_at > ?').get(monthStart).cnt
  // DAU: уникальные пользователи с активностью за последние 24h
  const dau             = db.prepare('SELECT COUNT(*) AS cnt FROM users WHERE last_seen_at > ?').get(todayStart).cnt

  // ── Подписки ──
  const activeSubs      = db.prepare(
    'SELECT COUNT(*) AS cnt FROM subscriptions WHERE expires_at > ? AND cancelled_at IS NULL'
  ).get(now).cnt
  const subsByPlan      = db.prepare(
    'SELECT plan, COUNT(*) AS cnt FROM subscriptions WHERE expires_at > ? AND cancelled_at IS NULL GROUP BY plan'
  ).all(now)

  // ── Доход Stars ──
  const starsToday = db.prepare("SELECT COALESCE(SUM(amount_stars),0) AS s FROM payments WHERE status='paid' AND paid_at > ?").get(todayStart).s
  const starsWeek  = db.prepare("SELECT COALESCE(SUM(amount_stars),0) AS s FROM payments WHERE status='paid' AND paid_at > ?").get(weekStart).s
  const starsMonth = db.prepare("SELECT COALESCE(SUM(amount_stars),0) AS s FROM payments WHERE status='paid' AND paid_at > ?").get(monthStart).s
  const starsAll   = db.prepare("SELECT COALESCE(SUM(amount_stars),0) AS s FROM payments WHERE status='paid'").get().s

  // ── Доход ЮКасса ──
  const ykToday = db.prepare("SELECT COALESCE(SUM(amount_kopecks),0) AS s FROM yk_payments WHERE status='succeeded' AND succeeded_at > ?").get(todayStart).s / 100
  const ykWeek  = db.prepare("SELECT COALESCE(SUM(amount_kopecks),0) AS s FROM yk_payments WHERE status='succeeded' AND succeeded_at > ?").get(weekStart).s / 100
  const ykMonth = db.prepare("SELECT COALESCE(SUM(amount_kopecks),0) AS s FROM yk_payments WHERE status='succeeded' AND succeeded_at > ?").get(monthStart).s / 100
  const ykAll   = db.prepare("SELECT COALESCE(SUM(amount_kopecks),0) AS s FROM yk_payments WHERE status='succeeded'").get().s / 100

  // ── Конверсия ──
  const conversionPct = totalUsers > 0 ? ((activeSubs / totalUsers) * 100).toFixed(1) : '0.0'

  return {
    users: {
      total: totalUsers,
      new_today: newUsersToday,
      new_week:  newUsersWeek,
      new_month: newUsersMonth,
      dau,
    },
    subscriptions: {
      active:      activeSubs,
      by_plan:     subsByPlan,
      conversion:  conversionPct,  // string, "%"
    },
    stars: {
      today: starsToday,
      week:  starsWeek,
      month: starsMonth,
      all:   starsAll,
    },
    yk_rub: {
      today: ykToday,
      week:  ykWeek,
      month: ykMonth,
      all:   ykAll,
    },
  }
}

// ─── Графики ──────────────────────────────────────────────────────────────

/**
 * Данные для графика новых пользователей.
 * @param {object} db
 * @param {number} days — последние N дней (default 30)
 * @returns {{ new_users: {day: string, value: number}[] }}
 */
export function getUsersChart(db, days = 30) {
  const now    = Date.now()
  const cutoff = now - days * MS_PER_DAY

  const rows = db.prepare(`
    SELECT
      DATE(first_seen_at / 1000, 'unixepoch') AS day,
      COUNT(*) AS cnt
    FROM users
    WHERE first_seen_at > ?
    GROUP BY day
    ORDER BY day
  `).all(cutoff)

  return {
    new_users: fillDays(rows, cutoff, now),
  }
}

/**
 * Данные для графика дохода.
 * Возвращает Stars и RUB (ЮК) по дням.
 * @param {object} db
 * @param {number} days
 */
export function getRevenueChart(db, days = 30) {
  const now    = Date.now()
  const cutoff = now - days * MS_PER_DAY

  const starsRows = db.prepare(`
    SELECT
      DATE(paid_at / 1000, 'unixepoch') AS day,
      SUM(amount_stars) AS cnt
    FROM payments
    WHERE status = 'paid' AND paid_at > ?
    GROUP BY day
    ORDER BY day
  `).all(cutoff)

  const ykRows = db.prepare(`
    SELECT
      DATE(succeeded_at / 1000, 'unixepoch') AS day,
      SUM(amount_kopecks) / 100 AS cnt
    FROM yk_payments
    WHERE status = 'succeeded' AND succeeded_at > ?
    GROUP BY day
    ORDER BY day
  `).all(cutoff)

  return {
    stars_by_day: fillDays(starsRows, cutoff, now),
    yk_rub_by_day: fillDays(ykRows,   cutoff, now),
  }
}
