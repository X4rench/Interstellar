import { logAction } from './audit.js';
import { sendMessage, escapeHtml } from './bot-api.js';

/**
 * Admin-операции. Чистая логика без Express — server.js вызывает эти
 * функции из route-handler'ов. Это позволяет тестировать без mock'ов req/res
 * и переиспользовать (например в admin CLI tool в будущем).
 *
 * Все мутирующие операции:
 *   - проверяют инвариант (например actor != target для grant_partner)
 *   - идут в db.transaction
 *   - пишут audit-запись В ТОЙ ЖЕ транзакции (атомарность гарантирована)
 *   - не throw'ают на business-validation — возвращают { ok:false, error }
 *   - throw только на программные ошибки (DB crash и т.п.)
 */

// ─── валидаторы ──────────────────────────────────────────────────────────

const SLUG_RE = /^[\w-]{3,32}$/i;

function validateSlug(slug) {
  if (typeof slug !== 'string') return 'SLUG_REQUIRED';
  if (!SLUG_RE.test(slug)) return 'SLUG_INVALID_FORMAT';
  return null;
}

function validateShareBps(bps) {
  if (!Number.isInteger(bps)) return 'SHARE_BPS_NOT_INTEGER';
  if (bps < 0 || bps > 10000) return 'SHARE_BPS_OUT_OF_RANGE';
  return null;
}

// ─── Users (search/list) ─────────────────────────────────────────────────

/**
 * Поиск юзеров для admin UI (нужно чтобы найти target_user_id для grant).
 * Возвращает базовые поля. PII (никогда не выходит за пределы users-таблицы)
 * — id/username/first_name/last_name — это TG-public, не secret.
 *
 * Фильтры:
 *   - search: частичное совпадение по username или first_name
 *   - hasSubscription: true/false (только активные подписки)
 *   - attributionSlug: точное совпадение по start_param
 *   - limit/offset для пагинации (max 100/страница)
 */
export function listUsers({ db, search, hasSubscription, attributionSlug, limit = 50, offset = 0 }) {
  limit = Math.min(Math.max(1, Number(limit) || 50), 100);
  offset = Math.max(0, Number(offset) || 0);

  const filters = [];
  const params = [];

  if (search && typeof search === 'string') {
    const q = `%${search.replace(/[%_]/g, '\\$&').slice(0, 50)}%`;
    filters.push('(u.username LIKE ? ESCAPE \'\\\\\' OR u.first_name LIKE ? ESCAPE \'\\\\\')');
    params.push(q, q);
  }
  if (hasSubscription === true) {
    filters.push(
      `EXISTS (SELECT 1 FROM subscriptions s WHERE s.telegram_user_id=u.telegram_user_id AND s.expires_at > ?)`,
    );
    params.push(Date.now());
  } else if (hasSubscription === false) {
    filters.push(
      `NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.telegram_user_id=u.telegram_user_id AND s.expires_at > ?)`,
    );
    params.push(Date.now());
  }
  if (attributionSlug && typeof attributionSlug === 'string') {
    filters.push(
      'EXISTS (SELECT 1 FROM attributions a WHERE a.telegram_user_id=u.telegram_user_id AND a.start_param = ?)',
    );
    params.push(attributionSlug.slice(0, 64));
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const rows = db
    .prepare(
      `SELECT u.telegram_user_id, u.username, u.first_name, u.last_name,
              u.language_code, u.first_seen_at, u.last_seen_at,
              (SELECT start_param FROM attributions WHERE telegram_user_id=u.telegram_user_id) AS attribution_slug,
              EXISTS (SELECT 1 FROM partners p WHERE p.telegram_user_id=u.telegram_user_id AND p.status='active') AS is_partner,
              EXISTS (SELECT 1 FROM subscriptions s WHERE s.telegram_user_id=u.telegram_user_id AND s.expires_at > ?) AS is_pro
       FROM users u
       ${where}
       ORDER BY u.last_seen_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(Date.now(), ...params, limit, offset);

  const total = db
    .prepare(`SELECT COUNT(*) AS c FROM users u ${where}`)
    .get(...params).c;

  return { users: rows, total, limit, offset };
}

// ─── Partners ────────────────────────────────────────────────────────────

/**
 * Выдача partner-роли. Инварианты:
 *   - actor != target (admin не может grant'ить себе)
 *   - target юзер существует в users (создан после первого входа в mini-app)
 *   - slug формат /^[\w-]{3,32}$/i
 *   - slug уникален (BD constraint + наш check для понятной ошибки)
 *   - share_bps в диапазоне [0, 10000]
 *   - target ещё не имеет partner-роли (или есть revoked — реактивируем)
 *
 * Запись + audit в одной транзакции. Если что-то падает — rollback.
 */
export function grantPartner({
  db,
  adminId,
  targetUserId,
  bloggerSlug,
  revenueShareBps = 5000,
  notes,
  ip,
  userAgent,
  requestId,
}) {
  // 1. Validate
  if (adminId === targetUserId) {
    return { ok: false, error: 'CANNOT_GRANT_SELF' };
  }
  const slugErr = validateSlug(bloggerSlug);
  if (slugErr) return { ok: false, error: slugErr };
  const bpsErr = validateShareBps(revenueShareBps);
  if (bpsErr) return { ok: false, error: bpsErr };

  // 2. Target user existence
  const targetUser = db
    .prepare('SELECT telegram_user_id, first_name, username FROM users WHERE telegram_user_id = ?')
    .get(targetUserId);
  if (!targetUser) return { ok: false, error: 'TARGET_USER_NOT_FOUND' };

  // 3. Уникальность slug (case-insensitive)
  const slugConflict = db
    .prepare('SELECT telegram_user_id FROM partners WHERE LOWER(blogger_slug) = LOWER(?) AND status = \'active\'')
    .get(bloggerSlug);
  if (slugConflict && slugConflict.telegram_user_id !== targetUserId) {
    return { ok: false, error: 'SLUG_ALREADY_TAKEN' };
  }

  // 4. Транзакция: INSERT-or-reactivate partner + backfill attributions + audit
  const tx = db.transaction(() => {
    const existing = db
      .prepare('SELECT telegram_user_id, status FROM partners WHERE telegram_user_id = ?')
      .get(targetUserId);

    if (existing) {
      if (existing.status === 'active') {
        // Уже активный — это OK для идемпотентности (повторный grant с теми же
        // параметрами). Просто обновим slug/share если изменились.
        db.prepare(
          `UPDATE partners SET blogger_slug = ?, revenue_share_bps = ?, notes = COALESCE(?, notes)
           WHERE telegram_user_id = ?`,
        ).run(bloggerSlug, revenueShareBps, notes ?? null, targetUserId);
      } else {
        // Реактивация revoked-партнёра. Сбрасываем revoke поля.
        db.prepare(
          `UPDATE partners SET
             status = 'active',
             blogger_slug = ?,
             revenue_share_bps = ?,
             granted_by_admin_id = ?,
             granted_at = ?,
             revoked_at = NULL,
             revoke_reason = NULL,
             notes = COALESCE(?, notes)
           WHERE telegram_user_id = ?`,
        ).run(bloggerSlug, revenueShareBps, adminId, Date.now(), notes ?? null, targetUserId);
      }
    } else {
      db.prepare(
        `INSERT INTO partners (
           telegram_user_id, blogger_slug, revenue_share_bps, status,
           granted_by_admin_id, granted_at, notes, pii_provided
         ) VALUES (?, ?, ?, 'active', ?, ?, ?, 0)`,
      ).run(targetUserId, bloggerSlug, revenueShareBps, adminId, Date.now(), notes ?? null);
    }

    // Backfill attributions: если у нас уже есть атрибуции по этому slug
    // (юзеры пришли по ссылке до того как мы выдали роль) — привязываем их
    // к новому partner_id. LOWER() — EC-3, чтобы регистр slug'а не ломал
    // мэтчинг (юзер пришёл с `Vasya`, партнёр зарегался как `vasya`).
    db.prepare(
      `UPDATE attributions SET matched_partner_id = ?
       WHERE LOWER(start_param) = LOWER(?) AND matched_partner_id IS NULL`,
    ).run(targetUserId, bloggerSlug);

    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: existing ? (existing.status === 'active' ? 'partner_update' : 'partner_reactivate') : 'grant_partner',
      targetUserId,
      targetResource: 'partners',
      targetId: String(targetUserId),
      payload: {
        slug: bloggerSlug,
        revenue_share_bps: revenueShareBps,
        was_status: existing?.status ?? null,
      },
      ip,
      userAgent,
      requestId,
    });
  });

  tx();

  // Уведомление партнёру в TG (fire-and-forget).
  const botUsername = process.env.BOT_USERNAME || '';
  const botAppName = process.env.BOT_APP_NAME || 'app';
  const refLink = botUsername
    ? `https://t.me/${botUsername}/${botAppName}?startapp=${bloggerSlug}`
    : bloggerSlug;
  sendMessage({
    chatId: targetUserId,
    text:
      `🎉 <b>Тебя пригласили в партнёрскую программу Interstellar!</b>\n\n` +
      `Твоя реферальная ссылка:\n<code>${escapeHtml(refLink)}</code>\n\n` +
      `Доля: ${(revenueShareBps / 100).toFixed(2)}% от каждого платежа реферралов\n\n` +
      `Открой Mini App → Профиль → «Партнёрство» чтобы заполнить реквизиты и увидеть статистику.`,
  });

  return { ok: true, partner: getPartner({ db, telegramUserId: targetUserId }) };
}

/**
 * Список всех партнёров с агрегатами. Для admin UI.
 */
export function listPartners({ db, status = 'all', limit = 100, offset = 0 }) {
  limit = Math.min(Math.max(1, Number(limit) || 100), 200);
  offset = Math.max(0, Number(offset) || 0);

  const statusFilter = status === 'all' ? '' : `WHERE p.status = ?`;
  const params = status === 'all' ? [] : [status];

  const rows = db
    .prepare(
      `SELECT
         p.telegram_user_id, p.blogger_slug, p.revenue_share_bps, p.status,
         p.granted_at, p.granted_by_admin_id, p.pii_provided, p.notes,
         u.first_name AS partner_first_name, u.username AS partner_username,
         (SELECT COUNT(*) FROM attributions a WHERE a.matched_partner_id = p.telegram_user_id) AS referrals_count,
         (SELECT COALESCE(SUM(pa.partner_revenue_stars), 0) FROM payments pa
            WHERE pa.attributed_partner_id = p.telegram_user_id AND pa.status='paid') AS earned_stars,
         (SELECT COALESCE(SUM(po.amount_stars), 0) FROM partner_payouts po
            WHERE po.partner_telegram_user_id = p.telegram_user_id AND po.status='paid') AS paid_out_stars,
         (SELECT COALESCE(SUM(pa.partner_revenue_rub), 0)
            FROM payments pa WHERE pa.attributed_partner_id = p.telegram_user_id AND pa.status='paid')
          + (SELECT COALESCE(SUM(yk.partner_revenue_rub), 0)
            FROM yk_payments yk WHERE yk.attributed_partner_id = p.telegram_user_id AND yk.status='succeeded')
          AS earned_rub,
         (SELECT COALESCE(SUM(po.amount_rub), 0) FROM partner_payouts po
            WHERE po.partner_telegram_user_id = p.telegram_user_id AND po.status='paid') AS paid_out_rub
       FROM partners p
       LEFT JOIN users u ON u.telegram_user_id = p.telegram_user_id
       ${statusFilter}
       ORDER BY p.granted_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);

  return { partners: rows, limit, offset };
}

/**
 * Детали одного партнёра (для admin detail view).
 * PII НЕ возвращаем здесь — для них отдельный endpoint /admin/partners/:id/pii
 * с requireConfirmAction (мы его в Phase 4.E реализуем).
 */
export function getPartner({ db, telegramUserId }) {
  const row = db
    .prepare(
      `SELECT
         p.telegram_user_id, p.blogger_slug, p.revenue_share_bps, p.status,
         p.granted_at, p.granted_by_admin_id, p.revoked_at, p.revoke_reason,
         p.pii_provided, p.pii_consent_at, p.notes,
         u.first_name AS partner_first_name, u.username AS partner_username,
         (SELECT COUNT(*) FROM attributions a WHERE a.matched_partner_id = p.telegram_user_id) AS referrals_count,
         (SELECT COUNT(*) FROM payments pa
            WHERE pa.attributed_partner_id = p.telegram_user_id AND pa.status='paid') AS conversions_count,
         (SELECT COALESCE(SUM(pa.partner_revenue_stars), 0) FROM payments pa
            WHERE pa.attributed_partner_id = p.telegram_user_id AND pa.status='paid') AS earned_stars,
         (SELECT COALESCE(SUM(po.amount_stars), 0) FROM partner_payouts po
            WHERE po.partner_telegram_user_id = p.telegram_user_id
              AND po.status IN ('requested','awaiting_receipt','approved')) AS pending_payouts_stars,
         (SELECT COALESCE(SUM(po.amount_stars), 0) FROM partner_payouts po
            WHERE po.partner_telegram_user_id = p.telegram_user_id AND po.status='paid') AS paid_out_stars,
         (SELECT COALESCE(SUM(pa.partner_revenue_rub), 0)
            FROM payments pa WHERE pa.attributed_partner_id = p.telegram_user_id AND pa.status='paid')
          + (SELECT COALESCE(SUM(yk.partner_revenue_rub), 0)
            FROM yk_payments yk WHERE yk.attributed_partner_id = p.telegram_user_id AND yk.status='succeeded')
          AS earned_rub,
         (SELECT COALESCE(SUM(po.amount_rub), 0) FROM partner_payouts po
            WHERE po.partner_telegram_user_id = p.telegram_user_id AND po.status='paid') AS paid_out_rub
       FROM partners p
       LEFT JOIN users u ON u.telegram_user_id = p.telegram_user_id
       WHERE p.telegram_user_id = ?`,
    )
    .get(telegramUserId);

  if (!row) return null;
  row.balance_stars = (row.earned_stars || 0) - (row.paid_out_stars || 0) - (row.pending_payouts_stars || 0);
  row.balance_rub = Math.max(0, (row.earned_rub || 0) - (row.paid_out_rub || 0));
  return row;
}

/**
 * Изменение партнёра: slug / share_bps / notes. Любое изменение → audit.
 */
export function updatePartner({
  db,
  adminId,
  targetUserId,
  bloggerSlug,
  revenueShareBps,
  notes,
  ip,
  userAgent,
  requestId,
}) {
  if (adminId === targetUserId) return { ok: false, error: 'CANNOT_MODIFY_SELF' };

  const existing = db
    .prepare('SELECT * FROM partners WHERE telegram_user_id = ?')
    .get(targetUserId);
  if (!existing) return { ok: false, error: 'PARTNER_NOT_FOUND' };

  const updates = {};
  const changes = {};

  if (bloggerSlug !== undefined) {
    const err = validateSlug(bloggerSlug);
    if (err) return { ok: false, error: err };
    // ── C7: slug-hijack защита ──
    // Смена slug у активного партнёра запрещена: можно «угнать» атрибуции
    // юзеров пришедших через старый slug, перенаправив их к новому
    // партнёру (если slug передан другому). Если действительно нужно
    // сменить slug — нужен revoke + новый grant (с новым slug), чтобы
    // явно зафиксировать в audit.
    if (bloggerSlug.toLowerCase() !== existing.blogger_slug.toLowerCase()) {
      return {
        ok: false,
        error: 'SLUG_CHANGE_FORBIDDEN_USE_REVOKE_AND_REGRANT',
      };
    }
    // Note: не добавляем в updates если совпадает по lowercase (no-op).
  }

  if (revenueShareBps !== undefined) {
    const err = validateShareBps(revenueShareBps);
    if (err) return { ok: false, error: err };
    if (revenueShareBps !== existing.revenue_share_bps) {
      updates.revenue_share_bps = revenueShareBps;
      changes.share_bps = { from: existing.revenue_share_bps, to: revenueShareBps };
    }
  }

  if (notes !== undefined && notes !== existing.notes) {
    updates.notes = notes;
    changes.notes_changed = true;
  }

  if (Object.keys(updates).length === 0) {
    return { ok: true, partner: getPartner({ db, telegramUserId: targetUserId }), no_changes: true };
  }

  const tx = db.transaction(() => {
    const sets = Object.keys(updates).map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE partners SET ${sets} WHERE telegram_user_id = @id`).run({
      ...updates,
      id: targetUserId,
    });

    // Backfill: если slug сменился — также можно обновить matched_partner_id
    // у attributions, чтобы новые юзеры с новым slug привязывались.
    // НО старые атрибуции остаются связаны с partner-id (через matched_partner_id),
    // а start_param в attributions остаётся старый. Так задумано: атрибуция
    // фиксируется в момент первого визита.
    if (updates.blogger_slug) {
      db.prepare(
        `UPDATE attributions SET matched_partner_id = ? WHERE start_param = ? AND matched_partner_id IS NULL`,
      ).run(targetUserId, updates.blogger_slug);
    }

    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: 'partner_update',
      targetUserId,
      targetResource: 'partners',
      targetId: String(targetUserId),
      payload: changes,
      ip,
      userAgent,
      requestId,
    });
  });

  tx();
  return { ok: true, partner: getPartner({ db, telegramUserId: targetUserId }) };
}

/**
 * Отзыв partner-роли. Не удаляет данные — status='revoked', audit-trail
 * сохраняется. Если есть pending payouts — НЕ блокируем revoke; админ
 * вручную решает что с ними делать.
 */
export function revokePartner({ db, adminId, targetUserId, reason, ip, userAgent, requestId }) {
  if (adminId === targetUserId) return { ok: false, error: 'CANNOT_REVOKE_SELF' };

  const existing = db
    .prepare('SELECT status FROM partners WHERE telegram_user_id = ?')
    .get(targetUserId);
  if (!existing) return { ok: false, error: 'PARTNER_NOT_FOUND' };
  if (existing.status === 'revoked') return { ok: false, error: 'ALREADY_REVOKED' };

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE partners SET status='revoked', revoked_at=?, revoke_reason=? WHERE telegram_user_id=?`,
    ).run(Date.now(), reason || null, targetUserId);

    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: 'partner_revoke',
      targetUserId,
      targetResource: 'partners',
      targetId: String(targetUserId),
      payload: { reason: reason || null },
      ip,
      userAgent,
      requestId,
    });
  });
  tx();

  return { ok: true, partner: getPartner({ db, telegramUserId: targetUserId }) };
}

// ─── Payouts ─────────────────────────────────────────────────────────────

/**
 * Список выплат с фильтром по статусу. Для admin UI очереди.
 */
export function listPayouts({ db, status, limit = 100, offset = 0 }) {
  limit = Math.min(Math.max(1, Number(limit) || 100), 200);
  offset = Math.max(0, Number(offset) || 0);

  const statusFilter = status ? `WHERE po.status = ?` : '';
  const params = status ? [status] : [];

  const rows = db
    .prepare(
      `SELECT
         po.id, po.partner_telegram_user_id, po.amount_rub, po.amount_stars, po.status,
         po.receipt_number, po.receipt_uploaded_at,
         po.external_payout_ref, po.external_payout_at, po.external_payout_amount_rub,
         po.requested_at, po.decided_at, po.decided_by_admin_id, po.rejection_reason,
         p.blogger_slug AS partner_slug,
         u.first_name AS partner_first_name, u.username AS partner_username
       FROM partner_payouts po
       LEFT JOIN partners p ON p.telegram_user_id = po.partner_telegram_user_id
       LEFT JOIN users u ON u.telegram_user_id = po.partner_telegram_user_id
       ${statusFilter}
       ORDER BY po.requested_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);

  return { payouts: rows, limit, offset };
}

/**
 * Approve payout: status='requested' → 'awaiting_receipt' (партнёр шлёт
 * чек) либо если receipt уже есть → 'approved' (готов к переводу).
 *
 * Логика: если у payout уже есть receipt_number → сразу 'approved'.
 * Иначе → 'awaiting_receipt' и уведомление партнёру.
 */
export function approvePayout({ db, adminId, payoutId, ip, userAgent, requestId }) {
  const po = db.prepare('SELECT * FROM partner_payouts WHERE id = ?').get(payoutId);
  if (!po) return { ok: false, error: 'PAYOUT_NOT_FOUND' };
  if (po.status !== 'requested' && po.status !== 'awaiting_receipt') {
    return { ok: false, error: `BAD_STATUS_${po.status.toUpperCase()}` };
  }

  const nextStatus = po.receipt_number ? 'approved' : 'awaiting_receipt';

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE partner_payouts SET status=?, decided_at=?, decided_by_admin_id=? WHERE id=?`,
    ).run(nextStatus, Date.now(), adminId, payoutId);

    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: nextStatus === 'approved' ? 'payout_approve' : 'payout_request_receipt',
      targetUserId: po.partner_telegram_user_id,
      targetResource: 'partner_payouts',
      targetId: String(payoutId),
      payload: { amount_stars: po.amount_stars, has_receipt: !!po.receipt_number },
      ip,
      userAgent,
      requestId,
    });
  });
  tx();

  // Notify партнёра. BUSINESS_INN/NAME — из env, теоретически контролит
  // только владелец инсталляции, но escape всё равно для безопасности.
  const businessInn = escapeHtml(process.env.BUSINESS_INN || '');
  const businessName = escapeHtml(process.env.BUSINESS_NAME || 'Interstellar');
  if (nextStatus === 'awaiting_receipt') {
    sendMessage({
      chatId: po.partner_telegram_user_id,
      text:
        `📋 <b>Запрос на выплату принят</b>\n\n` +
        `Сумма: ${po.amount_rub != null ? po.amount_rub + ' ₽' : po.amount_stars + ' ⭐'}\n\n` +
        `Чтобы получить выплату, выставь нам чек через приложение «Мой налог»:\n` +
        `<b>${businessName}</b>` +
        (businessInn ? `\nИНН: <code>${businessInn}</code>` : '') +
        `\n\nПосле выставления чека загрузи его номер в Mini App: Профиль → Партнёрство → Заявка #${payoutId}.`,
    });
  } else {
    sendMessage({
      chatId: po.partner_telegram_user_id,
      text: `✅ Заявка на выплату #${payoutId} одобрена. Перевод в течение 1-2 рабочих дней.`,
    });
  }

  return { ok: true, payout_id: payoutId, new_status: nextStatus };
}

/**
 * Mark paid: status='approved' → 'paid' + external_payout_ref + amount_rub
 * (для бухгалтерии — рублёвая сумма после конвертации).
 */
export function markPayoutPaid({
  db,
  adminId,
  payoutId,
  externalRef,
  amountRub,
  ip,
  userAgent,
  requestId,
}) {
  if (!externalRef || typeof externalRef !== 'string') {
    return { ok: false, error: 'EXTERNAL_REF_REQUIRED' };
  }
  if (!Number.isFinite(amountRub) || amountRub <= 0) {
    return { ok: false, error: 'AMOUNT_RUB_REQUIRED' };
  }

  const po = db.prepare('SELECT * FROM partner_payouts WHERE id = ?').get(payoutId);
  if (!po) return { ok: false, error: 'PAYOUT_NOT_FOUND' };
  if (po.status !== 'approved') {
    return { ok: false, error: `BAD_STATUS_${po.status.toUpperCase()}` };
  }

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE partner_payouts SET
         status='paid',
         external_payout_ref=?,
         external_payout_at=?,
         external_payout_amount_rub=?
       WHERE id=?`,
    ).run(externalRef, Date.now(), amountRub, payoutId);

    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: 'payout_mark_paid',
      targetUserId: po.partner_telegram_user_id,
      targetResource: 'partner_payouts',
      targetId: String(payoutId),
      payload: {
        amount_stars: po.amount_stars,
        amount_rub: amountRub,
        external_ref: externalRef.slice(0, 64),
      },
      ip,
      userAgent,
      requestId,
    });
  });
  tx();

  sendMessage({
    chatId: po.partner_telegram_user_id,
    text:
      `💸 <b>Выплата отправлена</b>\n\n` +
      `Сумма: ${po.amount_stars} ⭐ (${amountRub} ₽)\n` +
      `Платёжка: <code>${escapeHtml(externalRef)}</code>\n\n` +
      `Спасибо за работу! 🤝`,
  });

  return { ok: true, payout_id: payoutId };
}

export function rejectPayout({ db, adminId, payoutId, reason, ip, userAgent, requestId }) {
  if (!reason || typeof reason !== 'string') return { ok: false, error: 'REASON_REQUIRED' };

  const po = db.prepare('SELECT * FROM partner_payouts WHERE id = ?').get(payoutId);
  if (!po) return { ok: false, error: 'PAYOUT_NOT_FOUND' };
  if (po.status === 'paid' || po.status === 'rejected') {
    return { ok: false, error: `BAD_STATUS_${po.status.toUpperCase()}` };
  }

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE partner_payouts SET status='rejected', decided_at=?, decided_by_admin_id=?, rejection_reason=? WHERE id=?`,
    ).run(Date.now(), adminId, reason.slice(0, 500), payoutId);

    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: 'payout_reject',
      targetUserId: po.partner_telegram_user_id,
      targetResource: 'partner_payouts',
      targetId: String(payoutId),
      payload: { amount_stars: po.amount_stars, reason: reason.slice(0, 100) },
      ip,
      userAgent,
      requestId,
    });
  });
  tx();

  sendMessage({
    chatId: po.partner_telegram_user_id,
    text: `❌ Заявка на выплату #${payoutId} отклонена.\nПричина: ${escapeHtml(reason)}\n\nЕсли есть вопросы — напиши в поддержку.`,
  });

  return { ok: true, payout_id: payoutId };
}

// ─── Audit log view ──────────────────────────────────────────────────────

export function listAudit({ db, action, targetUserId, actorUserId, limit = 100, offset = 0 }) {
  limit = Math.min(Math.max(1, Number(limit) || 100), 200);
  offset = Math.max(0, Number(offset) || 0);

  const filters = [];
  const params = [];
  if (action) {
    filters.push('action = ?');
    params.push(action);
  }
  if (Number.isFinite(targetUserId)) {
    filters.push('target_user_id = ?');
    params.push(targetUserId);
  }
  if (Number.isFinite(actorUserId)) {
    filters.push('actor_user_id = ?');
    params.push(actorUserId);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const rows = db
    .prepare(
      `SELECT id, occurred_at, actor_user_id, actor_role, action,
              target_user_id, target_resource, target_id, payload_json,
              ip, request_id
       FROM audit_log
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);

  // Parse payload_json
  for (const r of rows) {
    try {
      r.payload = JSON.parse(r.payload_json);
      delete r.payload_json;
    } catch {
      r.payload = {};
    }
  }

  const total = db.prepare(`SELECT COUNT(*) AS c FROM audit_log ${where}`).get(...params).c;
  return { entries: rows, total, limit, offset };
}

// ─── Subscription management (admin grant/revoke) ────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
const PLAN_DEFAULT_DAYS = {
  basic_month: 30,
  premium_month: 30,
  day_pass: 1,
};

/**
 * Выдача подписки админом (бесплатно — для тестов, инфлюенсеров, рефаунд-кейсов).
 * Сразу активирует — никаких pre-checkout flow. Для day_pass пишет в day_passes,
 * для basic/premium — в subscriptions (предварительно отменяя текущую если есть).
 *
 * @param plan 'basic_month' | 'premium_month' | 'day_pass'
 * @param durationDays число дней (опционально, по умолчанию: 30 для подписок, 1 для DP)
 */
export function grantSubscription({
  db,
  adminId,
  targetUserId,
  plan,
  durationDays,
  ip,
  userAgent,
  requestId,
}) {
  if (!PLAN_DEFAULT_DAYS[plan]) {
    return { ok: false, error: 'INVALID_PLAN' };
  }
  const days = Number.isInteger(durationDays) && durationDays > 0 && durationDays <= 3650
    ? durationDays
    : PLAN_DEFAULT_DAYS[plan];

  const targetUser = db
    .prepare('SELECT telegram_user_id, first_name, username FROM users WHERE telegram_user_id = ?')
    .get(targetUserId);
  if (!targetUser) return { ok: false, error: 'TARGET_USER_NOT_FOUND' };

  const now = Date.now();
  const expiresAt = now + days * DAY_MS;

  const tx = db.transaction(() => {
    if (plan === 'day_pass') {
      // day_passes требует UNIQUE telegram_payment_charge_id — фейковый id для grant.
      // Префикс admin_grant_ чтобы не конфликтовало с реальными Stars/YK platежами.
      db.prepare(`
        INSERT INTO day_passes (telegram_user_id, purchased_at, expires_at,
          telegram_payment_charge_id, source)
        VALUES (?, ?, ?, ?, 'admin_grant')
      `).run(targetUserId, now, expiresAt, `admin_grant_${now}_${targetUserId}`);
    } else {
      // Отменяем активные подписки чтобы не накапливались параллельные строки.
      // Юзер получает новую подписку с нужным сроком, старая закрывается.
      db.prepare(`
        UPDATE subscriptions
        SET cancelled_at = ?
        WHERE telegram_user_id = ? AND expires_at > ? AND cancelled_at IS NULL
      `).run(now, targetUserId, now);

      db.prepare(`
        INSERT INTO subscriptions
          (telegram_user_id, plan, started_at, expires_at, is_trial,
           auto_renew, source)
        VALUES (?, ?, ?, ?, 0, 0, 'admin_grant')
      `).run(targetUserId, plan, now, expiresAt);
    }

    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: 'admin_grant_subscription',
      targetUserId,
      targetResource: plan === 'day_pass' ? 'day_passes' : 'subscriptions',
      targetId: String(targetUserId),
      payload: { plan, duration_days: days, expires_at: expiresAt },
      ip,
      userAgent,
      requestId,
    });
  });
  tx();

  // Уведомление юзеру (fire-and-forget).
  const planLabel = plan === 'premium_month'
    ? 'Premium'
    : plan === 'basic_month'
      ? 'Basic'
      : 'Day Pass';
  const expiresStr = new Date(expiresAt).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
  sendMessage({
    chatId: targetUserId,
    text:
      `🎁 <b>Тебе подарили подписку Interstellar!</b>\n\n` +
      `Тариф: <b>${planLabel}</b>\n` +
      `Действует до: <b>${escapeHtml(expiresStr)}</b>\n\n` +
      `Открывай Mini App и пользуйся 🚀`,
  });

  return { ok: true, plan, expires_at: expiresAt, duration_days: days };
}

/**
 * Отбирание подписки админом. Закрывает активные subscriptions (cancelled_at=now)
 * и истечает активные day_passes (expires_at=now). После этого юзер сразу
 * становится free-tier до новой покупки/grant.
 */
export function revokeSubscription({
  db,
  adminId,
  targetUserId,
  reason,
  ip,
  userAgent,
  requestId,
}) {
  const targetUser = db
    .prepare('SELECT telegram_user_id FROM users WHERE telegram_user_id = ?')
    .get(targetUserId);
  if (!targetUser) return { ok: false, error: 'TARGET_USER_NOT_FOUND' };

  const now = Date.now();
  let subsCancelled = 0;
  let dpExpired = 0;

  const tx = db.transaction(() => {
    const subRes = db.prepare(`
      UPDATE subscriptions
      SET cancelled_at = ?
      WHERE telegram_user_id = ? AND expires_at > ? AND cancelled_at IS NULL
    `).run(now, targetUserId, now);
    subsCancelled = subRes.changes;

    const dpRes = db.prepare(`
      UPDATE day_passes
      SET expires_at = ?
      WHERE telegram_user_id = ? AND expires_at > ?
    `).run(now, targetUserId, now);
    dpExpired = dpRes.changes;

    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: 'admin_revoke_subscription',
      targetUserId,
      targetResource: 'subscriptions',
      targetId: String(targetUserId),
      payload: {
        subscriptions_cancelled: subsCancelled,
        day_passes_expired: dpExpired,
        reason: reason || null,
      },
      ip,
      userAgent,
      requestId,
    });
  });
  tx();

  if (subsCancelled > 0 || dpExpired > 0) {
    // Уведомление юзеру (fire-and-forget). Только если реально что-то отобрали.
    sendMessage({
      chatId: targetUserId,
      text:
        `⚠️ <b>Подписка отозвана администратором.</b>\n\n` +
        (reason ? `Причина: ${escapeHtml(reason)}\n\n` : '') +
        `Если считаешь это ошибкой — свяжись с поддержкой.`,
    });
  }

  return {
    ok: true,
    subscriptions_cancelled: subsCancelled,
    day_passes_expired: dpExpired,
  };
}

/**
 * Получить текущий статус подписки юзера (для админ-UI).
 * Возвращает информацию о всех активных подписках + day pass.
 */
export function getUserSubscriptionStatus({ db, targetUserId }) {
  const targetUser = db
    .prepare('SELECT telegram_user_id, first_name, last_name, username FROM users WHERE telegram_user_id = ?')
    .get(targetUserId);
  if (!targetUser) return { ok: false, error: 'TARGET_USER_NOT_FOUND' };

  const now = Date.now();
  const sub = db
    .prepare(`
      SELECT plan, started_at, expires_at, source, auto_renew
      FROM subscriptions
      WHERE telegram_user_id = ? AND expires_at > ? AND cancelled_at IS NULL
      ORDER BY expires_at DESC LIMIT 1
    `)
    .get(targetUserId, now);
  const dp = db
    .prepare(`
      SELECT purchased_at, expires_at, source
      FROM day_passes
      WHERE telegram_user_id = ? AND expires_at > ?
      ORDER BY expires_at DESC LIMIT 1
    `)
    .get(targetUserId, now);

  return {
    ok: true,
    user: targetUser,
    subscription: sub || null,
    day_pass: dp || null,
  };
}
