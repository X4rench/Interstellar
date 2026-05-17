/**
 * Wrapper над Telegram Bot API. Все вызовы к api.telegram.org идут только
 * через этот модуль — централизация для:
 *   - единого error-handling (TgApiError с кодом + описанием)
 *   - timeout (30 сек на запрос)
 *   - HTML-escape для интерполяций (защита от admin-инъекций в parse_mode=HTML)
 *   - логирования и (в будущем) метрик
 *
 * BOT_TOKEN читается лениво — модуль может быть импортирован до конфига .env.
 */

/**
 * Escape HTML-spec символов для безопасной интерполяции в parse_mode=HTML.
 * Без этого admin может вписать в reason/notes/external_ref строку с
 * `<a href="phishing">` и отправить юзеру через sendMessage. TG honours
 * только ограниченный набор тегов (b, i, u, s, code, pre, a) — но и этого
 * достаточно для phishing-ссылок.
 *
 * Используется в callsites где user/admin input идёт в HTML-template.
 * Для статичных строк escape не требуется.
 */
export function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const TG_API_TIMEOUT_MS = 30_000;

export class TgApiError extends Error {
  constructor(method, code, description) {
    super(`TG API ${method} failed (${code}): ${description}`);
    this.name = 'TgApiError';
    this.method = method;
    this.code = code;
    this.description = description;
  }
}

function getBotToken() {
  const t = process.env.BOT_TOKEN;
  if (!t) throw new Error('[bot-api] BOT_TOKEN not set');
  return t;
}

// ─── Прокси для обхода блокировок (если api.telegram.org заблокирован) ──
// На РФ-хостинге РКН периодически блокирует подсеть к api.telegram.org.
// Если задана `TG_API_PROXY` — все запросы идут через указанный прокси.
//
// Поддерживаемые форматы:
//   http://user:pass@proxy.example.com:8080   — HTTP-прокси
//   https://user:pass@proxy.example.com:443   — HTTPS-прокси (рекомендую)
//   socks5://user:pass@proxy.example.com:1080 — SOCKS5 (требует undici 6+)
//
// Включается без рестарта кода — только env-переменная и restart процесса.
// undici (поставляется с Node 22+) поддерживает ProxyAgent нативно.
//
// Альтернатива (более стабильная при частых блокировках): запустить
// `telegram-bot-api` local server рядом с бэком и задать
// TG_API_BASE_URL=http://localhost:8081 — тогда вообще не зависим от
// api.telegram.org, ходим в MTProto через свой DC95.
let cachedDispatcher = null;
async function getTgDispatcher() {
  const proxyUrl = process.env.TG_API_PROXY;
  if (!proxyUrl) return null;
  if (cachedDispatcher) return cachedDispatcher;
  try {
    const { ProxyAgent } = await import('undici');
    cachedDispatcher = new ProxyAgent(proxyUrl);
    // eslint-disable-next-line no-console
    console.log('[bot-api] Using proxy:', proxyUrl.replace(/\/\/.*@/, '//***:***@'));
    return cachedDispatcher;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[bot-api] Failed to setup proxy:', err.message);
    return null;
  }
}

function getTgApiBaseUrl() {
  // Альтернативный кастомный telegram-bot-api сервер.
  // По умолчанию официальный api.telegram.org.
  const base = process.env.TG_API_BASE_URL || 'https://api.telegram.org';
  return base.replace(/\/$/, '');
}

async function tgCall(method, params = {}) {
  const token = getBotToken();
  const url = `${getTgApiBaseUrl()}/bot${token}/${method}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TG_API_TIMEOUT_MS);

  try {
    const dispatcher = await getTgDispatcher();
    const fetchOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    };
    if (dispatcher) fetchOpts.dispatcher = dispatcher;

    const res = await fetch(url, fetchOpts);
    const data = await res.json();
    if (!data.ok) {
      throw new TgApiError(method, data.error_code, data.description || 'unknown');
    }
    return data.result;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new TgApiError(method, 0, `timeout after ${TG_API_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Invoice / payments ─────────────────────────────────────────────────

/**
 * Создаёт ссылку на Stars-инвойс (subscription).
 *
 * @param params:
 *   title              — отображается юзеру в нативном invoice-окне TG
 *   description        — пояснение
 *   payload            — НАШ внутренний идентификатор (1-128 байт). НЕ
 *                        раскрываем юзеру; используем для биндинга платежа.
 *   amountStars        — сумма в Stars (XTR)
 *   subscriptionPeriodSec — для recurring; для Stars-подписки строго 2592000 (30 дней)
 *
 * @returns строка `t.me/$...` — это URL для WebApp.openInvoice()
 */
export async function createInvoiceLink({
  title,
  description,
  payload,
  amountStars,
  subscriptionPeriodSec = 2592000,
}) {
  return await tgCall('createInvoiceLink', {
    title,
    description,
    payload,
    provider_token: '',                          // пусто для Stars
    currency: 'XTR',
    prices: [{ label: 'Pro подписка', amount: amountStars }],
    subscription_period: subscriptionPeriodSec,
    // Дополнительные поля — не нужны для Stars:
    //   max_tip_amount, suggested_tip_amounts, start_parameter,
    //   provider_data, photo_url, photo_size, photo_width, photo_height,
    //   need_name/phone/email/shipping_address, is_flexible
  });
}

/**
 * Отвечает на pre_checkout_query. ОБЯЗАТЕЛЬНО вызвать в течение 10 секунд
 * после получения update.pre_checkout_query, иначе TG отменит платёж.
 *
 * Для Stars-инвойса логика всегда: ok=true (никакой инвентори-проверки нет).
 * Отказываем только если знаем, что юзер забанен в нашем приложении
 * (на старте — не блокируем никого).
 */
export async function answerPreCheckoutQuery({ queryId, ok = true, errorMessage }) {
  const params = { pre_checkout_query_id: queryId, ok };
  if (!ok) params.error_message = errorMessage || 'Платёж отклонён';
  return await tgCall('answerPreCheckoutQuery', params);
}

// ─── Webhook management ─────────────────────────────────────────────────

/**
 * Регистрирует webhook на бэке. Запускается ОДИН раз после деплоя (или при
 * смене URL/секрета). Можно вручную через утилиту scripts/setup-webhook.js
 * либо автоматически на старте через runWebhookSetup() (см. внизу).
 *
 * @param url             — публичный HTTPS URL нашего бэка
 *                          + /api/v1/telegram/webhook
 * @param secretToken     — наш TELEGRAM_WEBHOOK_SECRET
 * @param allowedUpdates  — список update-типов которые мы хотим. По умолчанию
 *                          включаем минимум для подписок + блокировки бота.
 */
export async function setWebhook({
  url,
  secretToken,
  allowedUpdates = ['message', 'pre_checkout_query', 'my_chat_member'],
  dropPendingUpdates = false,
}) {
  return await tgCall('setWebhook', {
    url,
    secret_token: secretToken,
    allowed_updates: allowedUpdates,
    drop_pending_updates: dropPendingUpdates,
  });
}

export async function getWebhookInfo() {
  return await tgCall('getWebhookInfo');
}

export async function deleteWebhook({ dropPendingUpdates = false } = {}) {
  return await tgCall('deleteWebhook', { drop_pending_updates: dropPendingUpdates });
}

// ─── Reconciliation ─────────────────────────────────────────────────────

/**
 * Возвращает список Stars-транзакций нашего бота за окно. Используется
 * cron'ом reconcile для догонки потерянных webhook'ов.
 *
 * Telegram отдаёт max 100 за раз; для большего — пагинировать через offset.
 */
export async function getStarTransactions({ offset = 0, limit = 100 } = {}) {
  return await tgCall('getStarTransactions', { offset, limit });
}

// ─── Refunds & subscription management ─────────────────────────────────

/**
 * Полный возврат Stars-платежа юзеру. Идемпотентно: повторный refund
 * того же charge_id вернёт ошибку TG, которую ловим и логируем как
 * already_refunded.
 *
 * ВНИМАНИЕ: refund НЕ отменяет подписку автоматически — после refund'а
 * нужен явный editUserStarSubscription(is_canceled=true).
 */
export async function refundStarPayment({ userId, telegramPaymentChargeId }) {
  return await tgCall('refundStarPayment', {
    user_id: userId,
    telegram_payment_charge_id: telegramPaymentChargeId,
  });
}

/**
 * Отменяет/реактивирует Stars-подписку. is_canceled=true — после конца
 * текущего периода TG не будет списывать дальше, юзер сохраняет доступ
 * до expires_at.
 */
export async function editUserStarSubscription({ userId, telegramPaymentChargeId, isCanceled }) {
  return await tgCall('editUserStarSubscription', {
    user_id: userId,
    telegram_payment_charge_id: telegramPaymentChargeId,
    is_canceled: isCanceled,
  });
}

// ─── Notifications (admin alerts) ──────────────────────────────────────

/**
 * Шлёт сообщение в чат. Используем для:
 *  - admin-alert'ов о расхождениях (платёж без outstanding-инвойса)
 *  - партнёру при approve/paid выплаты
 *  - юзеру при успешной активации подписки
 *
 * Требует чтобы юзер уже написал боту хотя бы /start, иначе 403 Forbidden.
 * Ошибки не throw'аем (notifications не должны блокировать основной flow).
 */
export async function sendMessage({
  chatId,
  text,
  parseMode = 'HTML',
  disableWebPagePreview = true,
  replyMarkup,
}) {
  try {
    const params = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: disableWebPagePreview,
    };
    if (replyMarkup) params.reply_markup = JSON.stringify(replyMarkup);
    return await tgCall('sendMessage', params);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[bot-api] sendMessage failed:', err.message);
    return null;
  }
}

/**
 * Установка команд бота (через @BotFather можно тоже, но через API
 * безопаснее и автоматизируемее). Включает обязательный /paysupport
 * по требованию Telegram TOS для платных ботов.
 */
export async function setBotCommands({ commands }) {
  return await tgCall('setMyCommands', { commands });
}
