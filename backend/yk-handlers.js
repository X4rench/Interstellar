/**
 * Бизнес-логика для платежей через ЮКассу.
 * Аналог payments.js (который для Telegram Stars), но проще: ЮК сам отдаёт
 * webhook-уведомление и нам нужно только записать факт + активировать подписку.
 *
 * Поток:
 *   1. createYkPayment() → запись в yk_payments(status='pending') + YK API call
 *      → возвращает confirmation_url для фронта
 *   2. (юзер платит на сайте ЮК)
 *   3. webhook payment.succeeded → activatePaidSubscription()
 *   4. Cron автопродления (в server.js) → createRecurringPayment по
 *      сохранённому payment_method_id
 */

import { giveReferralReward } from './db.js';
import {
  createPayment as ykCreatePayment,
  createRecurringPayment as ykCreateRecurring,
  getPayment as ykGetPayment,
  isYkEnabled,
  ykMode,
  YkError,
} from './yookassa.js';

// Цены в КОПЕЙКАХ. Источник истины — синхронизировать с frontend PLANS
// в mini-app/src/utils/api.ts (там approxRub) и legalContent.ts (цены в
// договоре-оферте).
//
// ⚠️ ВРЕМЕННО: 1₽ ВЕЗДЕ для тестирования боевого магазина ЮКассы.
// Когда тесты пройдут — вернуть на боевые цены:
//   basic_month:   30000,  // 300 ₽
//   premium_month: 75000,  // 750 ₽
//   day_pass:       7500,  // 75 ₽
export const YK_PLAN_PRICES_KOPECKS = {
  basic_month:   100,  // 1 ₽ (тест)
  premium_month: 100,  // 1 ₽ (тест)
  day_pass:      100,  // 1 ₽ (тест)
};

// Длительность активации в МИЛЛИСЕКУНДАХ (важно — все timestamp'ы в проекте
// в Date.now()-формате: миллисекунды от epoch, не секунды). Раньше я писал
// в секундах — getActiveSubscription с `expires_at > Date.now()` (ms) не
// находил подписку, и юзер видел Free даже после успешной активации.
const DAY_MS = 86400 * 1000;
const PLAN_DURATION_MS = {
  basic_month: 30 * DAY_MS,
  premium_month: 30 * DAY_MS,
  day_pass: 1 * DAY_MS,
};

// Описание для чека ЮК (отображается юзеру).
const PLAN_DESCRIPTION = {
  basic_month:   'Интерстеллар Basic — подписка на 30 дней',
  premium_month: 'Интерстеллар Premium — подписка на 30 дней',
  day_pass:      'Интерстеллар Day Pass — 24 часа без лимита',
};

/**
 * Создаёт платёж в ЮК и записывает его в БД.
 * Возвращает confirmation_url для редиректа юзера.
 *
 * @param {Database} db — better-sqlite3
 * @param {number} userId — telegram_user_id
 * @param {string} plan — 'basic_month' | 'premium_month' | 'day_pass'
 * @param {boolean} autoRenew — сохранять ли payment_method для авто-продления
 * @param {string} returnUrl — куда вернуть юзера после оплаты (наш фронт)
 */
export async function createYkPayment({ db, userId, plan, autoRenew, returnUrl }) {
  if (!isYkEnabled()) {
    throw new Error('YK_NOT_CONFIGURED');
  }
  const amountKopecks = YK_PLAN_PRICES_KOPECKS[plan];
  if (!amountKopecks) {
    throw new Error('UNSUPPORTED_PLAN');
  }
  // Автопродление отключено по бизнес-решению.
  // ВАЖНО: save_payment_method=true вызывает 400 от ЮКассы если в
  // payment_method_types есть НЕ-карточные методы (SBP, T-Pay, SberPay).
  // Это и был баг с Basic/Premium — они зависали при создании платежа.
  // Для Day Pass save был false → работал. Теперь везде false → все
  // планы создаются успешно, ни один не продлевается автоматически.
  const savePaymentMethod = false;
  // autoRenew параметр оставлен в сигнатуре для совместимости со старыми
  // вызовами с фронта, но больше не влияет на флоу — игнорируется.
  void autoRenew;

  // Вызываем YK ПЕРВЫМ — без её ответа у нас нет yk_payment_id.
  // Если YK упала — ничего не пишем в БД (нечего активировать).
  const payment = await ykCreatePayment({
    amountRub: amountKopecks / 100,
    description: PLAN_DESCRIPTION[plan],
    returnUrl,
    savePaymentMethod,
    metadata: {
      telegram_user_id: String(userId),
      plan,
      auto_renew: 'false',
    },
  });

  // Атрибуция к партнёру (если юзер пришёл по партнёрской ссылке).
  const attrRow = db
    .prepare('SELECT matched_partner_id FROM attributions WHERE telegram_user_id = ?')
    .get(userId);
  const attrPartnerId = attrRow?.matched_partner_id ?? null;
  let attrShareBps = null;
  if (attrPartnerId) {
    const partnerRow = db
      .prepare("SELECT revenue_share_bps FROM partners WHERE telegram_user_id = ? AND status = 'active'")
      .get(attrPartnerId);
    attrShareBps = partnerRow?.revenue_share_bps ?? null;
  }

  // Идемпотентность: INSERT OR IGNORE — если webhook успел прийти ДО того
  // как мы дошли сюда (маловероятно, но возможно при retry), не перезапишем.
  const now = Date.now();
  db.prepare(`
    INSERT OR IGNORE INTO yk_payments
      (yk_payment_id, telegram_user_id, plan, amount_kopecks, status,
       metadata_json, attributed_partner_id, revenue_share_bps_snapshot,
       created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payment.id,
    userId,
    plan,
    amountKopecks,
    payment.status,
    JSON.stringify({ auto_renew: autoRenew }),
    attrPartnerId,
    attrShareBps,
    now,
    now,
  );

  return {
    yk_payment_id: payment.id,
    confirmation_url: payment.confirmation?.confirmation_url || null,
    status: payment.status,
    mode: ykMode(),
  };
}

/**
 * Polling-статус. Используется фронтом после возврата с YK-сайта.
 * Если в БД статус 'pending' и прошло >3 сек — обновляем через YK API
 * (на случай если webhook ещё не пришёл, но платёж уже succeeded).
 */
export async function getYkPaymentStatus({ db, userId, paymentId }) {
  const row = db.prepare(`
    SELECT status, telegram_user_id, updated_at
    FROM yk_payments WHERE yk_payment_id = ?
  `).get(paymentId);

  if (!row) return { status: 'unknown' };
  // Не отдаём чужие платежи (защита от Forced Browsing).
  if (row.telegram_user_id !== userId) return { status: 'unknown' };

  // Если pending и старше 3 сек — освежаем из YK
  // (на случай race: юзер уже оплатил, но webhook задержался).
  const now = Date.now();
  if (row.status === 'pending' && now - row.updated_at > 3000) {
    try {
      const yk = await ykGetPayment(paymentId);
      if (yk.status !== row.status) {
        // Обновим в БД (webhook всё равно придёт и сделает то же,
        // но мы хотим отдать актуальный статус прямо сейчас).
        db.prepare(`
          UPDATE yk_payments SET status = ?, updated_at = ?
          WHERE yk_payment_id = ?
        `).run(yk.status, now, paymentId);
        return { status: yk.status };
      }
    } catch (err) {
      // YK недоступна — отдаём что есть в БД.
      console.warn('[yk] getPayment poll failed:', err.message);
    }
  }

  return { status: row.status };
}

/**
 * Обработка webhook'а payment.succeeded.
 * Идемпотентно — если уже активировали, повторный webhook ничего не сломает.
 *
 * @returns {object} { activated: boolean, expires_at: number } или { activated: false, reason }
 */
export function handleYkPaymentSucceeded({ db, ykPayment }) {
  const paymentId = ykPayment.id;
  const now = Date.now();

  // Найдём наш row. Если его НЕТ — это означает payment создан не нами
  // (или таблица грохнута). Логируем и игнорируем — не активируем
  // подписку «из ниоткуда».
  const row = db.prepare(`
    SELECT telegram_user_id, plan, status, amount_kopecks, metadata_json,
           attributed_partner_id, revenue_share_bps_snapshot
    FROM yk_payments WHERE yk_payment_id = ?
  `).get(paymentId);

  if (!row) {
    console.error(`[yk-webhook] unknown payment_id ${paymentId}`);
    return { activated: false, reason: 'UNKNOWN_PAYMENT' };
  }

  // Уже активировано — webhook-replay, игнорируем.
  if (row.status === 'succeeded') {
    return { activated: false, reason: 'ALREADY_PROCESSED' };
  }

  // Проверка: сумма платежа совпадает с тарифом (anti-tamper).
  const ykAmountKopecks = Math.round(Number(ykPayment.amount?.value) * 100);
  if (ykAmountKopecks !== row.amount_kopecks) {
    console.error(
      `[yk-webhook] amount mismatch payment=${paymentId} ` +
      `db=${row.amount_kopecks} yk=${ykAmountKopecks}`,
    );
    return { activated: false, reason: 'AMOUNT_MISMATCH' };
  }

  // Извлекаем payment_method details для UI / recurring
  const paymentMethod = ykPayment.payment_method || {};
  const savedMethodId = paymentMethod.saved ? paymentMethod.id : null;
  const card = paymentMethod.card || {};
  const cardLast4 = card.last4 || null;
  const methodType = paymentMethod.type || null;

  // Парсим metadata чтобы узнать auto_renew (мы это пихали при createPayment)
  let autoRenew = false;
  try {
    const meta = JSON.parse(row.metadata_json || '{}');
    autoRenew = Boolean(meta.auto_renew) && savedMethodId !== null;
  } catch { /* malformed metadata — игнорируем */ }

  const durationMs = PLAN_DURATION_MS[row.plan];
  const expiresAt = now + durationMs;
  // Для day_pass — не подписка, а Day Pass-запись (отдельная таблица).
  // Для basic/premium — пишем в subscriptions.
  const planKey = row.plan === 'day_pass' ? 'day_pass' : row.plan;

  // Транзакция: обновляем yk_payments + создаём subscription/day_pass.
  // Если что-то упало — webhook вернёт 5xx и TG ретраит, поэтому атомарно.
  const tx = db.transaction(() => {
    // 1) yk_payments
    db.prepare(`
      UPDATE yk_payments SET
        status = 'succeeded',
        payment_method_type = ?,
        card_last4 = ?,
        saved_payment_method_id = ?,
        last_webhook_json = ?,
        succeeded_at = ?,
        updated_at = ?
      WHERE yk_payment_id = ?
    `).run(
      methodType,
      cardLast4,
      savedMethodId,
      JSON.stringify(ykPayment).slice(0, 8000),
      now,
      now,
      paymentId,
    );

    // 2) Активация подписки
    if (planKey === 'day_pass') {
      // day_passes таблица была заточена под Stars (telegram_payment_charge_id
      // NOT NULL UNIQUE). Для YK туда пишем yk_payment_id — формат
      // совместимый (UUID), UNIQUE-семантика сохранена.
      db.prepare(`
        INSERT INTO day_passes
          (telegram_user_id, purchased_at, expires_at,
           telegram_payment_charge_id, source)
        VALUES (?, ?, ?, ?, 'yookassa')
      `).run(row.telegram_user_id, now, expiresAt, paymentId);
    } else {
      // basic_month / premium_month → subscriptions
      // Отменим предыдущую активную (если есть) и заведём новую.
      db.prepare(`
        UPDATE subscriptions
        SET cancelled_at = ?
        WHERE telegram_user_id = ?
          AND expires_at > ?
          AND cancelled_at IS NULL
      `).run(now, row.telegram_user_id, now);

      db.prepare(`
        INSERT INTO subscriptions
          (telegram_user_id, plan, started_at, expires_at, is_trial,
           auto_renew, yk_payment_method_id, source)
        VALUES (?, ?, ?, ?, 0, ?, ?, 'yookassa')
      `).run(
        row.telegram_user_id,
        planKey,
        now,
        expiresAt,
        autoRenew ? 1 : 0,
        savedMethodId,
      );
    }
  });
  tx();

  // Партнёрская доля в рублях (рассчитываем снаружи транзакции — не критично,
  // webhook может повторить если упадёт, partner_revenue_rub DEFAULT 0 безопасен).
  if (row.attributed_partner_id && row.revenue_share_bps_snapshot) {
    const partnerRevenueRub = Math.round(
      (row.amount_kopecks / 100) * (row.revenue_share_bps_snapshot / 10000) * 100,
    ) / 100;
    db.prepare('UPDATE yk_payments SET partner_revenue_rub = ? WHERE yk_payment_id = ?')
      .run(partnerRevenueRub, paymentId);
  }

  // Реферальная награда (идемпотентна: UNIQUE(referred_user_id) не даст
  // начислить дважды, даже если вебхук прилетит повторно или при авторенью).
  try {
    giveReferralReward(db, row.telegram_user_id, row.plan)
  } catch (e) {
    console.error('[referral] YK reward error:', e)
  }

  console.log(
    `[yk-webhook] activated user=${row.telegram_user_id} plan=${row.plan} ` +
    `expires=${expiresAt} auto_renew=${autoRenew} method=${methodType}`,
  );
  return { activated: true, expires_at: expiresAt, plan: row.plan };
}

/**
 * Обработка webhook'а payment.canceled.
 * Юзер отменил оплату на сайте YK, или 3DS не прошёл.
 */
export function handleYkPaymentCanceled({ db, ykPayment }) {
  const paymentId = ykPayment.id;
  const reason = ykPayment.cancellation_details?.reason || 'unknown';
  const now = Date.now();

  db.prepare(`
    UPDATE yk_payments SET
      status = 'canceled',
      error_code = ?,
      last_webhook_json = ?,
      updated_at = ?
    WHERE yk_payment_id = ? AND status != 'succeeded'
  `).run(
    reason,
    JSON.stringify(ykPayment).slice(0, 8000),
    now,
    paymentId,
  );

  console.log(`[yk-webhook] canceled payment=${paymentId} reason=${reason}`);
  return { canceled: true, reason };
}

/**
 * Обработка webhook'а refund.succeeded.
 * Отменяем именно ту подписку которая была активирована этим платежом
 * (НЕ все активные — иначе можно случайно отменить premium-подписку
 * при refund'е basic).
 */
export function handleYkRefundSucceeded({ db, ykRefund }) {
  const paymentId = ykRefund.payment_id;
  const now = Date.now();

  const row = db.prepare(`
    SELECT telegram_user_id, plan, succeeded_at
    FROM yk_payments WHERE yk_payment_id = ?
  `).get(paymentId);

  if (!row) {
    console.error(`[yk-webhook] refund for unknown payment ${paymentId}`);
    return { refunded: false, reason: 'UNKNOWN_PAYMENT' };
  }

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE yk_payments SET
        refunded_at = ?,
        updated_at = ?
      WHERE yk_payment_id = ?
    `).run(now, now, paymentId);

    // Отменяем только эту конкретную подписку — ту что была создана
    // ПОСЛЕ этого платежа (started_at >= succeeded_at). Это защита от
    // overshoot когда юзер успел и купить, и refund'нуть, и купить
    // другой план: refund первого не должен убить второй.
    if (row.plan !== 'day_pass') {
      db.prepare(`
        UPDATE subscriptions SET cancelled_at = ?
        WHERE telegram_user_id = ?
          AND source = 'yookassa'
          AND plan = ?
          AND started_at >= ?
          AND cancelled_at IS NULL
      `).run(now, row.telegram_user_id, row.plan, row.succeeded_at || 0);
    }
  });
  tx();

  console.log(`[yk-webhook] refunded payment=${paymentId} plan=${row.plan}`);
  return { refunded: true };
}

/**
 * Cron автопродления.
 * Раз в час берём подписки которые истекают в течение 24 часов и имеют
 * auto_renew + сохранённый payment_method_id — пытаемся списать через YK.
 * Если успех — продлеваем на 30 дней. Если карта истекла — auto_renew=0
 * и шлём юзеру уведомление через бот.
 */
export async function renewSubscriptionsCron({ db, returnUrl }) {
  const now = Date.now();
  const cutoff = now + DAY_MS; // подписки которые истекают в течение 24h

  const due = db.prepare(`
    SELECT id, telegram_user_id, plan, yk_payment_method_id, expires_at
    FROM subscriptions
    WHERE auto_renew = 1
      AND yk_payment_method_id IS NOT NULL
      AND expires_at < ?
      AND expires_at > ?
      AND cancelled_at IS NULL
      AND source = 'yookassa'
  `).all(cutoff, now);

  console.log(`[yk-cron] checking ${due.length} subscriptions for renewal`);

  for (const sub of due) {
    const amountKopecks = YK_PLAN_PRICES_KOPECKS[sub.plan];
    if (!amountKopecks) {
      console.error(`[yk-cron] unknown plan ${sub.plan} for sub ${sub.id}`);
      continue;
    }
    try {
      const yk = await ykCreateRecurring({
        amountRub: amountKopecks / 100,
        description: PLAN_DESCRIPTION[sub.plan] + ' (автопродление)',
        paymentMethodId: sub.yk_payment_method_id,
        metadata: {
          telegram_user_id: String(sub.telegram_user_id),
          plan: sub.plan,
          is_recurring: 'true',
          renewed_subscription_id: String(sub.id),
        },
      });

      // Запишем платёж — webhook payment.succeeded активирует продление
      // через стандартный handleYkPaymentSucceeded.
      db.prepare(`
        INSERT INTO yk_payments
          (yk_payment_id, telegram_user_id, plan, amount_kopecks, status,
           is_recurring, metadata_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
      `).run(
        yk.id,
        sub.telegram_user_id,
        sub.plan,
        amountKopecks,
        yk.status,
        JSON.stringify({ auto_renew: true, parent_sub: sub.id }),
        now,
        now,
      );

      console.log(`[yk-cron] sub=${sub.id} → yk_payment=${yk.id} status=${yk.status}`);
    } catch (err) {
      // Карта истекла / insufficient_funds / 3DS-required — отключаем
      // auto_renew, юзер получит уведомление при подходе срока истечения.
      if (err instanceof YkError && err.httpStatus >= 400 && err.httpStatus < 500) {
        console.warn(`[yk-cron] renewal failed for sub ${sub.id}: ${err.ykCode}, disabling auto_renew`);
        db.prepare(`
          UPDATE subscriptions SET auto_renew = 0
          WHERE id = ?
        `).run(sub.id);
        // TODO: бот-уведомление «карта недействительна, продли вручную»
      } else {
        console.error(`[yk-cron] renewal error for sub ${sub.id}:`, err);
      }
    }
  }
}
