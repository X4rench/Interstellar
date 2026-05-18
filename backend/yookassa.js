/**
 * Клиент API ЮКассы (v3).
 * Документация: https://yookassa.ru/developers/api
 *
 * Auth: HTTP Basic с парой ShopID:SecretKey.
 * Endpoint: https://api.yookassa.ru/v3
 * Идемпотентность: ВСЕ POST/DELETE требуют header `Idempotence-Key` (UUID).
 *
 * Поток рекуррентного платежа:
 *   1. Первый платёж: createPayment({ save_payment_method: true, ... })
 *      → ЮК возвращает confirmation.confirmation_url для редиректа юзера
 *      → юзер оплачивает → webhook payment.succeeded
 *      → в webhook: payment.payment_method.id + payment.payment_method.saved === true
 *   2. Сохраняем payment_method.id в БД (привязан к юзеру)
 *   3. Каждые 30 дней: createPayment({ payment_method_id: '...', confirmation: undefined })
 *      → автосписание без участия юзера (если у него карта валидна)
 *      → webhook payment.succeeded / payment.canceled (карта недействительна)
 *
 * IP-whitelist для webhook'ов от ЮКассы (важно проверять в /yookassa-webhook):
 *   185.71.76.0/27, 185.71.77.0/27, 77.75.153.0/25, 77.75.154.128/25,
 *   77.75.156.11, 77.75.156.35, 2a02:5180::/32
 * Источник: https://yookassa.ru/developers/using-api/webhooks#ip
 */

import crypto from 'node:crypto';

const YK_API_BASE = 'https://api.yookassa.ru/v3';
const YK_TIMEOUT_MS = 15_000;

const SHOP_ID = process.env.YK_SHOP_ID || '';
const SECRET_KEY = process.env.YK_SECRET_KEY || '';
const IS_TEST = SECRET_KEY.startsWith('test_');

if (SHOP_ID && SECRET_KEY) {
  console.log(`[yk] enabled, mode=${IS_TEST ? 'TEST' : 'LIVE'}, shop=${SHOP_ID}`);
} else {
  console.log('[yk] disabled — YK_SHOP_ID/YK_SECRET_KEY not set');
}

/** Простая проверка что клиент сконфигурирован. */
export function isYkEnabled() {
  return Boolean(SHOP_ID && SECRET_KEY);
}

/** Возвращает 'test' | 'live' — для логов и UI-индикации. */
export function ykMode() {
  return IS_TEST ? 'test' : 'live';
}

/** Кидаемое из всех публичных функций при ошибке. */
export class YkError extends Error {
  constructor(httpStatus, ykCode, ykDescription, message) {
    super(message || `YK ${httpStatus} ${ykCode}: ${ykDescription}`);
    this.name = 'YkError';
    this.httpStatus = httpStatus;
    this.ykCode = ykCode;
    this.ykDescription = ykDescription;
  }
}

/**
 * Базовый запрос к ЮК с Basic-auth, idempotence-key, timeout.
 */
async function ykRequest(method, path, body, idempotenceKey) {
  if (!isYkEnabled()) {
    throw new YkError(0, 'NOT_CONFIGURED', 'YK_SHOP_ID/YK_SECRET_KEY missing');
  }

  const headers = {
    Authorization: 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64'),
    'Content-Type': 'application/json',
  };
  if (method !== 'GET' && idempotenceKey) {
    headers['Idempotence-Key'] = idempotenceKey;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), YK_TIMEOUT_MS);

  try {
    const resp = await fetch(`${YK_API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await resp.json();
    } catch {
      /* не JSON */
    }

    if (!resp.ok) {
      const code = data?.code || `HTTP_${resp.status}`;
      const desc = data?.description || resp.statusText || 'unknown';
      console.error(`[yk] ${method} ${path} → ${resp.status} ${code}: ${desc}`);
      throw new YkError(resp.status, code, desc);
    }

    return data;
  } catch (err) {
    if (err instanceof YkError) throw err;
    if (err.name === 'AbortError') {
      throw new YkError(0, 'TIMEOUT', `request timeout after ${YK_TIMEOUT_MS}ms`);
    }
    throw new YkError(0, 'NETWORK', String(err?.message || err));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Создаёт первый платёж с возможностью сохранить способ оплаты для авто-
 * продлений. Возвращает payment-объект с confirmation_url, куда нужно
 * перенаправить юзера.
 *
 * @param {object} args
 * @param {number} args.amountRub — целое число рублей (внутри умножим на 100)
 * @param {string} args.description — что покупает юзер (показывается в чеке)
 * @param {string} args.returnUrl — куда вернуться после оплаты (наш фронт)
 * @param {boolean} [args.savePaymentMethod=false] — для recurring подписок
 * @param {object} [args.metadata] — kv-данные, прилетят обратно в webhook
 * @param {object} [args.receipt] — для 54-ФЗ (опционально на самозанятом до 5М)
 */
export async function createPayment({
  amountRub,
  description,
  returnUrl,
  savePaymentMethod = false,
  metadata,
  receipt,
}) {
  const idempotenceKey = crypto.randomUUID();
  const body = {
    amount: {
      // ЮК принимает сумму как строку с десятичными копейками: "300.00"
      value: amountRub.toFixed(2),
      currency: 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: returnUrl,
    },
    description: description.slice(0, 128),
    save_payment_method: savePaymentMethod,
    ...(metadata && { metadata }),
    ...(receipt && { receipt }),
  };
  return ykRequest('POST', '/payments', body, idempotenceKey);
}

/**
 * Автоплатёж по сохранённому способу оплаты (recurring).
 * Используется в cron для продления подписок.
 *
 * Возвращает payment-объект сразу со status 'succeeded' (синхронное списание)
 * либо 'pending' (3DS challenge — редкий случай для recurring).
 */
export async function createRecurringPayment({
  amountRub,
  description,
  paymentMethodId,
  metadata,
  receipt,
}) {
  const idempotenceKey = crypto.randomUUID();
  const body = {
    amount: {
      value: amountRub.toFixed(2),
      currency: 'RUB',
    },
    payment_method_id: paymentMethodId,
    capture: true,
    description: description.slice(0, 128),
    ...(metadata && { metadata }),
    ...(receipt && { receipt }),
  };
  return ykRequest('POST', '/payments', body, idempotenceKey);
}

/** Получить текущий статус платежа (poll'ить пока succeeded/canceled). */
export async function getPayment(paymentId) {
  return ykRequest('GET', `/payments/${encodeURIComponent(paymentId)}`);
}

/**
 * Полный или частичный refund.
 * Refund запускает event refund.succeeded в webhook.
 */
export async function refundPayment({ paymentId, amountRub, reason }) {
  const idempotenceKey = crypto.randomUUID();
  const body = {
    payment_id: paymentId,
    amount: {
      value: amountRub.toFixed(2),
      currency: 'RUB',
    },
    ...(reason && { description: reason.slice(0, 250) }),
  };
  return ykRequest('POST', '/refunds', body, idempotenceKey);
}

/**
 * Проверяет что webhook пришёл с IP-адреса ЮКассы (защита от форджа).
 * Список IP документирован: https://yookassa.ru/developers/using-api/webhooks#ip
 *
 * Если за CF/nginx — нужен правильный TRUST_PROXY_HOPS и req.ip даст
 * настоящий remoteAddr из X-Forwarded-For.
 */
const YK_IP_WHITELIST = [
  // IPv4 CIDR блоки
  { net: '185.71.76.0',  bits: 27 },
  { net: '185.71.77.0',  bits: 27 },
  { net: '77.75.153.0',  bits: 25 },
  { net: '77.75.154.128', bits: 25 },
  // Точечные IP
  { net: '77.75.156.11',  bits: 32 },
  { net: '77.75.156.35',  bits: 32 },
];

function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

export function isYkIp(ip) {
  // Snip IPv6-mapped IPv4 (например ::ffff:185.71.76.1)
  const cleanIp = ip?.startsWith('::ffff:') ? ip.slice(7) : ip;
  if (!cleanIp || !/^\d+\.\d+\.\d+\.\d+$/.test(cleanIp)) return false;
  const ipInt = ipv4ToInt(cleanIp);
  for (const { net, bits } of YK_IP_WHITELIST) {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    if ((ipInt & mask) === (ipv4ToInt(net) & mask)) return true;
  }
  return false;
}
