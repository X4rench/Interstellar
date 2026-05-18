import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import crypto from 'node:crypto';

import { authMiddleware } from './auth.js';
import {
  openDb,
  upsertUser,
  getActiveSubscription,
  checkAndIncrementChatUsage,
  getUserTier,
  hasActiveDayPass,
  getFreeMessagesRemaining,
  TIER_HISTORY_WINDOW,
  FREE_LIFETIME_MESSAGES,
} from './db.js';
import {
  loadRole,
  isAdmin,
  getAdminCount,
  requireRole,
  requireConfirmAction,
  requireFreshAuth,
} from './roles.js';
import { isCryptoConfigured } from './crypto.js';
import {
  createInvoice as paymentsCreateInvoice,
  handlePreCheckoutQuery,
  handleSuccessfulPayment,
  handleRefundedPayment,
  getInvoiceStatus,
  reconcileMissingPayments,
  manualRecoverPayment,
} from './payments.js';
import {
  createYkPayment,
  getYkPaymentStatus,
  handleYkPaymentSucceeded,
  handleYkPaymentCanceled,
  handleYkRefundSucceeded,
  renewSubscriptionsCron,
  YK_PLAN_PRICES_KOPECKS,
} from './yk-handlers.js';
import { isYkEnabled, isYkIp } from './yookassa.js';
import {
  listUsers as adminListUsers,
  grantPartner,
  listPartners,
  getPartner,
  updatePartner,
  revokePartner,
  listPayouts,
  approvePayout,
  markPayoutPaid,
  rejectPayout,
  listAudit,
} from './admin.js';
import {
  getPartnerSummary,
  getPartnerProfile,
  updatePartnerProfile,
  listPartnerPayouts,
  createPartnerPayout,
  uploadPayoutReceipt,
} from './partner.js';

// ─── env ──────────────────────────────────────────────────────────────────
const NODE_ENV = process.env.NODE_ENV || 'development';
const POLZA_API_URL = process.env.POLZA_API_URL || 'https://api.polza.ai/api/v1/chat/completions';
// Дефолт = qwen/qwen3-235b-a22b-2507. Перешли с openai/gpt-4o-mini по
// причинам: (a) ~6× дешевле на output, (b) гораздо разговорнее в
// character-play (gpt-4o-mini был склонен к «помощник-стилю» с
// бесконечными «Интересный вопрос!»), (c) отличный русский, (d) быстро
// (non-thinking instruct, без reasoning-блоков).
//
// ВНИМАНИЕ: перед переключением проверь что модель есть в каталоге polza:
//   curl -H "Authorization: Bearer $POLZA_API_KEY" \
//        https://api.polza.ai/api/v1/models | jq '.data[].id' | grep qwen3
//
// Если qwen3-235b нет — возьми qwen2.5-72b-instruct как fallback. На крайний
// случай вернись на openai/gpt-4o-mini (хуже, но точно работает).
const MODEL = process.env.POLZA_MODEL || 'qwen/qwen3-235b-a22b-2507';
const PORT = Number(process.env.PORT) || 3001;
const POLZA_KEY = process.env.POLZA_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const DB_PATH = process.env.DB_PATH || './data/interstellar.sqlite';
const DEV_BYPASS = process.env.DEV_BYPASS_INITDATA === '1';
const TRUST_PROXY_HOPS = Number(process.env.TRUST_PROXY_HOPS) || 0;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';
const RECONCILE_INTERVAL_MIN = Number(process.env.RECONCILE_INTERVAL_MIN) || 5;
const CORS_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
// Production-домены прода — добавляем ВСЕГДА, как страховка от ситуации
// «забыли обновить .env при переезде». Раньше из-за этого фронт получал
// CORS-ошибку и юзеры видели «не удалось получить ответ» в чате.
// Эти конкретно — наши собственные домены, чужие сюда не попадут.
const PROD_CORS_FALLBACK = [
  'https://interstellar-app.ru',
  'https://app.interstellar-app.ru',
];
for (const o of PROD_CORS_FALLBACK) {
  if (!CORS_ORIGINS.includes(o)) CORS_ORIGINS.push(o);
}

// ─── pre-flight checks ────────────────────────────────────────────────────
if (!POLZA_KEY) {
  console.error('[fatal] POLZA_API_KEY is not set. Create backend/.env from .env.example.');
  process.exit(1);
}

if (!BOT_TOKEN && !DEV_BYPASS) {
  console.error('[fatal] BOT_TOKEN is not set and DEV_BYPASS_INITDATA is not enabled.');
  console.error('[fatal] Set BOT_TOKEN in backend/.env (production)');
  console.error('[fatal] OR set DEV_BYPASS_INITDATA=1 (DEV without bot registration).');
  process.exit(1);
}

// Жёсткий guard: на проде DEV_BYPASS категорически запрещён.
// Лучше упасть на старте чем выпустить уязвимый API в прод.
if (NODE_ENV === 'production' && DEV_BYPASS) {
  console.error('[fatal] DEV_BYPASS_INITDATA=1 in NODE_ENV=production. Refusing to start.');
  console.error('[fatal] Set DEV_BYPASS_INITDATA=0 and provide a real BOT_TOKEN.');
  process.exit(1);
}

if (DEV_BYPASS) {
  console.warn('[warn] ⚠️  DEV_BYPASS_INITDATA=1 — initData hash NOT validated.');
  console.warn('[warn] ⚠️  Anyone with the API URL can impersonate any user_id.');
  console.warn('[warn] ⚠️  NEVER use in production.');
}

// Crypto-настройка не обязательна для базового /chat и /users/me, но
// необходима для partner-операций. Если не настроена — warn (не fatal),
// partner-эндпоинты сами вернут 500 с понятным error code если их вызовут.
const cryptoReady = isCryptoConfigured();
if (!cryptoReady) {
  console.warn('[warn] PAYOUT_ENCRYPTION_KEY not configured — partner PII endpoints will fail.');
  console.warn('[warn] Generate via: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
}

const adminCount = getAdminCount();
if (adminCount === 0) {
  console.warn('[warn] ADMIN_TELEGRAM_IDS пуст — никто не сможет выдавать partner-роли.');
  console.warn('[warn] Узнай свой ID через @userinfobot в Telegram и добавь в .env.');
} else {
  console.log(`[backend] admins configured: ${adminCount}`);
}

// ─── shared resources ─────────────────────────────────────────────────────
const db = openDb(DB_PATH);
const requireAuth = authMiddleware({ botToken: BOT_TOKEN, devBypass: DEV_BYPASS });
const roleLoader = loadRole(db);

// ─── простой in-memory rate limiter ─────────────────────────────────────
// Сбрасывается при рестарте — это OK для MVP (атакующий не сможет
// заранее накопить лимит). Для prod-сценария с несколькими процессами —
// заменить на shared store (redis/SQLite).
const rateLimitMap = new Map(); // key: "userId:bucket" → { count, resetAt }

function rateLimit({ bucket, windowMs, max }) {
  return (req, res, next) => {
    const userId = req.tgUser?.telegram_user_id;
    if (!Number.isFinite(userId)) return next(); // нет user — пропускаем (другой middleware вернёт 401)

    const key = `${userId}:${bucket}`;
    const now = Date.now();
    let entry = rateLimitMap.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitMap.set(key, entry);
    }
    entry.count++;
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ ok: false, error: 'RATE_LIMITED', retry_after: retryAfter });
    }
    next();
  };
}

// ─── Telegram webhook: secret_token middleware ──────────────────────────
// Constant-time сравнение, чтобы не палить ничего по таймингам.
function verifyTelegramWebhook(req, res, next) {
  if (!TELEGRAM_WEBHOOK_SECRET) {
    // На DEV без секрета — отказываем (иначе любой может симулировать webhook).
    return res.status(503).json({ ok: false, error: 'WEBHOOK_NOT_CONFIGURED' });
  }
  const provided = req.header('X-Telegram-Bot-Api-Secret-Token') || '';
  if (provided.length !== TELEGRAM_WEBHOOK_SECRET.length) {
    return res.status(401).end();
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(TELEGRAM_WEBHOOK_SECRET);
  if (!crypto.timingSafeEqual(a, b)) {
    return res.status(401).end();
  }
  next();
}

// ─── middleware ───────────────────────────────────────────────────────────
const MAX_PERSONA_LEN = 8000;
const MAX_MSG_LEN = 4000;
const MAX_HISTORY = 60;
// ── Sliding window для экономии токенов ──
// Клиент может прислать до MAX_HISTORY (60) сообщений, но мы шлём в LLM
// только последние HISTORY_TRIM_TO. Это снижает input-tokens в long-сессиях
// на 60-70% при минимальной потере качества (последние 20 msg обычно достаточны
// для контекста). Подробнее: docs/ECONOMICS.md.
//
// При вырастании ARPU/доли premium-юзеров — можно сделать per-tier:
//   free: 10, basic: 20, premium: 40
// Сейчас единый порог для всех.
const HISTORY_TRIM_TO = 20;
// max_tokens для output. Жёсткий cap чтобы модель не растягивалась в
// лекции. Раньше было 600 — модель выходила на 3-4 длинных абзаца
// (типичный gpt-4o-mini «помощник-стиль»). Снизили до 280: хватает на
// 2-4 предложения живого ответа, отрезает многословность.
// Эмодзи/одно слово/короткие реплики — естественно укладываются.
const LLM_MAX_OUTPUT_TOKENS = 280;
const REQUEST_TIMEOUT_MS = 60_000;

const app = express();

// Доверяем proxy-заголовкам X-Forwarded-For/Proto для Render/Cloudflare.
// TRUST_PROXY_HOPS=1 на проде, =0 на локалке (иначе атакующий может
// подделать ip в audit-log через подменённый X-Forwarded-For).
if (TRUST_PROXY_HOPS > 0) {
  app.set('trust proxy', TRUST_PROXY_HOPS);
}

// CORS: в DEV без allowlist разрешаем всё (упрощает тестирование), в prod
// — строгий allowlist, иначе любой сайт может ходить в твой бэк.
if (CORS_ORIGINS.length > 0) {
  app.use(
    cors({
      origin: (origin, cb) => {
        // Запросы без Origin (curl, server-side) — пропускаем.
        if (!origin) return cb(null, true);
        if (CORS_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );
} else {
  console.warn('[warn] CORS_ALLOWED_ORIGINS пуст — разрешён любой origin (только для DEV).');
  app.use(cors());
}

app.use(express.json({ limit: '512kb' }));

// ─── health ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    model: MODEL,
    auth: DEV_BYPASS ? 'dev-bypass' : BOT_TOKEN ? 'bot-token' : 'none',
  });
});

// ─── auth: smoke-test эндпоинт ────────────────────────────────────────────
// Фронт дёргает при старте mini-app, чтобы убедиться что initData принимается
// бэком. Если возвращает 401 — значит конфигурация (BOT_TOKEN или DEV-bypass)
// сломана, можно показать соответствующий error UI.
app.post('/api/v1/auth/validate-init-data', requireAuth, (req, res) => {
  res.json({
    ok: true,
    telegram_user_id: req.tgUser.telegram_user_id,
    first_name: req.tgUser.first_name,
  });
});

// ─── users: profile + subscription + role + tier ─────────────────────────
app.get('/api/v1/users/me', requireAuth, roleLoader, (req, res) => {
  const u = req.tgUser;

  // Upsert юзера + регистрация атрибуции (если start_param впервые).
  upsertUser(db, u);

  const subscription = getActiveSubscription(db, u.telegram_user_id);
  const tier = getUserTier(db, u.telegram_user_id);
  const dayPassActive = hasActiveDayPass(db, u.telegram_user_id);
  // Для free-юзеров — сколько осталось lifetime-сообщений (для UI индикатора).
  // Для платных не имеет смысла, но всё равно отдаём (frontend сам решит).
  const freeMessagesRemaining = getFreeMessagesRemaining(db, u.telegram_user_id);

  const partnerPublic = req.partner
    ? {
        blogger_slug: req.partner.blogger_slug,
        revenue_share_bps: req.partner.revenue_share_bps,
        pii_provided: req.partner.pii_provided === 1,
      }
    : null;

  res.json({
    ok: true,
    user: {
      telegram_user_id: u.telegram_user_id,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      language_code: u.language_code,
      photo_url: u.photo_url,
    },
    subscription, // null если нет активной
    // Tier-info: фронт использует для feature-gates (NSFW = premium, etc).
    tier,                             // 'free' | 'basic' | 'premium'
    day_pass_active: dayPassActive,
    // One-shot Free: сколько у юзера осталось бесплатных сообщений.
    // Имеет смысл только для tier='free'. Frontend показывает индикатор.
    free_messages_remaining: freeMessagesRemaining,
    free_messages_lifetime: FREE_LIFETIME_MESSAGES,
    role: req.role,                   // 'admin' | 'partner' | 'regular'
    partner: partnerPublic,           // null если не partner
    bot: {
      username: process.env.BOT_USERNAME || null,
      app_name: process.env.BOT_APP_NAME || 'app',
    },
  });
});

// ─── billing: создание Stars-инвойса ───────────────────────────────────
// Rate-limit: 5 инвойсов в минуту на юзера. Защита от спама и от двойных
// списаний если фронт глючит и кликает.
app.post(
  '/api/v1/billing/create-invoice',
  requireAuth,
  rateLimit({ bucket: 'create_invoice', windowMs: 60_000, max: 5 }),
  async (req, res) => {
    try {
      const userId = req.tgUser.telegram_user_id;
      // Поддерживаемые plan-коды: basic_month, premium_month, day_pass.
      // 'month' оставляем как алиас на basic_month для обратной совместимости
      // со старыми клиентами (api.ts уже шлёт новые коды, но не сломаемся).
      const rawPlan = req.body?.plan || 'basic_month';
      const VALID_PLANS = new Set(['basic_month', 'premium_month', 'day_pass', 'month']);
      if (!VALID_PLANS.has(rawPlan)) {
        return res.status(400).json({ ok: false, error: 'UNSUPPORTED_PLAN' });
      }
      const plan = rawPlan === 'month' ? 'basic_month' : rawPlan;

      // Идемпотентная вставка юзера (на случай если /users/me ещё не дёргался)
      upsertUser(db, req.tgUser);

      const { invoiceLink, payload, amountStars } = await paymentsCreateInvoice({
        db,
        userId,
        plan,
      });

      res.json({ ok: true, invoice_link: invoiceLink, payload, amount_stars: amountStars });
    } catch (err) {
      console.error('[billing] create-invoice failed:', err);
      res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
    }
  },
);

// ─── billing: polling статуса инвойса ──────────────────────────────────
// Клиент после openInvoice→callback('paid') поллит этот endpoint каждые
// 1.5s × 30s. Возвращает 'paid' только когда webhook реально пришёл и
// подписка активирована — до тех пор 'pending'. Защита: payload должен
// принадлежать запрашивающему юзеру (проверка по userId внутри).
app.get('/api/v1/billing/invoice-status/:payload', requireAuth, (req, res) => {
  const userId = req.tgUser.telegram_user_id;
  const payload = req.params.payload;
  const result = getInvoiceStatus({ db, userId, payload });
  res.json({ ok: true, status: result.status });
});

// ─── ЮКасса: создание платежа ──────────────────────────────────────────
// Использует API ЮКассы напрямую (не через Telegram-инвойс). Платёж
// идёт на сайт ЮК (confirmation_url) — юзер платит картой/СБП/T-Pay,
// возвращается на наш фронт по return_url. Параллельно прилетает
// webhook на /api/v1/yookassa-webhook, который активирует подписку.
//
// Rate-limit: 5/min — те же что для Stars, защита от двойных кликов.
app.post(
  '/api/v1/billing/yk-create-payment',
  requireAuth,
  rateLimit({ bucket: 'yk_create_payment', windowMs: 60_000, max: 5 }),
  async (req, res) => {
    try {
      if (!isYkEnabled()) {
        return res.status(503).json({ ok: false, error: 'YK_NOT_CONFIGURED' });
      }
      const userId = req.tgUser.telegram_user_id;
      const rawPlan = req.body?.plan || 'basic_month';
      const autoRenew = req.body?.auto_renew !== false; // по умолчанию вкл.
      const returnUrl = req.body?.return_url;

      if (!YK_PLAN_PRICES_KOPECKS[rawPlan]) {
        return res.status(400).json({ ok: false, error: 'UNSUPPORTED_PLAN' });
      }
      if (typeof returnUrl !== 'string' || !returnUrl.startsWith('https://')) {
        return res.status(400).json({ ok: false, error: 'BAD_RETURN_URL' });
      }
      // Whitelist: return_url должен быть на нашем домене ИЛИ t.me
      // (для возврата в Mini App после оплаты на сайте ЮК).
      const allowedHosts = [
        'interstellar-app.ru',
        'app.interstellar-app.ru',
        't.me', // Telegram deep-link на наш бот/Mini App
      ];
      try {
        const host = new URL(returnUrl).hostname;
        if (!allowedHosts.includes(host)) {
          return res.status(400).json({ ok: false, error: 'BAD_RETURN_HOST' });
        }
      } catch {
        return res.status(400).json({ ok: false, error: 'BAD_RETURN_URL' });
      }

      upsertUser(db, req.tgUser);
      const result = await createYkPayment({
        db,
        userId,
        plan: rawPlan,
        autoRenew,
        returnUrl,
      });
      res.json({ ok: true, ...result });
    } catch (err) {
      console.error('[yk] create-payment failed:', err);
      res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
    }
  },
);

// ─── ЮКасса: polling статуса ───────────────────────────────────────────
// Клиент после возврата с YK-сайта поллит этот endpoint каждые 1.5s.
// Возвращает 'succeeded' когда webhook реально пришёл и подписка
// активирована — до тех пор 'pending'/'unknown'.
app.get('/api/v1/billing/yk-status/:paymentId', requireAuth, async (req, res) => {
  try {
    const userId = req.tgUser.telegram_user_id;
    const paymentId = req.params.paymentId;
    if (!/^[a-zA-Z0-9_-]{16,64}$/.test(paymentId)) {
      return res.status(400).json({ ok: false, error: 'BAD_PAYMENT_ID' });
    }
    const result = await getYkPaymentStatus({ db, userId, paymentId });
    res.json({ ok: true, status: result.status });
  } catch (err) {
    console.error('[yk] status poll failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

// ─── ЮКасса webhook ────────────────────────────────────────────────────
// ЮК шлёт callback при изменении статуса платежа. Защита:
//   1) IP-whitelist (ЮК публикует список своих исходящих IP)
//   2) Идемпотентность через UNIQUE(yk_payment_id) и status-check
// Всегда возвращаем 200 для известных event-типов, чтобы ЮК не ретраил
// (если упадём с 5xx — ЮК будет долбить нас часами).
app.post('/api/v1/yookassa-webhook', (req, res) => {
  // Берём IP клиента. Приоритет:
  // 1) CF-Connecting-IP — Cloudflare кладёт сюда настоящий IP клиента
  //    (без проксирования через CF этого header нет)
  // 2) X-Forwarded-For — обычный proxy-header, первый IP = original
  // 3) req.ip / remoteAddr — fallback если за nginx без CF
  // Без этого webhook ловил CF IP (162.158.x.x) вместо YK IP — все
  // вебхуки отвергались с IP_NOT_ALLOWED → подписки не активировались.
  const cfIp = req.headers['cf-connecting-ip'];
  const xff = req.headers['x-forwarded-for'];
  const firstXff = typeof xff === 'string' ? xff.split(',')[0].trim() : null;
  const ip = cfIp || firstXff || req.ip || req.connection?.remoteAddress || '';
  if (!isYkIp(ip)) {
    console.warn(`[yk-webhook] rejected ip=${ip} (cf=${cfIp || 'none'}, xff=${xff || 'none'})`);
    return res.status(403).json({ ok: false, error: 'IP_NOT_ALLOWED' });
  }

  const body = req.body;
  if (!body || body.type !== 'notification') {
    return res.status(400).json({ ok: false, error: 'BAD_BODY' });
  }

  try {
    switch (body.event) {
      case 'payment.succeeded':
        handleYkPaymentSucceeded({ db, ykPayment: body.object });
        break;
      case 'payment.canceled':
        handleYkPaymentCanceled({ db, ykPayment: body.object });
        break;
      case 'refund.succeeded':
        handleYkRefundSucceeded({ db, ykRefund: body.object });
        break;
      case 'payment.waiting_for_capture':
        // capture=true в createPayment — этот event не должен приходить.
        // Если придёт — игнорируем, лог чтоб знать.
        console.log('[yk-webhook] waiting_for_capture (ignored)');
        break;
      default:
        console.log(`[yk-webhook] unknown event: ${body.event}`);
    }
    return res.json({ ok: true });
  } catch (err) {
    // НЕ кидаем 5xx — иначе ЮК будет ретраить. Записываем в логи и
    // отвечаем 200, ручной разбор по логам.
    console.error('[yk-webhook] handler error:', err);
    return res.json({ ok: true, internal_error: true });
  }
});

// ─── Telegram webhook ──────────────────────────────────────────────────
// Принимает Update от Telegram. NO requireAuth — auth через secret_token.
// ВСЕГДА возвращает 2xx если secret валидный (даже на replay), чтобы TG
// не ретраил. На 5xx TG будет ретраить 3 раза — это используется как
// safety net для случая когда наша БД упала.
app.post('/api/v1/telegram/webhook', verifyTelegramWebhook, async (req, res) => {
  const update = req.body;
  if (!update || typeof update !== 'object') {
    return res.status(400).end();
  }

  try {
    // ── pre_checkout_query (KRITICAL: must answer ≤10 sec) ──
    if (update.pre_checkout_query) {
      await handlePreCheckoutQuery({ db, query: update.pre_checkout_query });
      return res.status(200).end();
    }

    // ── successful_payment ──
    if (update.message?.successful_payment) {
      const result = handleSuccessfulPayment({ db, message: update.message, source: 'webhook' });
      if (!result.ok && result.error !== 'amount_mismatch') {
        // Что-то пошло не так на нашей стороне — возвращаем 500 чтобы TG ретраил.
        // amount_mismatch — это уже залогировано, ретрай не поможет.
        console.error('[webhook] successful_payment failed:', result);
        return res.status(500).end();
      }
      return res.status(200).end();
    }

    // ── refunded_payment (Bot API 8.0+) ──
    if (update.message?.refunded_payment) {
      handleRefundedPayment({ db, message: update.message });
      return res.status(200).end();
    }

    // ── my_chat_member (юзер заблокировал бота) ──
    // На старте просто логируем (без PII).
    if (update.my_chat_member) {
      const status = update.my_chat_member?.new_chat_member?.status;
      // eslint-disable-next-line no-console
      console.info('[webhook] my_chat_member status:', status);
      return res.status(200).end();
    }

    // ── /start и /paysupport команды (TG TOS требование) ──
    const text = update.message?.text;
    const chatId = update.message?.chat?.id;
    if (text && chatId) {
      if (text.startsWith('/paysupport')) {
        // TG TOS для платных ботов: команда /paysupport ОБЯЗАТЕЛЬНА.
        const { sendMessage: sendBotMessage } = await import('./bot-api.js');
        const supportContact = process.env.SUPPORT_CONTACT || process.env.BOT_USERNAME || 'support';
        sendBotMessage({
          chatId,
          text:
            `💳 <b>Поддержка по платежам — Интерстеллар</b>\n\n` +
            `Тарифы:\n` +
            `• Basic — 199 ⭐ / мес (50 сообщений в день)\n` +
            `• Premium — 499 ⭐ / мес (200 сообщений + 18+)\n` +
            `• Day Pass — 50 ⭐ разово (24h без лимита)\n\n` +
            `Если что-то пошло не так:\n\n` +
            `1️⃣ <b>Подписка не активировалась</b> — подожди 5 минут (webhook от Telegram может задержаться) и перезайди в приложение через Menu Button.\n\n` +
            `2️⃣ <b>Списали Stars, но подписки нет</b> — пришли скриншот платежа (Settings → Stars and Subscriptions → History) на @${supportContact}.\n\n` +
            `3️⃣ <b>Хочешь возврат</b> — по ЗоЗПП ст.32 ты вправе отказаться от подписки. Напиши @${supportContact} с указанием user_id, и мы вернём Stars на твой баланс.\n\n` +
            `4️⃣ <b>Отмена автопродления</b> — Telegram Settings → Stars and Subscriptions → выбери «Интерстеллар» → Cancel Subscription.\n\n` +
            `5️⃣ <b>Day Pass возврату не подлежит</b> после начала использования (цифровой контент, ПП РФ № 55).\n\n` +
            `Все условия — в разделе «Юридические документы» приложения.`,
        });
        return res.status(200).end();
      }
      if (text === '/start' || text?.startsWith('/start ')) {
        const { sendMessage: sendBotMessage } = await import('./bot-api.js');
        const botUsername = process.env.BOT_USERNAME || 'InterstellarBot';
        const appName = process.env.BOT_APP_NAME || 'app';
        const webAppUrl = `https://t.me/${botUsername}/${appName}`;

        // first_name юзера — для персонализации (если есть)
        const firstName = update.message?.from?.first_name?.trim() || 'друг';

        sendBotMessage({
          chatId,
          text:
            `<b>Привет, ${firstName}!</b> ✨\n\n` +
            `Это <b>Интерстеллар</b> — твой портал в разговоры с великими людьми всех времён.\n\n` +
            `🧠 <b>Зигмунд Фрейд</b> — расскажет про сны и подсознание\n` +
            `⚡ <b>Альберт Эйнштейн</b> — о вселенной простыми словами\n` +
            `👑 <b>Клеопатра</b> — про власть, любовь и Египет\n` +
            `📖 <b>Достоевский, Ницше, Тесла...</b> — и ещё 50+ персонажей\n\n` +
            `🎁 Первые <b>10 сообщений — бесплатно</b>.\n\n` +
            `Жми кнопку ниже, чтобы начать ↓`,
          replyMarkup: {
            inline_keyboard: [
              // Открыть Mini App через t.me — единая точка входа.
              // Раньше тут был хардкод https://interstellar-2s4.pages.dev —
              // preview-домен CF Pages, который мог быть пересоздан/удалён
              // в любой момент → все новые юзеры улетали бы в никуда.
              // Теперь через t.me/$bot/$app — линк управляется в BotFather.
              [{ text: '🚀 Открыть приложение', url: webAppUrl }],
              [{ text: '💎 Тарифы и подписка', url: webAppUrl }],
            ],
          },
        });
        return res.status(200).end();
      }

      // /help — краткая помощь
      if (text === '/help') {
        const { sendMessage: sendBotMessage } = await import('./bot-api.js');
        const botUsername = process.env.BOT_USERNAME || 'InterstellarBot';
        const appName = process.env.BOT_APP_NAME || 'app';
        sendBotMessage({
          chatId,
          text:
            `<b>Команды Интерстеллар</b>\n\n` +
            `/start — приветствие и кнопка запуска\n` +
            `/help — эта подсказка\n` +
            `/paysupport — помощь по платежам и возвратам\n\n` +
            `Чтобы начать общение с персонажами — открой Mini App через меню снизу ⬇️\n` +
            `Или по ссылке: https://t.me/${botUsername}/${appName}`,
        });
        return res.status(200).end();
      }
    }

    // Другие типы обновлений — игнорируем без ошибки.
    return res.status(200).end();
  } catch (err) {
    console.error('[webhook] handler crashed:', err);
    return res.status(500).end();
  }
});

// ─── admin: manual payment recovery ────────────────────────────────────
// Последняя инстанция: юзер прислал скрин платежа, webhook+reconcile не
// сработали. Админ вручную создаёт payment-запись и активирует подписку.
app.post(
  '/api/v1/admin/payments/recover',
  requireAuth,
  roleLoader,
  requireRole(['admin']),
  requireConfirmAction(),
  (req, res) => {
    const { user_id, charge_id, amount_stars, payload } = req.body || {};
    if (!Number.isFinite(user_id) || !charge_id || !Number.isFinite(amount_stars)) {
      return res.status(400).json({ ok: false, error: 'BAD_INPUT' });
    }
    const result = manualRecoverPayment({
      db,
      adminId: req.tgUser.telegram_user_id,
      userId: user_id,
      chargeId: charge_id,
      amountStars: amount_stars,
      payload: payload || null,
    });
    if (!result.ok) {
      return res.status(409).json(result);
    }
    res.json(result);
  },
);

// ─── admin: trigger reconciliation manually ────────────────────────────
app.post(
  '/api/v1/admin/payments/reconcile',
  requireAuth,
  roleLoader,
  requireRole(['admin']),
  async (_req, res) => {
    try {
      const result = await reconcileMissingPayments({ db });
      res.json({ ok: true, ...result });
    } catch (err) {
      console.error('[admin] reconcile failed:', err);
      res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
    }
  },
);

// ─── admin: helper для shared mw + ip/ua extraction ─────────────────────
function adminContext(req) {
  return {
    adminId: req.tgUser.telegram_user_id,
    ip: req.ip || null,
    userAgent: req.header('user-agent') || null,
    requestId: req.header('x-request-id') || null,
  };
}

const requireAdmin = [requireAuth, roleLoader, requireRole(['admin'])];
// ── C4: requireFreshAuth ──
// Destructive admin-операции дополнительно требуют initData возрастом ≤ 1h.
// Это снижает окно эксплуатации перехваченного initData с 24h до 1h.
const requireAdminConfirm = [...requireAdmin, requireFreshAuth(3600), requireConfirmAction()];

// ─── admin: users (search) ──────────────────────────────────────────────
app.get('/api/v1/admin/users', ...requireAdmin, (req, res) => {
  try {
    const result = adminListUsers({
      db,
      search: typeof req.query.q === 'string' ? req.query.q : undefined,
      hasSubscription:
        req.query.has_subscription === 'true' ? true : req.query.has_subscription === 'false' ? false : undefined,
      attributionSlug: typeof req.query.attribution_slug === 'string' ? req.query.attribution_slug : undefined,
      limit: Number(req.query.limit) || 50,
      offset: Number(req.query.offset) || 0,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[admin] listUsers failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

// ─── admin: partners ────────────────────────────────────────────────────
app.get('/api/v1/admin/partners', ...requireAdmin, (req, res) => {
  try {
    const result = listPartners({
      db,
      status: typeof req.query.status === 'string' ? req.query.status : 'all',
      limit: Number(req.query.limit) || 100,
      offset: Number(req.query.offset) || 0,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[admin] listPartners failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.get('/api/v1/admin/partners/:id', ...requireAdmin, (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isFinite(targetId)) return res.status(400).json({ ok: false, error: 'BAD_ID' });
  const partner = getPartner({ db, telegramUserId: targetId });
  if (!partner) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  res.json({ ok: true, partner });
});

app.post('/api/v1/admin/partners', ...requireAdminConfirm, (req, res) => {
  try {
    const { target_user_id, blogger_slug, revenue_share_bps, notes } = req.body || {};
    const result = grantPartner({
      db,
      ...adminContext(req),
      targetUserId: Number(target_user_id),
      bloggerSlug: blogger_slug,
      revenueShareBps: Number.isFinite(Number(revenue_share_bps)) ? Number(revenue_share_bps) : 5000,
      notes: notes ?? null,
    });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[admin] grantPartner failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.patch('/api/v1/admin/partners/:id', ...requireAdminConfirm, (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isFinite(targetId)) return res.status(400).json({ ok: false, error: 'BAD_ID' });
  try {
    const { blogger_slug, revenue_share_bps, notes } = req.body || {};
    const result = updatePartner({
      db,
      ...adminContext(req),
      targetUserId: targetId,
      bloggerSlug: blogger_slug,
      revenueShareBps: revenue_share_bps !== undefined ? Number(revenue_share_bps) : undefined,
      notes,
    });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[admin] updatePartner failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.post('/api/v1/admin/partners/:id/revoke', ...requireAdminConfirm, (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isFinite(targetId)) return res.status(400).json({ ok: false, error: 'BAD_ID' });
  try {
    const result = revokePartner({
      db,
      ...adminContext(req),
      targetUserId: targetId,
      reason: req.body?.reason,
    });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[admin] revokePartner failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

// ─── admin: payouts ─────────────────────────────────────────────────────
app.get('/api/v1/admin/payouts', ...requireAdmin, (req, res) => {
  try {
    const result = listPayouts({
      db,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      limit: Number(req.query.limit) || 100,
      offset: Number(req.query.offset) || 0,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[admin] listPayouts failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.post('/api/v1/admin/payouts/:id/approve', ...requireAdminConfirm, (req, res) => {
  const payoutId = Number(req.params.id);
  if (!Number.isFinite(payoutId)) return res.status(400).json({ ok: false, error: 'BAD_ID' });
  try {
    const result = approvePayout({ db, ...adminContext(req), payoutId });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[admin] approvePayout failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.post('/api/v1/admin/payouts/:id/mark-paid', ...requireAdminConfirm, (req, res) => {
  const payoutId = Number(req.params.id);
  if (!Number.isFinite(payoutId)) return res.status(400).json({ ok: false, error: 'BAD_ID' });
  try {
    const result = markPayoutPaid({
      db,
      ...adminContext(req),
      payoutId,
      externalRef: req.body?.external_ref,
      amountRub: Number(req.body?.amount_rub),
    });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[admin] markPayoutPaid failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.post('/api/v1/admin/payouts/:id/reject', ...requireAdminConfirm, (req, res) => {
  const payoutId = Number(req.params.id);
  if (!Number.isFinite(payoutId)) return res.status(400).json({ ok: false, error: 'BAD_ID' });
  try {
    const result = rejectPayout({
      db,
      ...adminContext(req),
      payoutId,
      reason: req.body?.reason,
    });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[admin] rejectPayout failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

// ─── partner endpoints ──────────────────────────────────────────────────
const requirePartner = [requireAuth, roleLoader, requireRole(['partner'])];
// Partner-destructive (PATCH profile, POST payout) — тоже требуем свежий
// initData ≤ 1h. Partner-чтение остаётся на стандартном 24h TTL.
const requirePartnerConfirm = [...requirePartner, requireFreshAuth(3600), requireConfirmAction()];

function partnerContext(req) {
  return {
    partnerUserId: req.tgUser.telegram_user_id,
    ip: req.ip || null,
    userAgent: req.header('user-agent') || null,
    requestId: req.header('x-request-id') || null,
  };
}

app.get('/api/v1/partner/summary', ...requirePartner, (req, res) => {
  try {
    const summary = getPartnerSummary({
      db,
      partnerUserId: req.tgUser.telegram_user_id,
      businessInn: process.env.BUSINESS_INN,
      businessName: process.env.BUSINESS_NAME,
    });
    if (!summary) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    res.json({ ok: true, summary });
  } catch (err) {
    console.error('[partner] summary failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.get('/api/v1/partner/profile', ...requirePartner, (req, res) => {
  try {
    const profile = getPartnerProfile({ db, partnerUserId: req.tgUser.telegram_user_id });
    if (!profile) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    res.json({ ok: true, profile });
  } catch (err) {
    console.error('[partner] profile failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.patch('/api/v1/partner/profile', ...requirePartnerConfirm, (req, res) => {
  try {
    const result = updatePartnerProfile({
      db,
      ...partnerContext(req),
      ...(req.body || {}),
    });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[partner] update profile failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.get('/api/v1/partner/payouts', ...requirePartner, (req, res) => {
  try {
    const result = listPartnerPayouts({
      db,
      partnerUserId: req.tgUser.telegram_user_id,
      limit: Number(req.query.limit) || 50,
      offset: Number(req.query.offset) || 0,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[partner] list payouts failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

app.post(
  '/api/v1/partner/payouts',
  ...requirePartnerConfirm,
  rateLimit({ bucket: 'partner_payout_request', windowMs: 60_000, max: 3 }),
  (req, res) => {
    try {
      const result = createPartnerPayout({
        db,
        ...partnerContext(req),
        amountStars: req.body?.amount_stars ? Number(req.body.amount_stars) : undefined,
      });
      if (!result.ok) return res.status(400).json(result);
      res.json(result);
    } catch (err) {
      console.error('[partner] create payout failed:', err);
      res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
    }
  },
);

app.patch('/api/v1/partner/payouts/:id/receipt', ...requirePartnerConfirm, (req, res) => {
  const payoutId = Number(req.params.id);
  if (!Number.isFinite(payoutId)) return res.status(400).json({ ok: false, error: 'BAD_ID' });
  try {
    const result = uploadPayoutReceipt({
      db,
      ...partnerContext(req),
      payoutId,
      receiptNumber: req.body?.receipt_number,
    });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('[partner] upload receipt failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

// ─── admin: audit ───────────────────────────────────────────────────────
app.get('/api/v1/admin/audit', ...requireAdmin, (req, res) => {
  try {
    const result = listAudit({
      db,
      action: typeof req.query.action === 'string' ? req.query.action : undefined,
      targetUserId: req.query.target_user_id ? Number(req.query.target_user_id) : undefined,
      actorUserId: req.query.actor_user_id ? Number(req.query.actor_user_id) : undefined,
      limit: Number(req.query.limit) || 100,
      offset: Number(req.query.offset) || 0,
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[admin] listAudit failed:', err);
    res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  }
});

// ─── chat: stateless прокси к polza.ai ────────────────────────────────────
// C2 (security audit): /chat ТЕПЕРЬ требует requireAuth + rate-limit.
// До этого был открыт миру — атакующий мог жечь polza.ai-кредиты бесплатно.
// Server-side daily-limit (30 msg/day для free) — TODO в Phase 4.G полировке
// (нужна отдельная таблица chat_usage; сейчас rate-limit 30/min — этого
// достаточно чтобы остановить burn-атаку, нормальное использование <10/min).
app.post(
  '/api/v1/chat',
  requireAuth,
  rateLimit({ bucket: 'chat', windowMs: 60_000, max: 30 }),
  async (req, res) => {
    // ── Server-side tier-based limit ──
    // Free: 10 сообщений ПОЖИЗНЕННО (one-shot, anti-abuse).
    // Basic: 50/day. Premium: 200/day. Day Pass — снимает дневной лимит на 24h.
    // Атомарная check+increment защищает от race.
    const userId = req.tgUser.telegram_user_id;
    // Идемпотентно создаём юзера ДО check+increment.
    // Без этого UPDATE users SET free_messages_used... вернёт 0 affected rows
    // если юзер ещё не написал /users/me — счётчик не инкрементится.
    upsertUser(db, req.tgUser);
    const usage = checkAndIncrementChatUsage(db, userId);
    if (!usage.ok) {
      // Для free вместо 'DAILY' возвращаем 'LIFETIME' — фронт показывает
      // правильную копию в paywall: «10 бесплатных закончились» vs «лимит дня».
      const errorCode = usage.tier === 'free'
        ? 'LIFETIME_LIMIT_EXCEEDED'
        : 'DAILY_LIMIT_EXCEEDED';
      return res.status(429).json({
        ok: false,
        error: errorCode,
        tier: usage.tier,
        count: usage.count,
        limit: usage.limit,
      });
    }
    // tier и has_day_pass передаём в history-trim ниже.
    const tier = usage.tier;

  const { persona, messages } = req.body || {};

  if (typeof persona !== 'string' || !persona.trim()) {
    return res.status(400).json({ ok: false, error: 'BAD_PERSONA' });
  }
  if (persona.length > MAX_PERSONA_LEN) {
    return res.status(400).json({ ok: false, error: 'PERSONA_TOO_LONG' });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ ok: false, error: 'BAD_MESSAGES' });
  }
  if (messages.length > MAX_HISTORY) {
    return res.status(400).json({ ok: false, error: 'HISTORY_TOO_LONG' });
  }

  // ── Sliding window: keep последние N сообщений (per-tier) ──
  // Persona всегда отправляем (кэшируется через x-grok-conv-id ниже).
  // Free: 5, Basic: 15, Premium: 30. Чем выше тир — тем глубже память.
  const windowSize = TIER_HISTORY_WINDOW[tier] ?? HISTORY_TRIM_TO;
  const trimmedMessages = messages.length > windowSize
    ? messages.slice(-windowSize)
    : messages;

  const aiMessages = [
    { role: 'system', content: persona },
    ...trimmedMessages.map((m) => {
      const role = m?.role === 'user' ? 'user' : 'assistant';
      const content = String(m?.content ?? '').slice(0, MAX_MSG_LEN);
      return { role, content };
    }),
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // ── Prompt caching ──
  // OpenAI (gpt-4o-mini): автоматический кэш на input > 1024 tokens, никакого
  // заголовка не требуется. Кэш определяется по совпадению префикса prompt'а.
  // Поскольку у нас persona (system) первая, и потом sliding window истории,
  // совпадающий префикс между запросами одного диалога = cache hit.
  // 50% off на cached input. Free benefit, не требует архитектурных изменений.
  // См. https://platform.openai.com/docs/guides/prompt-caching
  //
  // Если в будущем вернёмся на xAI/Grok — передаём 'x-grok-conv-id'
  // (hash от persona) для их manual prompt caching (75% off).
  const convId = crypto
    .createHash('sha256')
    .update(persona)
    .digest('hex')
    .slice(0, 32);

  // Retry-логика. polza.ai (как любой proxy-провайдер) периодически
  // отдаёт 502/503 на transient flake. Без retry юзер видит «нейросеть
  // недоступна» при обычном hiccup'е. С retry — большинство мерцаний
  // лечатся прозрачно (полная задержка ≈ 350+750 мс в худшем случае).
  const POLZA_RETRY_DELAYS = [350, 750]; // 2 retries; первая попытка + 2 retry = 3
  const bodyJson = JSON.stringify({
    model: MODEL,
    messages: aiMessages,
    // 0.75 — баланс между живостью и контролем. Слишком высокая
    // (>0.85) гонит модель в «литературщину», низкая (<0.6) сушит речь.
    temperature: 0.75,
    max_tokens: LLM_MAX_OUTPUT_TOKENS,
    // 0.2/0.1 — мягкие penalty, гонят зачины-шаблоны но не ломают речь.
    frequency_penalty: 0.2,
    presence_penalty: 0.1,
  });

  let upstream;
  let lastError = '';
  let lastStatus = 0;
  try {
    for (let attempt = 0; attempt <= POLZA_RETRY_DELAYS.length; attempt++) {
      try {
        upstream = await fetch(POLZA_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${POLZA_KEY}`,
            'Content-Type': 'application/json',
            'x-grok-conv-id': convId,
          },
          body: bodyJson,
          signal: controller.signal,
        });
        // Retry-able: только 5xx и 429 (rate-limit на upstream).
        // 4xx (кроме 429) = клиентская ошибка → нет смысла retry'ить.
        if (upstream.ok || (upstream.status < 500 && upstream.status !== 429)) {
          break;
        }
        lastStatus = upstream.status;
        lastError = await upstream.text().catch(() => '');
        console.warn(`[polza] retry ${attempt + 1}/${POLZA_RETRY_DELAYS.length + 1}, status=${upstream.status}`);
      } catch (fetchErr) {
        // Network error — тоже retry'абельно (TCP reset, DNS hiccup).
        // AbortError (наш timeout) — кидаем дальше, retry не имеет смысла.
        if (fetchErr?.name === 'AbortError') throw fetchErr;
        lastError = String(fetchErr);
        console.warn(`[polza] network err retry ${attempt + 1}: ${fetchErr.message}`);
      }
      if (attempt < POLZA_RETRY_DELAYS.length) {
        await new Promise((r) => setTimeout(r, POLZA_RETRY_DELAYS[attempt]));
      }
    }

    if (!upstream || !upstream.ok) {
      console.error('[polza] upstream error after retries', lastStatus, lastError.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'UPSTREAM_ERROR', status: lastStatus });
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      console.error('[polza] empty content in response', JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ ok: false, error: 'EMPTY_RESPONSE' });
    }

    return res.json({ ok: true, response: content });
  } catch (err) {
    if (err?.name === 'AbortError') {
      return res.status(504).json({ ok: false, error: 'TIMEOUT' });
    }
    console.error('[chat] internal error', err);
    return res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
  } finally {
    clearTimeout(timer);
  }
  },
);

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'NOT_FOUND' });
});

const server = app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
  console.log(`[backend] model:    ${MODEL}`);
  console.log(`[backend] upstream: ${POLZA_API_URL}`);
  console.log(`[backend] db:       ${DB_PATH}`);
  console.log(`[backend] auth:     ${DEV_BYPASS ? 'DEV bypass' : 'BOT_TOKEN HMAC'}`);
  console.log(
    `[backend] webhook:  ${
      TELEGRAM_WEBHOOK_SECRET ? 'enabled (secret configured)' : 'DISABLED — set TELEGRAM_WEBHOOK_SECRET'
    }`,
  );
});

// ─── Graceful shutdown ──────────────────────────────────────────────────
// При systemctl restart/stop systemd шлёт SIGTERM. Без обработчика Node
// просто умирает, обрывая in-flight /chat (60s timeout) → юзеры видят
// сбой. С graceful: даём текущим запросам доработать, потом закрываем
// listener + БД.
let shuttingDown = false;
function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[backend] received ${signal}, shutting down gracefully...`);

  // Перестаём принимать новые соединения. Существующие — даём доработать.
  server.close(() => {
    console.log('[backend] HTTP server closed');
    try {
      db.close();
      console.log('[backend] DB closed');
    } catch (err) {
      console.error('[backend] DB close error', err);
    }
    process.exit(0);
  });

  // Hard-exit через 30 сек если кто-то завис (защита от вечной висимости).
  // systemd TimeoutStopSec по дефолту 90s, так что 30s даёт буфер.
  setTimeout(() => {
    console.error('[backend] graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 30_000).unref();
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── Reconciliation cron ───────────────────────────────────────────────
// Каждые N минут догоняем потерянные webhook'и через getStarTransactions.
// Запускается только если BOT_TOKEN настроен (без токена нет TG API доступа).
if (BOT_TOKEN && !DEV_BYPASS) {
  const intervalMs = RECONCILE_INTERVAL_MIN * 60 * 1000;
  console.log(`[backend] reconcile: every ${RECONCILE_INTERVAL_MIN}min`);

  // Первый прогон через 30 сек после старта (дать серверу прогреться).
  setTimeout(() => {
    reconcileMissingPayments({ db }).catch((err) => {
      console.warn('[reconcile] initial run failed:', err.message);
    });
  }, 30_000);

  setInterval(() => {
    reconcileMissingPayments({ db }).catch((err) => {
      console.warn('[reconcile] cron run failed:', err.message);
    });
  }, intervalMs);
} else {
  console.log('[backend] reconcile: DISABLED (no BOT_TOKEN or DEV bypass active)');
}

// ─── YooKassa: cron автопродления ──────────────────────────────────────
// Каждый час проверяем подписки которые истекают в течение 24h и имеют
// auto_renew=1 + сохранённый payment_method_id. Делаем recurring-платёж
// через ЮК → webhook payment.succeeded → продление на 30 дней.
// Запускается только если ЮК сконфигурирована.
if (isYkEnabled()) {
  const YK_RENEW_INTERVAL_MS = 60 * 60 * 1000; // каждый час
  console.log('[backend] yk-renewal: every 60min');

  // Первый прогон через 5 минут после старта
  setTimeout(() => {
    renewSubscriptionsCron({ db }).catch((err) => {
      console.error('[yk-cron] initial run failed:', err);
    });
  }, 5 * 60 * 1000);

  setInterval(() => {
    renewSubscriptionsCron({ db }).catch((err) => {
      console.error('[yk-cron] cron run failed:', err);
    });
  }, YK_RENEW_INTERVAL_MS);
}
