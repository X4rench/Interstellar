import crypto from 'node:crypto';

/**
 * Append-only audit log с tamper-evident hash chain.
 *
 * Каждая запись содержит prev_hash (хеш предыдущей) и this_hash = SHA-256
 * от каноничной сериализации всех полей включая prev_hash. Если кто-то
 * пытается отредактировать прошлую запись — cron verifyAuditChain() это
 * детектит на следующем проходе.
 *
 * ВАЖНО: НИКОГДА не вызывать UPDATE/DELETE на audit_log из application code.
 * Retention-чистка — отдельным cron'ом (вне этого модуля).
 */

/**
 * Каноничная JSON-сериализация: ключи отсортированы по алфавиту, числовые
 * literal'ы без trailing-нулей. Используется и при INSERT (для расчёта
 * this_hash), и при verify (для пересчёта).
 */
function canonicalize(obj) {
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

function rowForHash(row) {
  return {
    occurred_at: row.occurred_at,
    actor_user_id: row.actor_user_id,
    actor_role: row.actor_role,
    action: row.action,
    target_user_id: row.target_user_id ?? null,
    target_resource: row.target_resource ?? null,
    target_id: row.target_id ?? null,
    payload_json: row.payload_json,
    ip: row.ip ?? null,
    user_agent: row.user_agent ?? null,
    request_id: row.request_id ?? null,
    prev_hash: row.prev_hash ?? '',
  };
}

/**
 * Записывает событие в audit log.
 *
 * @param db        better-sqlite3 instance
 * @param params:
 *   actorUserId    — telegram_user_id того кто действует
 *   actorRole      — admin | partner | regular | system
 *   action         — машинно-читаемый идентификатор события
 *                    ('grant_partner','revoke_partner','approve_payout',
 *                     'mark_payout_paid','create_invoice','payment_received',
 *                     'manual_payment_recovery','payout_request_create',
 *                     'partner_pii_update','partner_slug_change',
 *                     'partner_share_change', ...)
 *   targetUserId   — на кого направлено (если применимо)
 *   targetResource — partners | payouts | subscriptions | payments | users
 *   targetId       — строковый id ресурса (если применимо)
 *   payload        — JSON object с before/after для контролируемых полей.
 *                    КАТЕГОРИЧЕСКИ НЕ кладите сюда PII (имена, ИНН, реквизиты,
 *                    содержимое чатов). Только booleans/numbers/slugs/status'ы.
 *   ip             — req.ip (с trust proxy)
 *   userAgent      — req.header('user-agent')
 *   requestId      — UUID per request (для коррелирования)
 *
 * Должна вызываться ВНУТРИ той же транзакции что и сама бизнес-мутация —
 * иначе при rollback'е бизнес-операции audit-запись может остаться (и
 * наоборот). better-sqlite3 поддерживает вложенные транзакции; вызывающий
 * код оборачивает свою логику + logAction в одну `db.transaction(() => {...})`.
 */
export function logAction(db, params) {
  const occurredAt = Date.now();
  const last = db.prepare('SELECT this_hash FROM audit_log ORDER BY id DESC LIMIT 1').get();
  const prevHash = last?.this_hash ?? '';

  const row = {
    occurred_at: occurredAt,
    actor_user_id: params.actorUserId,
    actor_role: params.actorRole,
    action: params.action,
    target_user_id: params.targetUserId ?? null,
    target_resource: params.targetResource ?? null,
    target_id: params.targetId ?? null,
    payload_json: JSON.stringify(params.payload ?? {}),
    ip: params.ip ?? null,
    user_agent: params.userAgent ?? null,
    request_id: params.requestId ?? null,
    prev_hash: prevHash,
  };

  const canonical = canonicalize(rowForHash(row));
  const thisHash = crypto.createHash('sha256').update(canonical).digest('hex');

  db.prepare(
    `INSERT INTO audit_log (
       occurred_at, actor_user_id, actor_role, action,
       target_user_id, target_resource, target_id,
       payload_json, ip, user_agent, request_id,
       prev_hash, this_hash
     ) VALUES (
       @occurred_at, @actor_user_id, @actor_role, @action,
       @target_user_id, @target_resource, @target_id,
       @payload_json, @ip, @user_agent, @request_id,
       @prev_hash, @this_hash
     )`,
  ).run({ ...row, this_hash: thisHash });
}

/**
 * Проходит цепочку. Возвращает:
 *   { ok: true, verifiedCount: N } если цепочка не нарушена
 *   { ok: false, brokenAt: id, reason: 'prev_hash_mismatch' | 'hash_mismatch' }
 *     если найдена расхождение.
 *
 * Должна запускаться cron'ом каждые 24h. При ok:false — alert админу
 * (через Sentry или TG bot).
 */
export function verifyAuditChain(db) {
  const rows = db
    .prepare(
      `SELECT id, occurred_at, actor_user_id, actor_role, action,
              target_user_id, target_resource, target_id,
              payload_json, ip, user_agent, request_id,
              prev_hash, this_hash
       FROM audit_log ORDER BY id ASC`,
    )
    .all();

  let expectedPrev = '';
  for (const row of rows) {
    if ((row.prev_hash ?? '') !== expectedPrev) {
      return { ok: false, brokenAt: row.id, reason: 'prev_hash_mismatch' };
    }
    const canonical = canonicalize(rowForHash(row));
    const recalc = crypto.createHash('sha256').update(canonical).digest('hex');
    if (recalc !== row.this_hash) {
      return { ok: false, brokenAt: row.id, reason: 'hash_mismatch' };
    }
    expectedPrev = row.this_hash;
  }
  return { ok: true, verifiedCount: rows.length };
}
