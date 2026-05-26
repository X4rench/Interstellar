import crypto from 'node:crypto';
import {
  createInvoiceLink,
  answerPreCheckoutQuery,
  getStarTransactions,
  sendMessage,
  editUserStarSubscription,
} from './bot-api.js';
import { logAction } from './audit.js';
import { giveReferralReward } from './db.js';

/**
 * Бизнес-логика Stars-платежей.
 *
 * Архитектура надёжности:
 *   1. ИСТОЧНИК ИСТИНЫ — webhook от Telegram. Client callback от openInvoice
 *      — только подсказка для UX, никогда не активирует подписку.
 *   2. Идемпотентность — UNIQUE(telegram_payment_charge_id) в payments.
 *      Дубль webhook'а → CONSTRAINT FAIL → ловим, 200 OK для TG.
 *   3. Snapshot атрибуции на момент create-invoice — защита от смены
 *      partner-slug'а между показом invoice и оплатой.
 *   4. Reconciliation cron — догоняет потерянные webhook'и через
 *      getStarTransactions каждые N минут.
 *   5. Manual recovery endpoint — последняя инстанция для случаев когда
 *      reconciliation не справился (юзер прислал скрин платежа).
 */

const SUBSCRIPTION_PERIOD_DAYS = 30;
const SUBSCRIPTION_PERIOD_SEC = SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60;
const SUBSCRIPTION_PERIOD_MS = SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000;
const DAY_PASS_MS = 24 * 60 * 60 * 1000;

const PAYLOAD_VERSION = 'v1';

/**
 * Конфигурация тарифов. Точка истины (синхронизировать с frontend).
 *
 * - basic_month / premium_month: recurring subscription_period 30 дней
 * - day_pass: one-time (без subscription_period), действие 24h
 *
 * Цена в Stars — берётся из env с дефолтами. На прод-релизе уточнить.
 */
function getPlanConfig(plan) {
  const plans = {
    basic_month: {
      title: 'Interstellar Basic',
      description: '50 сообщений/день · все персонажи · кастомные · 1 месяц',
      stars: Number(process.env.STAR_PRICE_BASIC) || 199,
      recurring: true,
      subscription_period_sec: SUBSCRIPTION_PERIOD_SEC,
      duration_ms: SUBSCRIPTION_PERIOD_MS,
    },
    premium_month: {
      title: 'Interstellar Premium',
      description: '200 сообщений/день · 18+ персонажи · длиннее память · 1 месяц',
      stars: Number(process.env.STAR_PRICE_PREMIUM) || 499,
      recurring: true,
      subscription_period_sec: SUBSCRIPTION_PERIOD_SEC,
      duration_ms: SUBSCRIPTION_PERIOD_MS,
    },
    day_pass: {
      title: 'Day Pass',
      description: '+100 сообщений к дневному лимиту на 24 часа',
      stars: Number(process.env.STAR_PRICE_DAY_PASS) || 50,
      recurring: false,
      subscription_period_sec: 0,
      duration_ms: DAY_PASS_MS,
    },
  };
  return plans[plan] || null;
}

/**
 * Генерирует уникальный invoice_payload. Структура: "v1:{userId}:{nonce}".
 * nonce — UUIDv4 (фактически 32 hex символа) для уникальности и защиты от
 * угадывания платежа другого юзера.
 *
 * Длина payload <= 128 байт (требование TG): "v1:" (3) + uid (макс 20) + ":"
 * (1) + nonce (32) ≤ 56 байт.
 */
function buildInvoicePayload(userId) {
  const nonce = crypto.randomBytes(16).toString('hex');
  return `${PAYLOAD_VERSION}:${userId}:${nonce}`;
}

function parsePayload(payload) {
  if (typeof payload !== 'string') return null;
  const parts = payload.split(':');
  if (parts.length !== 3 || parts[0] !== PAYLOAD_VERSION) return null;
  // ВАЖНО: TG user_id может превысить Number.MAX_SAFE_INTEGER (≈ 9e15).
  // Сравнения через Number() ломаются — используем строки.
  const userIdStr = parts[1];
  if (!/^\d{1,19}$/.test(userIdStr) || userIdStr === '0') return null;
  return { userIdStr, userId: Number(userIdStr), nonce: parts[2] };
}

// Безопасное сравнение TG user_id (работает для значений > 2^53).
function userIdsEqual(a, b) {
  return String(a) === String(b);
}

// ─── Atribution snapshot ────────────────────────────────────────────────

/**
 * При создании инвойса фиксируем партнёра, через которого пришёл этот юзер,
 * И его текущую долю. Если slug партнёра/доля сменятся между create-invoice
 * и successful_payment — деньги пойдут так, как было зафиксировано в момент
 * create-invoice (партнёр не теряет свою долю).
 */
function snapshotAttribution(db, userId) {
  const row = db
    .prepare(
      `SELECT a.start_param, a.matched_partner_id, p.revenue_share_bps
       FROM attributions a
       LEFT JOIN partners p ON p.telegram_user_id = a.matched_partner_id AND p.status = 'active'
       WHERE a.telegram_user_id = ?`,
    )
    .get(userId);

  if (!row) return { partnerId: null, shareBps: null };

  // Если slug не привязан к partner_id (старая атрибуция или неактивный
  // партнёр) — пытаемся резолвить сейчас.
  let partnerId = row.matched_partner_id;
  let shareBps = row.revenue_share_bps;

  if (!partnerId && row.start_param) {
    // COLLATE NOCASE на partners.blogger_slug + LOWER() — обходим
    // case-sensitivity (EC-3): юзер мог прийти с `?startapp=vasya`,
    // партнёр зарегался как `Vasya` — должны мэтчить.
    const partner = db
      .prepare(
        `SELECT telegram_user_id, revenue_share_bps
         FROM partners
         WHERE LOWER(blogger_slug) = LOWER(?) AND status = 'active'`,
      )
      .get(row.start_param);
    if (partner) {
      partnerId = partner.telegram_user_id;
      shareBps = partner.revenue_share_bps;
      // Backfill attributions.matched_partner_id для будущих запросов.
      db.prepare('UPDATE attributions SET matched_partner_id = ? WHERE telegram_user_id = ?')
        .run(partnerId, userId);
    }
  }

  return { partnerId: partnerId ?? null, shareBps: shareBps ?? null };
}

// ─── Create invoice ─────────────────────────────────────────────────────

/**
 * Создаёт инвойс через Bot API + сохраняет outstanding-запись в БД.
 *
 * Идемпотентность soft: если для юзера есть активный pending invoice
 * моложе 10 минут — возвращаем тот же payload вместо создания нового.
 * Это снижает риск double-pay'я при множественных кликах.
 */
export async function createInvoice({ db, userId, plan = 'basic_month' }) {
  // Backward-compat: 'month' → 'basic_month' (старый API клиент).
  if (plan === 'month') plan = 'basic_month';

  const cfg = getPlanConfig(plan);
  if (!cfg) throw new Error(`UNSUPPORTED_PLAN: ${plan}`);

  const amountStars = cfg.stars;

  const payload = buildInvoicePayload(userId);
  // Partner-атрибуция применима только к подпискам (basic/premium), не к day_pass.
  // Day Pass — это разовая «прокачка», партнёр не получает долю.
  const { partnerId, shareBps } = plan === 'day_pass'
    ? { partnerId: null, shareBps: null }
    : snapshotAttribution(db, userId);

  // Сохраняем outstanding ДО запроса к TG (atomic, иначе риск выдать link
  // на который потом не сможем активировать).
  db.prepare(
    `INSERT INTO invoices_outstanding (
       invoice_payload, telegram_user_id, amount_stars, plan,
       attributed_partner_id, revenue_share_bps_snapshot, created_at, status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
  ).run(payload, userId, amountStars, plan, partnerId, shareBps, Date.now());

  let invoiceLink;
  try {
    invoiceLink = await createInvoiceLink({
      title: cfg.title,
      description: cfg.description,
      payload,
      amountStars,
      // day_pass: subscriptionPeriodSec=0 → TG воспринимает как one-time
      subscriptionPeriodSec: cfg.recurring ? cfg.subscription_period_sec : 0,
    });
  } catch (err) {
    db.prepare('UPDATE invoices_outstanding SET status = ?, consumed_at = ? WHERE invoice_payload = ?')
      .run('expired', Date.now(), payload);
    throw err;
  }

  // Audit (не критично — outside main flow для производительности)
  try {
    logAction(db, {
      actorUserId: userId,
      actorRole: 'regular', // даже partner/admin платит как regular
      action: 'create_invoice',
      targetUserId: userId,
      targetResource: 'invoices_outstanding',
      targetId: payload,
      payload: { amount_stars: amountStars, plan, attributed_partner_id: partnerId, share_bps: shareBps },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[payments] audit failed:', err.message);
  }

  return { invoiceLink, payload, amountStars, plan };
}

// ─── Webhook: pre_checkout_query ────────────────────────────────────────

/**
 * Ответ на pre_checkout_query. ОБЯЗАТЕЛЬНО синхронный — TG даёт нам 10 сек.
 * Никакой бизнес-логики до answer.
 *
 * Для Stars-инвойса всегда ok=true (нет inventory check). Отказы только
 * при явных причинах (юзер забанен у нас — на старте такого нет).
 */
export async function handlePreCheckoutQuery({ db, query }) {
  // ── H3: cross-user invoice abuse ──
  // Проверяем что юзер который пытается оплатить — тот же что создал invoice.
  // Это БЫСТРАЯ синхронная DB-проверка (≤ 1ms), укладываемся в 10-сек окно.
  const queryUserId = query.from?.id;
  const outstanding = db
    .prepare(
      `SELECT telegram_user_id, status FROM invoices_outstanding WHERE invoice_payload = ?`,
    )
    .get(query.invoice_payload);

  let ok = true;
  let errorMessage;
  if (outstanding) {
    if (outstanding.status !== 'pending') {
      ok = false;
      errorMessage = 'Этот платёж уже обработан';
    } else if (
      Number.isFinite(queryUserId) &&
      !userIdsEqual(outstanding.telegram_user_id, queryUserId)
    ) {
      ok = false;
      errorMessage = 'Платёж предназначен другому пользователю';
      logAction(db, {
        actorUserId: 0,
        actorRole: 'system',
        action: 'pre_checkout_cross_user',
        targetUserId: queryUserId,
        targetResource: 'invoices_outstanding',
        targetId: query.invoice_payload,
        payload: {
          owner_user_id: outstanding.telegram_user_id,
          paying_user_id: queryUserId,
        },
      });
    }
  }
  // Если outstanding не найден (manual invoice, reconciliation, etc.) —
  // отвечаем ok чтобы юзер мог завершить платёж. Webhook потом разрулит.

  try {
    await answerPreCheckoutQuery({ queryId: query.id, ok, errorMessage });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[payments] answerPreCheckoutQuery failed:', err.message);
    throw err;
  }
}

// ─── Webhook: successful_payment ────────────────────────────────────────

/**
 * Атомарная активация подписки в одной транзакции:
 *   1. INSERT в payments (UNIQUE charge_id даёт идемпотентность)
 *   2. INSERT в subscriptions с expires_at = paid_at + 30d
 *   3. UPDATE payments.subscription_id = ...
 *   4. UPDATE invoices_outstanding.status = 'consumed'
 *   5. logAction
 *
 * Если что-то падает — вся транзакция rollback'ается. Если CONSTRAINT FAIL
 * на UNIQUE charge_id — это replay (TG переиспользовал retry), не throw'аем,
 * возвращаем { replay: true }.
 *
 * @returns { ok, replay?: true, payment_id?, subscription_id?, mismatch?: { ... } }
 */
export function handleSuccessfulPayment({ db, message, source = 'webhook' }) {
  const sp = message.successful_payment;
  if (!sp) return { ok: false, error: 'no_successful_payment' };

  const userId = message.from?.id;
  if (!Number.isFinite(userId)) {
    return { ok: false, error: 'no_user_id' };
  }

  const chargeId = sp.telegram_payment_charge_id;
  const payload = sp.invoice_payload;
  const amount = sp.total_amount;
  const currency = sp.currency;

  if (!chargeId || !payload || !amount) {
    return { ok: false, error: 'malformed_successful_payment' };
  }
  if (currency !== 'XTR') {
    return { ok: false, error: 'unexpected_currency' };
  }

  // ── C1 / H3: anti-spoofing ──
  // Webhook secret_token не идентифицирует от чьего имени запрос. Чтобы
  // защититься от утечки секрета или от чужих payload'ов — сверяем что
  // userId в payload == message.from.id. Webhook от настоящего TG со
  // спуфингом from.id невозможен (TG сам подставляет реального
  // плательщика), но при компрометации secret любой может POST'нуть
  // нашему бэку с любым from.id.
  const parsed = parsePayload(payload);
  const isManualOrRecovered = source !== 'webhook'; // recovery/reconciliation идут другим путём
  if (parsed && !userIdsEqual(parsed.userId, userId) && !isManualOrRecovered) {
    logAction(db, {
      actorUserId: 0,
      actorRole: 'system',
      action: 'webhook_user_id_spoof_attempt',
      targetUserId: userId,
      targetResource: 'payments',
      targetId: chargeId,
      payload: { payload_user_id: parsed.userId, message_user_id: userId, source },
    });
    return { ok: false, error: 'payload_user_mismatch' };
  }

  // Поднимаем outstanding (для snapshot атрибуции).
  const outstanding = db
    .prepare(`SELECT * FROM invoices_outstanding WHERE invoice_payload = ?`)
    .get(payload);

  // ── H3: cross-user invoice abuse ──
  // Outstanding принадлежит другому юзеру (атакующий взял invoice-link и
  // оплатил его сам с другого аккаунта). Тогда активируем подписку
  // тому КТО ОПЛАТИЛ (это справедливо), но НЕ привязываем партнёра от
  // outstanding (она была у другого юзера).
  let attributedPartnerId = null;
  let shareBps = null;
  if (outstanding && userIdsEqual(outstanding.telegram_user_id, userId)) {
    attributedPartnerId = outstanding.attributed_partner_id;
    shareBps = outstanding.revenue_share_bps_snapshot;
  }

  // ── EC-7: recurring renewal attribution ──
  // Авто-продление подписки не создаёт нового outstanding (мы его не
  // создавали при первой оплате — TG сам прилетает с новым charge_id).
  // Чтобы партнёр получал свою долю и на 2-м, 3-м, ... месяце —
  // наследуем атрибуцию от предыдущего платежа этого юзера.
  if (!attributedPartnerId && (sp.is_recurring || !outstanding)) {
    const prev = db
      .prepare(
        `SELECT attributed_partner_id, revenue_share_bps_snapshot
         FROM payments
         WHERE telegram_user_id = ? AND status = 'paid' AND attributed_partner_id IS NOT NULL
         ORDER BY paid_at DESC LIMIT 1`,
      )
      .get(userId);
    if (prev?.attributed_partner_id) {
      attributedPartnerId = prev.attributed_partner_id;
      shareBps = prev.revenue_share_bps_snapshot;
    }
  }

  // ── C8: amount mismatch ──
  // expected = outstanding.amount_stars если он есть.
  // received = amount.
  //   overpay (received > expected): юзер заплатил больше — активируем,
  //     помечаем в audit, можем потом сделать рефанд разницы вручную
  //   underpay (received < expected): юзер заплатил меньше — НЕ активируем,
  //     записываем failed payment + alert админу (manual refund/recovery)
  let amountMismatchNote = null;
  if (outstanding && outstanding.amount_stars !== amount) {
    if (amount > outstanding.amount_stars) {
      amountMismatchNote = `overpay:${amount - outstanding.amount_stars}`;
      // Продолжаем — активируем юзеру (он заплатил больше, заслужил).
    } else {
      // underpay — фиксируем failed payment, не активируем.
      const failTx = db.transaction(() => {
        try {
          db.prepare(
            `INSERT INTO payments (
               telegram_user_id, telegram_payment_charge_id, provider_payment_charge_id,
               invoice_payload, amount_stars, currency, status,
               attributed_partner_id, revenue_share_bps_snapshot, partner_revenue_stars,
               paid_at, raw_update_json, source
             ) VALUES (?, ?, ?, ?, ?, ?, 'failed', NULL, NULL, 0, ?, ?, ?)`,
          ).run(
            userId,
            chargeId,
            sp.provider_payment_charge_id || null,
            payload,
            amount,
            currency,
            Date.now(),
            JSON.stringify(message).slice(0, 4000),
            source,
          );
        } catch (err) {
          if (err?.code !== 'SQLITE_CONSTRAINT_UNIQUE') throw err;
        }
        logAction(db, {
          actorUserId: 0,
          actorRole: 'system',
          action: 'payment_amount_underpay',
          targetUserId: userId,
          targetResource: 'payments',
          targetId: chargeId,
          payload: { expected: outstanding.amount_stars, received: amount },
        });
      });
      failTx();
      // Alert админов
      const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '')
        .split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
      for (const aid of adminIds) {
        sendMessage({
          chatId: aid,
          text:
            `⚠️ <b>Платёж underpay</b>\n\n` +
            `User: <code>${userId}</code>\n` +
            `Charge: <code>${chargeId}</code>\n` +
            `Ожидалось: ${outstanding.amount_stars} ⭐\n` +
            `Получено: ${amount} ⭐\n\n` +
            `Подписка НЕ активирована. Сделай refund через admin/payments/recover или прямой API.`,
        });
      }
      return { ok: false, error: 'amount_underpay', mismatch: { expected: outstanding.amount_stars, received: amount } };
    }
  }

  // Расчёт партнёрской доли (basis points). Используем целочисленную
  // арифметику чтобы не плодить float-ошибки.
  const partnerRevenue = shareBps !== null && attributedPartnerId !== null
    ? Math.floor((amount * shareBps) / 10000)
    : 0;

  // Определяем тип покупки по outstanding.plan (либо basic_month/premium_month/day_pass).
  // Если outstanding нет (recurring renewal без нашего invoice) — считаем что
  // продление того же plan'а что был у юзера, или basic_month по умолчанию.
  const planFromOutstanding = outstanding?.plan;
  const purchasePlan = planFromOutstanding || 'basic_month';
  const planCfg = getPlanConfig(purchasePlan);

  // Рублёвый эквивалент партнёрской доли. Подписки продаются в рублях,
  // поэтому бизнес-логика проще: доля = цена_тарифа_руб * share_bps / 10000.
  // Не зависит от курса Stars → рублей (который нестабилен и нам неизвестен).
  const PLAN_PRICES_RUB = { basic_month: 300, premium_month: 750, day_pass: 75 };
  const partnerRevenueRub = shareBps !== null && attributedPartnerId !== null
    ? Math.round(((PLAN_PRICES_RUB[purchasePlan] || 0) * shareBps) / 10000 * 100) / 100
    : 0;

  // Активация в транзакции
  const tx = db.transaction(() => {
    try {
      const insertPayment = db.prepare(
        `INSERT INTO payments (
           telegram_user_id, telegram_payment_charge_id, provider_payment_charge_id,
           invoice_payload, amount_stars, currency, status,
           attributed_partner_id, revenue_share_bps_snapshot, partner_revenue_stars, partner_revenue_rub,
           is_first_recurring, is_recurring, paid_at, raw_update_json, source, plan
         ) VALUES (
           @telegram_user_id, @charge_id, @provider_charge_id,
           @payload, @amount, @currency, 'paid',
           @partner_id, @share_bps, @partner_revenue, @partner_revenue_rub,
           @is_first_recurring, @is_recurring, @paid_at, @raw, @source, @plan
         )`,
      );
      const result = insertPayment.run({
        telegram_user_id: userId,
        charge_id: chargeId,
        provider_charge_id: sp.provider_payment_charge_id || null,
        payload,
        amount,
        currency,
        partner_id: attributedPartnerId,
        share_bps: shareBps,
        partner_revenue: partnerRevenue,
        partner_revenue_rub: partnerRevenueRub,
        is_first_recurring: sp.is_first_recurring ? 1 : 0,
        is_recurring: sp.is_recurring ? 1 : 0,
        paid_at: Date.now(),
        raw: JSON.stringify(message).slice(0, 4000),
        source,
        plan: purchasePlan,
      });
      const paymentId = result.lastInsertRowid;

      const startedAt = Date.now();
      const expiresAt = startedAt + (planCfg?.duration_ms ?? SUBSCRIPTION_PERIOD_MS);

      let subscriptionId = null;
      let dayPassId = null;

      if (purchasePlan === 'day_pass') {
        // Day Pass — отдельная таблица. Не подписка.
        const dpResult = db
          .prepare(
            `INSERT INTO day_passes (
               telegram_user_id, purchased_at, expires_at,
               telegram_payment_charge_id, payment_id
             ) VALUES (?, ?, ?, ?, ?)`,
          )
          .run(userId, startedAt, expiresAt, chargeId, paymentId);
        dayPassId = dpResult.lastInsertRowid;
      } else {
        // basic_month / premium_month — обычная subscription.
        const subResult = db
          .prepare(
            `INSERT INTO subscriptions (
               telegram_user_id, plan, started_at, expires_at,
               is_trial, payment_id, telegram_payment_charge_id
             ) VALUES (?, ?, ?, ?, 0, ?, ?)`,
          )
          .run(userId, purchasePlan, startedAt, expiresAt, paymentId, chargeId);
        subscriptionId = subResult.lastInsertRowid;

        db.prepare('UPDATE payments SET subscription_id = ? WHERE id = ?')
          .run(subscriptionId, paymentId);
      }

      if (outstanding) {
        db.prepare(
          `UPDATE invoices_outstanding SET status = 'consumed', consumed_at = ? WHERE invoice_payload = ?`,
        ).run(Date.now(), payload);
      }

      logAction(db, {
        actorUserId: 0,
        actorRole: 'system',
        action: source === 'webhook' ? 'payment_received' : `payment_${source}`,
        targetUserId: userId,
        targetResource: 'payments',
        targetId: chargeId,
        payload: {
          payment_id: paymentId,
          plan: purchasePlan,
          subscription_id: subscriptionId,
          day_pass_id: dayPassId,
          amount_stars: amount,
          attributed_partner_id: attributedPartnerId,
          partner_revenue_stars: partnerRevenue,
          is_first_recurring: !!sp.is_first_recurring,
          source,
          ...(amountMismatchNote ? { amount_note: amountMismatchNote } : {}),
        },
      });

      return { paymentId, subscriptionId, dayPassId, replay: false };
    } catch (err) {
      // SQLite UNIQUE constraint → код 'SQLITE_CONSTRAINT_UNIQUE'
      if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        // Это replay (дубль webhook'а). Существующая запись уже сделала
        // активацию — НЕ повторяем, отвечаем replay:true.
        logAction(db, {
          actorUserId: 0,
          actorRole: 'system',
          action: 'webhook_replay',
          targetUserId: userId,
          targetResource: 'payments',
          targetId: chargeId,
          payload: { source },
        });
        return { replay: true };
      }
      throw err;
    }
  });

  const result = tx();

  // Реферальная награда — только при первой оплате, не при recurring-продлениях.
  // is_recurring = true значит Telegram уже снял повторный платёж по подписке.
  if (!result.replay && !sp.is_recurring) {
    try {
      giveReferralReward(db, userId, purchasePlan)
    } catch (e) {
      // Не-фатально: оплата уже прошла, награда — бонус.
      console.error('[referral] Stars reward error:', e)
    }
  }

  return {
    ok: true,
    replay: result.replay === true,
    payment_id: result.paymentId,
    subscription_id: result.subscriptionId,
    day_pass_id: result.dayPassId,
    plan: purchasePlan,
  };
}

// ─── Webhook: refunded_payment ──────────────────────────────────────────

/**
 * Обработка refund (Bot API 8.0+ возвращает message.refunded_payment).
 * Помечаем payment.status='refunded' и cancel subscription (Pro исчезает
 * сразу — для refund'а партнёрская доля тоже refunded).
 */
export function handleRefundedPayment({ db, message }) {
  const rp = message.refunded_payment;
  if (!rp) return { ok: false, error: 'no_refunded_payment' };

  const chargeId = rp.telegram_payment_charge_id;
  if (!chargeId) return { ok: false, error: 'no_charge_id' };

  const payment = db
    .prepare(
      `SELECT id, telegram_user_id, subscription_id, attributed_partner_id, partner_revenue_stars
       FROM payments WHERE telegram_payment_charge_id = ?`,
    )
    .get(chargeId);
  if (!payment) {
    // eslint-disable-next-line no-console
    console.warn('[payments] refund for unknown charge_id:', chargeId);
    return { ok: false, error: 'unknown_charge_id' };
  }

  // ── BUG-6: find currently active subscription (not just the one linked
  // to this payment) — recurring renewals may have created new subscriptions
  // since the refunded payment. We cancel ALL subscriptions that derive
  // from a payment chain involving this refund.
  const activeSubs = db
    .prepare(
      `SELECT id FROM subscriptions
       WHERE telegram_user_id = ? AND expires_at > ? AND cancelled_at IS NULL`,
    )
    .all(payment.telegram_user_id, Date.now());

  // ── EC-10: detect "refund-after-payout" — partner уже получил долю
  // за этот платёж через payout, а юзер запросил возврат. Партнёр получил
  // деньги, наш бизнес — двойной убыток. Alert админу для clawback.
  let clawbackAlert = null;
  if (payment.attributed_partner_id && payment.partner_revenue_stars > 0) {
    const paidPayouts = db
      .prepare(
        `SELECT COALESCE(SUM(amount_stars), 0) AS s FROM partner_payouts
         WHERE partner_telegram_user_id = ? AND status = 'paid'`,
      )
      .get(payment.attributed_partner_id).s;
    if (paidPayouts > 0) {
      clawbackAlert = {
        partnerId: payment.attributed_partner_id,
        clawbackStars: payment.partner_revenue_stars,
        paidPayoutsStars: paidPayouts,
      };
    }
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE payments SET status = ?, refunded_at = ? WHERE id = ?')
      .run('refunded', Date.now(), payment.id);

    // Отменяем ВСЕ активные подписки этого юзера (cancel chain).
    for (const sub of activeSubs) {
      db.prepare('UPDATE subscriptions SET cancelled_at = ?, expires_at = ? WHERE id = ?')
        .run(Date.now(), Date.now(), sub.id);
    }

    logAction(db, {
      actorUserId: 0,
      actorRole: 'system',
      action: 'payment_refunded',
      targetUserId: payment.telegram_user_id,
      targetResource: 'payments',
      targetId: chargeId,
      payload: {
        payment_id: payment.id,
        cancelled_subscriptions: activeSubs.map((s) => s.id),
        partner_clawback_needed: !!clawbackAlert,
        ...(clawbackAlert ? { clawback: clawbackAlert } : {}),
      },
    });
  });
  tx();

  // ── C10: отменяем recurring billing в TG чтобы не было новых списаний.
  // Fire-and-forget: ошибка не должна блокировать основной flow.
  editUserStarSubscription({
    userId: payment.telegram_user_id,
    telegramPaymentChargeId: chargeId,
    isCanceled: true,
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn('[payments] editUserStarSubscription failed:', err.message);
    // Не падаем — refund уже зафиксирован в БД.
  });

  // ── EC-10 alert: если был clawback — шлём админу для ручной обработки.
  if (clawbackAlert) {
    const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '')
      .split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
    for (const aid of adminIds) {
      sendMessage({
        chatId: aid,
        text:
          `⚠️ <b>Refund after payout!</b>\n\n` +
          `Юзер ${payment.telegram_user_id} запросил возврат платежа ${chargeId}.\n` +
          `Партнёр <code>${clawbackAlert.partnerId}</code> уже получил долю ${clawbackAlert.clawbackStars} ⭐ ` +
          `(всего выплачено ${clawbackAlert.paidPayoutsStars} ⭐).\n\n` +
          `Нужна ручная обработка clawback — связаться с партнёром.`,
      });
    }
  }

  return { ok: true };
}

// ─── Client polling: invoice status ─────────────────────────────────────

/**
 * Клиент после openInvoice→paid поллит этот endpoint каждые 1.5s × 30s.
 * Возвращает 'paid' только когда webhook реально пришёл и подписка
 * активирована. До тех пор — 'pending'.
 *
 * Защита: проверяем что payload принадлежит этому юзеру (userId из
 * initData). Иначе любой залогиненный мог бы поллить чужие платежи.
 */
export function getInvoiceStatus({ db, userId, payload }) {
  const parsed = parsePayload(payload);
  if (!parsed || parsed.userId !== userId) {
    return { status: 'unknown' };
  }

  // Сначала смотрим в payments — если уже зачислен, всё ок.
  const payment = db
    .prepare('SELECT status FROM payments WHERE invoice_payload = ?')
    .get(payload);
  if (payment) {
    return { status: payment.status === 'paid' ? 'paid' : payment.status };
  }

  // Иначе смотрим outstanding — pending/expired.
  const outstanding = db
    .prepare('SELECT status FROM invoices_outstanding WHERE invoice_payload = ?')
    .get(payload);
  if (!outstanding) return { status: 'unknown' };
  return { status: outstanding.status === 'pending' ? 'pending' : outstanding.status };
}

// ─── Reconciliation ─────────────────────────────────────────────────────

/**
 * Догоняет потерянные webhook'и. Запускается setInterval'ом из server.js
 * каждые RECONCILE_INTERVAL_MIN минут.
 *
 * Алгоритм:
 *   1. Берёт invoices_outstanding со status='pending' старше 5 мин
 *   2. Для каждого: getStarTransactions(limit=100) и ищет по invoice_payload
 *   3. Если нашёл charge_id, которого нет в payments — обрабатывает
 *      через handleSuccessfulPayment(source='reconciliation')
 *   4. Также: помечает 'expired' те outstanding'и которые старше 24h
 *      (юзер закрыл инвойс не оплачивая)
 *
 * Идемпотентно: если за это время webhook всё-таки пришёл — payments уже
 * заполнен, handleSuccessfulPayment вернёт replay:true.
 */
export async function reconcileMissingPayments({ db }) {
  // 1. Expire старые pending'и (>24h)
  const expired = db
    .prepare(
      `UPDATE invoices_outstanding
       SET status = 'expired', consumed_at = ?
       WHERE status = 'pending' AND created_at < ?`,
    )
    .run(Date.now(), Date.now() - 24 * 60 * 60 * 1000);

  // 2. Берём оставшиеся pending'и старше 5 мин (новые могут ещё догнаться
  // webhook'ом).
  const staleThreshold = Date.now() - 5 * 60 * 1000;
  const pending = db
    .prepare(
      `SELECT invoice_payload, telegram_user_id, amount_stars, created_at
       FROM invoices_outstanding
       WHERE status = 'pending' AND created_at < ?
       ORDER BY created_at ASC LIMIT 50`,
    )
    .all(staleThreshold);

  if (pending.length === 0) {
    return { expired: expired.changes, reconciled: 0, scanned: 0 };
  }

  // 3. Запрашиваем последние Stars-транзакции (≤100 за раз).
  // TODO для больших объёмов: пагинировать через offset.
  let txs;
  try {
    txs = await getStarTransactions({ limit: 100 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[reconcile] getStarTransactions failed:', err.message);
    return { expired: expired.changes, reconciled: 0, scanned: 0, error: err.message };
  }

  // 4. Мап по invoice_payload для O(1) lookup.
  const txsByPayload = new Map();
  for (const t of (txs?.transactions || [])) {
    const payload = t?.source?.invoice_payload || t?.receiver?.invoice_payload;
    if (payload) txsByPayload.set(payload, t);
  }

  let reconciled = 0;
  for (const p of pending) {
    const t = txsByPayload.get(p.invoice_payload);
    if (!t) continue;

    // Реконструируем psuedo-message для handleSuccessfulPayment
    const user = t?.source?.user || t?.receiver?.user;
    const pseudoMessage = {
      from: { id: user?.id || p.telegram_user_id },
      successful_payment: {
        currency: 'XTR',
        total_amount: t.amount,
        invoice_payload: p.invoice_payload,
        telegram_payment_charge_id: t.id,
        provider_payment_charge_id: '',
        is_recurring: true,
        is_first_recurring: true,
      },
    };
    const res = handleSuccessfulPayment({ db, message: pseudoMessage, source: 'reconciliation' });
    if (res.ok && !res.replay) reconciled++;
  }

  if (reconciled > 0) {
    // eslint-disable-next-line no-console
    console.info(`[reconcile] recovered ${reconciled} missing payments`);
  }

  return { expired: expired.changes, reconciled, scanned: pending.length };
}

// ─── Manual recovery (admin) ────────────────────────────────────────────

/**
 * Ручное восстановление платежа админом. Используется в крайнем случае —
 * когда юзер прислал скрин платежа, а у нас в БД его нет (webhook +
 * reconcile не сработали).
 *
 * Требует чтобы charge_id ещё не было в payments (иначе двойная активация).
 */
export function manualRecoverPayment({ db, adminId, userId, chargeId, amountStars, payload }) {
  const exists = db
    .prepare('SELECT id FROM payments WHERE telegram_payment_charge_id = ?')
    .get(chargeId);
  if (exists) {
    return { ok: false, error: 'ALREADY_PROCESSED', payment_id: exists.id };
  }

  const pseudoMessage = {
    from: { id: userId },
    successful_payment: {
      currency: 'XTR',
      total_amount: amountStars,
      invoice_payload: payload || `manual:${userId}:${chargeId}`,
      telegram_payment_charge_id: chargeId,
      provider_payment_charge_id: '',
      is_recurring: false,
      is_first_recurring: true,
    },
  };
  const res = handleSuccessfulPayment({ db, message: pseudoMessage, source: 'manual_recovery' });

  if (res.ok) {
    logAction(db, {
      actorUserId: adminId,
      actorRole: 'admin',
      action: 'manual_payment_recovery',
      targetUserId: userId,
      targetResource: 'payments',
      targetId: chargeId,
      payload: { amount_stars: amountStars },
    });
    // Уведомим юзера через TG что подписка активирована.
    sendMessage({
      chatId: userId,
      text: `✅ <b>Подписка активирована</b>\n\nВаш платёж на ${amountStars} ⭐ обработан вручную поддержкой. Pro-доступ открыт на 30 дней.`,
    });
  }

  return res;
}
