import crypto from 'node:crypto';

/**
 * RBAC: regular | partner | admin.
 *
 * Admin определяется ИСКЛЮЧИТЕЛЬНО через env `ADMIN_TELEGRAM_IDS` (через
 * запятую). Никогда из БД. Это гарантирует: компрометация SQLite ≠
 * компрометация admin-роли. Изменение списка админов требует доступа к
 * Render dashboard (отдельный аккаунт + 2FA), а не SQL-доступа.
 *
 * Partner определяется через `SELECT FROM partners WHERE telegram_user_id=?
 * AND status='active'` на каждый запрос (не кэшируется на стороне клиента,
 * не подписывается в initData).
 */

let cachedAdminIds = null;

function parseAdminIds() {
  if (cachedAdminIds) return cachedAdminIds;
  const raw = process.env.ADMIN_TELEGRAM_IDS || '';
  const set = new Set();
  for (const part of raw.split(',').map((x) => x.trim()).filter(Boolean)) {
    const n = Number(part);
    if (Number.isFinite(n) && Number.isInteger(n) && n > 0) {
      set.add(n);
    } else {
      console.warn(`[roles] ignoring invalid admin id: "${part}"`);
    }
  }
  cachedAdminIds = set;
  return set;
}

export function isAdmin(telegramUserId) {
  if (!Number.isFinite(telegramUserId)) return false;
  return parseAdminIds().has(telegramUserId);
}

export function getAdminCount() {
  return parseAdminIds().size;
}

/**
 * Список telegram_user_id всех админов (из ADMIN_TELEGRAM_IDS).
 * Нужен для служебных рассылок — например, трекинг-уведомлений о переходах
 * по реферальным ссылкам.
 */
export function getAdminIds() {
  return Array.from(parseAdminIds());
}

/**
 * Middleware: после requireAuth. Резолвит роль и кладёт в req.role +
 * req.partner (если применимо). НЕ доверяет ничему кроме env и БД.
 *
 *   req.role     = 'admin' | 'partner' | 'regular'
 *   req.partner  = { telegram_user_id, blogger_slug, revenue_share_bps,
 *                    status, pii_provided } | null
 */
export function loadRole(db) {
  const partnerLookupStmt = db.prepare(
    `SELECT telegram_user_id, blogger_slug, revenue_share_bps, status,
            pii_provided, pii_consent_at, granted_at
     FROM partners
     WHERE telegram_user_id = ? AND status = 'active'`,
  );

  return function (req, res, next) {
    const userId = req.tgUser?.telegram_user_id;
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ ok: false, error: 'NO_USER' });
    }

    // Admin: только env. Не лезем в БД даже для проверки.
    if (isAdmin(userId)) {
      req.role = 'admin';
      req.partner = null;
      return next();
    }

    // Partner: из БД.
    const partner = partnerLookupStmt.get(userId);
    if (partner) {
      req.role = 'partner';
      req.partner = partner;
    } else {
      req.role = 'regular';
      req.partner = null;
    }
    next();
  };
}

/**
 * Проверка минимальной роли. Вызывать ПОСЛЕ loadRole.
 *
 *   app.get('/admin/x', requireAuth, loadRole(db), requireRole(['admin']), handler)
 *
 * Возвращает 403 FORBIDDEN если роль не в списке разрешённых.
 */
export function requireRole(allowedRoles) {
  const allowed = new Set(allowedRoles);
  return function (req, res, next) {
    if (!req.role) {
      return res.status(500).json({ ok: false, error: 'ROLE_NOT_LOADED' });
    }
    if (!allowed.has(req.role)) {
      // Не палим какие именно роли допустимы — единая 403 для всех случаев.
      return res.status(403).json({ ok: false, error: 'FORBIDDEN' });
    }
    next();
  };
}

/**
 * Дополнительная проверка свежести initData для критичных операций.
 * Стандартный TTL в auth.js — 24h. Для admin/payout-flow требуем
 * auth_date не старше 1 часа (default). Это защищает от long-lived
 * перехваченных initData.
 */
export function requireFreshAuth(maxAgeSec = 3600) {
  return function (req, res, next) {
    const authDate = Number(req.tgUser?.auth_date);
    if (!Number.isFinite(authDate)) {
      return res.status(401).json({ ok: false, error: 'NO_AUTH_DATE' });
    }
    if (Date.now() / 1000 - authDate > maxAgeSec) {
      return res.status(401).json({ ok: false, error: 'STALE_AUTH' });
    }
    next();
  };
}

/**
 * Канонизатор для confirm-hash. Используется и на бэке, и (зеркально) на
 * фронте чтобы хеши совпадали независимо от порядка ключей.
 */
export function canonicalize(obj) {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'number' || typeof obj === 'boolean') return JSON.stringify(obj);
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']';
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
  }
  return 'null';
}

/**
 * Защита от случайных кликов и CSRF: фронт после клика "подтвердить"
 * считает SHA-256 от канонизированного body и шлёт в `X-Confirm-Action`.
 * Если хеш не совпадает с пересчитанным на бэке — 412.
 *
 * Это НЕ настоящий 2FA (compromise сессии = compromise всего), но защищает
 * от:
 *   1. Случайного клика на destructive button (фронт обязательно показывает
 *      confirm-диалог перед расчётом хеша)
 *   2. CSRF (даже если cookie-based auth когда-нибудь добавится)
 *
 * На полноценный 2FA через TG bot inline callback переедем в Phase 4.E
 * (отдельный модуль twofa.js + хранилище short-lived challenges).
 */
export function requireConfirmAction() {
  return function (req, res, next) {
    const provided = req.header('X-Confirm-Action') || '';
    if (!provided) {
      return res.status(412).json({ ok: false, error: 'CONFIRM_ACTION_REQUIRED' });
    }
    const canonical = canonicalize(req.body ?? {});
    const expected = crypto.createHash('sha256').update(canonical).digest('hex');

    // Constant-time сравнение чтобы не палить hex по таймингам.
    const a = Buffer.from(provided.padEnd(64, '0').slice(0, 64), 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(412).json({ ok: false, error: 'CONFIRM_ACTION_MISMATCH' });
    }
    next();
  };
}
