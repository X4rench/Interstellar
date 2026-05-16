# Деплой Interstellar в production

Этот документ — пошаговый гайд от пустого аккаунта до live-бота на t.me.

**TL;DR:** 30-40 минут работы, 0 ₽ на хостинге (бесплатные тиры Render + Cloudflare Pages).

---

## Архитектура

```
┌──────────────────┐         ┌──────────────────┐
│ Cloudflare Pages │ HTTPS   │ Render Web Svc   │
│ mini-app/dist    │ ──────► │ backend/         │
│ static React     │  /api   │ Express+SQLite   │
└────────▲─────────┘         └────────▲─────────┘
         │                            │
         │ TG WebView                 │ Webhook
         │                            │
    ┌────┴────────────────────────────┴────┐
    │       Telegram Bot API               │
    └──────────────────────────────────────┘
```

**Бэк (Render):**
- Web Service из `backend/` (Node.js)
- Persistent disk 1 GB → SQLite файл
- Auto-deploy на push в main
- Cron-задачи через in-process `setInterval` (reconciliation)

**Фронт (Cloudflare Pages):**
- Static-сайт из `mini-app/dist/` (Vite build)
- Globally edge-cached, мгновенный TTFB
- Custom headers через `mini-app/public/_headers` (CSP)

**Telegram Bot:**
- Webhook на `<render-url>/api/v1/telegram/webhook`
- Mini App URL = `<cloudflare-url>`

---

## 0. Что должно быть в наличии

- [ ] **GitHub репозиторий** с этим кодом (запушь весь корень `Character Chat/CharacterChatRN`)
- [ ] **Telegram-аккаунт** (для @BotFather и @userinfobot)
- [ ] **Render аккаунт** ([render.com](https://render.com), бесплатно, нужен GitHub auth)
- [ ] **Cloudflare аккаунт** ([cloudflare.com](https://cloudflare.com), бесплатно)
- [ ] **POLZA_API_KEY** — у тебя уже есть из RN-проекта

---

## 1. Telegram: создаём бота

Открой [@BotFather](https://t.me/BotFather):

```
/newbot
→ имя бота: Interstellar
→ username: InterstellarChatBot (или любой свободный, оканчивающийся на bot)
```

Получишь токен формата `123456:AABBCC...`. **Сохрани его** — нужен в шаге 4.

Сразу же узнай свой `telegram_user_id` — открой [@userinfobot](https://t.me/userinfobot), напиши `/start`, увидишь число типа `123456789`.

---

## 2. Подготовка репозитория

Запушь код на GitHub:

```bash
cd "D:\TwinStars\Character Chat\CharacterChatRN"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/interstellar.git
git push -u origin main
```

⚠️ Убедись, что `.env` файлы **не закоммичены** — они в `.gitignore`. Проверь `git status`.

---

## 3. Деплой бэка на Render

1. На [render.com](https://render.com) → **New** → **Blueprint**
2. Подключи свой GitHub → выбери репозиторий `interstellar`
3. Render автоматически прочитает `backend/render.yaml` и создаст:
   - Web service `interstellar-backend` (Frankfurt region)
   - Persistent disk 1 GB на `/var/data`
4. **Заполни secret env-vars** в Dashboard → Settings → Environment:

   | Key | Value | Где взять |
   |-----|-------|-----------|
   | `POLZA_API_KEY` | твой ключ | polza.ai dashboard |
   | `POLZA_MODEL` | `openai/gpt-4o-mini` (рекомендуется) | См. блок про модель ниже |
   | `BOT_TOKEN` | `123456:AABBCC...` | @BotFather |
   | `BOT_USERNAME` | `InterstellarChatBot` | без @ |
   | `BOT_APP_NAME` | `app` | будет в URL Mini App |
   | `ADMIN_TELEGRAM_IDS` | твой `telegram_user_id` | @userinfobot |
   | `PAYOUT_ENCRYPTION_KEY` | случайный 32-byte base64 | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
   | `TELEGRAM_WEBHOOK_SECRET` | случайный hex | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `BUSINESS_INN` | твой ИНН для самозанятых | (если нет — оставь пустым, partner просто не увидит) |
   | `BUSINESS_NAME` | `Interstellar` | для чека ФНС |
   | `CORS_ALLOWED_ORIGINS` | заполнишь после шага 5 | |
   | `PUBLIC_BASE_URL` | `https://interstellar-backend.onrender.com` (свой) | URL покажет Render |
   | **Цены тарифов (опционально, дефолты ниже):** | | |
   | `STAR_PRICE_BASIC` | `199` | Basic, 50 msg/день |
   | `STAR_PRICE_PREMIUM` | `499` | Premium, 150 msg/день + 18+ |
   | `STAR_PRICE_DAY_PASS` | `50` | Day Pass, 24h без лимита |

   **Про модель LLM:** дефолт `openai/gpt-4o-mini` ($0.15/$0.60 за 1M tokens) — оптимально по цене/качеству/русскому/character-play. На момент мая 2026 xAI deprecated всю быструю линейку Grok (`grok-4.1-fast`, `grok-4-fast`, `grok-3-mini` — мертвы), `x-ai/grok-4.3` рабочий но в 5× дороже mini. Альтернативы для оптимизации:

   - `openai/gpt-4.1-mini` ($0.40/$1.60) — чуть умнее, но в 2.5× дороже
   - `google/gemini-2.0-flash` ($0.075/$0.30) — в 2× дешевле, но NSFW блокируется safety-filters Google → НЕ для Premium тира
   - `anthropic/claude-3.5-haiku` ($0.80/$4) — топ character-play, но дорогой output

   Проверить актуальный каталог:
   ```bash
   curl https://api.polza.ai/api/v1/models -H "Authorization: Bearer $POLZA_API_KEY" \
     | jq '.data[].id'
   ```

5. **Manual Deploy** в Dashboard. Жди ~3 мин. Через минуту смотри логи — должно быть:
   ```
   [db] applied migration 001_init.sql
   [db] applied migration 002_affiliate.sql
   [db] applied migration 003_chat_usage.sql
   [db] applied migration 004_pricing_tiers.sql
   [db] applied migration 005_free_messages_used.sql
   [backend] listening on http://localhost:10000
   [backend] model:    openai/gpt-4o-mini
   [backend] auth:     BOT_TOKEN HMAC
   ```

6. Проверь `/health`:
   ```
   curl https://interstellar-backend.onrender.com/health
   → {"ok":true,"model":"openai/gpt-4o-mini","auth":"bot-token"}
   ```

⚠️ Render Free Tier засыпает после 15 мин неактивности. Первый запрос будет ~30 сек (cold start). Для прода — Starter $7/мес держит инстанс живым.

---

## 4. Деплой фронта на Cloudflare Pages

1. [cloudflare.com/dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Подключи GitHub → выбери репозиторий → ветка `main`
3. **Build settings:**
   - Framework preset: **Vite** (или None)
   - Build command: `npm ci && npm run build`
   - Build output directory: `dist`
   - Root directory: `mini-app`
4. **Environment variables** (Production scope):
   - `VITE_API_BASE_URL` = `https://interstellar-backend.onrender.com/api/v1`
   - `VITE_SENTRY_DSN` = (опционально, твой DSN из sentry.io)
5. **Save and Deploy**

Через 2-3 минуты получишь URL вида `https://interstellar-app.pages.dev`. Это твой mini-app URL.

---

## 5. Связать всё вместе

Вернись на Render dashboard:

1. **`CORS_ALLOWED_ORIGINS`** → впиши URL Cloudflare Pages:
   ```
   https://interstellar-app.pages.dev
   ```
2. Save → Render автоматически передеплоит бэк
3. Зарегистрируй webhook в Telegram:

   ```bash
   # Локально, имея .env с тем же BOT_TOKEN/TELEGRAM_WEBHOOK_SECRET что на Render
   cd backend
   PUBLIC_BASE_URL=https://interstellar-backend.onrender.com node scripts/setup-webhook.js
   ```

   Должно вывести `✅ Webhook is configured correctly`.

   Альтернатива — через `curl`:
   ```bash
   curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
     -d url=https://interstellar-backend.onrender.com/api/v1/telegram/webhook \
     -d secret_token=<TELEGRAM_WEBHOOK_SECRET> \
     -d allowed_updates='["message","pre_checkout_query","my_chat_member"]'
   ```

4. **Подключи Mini App к боту** в @BotFather:
   ```
   /newapp
   → выбери своего бота
   → Title: Interstellar
   → Description: AI-чат с великими личностями
   → Photo: (загрузи 640x360 PNG логотипа)
   → Web App URL: https://interstellar-app.pages.dev
   → Short name: app (должен совпадать с BOT_APP_NAME!)
   ```

5. **Включи Menu Button** в @BotFather:
   ```
   /mybots → твой бот → Bot Settings → Menu Button → Configure menu button
   → Text: 🚀 Открыть Interstellar
   → URL: https://t.me/<BOT_USERNAME>/app
   ```

---

## 6. Smoke-тест

1. Открой бота через поиск в Telegram, нажми Menu Button
2. Mini App должен открыться с твоим именем сверху
3. Profile → должна быть секция «Администрирование» (потому что твой ID в `ADMIN_TELEGRAM_IDS`)
4. AdminPage → Грант роли (введи телеграм_user_id тест-аккаунта или попроси друга открыть бот)
5. **Free тариф — one-shot lifetime cap.** Отправь 10 сообщений с любым персонажем. 11-е должно вернуть `LIFETIME_LIMIT_EXCEEDED` и открыть Paywall с reason=`limit`. ⚠️ **На free-тарифе НЕТ daily reset** — это lifetime лимит, после 10 юзер навсегда заблокирован до покупки подписки. Anti-abuse.
6. **Покупка Basic (199⭐)** — на Paywall нажми на карточку Basic → «Купить за 199 ⭐» → пройди реальную оплату (купи Stars через @PremiumBot). После покупки лимит = 50/день, обновляется каждый UTC-день.
7. **Покупка Premium (499⭐)** — для другого тест-аккаунта. Лимит 200/день + NSFW.
8. **NSFW-гейт** — Premium-юзер видит 18+ персонажей разблокированными; Basic и Free-юзеры видят их с замком (тап → Paywall reason=`nsfw`).
9. **Custom characters** — все юзеры (включая Free) могут создавать неограниченно (хранится в localStorage юзера, нам бесплатно).
10. **Day Pass (50⭐)** — карточка появляется в Paywall только если уже есть Basic/Premium, не free. Снимает дневной лимит на 24h в текущем тире.
11. В логах Render должно появиться `[webhook]` сообщение и `payment_received` в audit_log.
12. Profile теперь показывает badge `BASIC` или `PREMIUM` (а не одинаковый `PRO`).

Если что-то не работает:
- Проверь `/health` от Cloudflare → должен пингануть бэк
- Открой DevTools в Telegram Web (Desktop): View → Open DevTools → Console
- Render logs → ищи ошибки

---

## 7. Дальше

**Production checklist:**
- [ ] Sentry DSN — настрой error-tracking
- [ ] Backup SQLite — `VACUUM INTO` в S3/R2 каждые 6h
- [ ] Custom domain (Cloudflare даёт бесплатно если домен через них) — для брендинга
- [ ] Upgrade Render → Starter ($7/мес) — избавляет от cold-start
- [ ] Status page / monitoring — UptimeRobot, freshping (бесплатно)

**Phase 4.F (YooKassa):**
Подключение второго платёжного провайдера для веб-вне-TG. Требует ИП/самозанятость + договор с ЮКассой. См. Phase 4.F TODO когда будешь готов.

---

## Troubleshooting

### `[fatal] DEV_BYPASS_INITDATA=1 in NODE_ENV=production`
Render сам ставит `NODE_ENV=production`. Убери `DEV_BYPASS_INITDATA` из env-vars (или установи `0`).

### Webhook возвращает 401
Секрет на Render и в setWebhook должны совпадать. Перевыпусти оба через `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` → положи и туда и туда → перезапусти бэк → пересоздай webhook.

### CORS error в browser console
В Render env: `CORS_ALLOWED_ORIGINS=https://interstellar-app.pages.dev,http://localhost:5173` (через запятую, БЕЗ пробелов).

### Платёж проходит, но Pro не активируется
Один из:
1. Webhook не доходит → проверь `https://api.telegram.org/bot<TOKEN>/getWebhookInfo` — должно быть `last_error_message: null`
2. Webhook доходит, но reconciliation проспал → Render Dashboard → Logs → ищи `[reconcile]`
3. Активировалось но фронт не обновил → дождись 5 мин и пере-открой Profile

Fallback: AdminPage → Payouts → ничего → AdminPage → но manual recovery нет в UI, дёргай напрямую через `curl`:
```bash
curl -X POST https://interstellar-backend.onrender.com/api/v1/admin/payments/recover \
  -H "Authorization: tma <твой initDataRaw из DevTools>" \
  -H "X-Confirm-Action: <SHA-256 от body, см. roles.js canonicalize>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":<userId>,"charge_id":"<from screenshot>","amount_stars":199}'
```

(В Phase 4.G.5 добавим manual-recovery UI в AdminPage.)
