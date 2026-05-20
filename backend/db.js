import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbInstance = null;

/**
 * Открывает SQLite БД, накатывает все непримеёненные миграции.
 * Идемпотентно: повторный вызов — возвращает уже открытый instance.
 *
 * Миграции лежат в backend/migrations/*.sql, применяются по алфавиту.
 * Применённые версии трекаются в schema_migrations.version.
 */
export function openDb(dbPath) {
  if (dbInstance) return dbInstance;

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  applyMigrations(db);

  dbInstance = db;
  return db;
}

function applyMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);

  const migrationsDir = path.resolve(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.warn('[db] no migrations dir found at', migrationsDir);
    return;
  }

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map((r) => r.version),
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const insert = db.prepare(
    'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
  );

  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    if (applied.has(version)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    // Каждая миграция идёт в одной транзакции — atomic apply.
    const run = db.transaction(() => {
      db.exec(sql);
      insert.run(version, Date.now());
    });

    try {
      run();
      console.log(`[db] applied migration ${file}`);
    } catch (err) {
      console.error(`[db] migration ${file} failed:`, err.message);
      throw err;
    }
  }
}

// ─── User helpers ──────────────────────────────────────────────────────────

const upsertUserStmt = (db) =>
  db.prepare(`
    INSERT INTO users (
      telegram_user_id, username, first_name, last_name, language_code,
      is_telegram_premium, photo_url, first_seen_at, last_seen_at
    )
    VALUES (
      @telegram_user_id, @username, @first_name, @last_name, @language_code,
      @is_telegram_premium, @photo_url, @now, @now
    )
    ON CONFLICT(telegram_user_id) DO UPDATE SET
      username = excluded.username,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      language_code = excluded.language_code,
      is_telegram_premium = excluded.is_telegram_premium,
      photo_url = excluded.photo_url,
      last_seen_at = excluded.last_seen_at
  `);

const upsertAttributionStmt = (db) =>
  db.prepare(`
    INSERT INTO attributions (telegram_user_id, start_param, first_seen_at)
    VALUES (?, ?, ?)
    ON CONFLICT(telegram_user_id) DO NOTHING
  `);

/**
 * Создаёт юзера или обновляет его TG-профиль (имя/username/фото — при
 * каждом запросе, юзер мог сменить в TG). Если есть start_param и атрибуции
 * ещё нет — фиксирует. Повторные start_param НЕ перезаписывают (правило
 * первого визита).
 */
export function upsertUser(db, tgUser) {
  const now = Date.now();
  upsertUserStmt(db).run({
    telegram_user_id: tgUser.telegram_user_id,
    username: tgUser.username,
    first_name: tgUser.first_name,
    last_name: tgUser.last_name,
    language_code: tgUser.language_code,
    is_telegram_premium: tgUser.is_premium ? 1 : 0,
    photo_url: tgUser.photo_url,
    now,
  });

  if (tgUser.start_param) {
    upsertAttributionStmt(db).run(tgUser.telegram_user_id, tgUser.start_param, now);

    // User-referral attribution: start_param = 'ref_XXXXXXXX'
    // Записываем referred_by_user_id только один раз (если ещё не установлен).
    // Самореферал блокируется проверкой telegram_user_id ≠ referrer.telegram_user_id.
    if (tgUser.start_param.startsWith('ref_')) {
      const code = tgUser.start_param.slice(4)
      if (code) {
        const referrer = db
          .prepare('SELECT telegram_user_id FROM users WHERE referral_code = ?')
          .get(code)
        if (referrer && referrer.telegram_user_id !== tgUser.telegram_user_id) {
          db.prepare(
            'UPDATE users SET referred_by_user_id = ? WHERE telegram_user_id = ? AND referred_by_user_id IS NULL',
          ).run(referrer.telegram_user_id, tgUser.telegram_user_id)
        }
      }
    }
  }
}

/**
 * Возвращает текущую активную подписку (expires_at > now()) или null.
 * Берётся самая дальняя по expires_at — на случай нескольких записей
 * (подряд два месяца через recurring billing).
 */
export function getActiveSubscription(db, telegram_user_id) {
  const row = db
    .prepare(
      `SELECT plan, started_at, expires_at, is_trial, cancelled_at,
              telegram_payment_charge_id, auto_renew, source
       FROM subscriptions
       WHERE telegram_user_id = ? AND expires_at > ?
       ORDER BY expires_at DESC
       LIMIT 1`,
    )
    .get(telegram_user_id, Date.now());

  if (!row) return null;

  return {
    plan: row.plan,
    started_at: new Date(row.started_at).toISOString(),
    expires_at: new Date(row.expires_at).toISOString(),
    is_trial: !!row.is_trial,
    cancelled_at: row.cancelled_at ? new Date(row.cancelled_at).toISOString() : null,
    // Auto-renew флаг — фронт показывает toggle в Profile.
    // Только yookassa-подписки могут быть recurring; Stars-подписки всегда
    // одноразовые → auto_renew = false для них.
    auto_renew: !!row.auto_renew,
    source: row.source || 'stars',
  };
}

// ─── Chat usage (limits per tier) ──────────────────────────────────────

/**
 * Free тариф — one-shot, пожизненный лимит. После N сообщений на навсегда
 * блокируется до покупки подписки. Anti-abuse + funnel: юзер пробует,
 * потом форсится купить.
 *
 * Если N = 10, юзер получает примерно 1 полноценный диалог (5-10 туров с
 * каким-нибудь Эйнштейном) и должен решить — стоит ли подписка.
 */
// Free тариф: ДНЕВНОЙ лимит (раньше был lifetime — менялся для retention).
// Логика: юзер тратит 10 сообщений за вечер → завтра возвращается →
// продукт в рутине → выше шанс конверсии. Lifetime убивал retention:
// потратил 10 и ушёл навсегда, потому что paywall не воспринимался.
// Имя оставили FREE_LIFETIME_MESSAGES для совместимости со старыми
// импортами в server.js (он отдаёт его как free_messages_lifetime в
// /users/me — фронт читает как «общая квота»). Семантически теперь —
// дневная.
export const FREE_LIFETIME_MESSAGES = 10;
export const FREE_DAILY_MESSAGES = 10;

/**
 * Дневные лимиты для всех тарифов. Точка истины — синхронизировать
 * с frontend (mini-app/src/utils/api.ts PLANS) при изменении.
 *
 * Free: 10/день — пробник, сбрасывается в полночь UTC.
 * Basic: 50 msg/день — комфортно для casual-юзеров.
 * Premium: 200 msg/день — для активных, включая power users + NSFW.
 *
 * Day Pass снимает любой из этих лимитов на 24h в текущем тире.
 */
export const TIER_DAILY_LIMITS = {
  free: FREE_DAILY_MESSAGES,
  basic: 50,
  premium: 200,
};

/**
 * Размер sliding-window истории (сколько последних сообщений шлём в LLM).
 * Меньше для бесплатных = меньше токенов = меньше costs. Premium даёт
 * глубже память. UNIVERSAL_RULES + persona кэшируются вне зависимости.
 */
export const TIER_HISTORY_WINDOW = {
  free: 5,
  basic: 15,
  premium: 30,
};

function getDayBucket(date = new Date()) {
  // UTC YYYY-MM-DD. Не локальное время — даёт стабильные buckets независимо
  // от TZ сервера. Юзер в МСК и юзер в США дают одинаковый bucket
  // для одного календарного UTC-дня. Reset для всех — 03:00 МСК.
  return date.toISOString().slice(0, 10);
}

/**
 * Возвращает текущий tier юзера: 'free' | 'basic' | 'premium'.
 * Источник истины — subscriptions table. Free = отсутствие активной подписки.
 */
export function getUserTier(db, telegramUserId) {
  const row = db
    .prepare(
      `SELECT plan FROM subscriptions
       WHERE telegram_user_id = ? AND expires_at > ?
       ORDER BY plan DESC, expires_at DESC LIMIT 1`,
    )
    .get(telegramUserId, Date.now());
  if (!row) return 'free';
  if (row.plan === 'premium_month') return 'premium';
  if (row.plan === 'basic_month') return 'basic';
  return 'free';
}

/**
 * Проверяет наличие активного Day Pass (срок не истёк).
 */
export function hasActiveDayPass(db, telegramUserId) {
  const row = db
    .prepare(
      'SELECT id FROM day_passes WHERE telegram_user_id = ? AND expires_at > ?',
    )
    .get(telegramUserId, Date.now());
  return !!row;
}

/**
 * Возвращает сколько бесплатных сообщений юзер ещё может использовать.
 * Только для tier='free'. Платным юзерам результат не имеет смысла.
 */
export function getFreeMessagesRemaining(db, telegramUserId) {
  // Раньше читали users.free_messages_used (lifetime). Теперь — chat_usage
  // за сегодняшний UTC-день. users.free_messages_used остаётся в схеме
  // (legacy, не трогаем — миграция была бы дорогой), но больше не
  // используется в проверках лимита.
  const bucket = getDayBucket();
  const row = db
    .prepare('SELECT count FROM chat_usage WHERE telegram_user_id = ? AND day_bucket = ?')
    .get(telegramUserId, bucket);
  const used = row?.count ?? 0;
  return Math.max(0, FREE_DAILY_MESSAGES - used);
}

/**
 * Атомарно: проверяет лимит и инкрементит счётчик.
 *
 * Логика по тарифам:
 *   - 'free' — pожизненный лимит FREE_LIFETIME_MESSAGES, считаем в
 *     users.free_messages_used. Day Pass не применим (нет активной подписки).
 *   - 'basic' / 'premium' — дневной лимит TIER_DAILY_LIMITS[tier], считаем
 *     в chat_usage по UTC-дню. Day Pass снимает лимит.
 *
 * Возвращает:
 *   { ok: true, tier, count, limit, has_day_pass }
 *   { ok: false, tier, count, limit, has_day_pass }
 *
 * Для free: limit = FREE_LIFETIME_MESSAGES, count = free_messages_used.
 * Для basic/premium: limit = TIER_DAILY_LIMITS[tier], count = today's count.
 */
export function checkAndIncrementChatUsage(db, telegramUserId) {
  const tier = getUserTier(db, telegramUserId);
  const hasPass = hasActiveDayPass(db, telegramUserId);

  // Унифицированная логика для всех тиров (free/basic/premium): дневная
  // квота из chat_usage с UTC-day-bucket. Раньше free шёл по отдельной
  // ветке через users.free_messages_used (lifetime) — поменяли на daily
  // для retention. Day Pass снимает лимит для платных, для free не
  // применяется (free не может купить Day Pass — он сначала покупает
  // подписку, и тогда DP relevant).
  const limit = TIER_DAILY_LIMITS[tier];
  const bucket = getDayBucket();

  let result;
  const tx = db.transaction(() => {
    const row = db
      .prepare(
        'SELECT count FROM chat_usage WHERE telegram_user_id = ? AND day_bucket = ?',
      )
      .get(telegramUserId, bucket);
    const current = row?.count ?? 0;

    if (!hasPass && current >= limit) {
      result = { ok: false, tier, count: current, limit, has_day_pass: false };
      return;
    }

    db.prepare(
      `INSERT INTO chat_usage (telegram_user_id, day_bucket, count, last_used_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(telegram_user_id, day_bucket) DO UPDATE
       SET count = count + 1, last_used_at = excluded.last_used_at`,
    ).run(telegramUserId, bucket, Date.now());

    result = {
      ok: true,
      tier,
      count: current + 1,
      limit,
      has_day_pass: hasPass,
    };
  });
  tx.immediate();
  return result;
}

// ─── Referral system ─────────────────────────────────────────────────────────

// No 0/O/I/1 — ambiguous in fonts. 32^8 ≈ 1 трлн вариантов,
// коллизии практически невозможны при нашем масштабе.
const REFERRAL_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function _generateReferralCode() {
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += REFERRAL_CODE_CHARS[Math.floor(Math.random() * REFERRAL_CODE_CHARS.length)]
  }
  return code
}

/**
 * Возвращает реферальный код юзера, создавая его при первом обращении.
 * Повторяет попытку при редкой UNIQUE-коллизии (до 10 раз).
 */
export function getOrCreateReferralCode(db, userId) {
  const row = db.prepare('SELECT referral_code FROM users WHERE telegram_user_id = ?').get(userId)
  if (row?.referral_code) return row.referral_code

  const stmt = db.prepare(
    'UPDATE users SET referral_code = ? WHERE telegram_user_id = ? AND referral_code IS NULL',
  )
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = _generateReferralCode()
    try {
      const info = stmt.run(code, userId)
      if (info.changes === 1) return code
      // changes === 0: параллельный запрос уже записал код
      const fresh = db.prepare('SELECT referral_code FROM users WHERE telegram_user_id = ?').get(userId)
      if (fresh?.referral_code) return fresh.referral_code
    } catch (e) {
      if (e?.code === 'SQLITE_CONSTRAINT_UNIQUE') continue // коллизия, retry
      throw e
    }
  }
  throw new Error('Failed to generate unique referral code after 10 attempts')
}

/**
 * Начисляет награду пригласившему юзеру после первой оплаты
 * приглашённого. Вызывается после Stars- и YK-вебхуков.
 *
 * Защита от фрода:
 *  • UNIQUE(referred_user_id) в referral_rewards → награда платится 1 раз
 *    за всё время, сколько бы раз invited user ни продлевал подписку.
 *  • Только basic_month / premium_month → Day Pass не триггерит награду.
 *  • Самореферал блокирован в upsertUser при первом open app.
 *  • referred_by_user_id записывается один раз — не перезаписывается.
 */
export function giveReferralReward(db, referredUserId, planPurchased) {
  if (!['basic_month', 'premium_month'].includes(planPurchased)) return false

  const user = db
    .prepare('SELECT referred_by_user_id FROM users WHERE telegram_user_id = ?')
    .get(referredUserId)
  if (!user?.referred_by_user_id) return false

  const referrerId = user.referred_by_user_id
  const rewardTier = planPurchased === 'premium_month' ? 'premium' : 'basic'
  const rewardPlan = planPurchased === 'premium_month' ? 'premium_month' : 'basic_month'
  const rewardDays = 3
  const rewardMs = rewardDays * 24 * 60 * 60 * 1000
  const now = Date.now()

  const didReward = db.transaction(() => {
    // INSERT OR IGNORE: UNIQUE(referred_user_id) гарантирует 0 или 1 изменение
    const insertInfo = db.prepare(`
      INSERT OR IGNORE INTO referral_rewards
        (referrer_user_id, referred_user_id, plan_purchased, reward_tier, reward_days, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(referrerId, referredUserId, planPurchased, rewardTier, rewardDays, now)

    if (insertInfo.changes === 0) return false // уже начислено, пропускаем

    // Продлеваем активную подписку пригласившего (самую дальнюю)
    const activeSub = db.prepare(`
      SELECT id, expires_at FROM subscriptions
      WHERE telegram_user_id = ? AND expires_at > ? AND cancelled_at IS NULL
      ORDER BY expires_at DESC LIMIT 1
    `).get(referrerId, now)

    if (activeSub) {
      // Продлеваем существующую подписку на 3 дня
      db.prepare('UPDATE subscriptions SET expires_at = expires_at + ? WHERE id = ?')
        .run(rewardMs, activeSub.id)
    } else {
      // Создаём новую 3-дневную подписку как подарок
      db.prepare(`
        INSERT INTO subscriptions (telegram_user_id, plan, started_at, expires_at, is_trial, source)
        VALUES (?, ?, ?, ?, 0, 'referral')
      `).run(referrerId, rewardPlan, now, now + rewardMs)
    }

    return true
  })()

  if (didReward) {
    console.log(
      `[referral] rewarded user=${referrerId} +${rewardDays}d ${rewardTier}` +
      ` (referred=${referredUserId} plan=${planPurchased})`,
    )
  }
  return didReward
}

/**
 * Статистика рефералов для ProfilePage и /referral/stats эндпоинта.
 */
export function getReferralStats(db, userId) {
  const referralCode = db
    .prepare('SELECT referral_code FROM users WHERE telegram_user_id = ?')
    .get(userId)?.referral_code ?? null

  const invitedCount = db
    .prepare('SELECT COUNT(*) AS c FROM users WHERE referred_by_user_id = ?')
    .get(userId)?.c ?? 0

  const rewards = db.prepare(`
    SELECT plan_purchased, reward_tier, reward_days, created_at
    FROM referral_rewards WHERE referrer_user_id = ?
    ORDER BY created_at DESC
  `).all(userId)

  return {
    referral_code: referralCode,
    invited_count: invitedCount,
    paid_count: rewards.length,
    rewards: rewards.map((r) => ({
      plan_purchased: r.plan_purchased,
      reward_tier: r.reward_tier,
      reward_days: r.reward_days,
      created_at: new Date(r.created_at).toISOString(),
    })),
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Возвращает атрибуцию юзера (start_param, first_seen_at) или null.
 * Используется в админке/аналитике, не в API-ответе на клиента.
 */
export function getAttribution(db, telegram_user_id) {
  const row = db
    .prepare('SELECT start_param, first_seen_at FROM attributions WHERE telegram_user_id = ?')
    .get(telegram_user_id);
  if (!row) return null;
  return {
    start_param: row.start_param,
    first_seen_at: new Date(row.first_seen_at).toISOString(),
  };
}
