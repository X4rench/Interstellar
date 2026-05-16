import crypto from 'node:crypto';

/**
 * TTL валидности initData. После 24h — отвергаем как stale (защита от
 * replay-атак с украденным initData). Telegram сам тоже ротирует
 * auth_date регулярно.
 */
const INIT_DATA_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Валидирует initData по HMAC-SHA256 с использованием BOT_TOKEN.
 *
 * Реализация по спеке https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Возвращает распарсенный {telegram_user_id, ...} либо null если невалидно.
 *
 * Проверки:
 *   1. Есть hash в параметрах
 *   2. HMAC совпадает (timing-safe сравнение)
 *   3. auth_date свежий (< 24h)
 *   4. user.id присутствует и > 0
 */
export function validateInitData(initDataRaw, botToken) {
  if (!initDataRaw || typeof initDataRaw !== 'string' || !botToken) return null;

  let params;
  try {
    params = new URLSearchParams(initDataRaw);
  } catch {
    return null;
  }

  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  // data-check-string: все оставшиеся параметры, отсортированные по ключу,
  // в формате `key=value`, разделитель — `\n`. signature НЕ исключаем
  // (она входит в data-check, см. свежую спеку 2024).
  const entries = Array.from(params.entries()).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  // secret_key = HMAC_SHA256(bot_token, "WebAppData")
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calc = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // Constant-time сравнение для защиты от timing-атак.
  let calcBuf, hashBuf;
  try {
    calcBuf = Buffer.from(calc, 'hex');
    hashBuf = Buffer.from(hash, 'hex');
  } catch {
    return null;
  }
  if (calcBuf.length !== hashBuf.length) return null;
  if (!crypto.timingSafeEqual(calcBuf, hashBuf)) return null;

  // TTL.
  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || authDate <= 0) return null;
  if (Date.now() - authDate * 1000 > INIT_DATA_TTL_MS) return null;

  // user-объект.
  let user;
  try {
    const userRaw = params.get('user');
    if (!userRaw) return null;
    user = JSON.parse(userRaw);
  } catch {
    return null;
  }
  if (!user || typeof user.id !== 'number' || user.id <= 0) return null;

  return buildTgUser(user, params, authDate);
}

/**
 * DEV-only: парсит initData БЕЗ валидации hash. Используется когда
 * BOT_TOKEN ещё не настроен и ходим из mini-app/ с моковым initData.
 *
 * НИКОГДА не вызывать в production — любой клиент может подделать user_id.
 */
export function parseInitDataUnsafe(initDataRaw) {
  if (!initDataRaw || typeof initDataRaw !== 'string') return null;

  let params;
  try {
    params = new URLSearchParams(initDataRaw);
  } catch {
    return null;
  }

  let user;
  try {
    user = JSON.parse(params.get('user') ?? '{}');
  } catch {
    return null;
  }
  if (!user || typeof user.id !== 'number' || user.id <= 0) return null;

  const authDate = Number(params.get('auth_date')) || Math.floor(Date.now() / 1000);
  return buildTgUser(user, params, authDate);
}

function buildTgUser(user, params, authDate) {
  const startParam = params.get('start_param');
  return {
    telegram_user_id: user.id,
    username: user.username ?? null,
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? null,
    language_code: user.language_code ?? null,
    is_premium: !!user.is_premium,
    photo_url: user.photo_url ?? null,
    start_param: validateStartParam(startParam),
    auth_date: authDate,
  };
}

/**
 * start_param должен соответствовать regex /^[\w-]{1,64}$/.
 * TG лимит для startapp — 64 символа. Все за пределами — отбрасываем
 * (вернётся null), чтобы не записать в БД мусор.
 */
const START_PARAM_RE = /^[\w-]{1,64}$/;
function validateStartParam(value) {
  if (!value) return null;
  return START_PARAM_RE.test(value) ? value : null;
}

/**
 * Express middleware factory.
 *
 * Парсит заголовок `Authorization: tma <initDataRaw>`, валидирует, кладёт
 * результат в req.tgUser. Если что-то не ок — 401 с понятным error code.
 *
 * @param {object} opts
 * @param {string} opts.botToken — токен бота для HMAC.
 * @param {boolean} opts.devBypass — если true, пропускает HMAC-валидацию
 *   (только для DEV-окружения без BOT_TOKEN).
 */
export function authMiddleware({ botToken, devBypass = false }) {
  return function (req, res, next) {
    const auth = req.header('Authorization') || '';
    const m = /^tma\s+(.+)$/i.exec(auth);
    if (!m) {
      return res.status(401).json({ ok: false, error: 'NO_INIT_DATA' });
    }
    const initDataRaw = m[1];

    const tgUser = devBypass
      ? parseInitDataUnsafe(initDataRaw)
      : validateInitData(initDataRaw, botToken);

    if (!tgUser) {
      return res
        .status(401)
        .json({ ok: false, error: devBypass ? 'BAD_INIT_DATA' : 'INVALID_INIT_DATA' });
    }

    req.tgUser = tgUser;
    next();
  };
}
