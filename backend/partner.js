import { encrypt, decrypt, maskTail } from './crypto.js';
import { logAction } from './audit.js';
import { sendMessage } from './bot-api.js';

/**
 * Partner-операции (партнёр работает со своими данными):
 *   - summary: статистика
 *   - profile (GET/PATCH): PII (ФИО/ИНН/email/phone/bank) — encrypt at rest
 *   - payouts (GET/POST): запросы на выплату + загрузка номера чека ФНС
 *
 * Все endpoints проверяют что req.tgUser.telegram_user_id == own partner row
 * (через roleLoader → req.partner). Никакого cross-partner-доступа.
 */

const MIN_PAYOUT_RUB = 2000; // 2000₽ минимальная сумма для вывода

// ─── Summary ─────────────────────────────────────────────────────────────

/**
 * Агрегированная статистика партнёра. Включает:
 *   - blogger_slug + текущая доля
 *   - referrals_count (кол-во юзеров пришедших по slug)
 *   - conversions_count (из них тех кто оплатил хотя бы раз)
 *   - earned_stars_total (cumulative)
 *   - paid_out_stars_total
 *   - pending_payouts_stars (заявки в обработке)
 *   - balance_stars (earned - paid - pending)
 *   - monthly buckets (4 последних месяца) с earned_stars и conversions
 *
 * НИКОГДА не возвращаем:
 *   - имена/usernames рефералов
 *   - точные даты конверсий
 *   - telegram_user_id рефералов
 *
 * Если referrals < 5 — это видно по counter'у, но никаких персональных
 * данных всё равно не выходит.
 */
export function getPartnerSummary({ db, partnerUserId, businessInn, businessName }) {
  const partner = db
    .prepare(`SELECT blogger_slug, revenue_share_bps, status, granted_at FROM partners WHERE telegram_user_id = ?`)
    .get(partnerUserId);
  if (!partner) return null;

  const refs = db
    .prepare('SELECT COUNT(*) AS c FROM attributions WHERE matched_partner_id = ?')
    .get(partnerUserId);

  const conversions = db
    .prepare(
      `SELECT
         (SELECT COUNT(DISTINCT telegram_user_id) FROM payments WHERE attributed_partner_id = ? AND status = 'paid')
       + (SELECT COUNT(DISTINCT telegram_user_id) FROM yk_payments WHERE attributed_partner_id = ? AND status = 'succeeded')
       AS c`,
    )
    .get(partnerUserId, partnerUserId);

  // Заработано: Stars-платежи + YooKassa-платежи, оба поля в рублях.
  const earnedStars = db
    .prepare(`SELECT COALESCE(SUM(partner_revenue_rub), 0) AS s FROM payments WHERE attributed_partner_id = ? AND status = 'paid'`)
    .get(partnerUserId);
  const earnedYk = db
    .prepare(`SELECT COALESCE(SUM(partner_revenue_rub), 0) AS s FROM yk_payments WHERE attributed_partner_id = ? AND status = 'succeeded'`)
    .get(partnerUserId);
  const totalEarned = Math.round(((earnedStars.s || 0) + (earnedYk.s || 0)) * 100) / 100;

  const paidOut = db
    .prepare(
      `SELECT COALESCE(SUM(amount_rub), 0) AS s
       FROM partner_payouts
       WHERE partner_telegram_user_id = ? AND status = 'paid'`,
    )
    .get(partnerUserId);

  const pending = db
    .prepare(
      `SELECT COALESCE(SUM(amount_rub), 0) AS s
       FROM partner_payouts
       WHERE partner_telegram_user_id = ? AND status IN ('requested','awaiting_receipt','approved')`,
    )
    .get(partnerUserId);

  const balanceRub = Math.max(0,
    Math.round((totalEarned - (paidOut.s || 0) - (pending.s || 0)) * 100) / 100,
  );

  // Месячные bucket'ы (последние 4 месяца). NOT real-time чтобы партнёр не
  // мог сопоставить конкретного нового реферала по deltam (см. design-doc).
  const monthlyRows = db
    .prepare(
      `SELECT
         strftime('%Y-%m', paid_at/1000, 'unixepoch') AS month,
         COALESCE(SUM(partner_revenue_rub), 0) AS earned_rub,
         COUNT(DISTINCT telegram_user_id) AS conversions
       FROM payments
       WHERE attributed_partner_id = ? AND status = 'paid'
         AND paid_at >= ?
       GROUP BY month
       ORDER BY month DESC`,
    )
    .all(partnerUserId, Date.now() - 120 * 24 * 60 * 60 * 1000);

  return {
    blogger_slug: partner.blogger_slug,
    revenue_share_bps: partner.revenue_share_bps,
    status: partner.status,
    granted_at: partner.granted_at,
    referrals_count: refs.c,
    conversions_count: conversions.c,
    earned_rub: totalEarned,
    paid_out_rub: paidOut.s || 0,
    pending_payouts_rub: pending.s || 0,
    balance_rub: balanceRub,
    can_request_payout: balanceRub >= MIN_PAYOUT_RUB,
    min_payout_rub: MIN_PAYOUT_RUB,
    monthly: monthlyRows,
    // Реквизиты для выставления чека
    business_inn: businessInn || null,
    business_name: businessName || null,
  };
}

// ─── Profile (PII) ───────────────────────────────────────────────────────

/**
 * Возвращает собственный PII-профиль партнёра. Шифротексты расшифровываем
 * ключом из env. Если ключ потерян или данные tampered — поля приходят
 * как null (decrypt вернёт null без throw).
 *
 * Для admin'а здесь же даём mask'ированную версию (last-4) — иначе
 * админ при подготовке выплаты не увидит ничего полезного.
 */
export function getPartnerProfile({ db, partnerUserId, masked = false }) {
  const row = db
    .prepare(
      `SELECT
         full_name_ciphertext, full_name_iv, full_name_tag,
         inn_ciphertext, inn_iv, inn_tag,
         email_ciphertext, email_iv, email_tag,
         phone_ciphertext, phone_iv, phone_tag,
         bank_details_ciphertext, bank_details_iv, bank_details_tag,
         pii_provided, pii_consent_at, pii_consent_version
       FROM partners WHERE telegram_user_id = ?`,
    )
    .get(partnerUserId);

  if (!row) return null;

  const fullName = decrypt(row.full_name_ciphertext, row.full_name_iv, row.full_name_tag);
  const inn = decrypt(row.inn_ciphertext, row.inn_iv, row.inn_tag);
  const email = decrypt(row.email_ciphertext, row.email_iv, row.email_tag);
  const phone = decrypt(row.phone_ciphertext, row.phone_iv, row.phone_tag);
  const bankDetailsRaw = decrypt(
    row.bank_details_ciphertext,
    row.bank_details_iv,
    row.bank_details_tag,
  );
  let bankDetails = null;
  if (bankDetailsRaw) {
    try { bankDetails = JSON.parse(bankDetailsRaw); } catch {}
  }

  if (masked) {
    return {
      full_name: fullName,
      inn_masked: maskTail(inn, 4),
      email_masked: email ? email.replace(/^(.).+(@.+)$/, '$1***$2') : null,
      phone_masked: maskTail(phone, 4),
      bank_account_masked: bankDetails?.account ? maskTail(bankDetails.account, 4) : null,
      pii_provided: row.pii_provided === 1,
      pii_consent_at: row.pii_consent_at,
    };
  }

  return {
    full_name: fullName,
    inn,
    email,
    phone,
    bank_details: bankDetails,
    pii_provided: row.pii_provided === 1,
    pii_consent_at: row.pii_consent_at,
    pii_consent_version: row.pii_consent_version,
  };
}

// ─── Profile validation ─────────────────────────────────────────────────

const INN_RE_SELFEMPLOYED = /^\d{12}$/;  // 12 цифр для самозанятого/ИП
const INN_RE_LEGAL = /^\d{10}$/;          // 10 цифр для юр. лица
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{10,20}$/;
const BANK_ACCOUNT_RE = /^\d{20}$/;       // российский счёт 20 цифр
const BIK_RE = /^\d{9}$/;                  // 9 цифр

function validatePiiFields({ full_name, inn, email, phone, bank_details }) {
  const errors = {};

  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 3 || full_name.length > 200) {
    errors.full_name = 'FULL_NAME_INVALID';
  }
  if (!inn || (!INN_RE_SELFEMPLOYED.test(inn) && !INN_RE_LEGAL.test(inn))) {
    errors.inn = 'INN_INVALID';
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    errors.email = 'EMAIL_INVALID';
  }
  if (!phone || !PHONE_RE.test(phone)) {
    errors.phone = 'PHONE_INVALID';
  }
  if (!bank_details || typeof bank_details !== 'object') {
    errors.bank_details = 'BANK_DETAILS_REQUIRED';
  } else {
    if (!BANK_ACCOUNT_RE.test(bank_details.account || '')) {
      errors.bank_account = 'BANK_ACCOUNT_INVALID';
    }
    if (!BIK_RE.test(bank_details.bik || '')) {
      errors.bik = 'BIK_INVALID';
    }
    if (!bank_details.bank_name || typeof bank_details.bank_name !== 'string' || bank_details.bank_name.length > 200) {
      errors.bank_name = 'BANK_NAME_INVALID';
    }
  }

  return Object.keys(errors).length === 0 ? null : errors;
}

/**
 * Обновление PII партнёра. Все 5 полей — required (иначе partner не сможет
 * получать выплаты). Шифруем каждое отдельно, чтобы при потере одного
 * поля не падали остальные.
 */
export function updatePartnerProfile({
  db,
  partnerUserId,
  full_name,
  inn,
  email,
  phone,
  bank_details,
  consent,
  ip,
  userAgent,
  requestId,
}) {
  // Согласие на ПД обязательно перед первым сохранением (152-ФЗ).
  if (!consent) return { ok: false, error: 'PII_CONSENT_REQUIRED' };

  const errors = validatePiiFields({ full_name, inn, email, phone, bank_details });
  if (errors) return { ok: false, error: 'VALIDATION_FAILED', fields: errors };

  const trimmedName = full_name.trim();
  const trimmedInn = String(inn).trim();
  const trimmedEmail = String(email).trim().toLowerCase();
  const trimmedPhone = String(phone).trim();
  const cleanBank = {
    account: String(bank_details.account).replace(/\s/g, ''),
    bik: String(bank_details.bik).replace(/\s/g, ''),
    bank_name: String(bank_details.bank_name).trim().slice(0, 200),
  };

  const nameEnc = encrypt(trimmedName);
  const innEnc = encrypt(trimmedInn);
  const emailEnc = encrypt(trimmedEmail);
  const phoneEnc = encrypt(trimmedPhone);
  const bankEnc = encrypt(JSON.stringify(cleanBank));

  const consentVersion = process.env.PARTNER_PII_CONSENT_VERSION || '2026.05';

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE partners SET
         full_name_ciphertext=?, full_name_iv=?, full_name_tag=?,
         inn_ciphertext=?, inn_iv=?, inn_tag=?,
         email_ciphertext=?, email_iv=?, email_tag=?,
         phone_ciphertext=?, phone_iv=?, phone_tag=?,
         bank_details_ciphertext=?, bank_details_iv=?, bank_details_tag=?,
         pii_provided=1,
         pii_consent_at=COALESCE(pii_consent_at, ?),
         pii_consent_version=?
       WHERE telegram_user_id=?`,
    ).run(
      nameEnc.ciphertext, nameEnc.iv, nameEnc.tag,
      innEnc.ciphertext, innEnc.iv, innEnc.tag,
      emailEnc.ciphertext, emailEnc.iv, emailEnc.tag,
      phoneEnc.ciphertext, phoneEnc.iv, phoneEnc.tag,
      bankEnc.ciphertext, bankEnc.iv, bankEnc.tag,
      Date.now(),
      consentVersion,
      partnerUserId,
    );

    logAction(db, {
      actorUserId: partnerUserId,
      actorRole: 'partner',
      action: 'partner_pii_update',
      targetUserId: partnerUserId,
      targetResource: 'partners',
      targetId: String(partnerUserId),
      payload: { consent_version: consentVersion, all_fields_provided: true },
      ip,
      userAgent,
      requestId,
    });
  });

  tx();
  return { ok: true };
}

// ─── Payouts ─────────────────────────────────────────────────────────────

export function listPartnerPayouts({ db, partnerUserId, limit = 50, offset = 0 }) {
  limit = Math.min(Math.max(1, Number(limit) || 50), 100);
  offset = Math.max(0, Number(offset) || 0);

  const rows = db
    .prepare(
      `SELECT
         id, amount_stars, status, receipt_number, receipt_uploaded_at,
         external_payout_ref, external_payout_at, external_payout_amount_rub,
         requested_at, decided_at, rejection_reason
       FROM partner_payouts
       WHERE partner_telegram_user_id = ?
       ORDER BY requested_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(partnerUserId, limit, offset);
  return { payouts: rows };
}

/**
 * Создаёт запрос на выплату. Инварианты:
 *   - balance >= MIN_PAYOUT_STARS
 *   - PII заполнены (без них админ не сможет выплатить)
 *   - нет активного pending payout (статусы requested/awaiting_receipt/approved)
 *   - amount_stars <= balance_stars
 *
 * Если amount не передан — берём весь доступный balance.
 */
export function createPartnerPayout({
  db,
  partnerUserId,
  amountRub,
  ip,
  userAgent,
  requestId,
}) {
  // ── BUG-10: race fix ──
  // Все проверки + INSERT — в ОДНОЙ транзакции. Без этого два конкурентных
  // запроса могли оба пройти validation и создать два payout (превысив
  // balance). better-sqlite3 — sync, но JS event loop может прерывать между
  // sync-вызовами разных async-handler'ов. BEGIN IMMEDIATE даёт write-lock,
  // вторая транзакция дождётся первой и увидит обновлённое состояние.
  let payoutId;
  let outcome = null;
  let balance = 0;
  let requestedAmount = 0;

  const tx = db.transaction(() => {
    const partner = db
      .prepare('SELECT pii_provided FROM partners WHERE telegram_user_id = ? AND status = \'active\'')
      .get(partnerUserId);
    if (!partner) {
      outcome = { ok: false, error: 'PARTNER_NOT_FOUND' };
      return;
    }
    if (partner.pii_provided !== 1) {
      outcome = { ok: false, error: 'PII_NOT_PROVIDED' };
      return;
    }

    const pendingCount = db
      .prepare(
        `SELECT COUNT(*) AS c FROM partner_payouts
         WHERE partner_telegram_user_id = ?
           AND status IN ('requested','awaiting_receipt','approved')`,
      )
      .get(partnerUserId).c;
    if (pendingCount > 0) {
      outcome = { ok: false, error: 'PAYOUT_ALREADY_PENDING' };
      return;
    }

    const earnedStarsRub = db
      .prepare(`SELECT COALESCE(SUM(partner_revenue_rub), 0) AS s FROM payments WHERE attributed_partner_id = ? AND status = 'paid'`)
      .get(partnerUserId).s;
    const earnedYkRub = db
      .prepare(`SELECT COALESCE(SUM(partner_revenue_rub), 0) AS s FROM yk_payments WHERE attributed_partner_id = ? AND status = 'succeeded'`)
      .get(partnerUserId).s;
    const totalEarned = (earnedStarsRub || 0) + (earnedYkRub || 0);

    const paid = db
      .prepare(`SELECT COALESCE(SUM(amount_rub), 0) AS s FROM partner_payouts WHERE partner_telegram_user_id = ? AND status = 'paid'`)
      .get(partnerUserId).s;
    balance = Math.max(0, Math.round((totalEarned - (paid || 0)) * 100) / 100);

    if (balance < MIN_PAYOUT_RUB) {
      outcome = { ok: false, error: 'BALANCE_BELOW_MIN', balance_rub: balance, min: MIN_PAYOUT_RUB };
      return;
    }

    requestedAmount = Number.isFinite(amountRub) && amountRub > 0
      ? Math.min(amountRub, balance)
      : balance;

    if (requestedAmount < MIN_PAYOUT_RUB) {
      outcome = { ok: false, error: 'AMOUNT_BELOW_MIN', min: MIN_PAYOUT_RUB };
      return;
    }

    const result = db
      .prepare(
        `INSERT INTO partner_payouts (
           partner_telegram_user_id, amount_stars, amount_rub, status, requested_at
         ) VALUES (?, 0, ?, 'requested', ?)`,
      )
      .run(partnerUserId, requestedAmount, Date.now());
    payoutId = result.lastInsertRowid;

    logAction(db, {
      actorUserId: partnerUserId,
      actorRole: 'partner',
      action: 'payout_request_create',
      targetUserId: partnerUserId,
      targetResource: 'partner_payouts',
      targetId: String(payoutId),
      payload: { amount_rub: requestedAmount, balance_at_time: balance },
      ip,
      userAgent,
      requestId,
    });
  });

  // .immediate() = BEGIN IMMEDIATE — берёт write-lock сразу при старте
  // транзакции (а не лениво при первом INSERT/UPDATE). Без этого две
  // параллельных транзакции могут одновременно прочитать balance до того
  // как одна из них сделает INSERT — классическая lost-update проблема.
  tx.immediate();
  if (outcome) return outcome;

  // Notify admin'ов через TG. Шлём всем кто в ADMIN_TELEGRAM_IDS.
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  for (const adminId of adminIds) {
    sendMessage({
      chatId: adminId,
      text:
        `📥 <b>Новая заявка на выплату #${payoutId}</b>\n\n` +
        `Партнёр: <code>${partner.blogger_slug}</code> (#${partnerUserId})\n` +
        `Сумма: <b>${requestedAmount} ₽</b>\n\n` +
        `Открой админку → Выплаты для обработки.`,
    });
  }

  return { ok: true, payout_id: payoutId, amount_rub: requestedAmount };
}

/**
 * Партнёр прислал номер чека ФНС. Разрешено только если статус
 * 'requested' или 'awaiting_receipt'. Если был 'awaiting_receipt'
 * (админ уже approve'нул и ждёт чек) — после загрузки переводим в 'approved'.
 */
export function uploadPayoutReceipt({
  db,
  partnerUserId,
  payoutId,
  receiptNumber,
  ip,
  userAgent,
  requestId,
}) {
  if (!receiptNumber || typeof receiptNumber !== 'string' || receiptNumber.trim().length < 3) {
    return { ok: false, error: 'RECEIPT_NUMBER_INVALID' };
  }

  const po = db
    .prepare(
      `SELECT id, partner_telegram_user_id, status FROM partner_payouts WHERE id = ?`,
    )
    .get(payoutId);
  if (!po) return { ok: false, error: 'PAYOUT_NOT_FOUND' };
  if (po.partner_telegram_user_id !== partnerUserId) return { ok: false, error: 'NOT_YOUR_PAYOUT' };
  if (po.status !== 'requested' && po.status !== 'awaiting_receipt') {
    return { ok: false, error: `BAD_STATUS_${po.status.toUpperCase()}` };
  }

  const newStatus = po.status === 'awaiting_receipt' ? 'approved' : po.status;

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE partner_payouts SET receipt_number=?, receipt_uploaded_at=?, status=? WHERE id=?`,
    ).run(receiptNumber.trim().slice(0, 100), Date.now(), newStatus, payoutId);

    logAction(db, {
      actorUserId: partnerUserId,
      actorRole: 'partner',
      action: 'payout_upload_receipt',
      targetUserId: partnerUserId,
      targetResource: 'partner_payouts',
      targetId: String(payoutId),
      payload: { receipt_number_length: receiptNumber.length, new_status: newStatus },
      ip,
      userAgent,
      requestId,
    });
  });
  tx();

  // Если статус стал approved — уведомим админов.
  if (newStatus === 'approved') {
    const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    for (const adminId of adminIds) {
      sendMessage({
        chatId: adminId,
        text: `📋 Партнёр загрузил чек для выплаты #${payoutId}. Можно переводить деньги.`,
      });
    }
  }

  return { ok: true, new_status: newStatus };
}
