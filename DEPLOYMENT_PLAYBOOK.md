# Playbook: Telegram Mini App с платежами и LLM-чатом

> Полное руководство по развёртыванию подписочного Telegram Mini App для РФ-аудитории.
> Собран из опыта развёртывания «Интерстеллар» (AI-чат с историческими личностями).
> Покрывает все грабли которые мы прошли. Используй для следующих проектов чтобы их не повторить.

**Версия:** 1.0 (май 2026)
**Стек:** Node.js + Express + better-sqlite3 + Vite/React + Cloudflare Pages + AEZA VPS + ЮКасса + Telegram Bot API

---

## 📑 Содержание

0. [TL;DR — что в итоге должно получиться](#0-tldr)
1. [Архитектура системы](#1-архитектура-системы)
2. [Что подготовить ДО старта](#2-что-подготовить-до-старта)
3. [Регистрация бота в BotFather](#3-регистрация-бота-в-botfather)
4. [Серверная инфраструктура](#4-серверная-инфраструктура)
5. [DNS и домены через Cloudflare](#5-dns-и-домены-через-cloudflare)
6. [Деплой Backend](#6-деплой-backend)
7. [Деплой Frontend в Cloudflare Pages](#7-деплой-frontend-в-cloudflare-pages)
8. [Telegram webhook + Sweden-прокси](#8-telegram-webhook--sweden-прокси)
9. [LLM-интеграция (polza.ai/OpenRouter)](#9-llm-интеграция)
10. [Платежи: Telegram Stars (legacy)](#10-платежи-telegram-stars-legacy)
11. [Платежи: ЮКасса с автопродлением](#11-платежи-юкасса-с-автопродлением)
12. [CSP, CORS, безопасность](#12-csp-cors-безопасность)
13. [Self-hosting telegram-web-app.js](#13-self-hosting-telegram-web-appjs)
14. [💥 ГРАБЛИ — список всех проблем и решений](#14-грабли)
15. [Чеклисты перед launch](#15-чеклисты)
16. [Мониторинг и инциденты](#16-мониторинг-и-инциденты)

---

## 0. TL;DR

В конце процесса у тебя будет:
- **Бот в Telegram** (`@YourAppBot`) с web_app кнопкой
- **Mini App на домене** (`https://yourapp.ru` через Cloudflare Pages, бесплатный hosting)
- **Backend API** (`https://api.yourapp.ru`) на AEZA Moscow VPS под systemd
- **БД** SQLite (better-sqlite3, файл на диске сервера)
- **LLM-чат** через polza.ai (российский OpenRouter-mirror) — Qwen/GPT/Claude по выбору
- **Платежи**:
  - Telegram Stars (быстро, бот сам авторизует)
  - ЮКасса напрямую (карты, СБП, T-Pay, SberPay, **автопродление**)
- **Sweden-прокси** для исходящих запросов в `api.telegram.org` (РФ блокирует напрямую)

**Общее время на деплой с нуля:** 1-3 дня (если делаешь по этому документу — 1 день).

**Стоимость в месяц:**
- AEZA Moscow VPS: ~400₽
- AEZA Sweden VPS: ~400₽
- Cloudflare Pages: $0 (бесплатно до 500 деплоев/мес)
- Домен `.ru`: ~200₽/год
- polza.ai баланс: $5-20 на месяц теста
- ЮКасса: 3.5% комиссия с транзакций, без абонплаты

---

## 1. Архитектура системы

```
┌─────────────────────────────────────────────────────────────────┐
│  Telegram-клиент (юзер)                                         │
│  ├─ Бот @YourAppBot                                             │
│  └─ Mini App открывается через t.me/YourAppBot/app              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Cloudflare Pages (HOSTING)                                     │
│  ├─ yourapp.ru (Vite/React-сборка)                              │
│  ├─ TLS, CDN, DDoS-защита                                       │
│  └─ Бесплатно                                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ XHR fetch
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  Cloudflare DNS (proxied) — api.yourapp.ru                      │
│  ├─ Маскирует IP бэка                                           │
│  ├─ TLS-termination (CF SSL + Let's Encrypt origin)             │
│  └─ rate-limit, WAF опционально                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  AEZA Moscow VPS — Backend                                      │
│  ├─ nginx (TLS terminator, reverse proxy на :3001)              │
│  ├─ Node.js (Express) под systemd:                              │
│  │  ├─ /api/v1/* — мини-аппа API                                │
│  │  ├─ /api/v1/telegram/webhook — приём Update от TG            │
│  │  └─ /api/v1/yookassa-webhook — приём callback от ЮК          │
│  ├─ better-sqlite3 (БД на диске)                                │
│  └─ HTTP клиент к polza.ai (LLM)                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS through proxy
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  AEZA Sweden VPS — 3proxy (Squid-альтернатива)                  │
│  ├─ HTTP-прокси с basic-auth                                    │
│  └─ Используется ТОЛЬКО для api.telegram.org                    │
│     (РФ блокирует прямой доступ из РФ-датацентров)              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
                  api.telegram.org
                  (setWebhook, sendMessage, refunds...)
```

**Почему именно так:**
- **Cloudflare Pages вместо своего хостинга фронта** — бесплатно, CDN, TLS из коробки, нет проблем с обновлениями
- **Маскировка IP backend через CF** — без CF IP backend светится, ловит DDoS и боты-сканеры
- **Sweden-прокси** — `api.telegram.org` блокируется у части хостеров в РФ, нужен out-of-RF выход
- **Anti-DDoS на VPS** — порт 22 (SSH) часто блокирован, поэтому все настройки через VNC-консоль

---

## 2. Что подготовить ДО старта

### 2.1 Аккаунты

- [ ] **Telegram аккаунт** (от своего номера, не от чужого — потом не открепишь)
- [ ] **AEZA**: 2 VPS заказа (Moscow + любая зарубежная локация: Sweden, Netherlands)
- [ ] **Cloudflare** аккаунт (бесплатный)
- [ ] **Регистратор домена** (reg.ru / nic.ru / GoDaddy — любой). Купить `.ru` или `.com`
- [ ] **polza.ai** аккаунт + пополнить балансом $10-20 для теста
- [ ] **GitHub** — приватный или публичный репо для синхронизации кода между ПК ↔ серверами
- [ ] **ЮКасса** — регистрация юрлица / самозанятого / ИП. Договор подписывается ~1 неделю
- [ ] **Самозанятость через приложение «Мой налог»** (или ИП/ООО — зависит от плана выручки)

### 2.2 Документы для ЮКассы

ЮКасса проверяет ИНН + банковский счёт. Для самозанятого:
- Паспорт
- Регистрация «Мой налог» — статус «активен»
- Номер расчётного счёта (Тинькофф/Сбер — реквизиты карты из ЛК банка)
- Описание деятельности (типовое для самозанятых: «разработка ПО») — переделать не дадут
- Email для уведомлений

После одобрения ЮКассы (5-7 дней) получишь:
- `ShopID` (числовой, ~7 цифр)
- `LegalID`
- `MerchantID` (для СБП)
- Подключённые методы оплаты: карта, СБП, T-Pay, SberPay, ЮMoney

### 2.3 Локальная подготовка

```bash
# Установи на свой ПК
node -v   # должен быть 18+
git --version
```

Если работаешь с Windows + Git Bash — это нормально, всё работает. WSL не обязателен.

---

## 3. Регистрация бота в BotFather

В Telegram пиши `@BotFather`:

```
/newbot
[имя бота, любое]
[username, должен заканчиваться на bot]
```

**ВАЖНО** про имена:
- Имена `Interstellar_bot`, `Cleopatra_bot` чаще всего заняты
- Бери что-то длинее: `InterstellarAiBot`, `MyAppFooBarBot`
- Если занято — BotFather просто скажет «occupied, try another»

Сохрани **BOT_TOKEN** (формат `123456:AAH-XXXXXXX...`). Это **главный секрет**. Никогда в репо.

Дальше в BotFather:
```
/mybots → выбери бота → Bot Settings → Menu Button → Configure → Edit menu button URL
```

Введи URL Mini App: `https://yourapp.ru` (пока его нет — введи временно `https://example.com`, потом обновишь).

**Создай Web App** (для shortcut `t.me/bot/appname`):
```
/newapp → выбери бота → название → описание → фото → ссылка yourapp.ru → short name (например app)
```

После этого Mini App доступен по двум URL:
- `t.me/YourBot/app` — деплинк (открывает Mini App из любого чата TG)
- Менюшка ☰ в чате бота

---

## 4. Серверная инфраструктура

### 4.1 Заказ VPS на AEZA

В AEZA панели:
1. **Сервер 1 — Moscow** (для backend):
   - Локация: Moscow или Saint Petersburg
   - ОС: Ubuntu 24.04 LTS
   - CPU: 2 vCPU, RAM 2GB — достаточно для старта
   - Диск: NVMe 30GB
2. **Сервер 2 — Sweden/Netherlands** (для proxy):
   - Локация: Sweden / Netherlands / Finland (вне РФ)
   - ОС: Ubuntu 24.04 LTS
   - CPU: 1 vCPU, RAM 1GB — минимум
   - Диск: 10GB

### 4.2 Anti-DDoS блокировка SSH

**Грабли #1:** AEZA в РФ часто блокирует входящий SSH (порт 22) с любых IP вне РФ, включая твою домашнюю сеть если она показывается как «foreign».

**Симптом:** `ssh root@1.2.3.4` → таймаут / refused.

**Решение:** Используй **VNC-консоль** в AEZA-панели для setup. После настройки можно открыть SSH с конкретным разрешённым IP, но проще оставить как есть и заходить через VNC при необходимости.

### 4.3 VNC paste багает — что делать

В VNC-консоли пастинг через буфер **обрезает переносы строк и спецсимволы**.

**Что ломается:**
- Длинные команды слипаются: `cd /home && git pull && systemctl restart` → `cd /home && git pullsystemctl restart` (без &&)
- Кавычки `"` превращаются в `&quot;`
- HTML-entities в JSON-телах

**Решения:**
1. Команды по одной строке, по одному Enter
2. Сложные команды — клади в shell-скрипт на GitHub, на сервере: `curl -L https://raw.githubusercontent.com/.../setup.sh | bash`
3. Для multiline-конфигов — используй `nano` (не пастит через VNC), вводи вручную или редактируй через `sed -i 's|old|new|' file`

### 4.4 Sweden-прокси (3proxy)

На Sweden VPS через VNC:

```bash
apt update && apt install -y 3proxy
```

Создай `/etc/3proxy/3proxy.cfg`:
```
nserver 1.1.1.1
nserver 8.8.8.8
nscache 65536
timeouts 1 5 30 60 180 1800 15 60

users PROXY_USER:CL:PROXY_PASSWORD_HERE

auth strong
allow PROXY_USER
proxy -p3128 -i0.0.0.0 -e0.0.0.0
```

Где `PROXY_USER` и `PROXY_PASSWORD_HERE` — что хочешь (используй strong random — это твой firewall на proxy).

```bash
systemctl enable --now 3proxy
ufw allow 3128/tcp
```

Проверь с локалки (любой ПК):
```bash
curl -x http://PROXY_USER:PROXY_PASSWORD@SWEDEN_IP:3128 https://api.telegram.org
# Должен вернуть {"ok":false,"error_code":404,...} — это значит проксирование работает
```

Запиши URL: `http://PROXY_USER:PROXY_PASSWORD@SWEDEN_IP:3128` — это `TG_API_PROXY`.

---

## 5. DNS и домены через Cloudflare

### 5.1 Перенос домена в Cloudflare

Если домен на reg.ru / GoDaddy:
1. В Cloudflare → Add Site → введи `yourapp.ru`
2. Выбери Free план
3. CF даст 2 nameserver'а типа `lola.ns.cloudflare.com`, `john.ns.cloudflare.com`
4. В панели регистратора домена → DNS → **смени nameservers на CF-вские**
5. Подожди 2-24 часа (обычно 1-2 часа)

**Грабли #2:** При смене NS теряются ранее настроенные DNS-записи (MX, A, и т.д.). Сохрани их ДО смены и восстанови в CF.

### 5.2 DNS записи для проекта

В Cloudflare → твой домен → DNS → Records:

```
Type    Name              Content              Proxy
A       yourapp.ru        192.0.2.1            ✅ (Proxied — cloudflare-orange)
A       app               192.0.2.1            ✅ (для app.yourapp.ru если нужен)
A       api               MOSCOW_IP            ✅ (Proxied — главное!)
```

- `yourapp.ru` и `app.yourapp.ru` указывают на CF Pages (получишь IP когда подключишь pages-сайт)
- `api.yourapp.ru` указывает на Moscow IP → но **через CF-proxy** (orange cloud) для скрытия настоящего IP

### 5.3 SSL Mode в Cloudflare

CF → SSL/TLS → Overview → **Full (strict)**

«Strict» требует валидный TLS-сертификат на origin-сервере. Поставь Let's Encrypt на nginx (см. раздел 6.4).

---

## 6. Деплой Backend

### 6.1 Базовая настройка Moscow VPS через VNC

```bash
# 1. Обновление + установка
apt update && apt upgrade -y
apt install -y curl wget git nano ufw build-essential nginx certbot python3-certbot-nginx sqlite3

# 2. Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp           # SSH (если работает)
ufw allow 80/tcp           # HTTP (нужен для Let's Encrypt валидации)
ufw allow 443/tcp          # HTTPS
ufw --force enable

# 3. Создание юзера для бэка (не запускаем как root)
useradd -m -s /bin/bash interstellar
```

### 6.2 Node.js через nvm

Работай **под юзером** `interstellar`, не root:
```bash
sudo -u interstellar -i

# Установка nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc

# Node 20 LTS
nvm install 20
nvm use 20
node -v   # v20.x

exit  # вернуться в root
```

### 6.3 Клонирование репо

```bash
sudo -u interstellar git clone https://github.com/youruser/yourrepo.git /home/interstellar/yourapp
cd /home/interstellar/yourapp/backend
sudo -u interstellar npm install --omit=dev
```

### 6.4 Let's Encrypt сертификат для api.yourapp.ru

**ВАЖНО:** Сначала DNS должен резолвить, **выключи CF proxy** (серое облачко) на 5 минут чтобы Let's Encrypt мог дотянуться до твоего сервера напрямую.

```bash
# Базовая nginx-конфигурация
cat > /etc/nginx/sites-available/api.yourapp.ru <<'NGINX'
server {
    listen 80;
    server_name api.yourapp.ru;
    location / { return 301 https://$host$request_uri; }
    location /.well-known/acme-challenge/ { root /var/www/html; }
}
NGINX
ln -sf /etc/nginx/sites-available/api.yourapp.ru /etc/nginx/sites-enabled/
systemctl reload nginx

# Получи сертификат
certbot --nginx -d api.yourapp.ru --email your@email.com --agree-tos -n
```

После выдачи серта **включи CF proxy обратно** (оранжевое облачко). Cloudflare кэширует CDN, backend защищён.

Дополнительная конфигурация nginx после certbot:
```nginx
server {
    listen 443 ssl http2;
    server_name api.yourapp.ru;
    ssl_certificate /etc/letsencrypt/live/api.yourapp.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourapp.ru/privkey.pem;

    # max body для платёжных webhook'ов
    client_max_body_size 256k;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $proxy_scheme;
    }
}
```

```bash
nginx -t && systemctl reload nginx
```

### 6.5 backend/.env

В `/home/interstellar/yourapp/backend/.env`:

```ini
# LLM
POLZA_API_KEY=pza_xxxxxxxxxxxxxxxxxxxxxxxx
POLZA_API_URL=https://api.polza.ai/api/v1/chat/completions
POLZA_MODEL=qwen/qwen3-235b-a22b-2507

# Сервер
PORT=3001
NODE_ENV=production
TRUST_PROXY_HOPS=1
DB_PATH=/home/interstellar/yourapp-data/app.sqlite

# Telegram
BOT_TOKEN=123456:AAH-XXXX
BOT_USERNAME=YourAppBot
BOT_APP_NAME=app
TELEGRAM_WEBHOOK_SECRET=случайная_строка_32_символа
TG_API_PROXY=http://PROXY_USER:PROXY_PASSWORD@SWEDEN_IP:3128

# CORS
CORS_ALLOWED_ORIGINS=https://yourapp.ru,https://app.yourapp.ru,http://localhost:5173

# RBAC
ADMIN_TELEGRAM_IDS=123456789,987654321

# ЮКасса (заполнить когда одобрят)
YK_SHOP_ID=1234567
YK_SECRET_KEY=live_XXXXXXX
PAYOUT_ENCRYPTION_KEY=случайная_32_байта_base64
```

**ГРАБЛИ #3:** Никогда не хардкодь секреты в bash-скриптах или коде. У нас был случай когда `POLZA_API_KEY` оказался захардкожен в `setup-aeza-backend.sh` в публичном репо → пришлось ротировать ключ. Используй env-vars: `export POLZA_API_KEY=xxx ./setup.sh`.

**ГРАБЛИ #4:** В VNC-скриншоты не делать с `cat .env` или `grep POLZA_API_KEY`. Если случайно — сразу ротировать.

### 6.6 systemd unit

`/etc/systemd/system/yourapp.service`:
```ini
[Unit]
Description=YourApp Backend
After=network.target

[Service]
Type=simple
User=interstellar
WorkingDirectory=/home/interstellar/yourapp/backend
ExecStart=/home/interstellar/.nvm/versions/node/v20.20.2/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/yourapp/backend.log
StandardError=append:/var/log/yourapp/backend.err.log
# Graceful shutdown timeout
TimeoutStopSec=45

[Install]
WantedBy=multi-user.target
```

```bash
mkdir -p /var/log/yourapp
chown interstellar:interstellar /var/log/yourapp
systemctl daemon-reload
systemctl enable --now yourapp
systemctl status yourapp
```

### 6.7 Logrotate

`/etc/logrotate.d/yourapp`:
```
/var/log/yourapp/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
    create 644 interstellar interstellar
    postrotate
        systemctl reload yourapp >/dev/null 2>&1 || true
    endscript
}
```

---

## 7. Деплой Frontend в Cloudflare Pages

### 7.1 Подключение репо

1. CF Dashboard → **Workers & Pages** → Create → Pages → Connect to Git
2. Авторизуй GitHub → выбери репо
3. Настройки сборки:
   - **Framework preset:** Vite (или None)
   - **Build command:** `cd mini-app && npm install && npm run build`
   - **Build output directory:** `mini-app/dist`
   - **Root directory:** оставь пустым
4. Environment variables (Build & Preview):
   ```
   VITE_API_BASE_URL=https://api.yourapp.ru/api/v1
   ```
5. Save and Deploy

После первого билда (1-3 минуты) получишь URL типа `yourapp-abc.pages.dev`.

### 7.2 Custom domain

CF Pages → твой проект → **Custom domains** → Add custom domain:
1. `yourapp.ru` — корневой
2. `app.yourapp.ru` — поддомен (если нужен)

CF автоматически выпустит TLS-серт и привяжет.

### 7.3 _headers (CSP и Cache)

В `mini-app/public/_headers`:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://telegram.org https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://api.yourapp.ru https://*.yourapp.ru https://*.pages.dev https://*.ingest.sentry.io https://cloudflareinsights.com; frame-ancestors 'self' https://web.telegram.org https://*.telegram.org; base-uri 'self'; form-action 'self'
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: interest-cohort=(), camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache, no-store, must-revalidate
```

**ГРАБЛИ #5:** Когда меняешь домен (например с `xxx.pages.dev` на `yourapp.ru`) — **обязательно обнови CORS_ALLOWED_ORIGINS** в backend `.env`. Иначе фронт получит CORS-ошибку и юзеры будут видеть «не удалось получить ответ. проверьте интернет».

**ГРАБЛИ #6:** В CSP `connect-src` обязательно должен быть домен бэка с правильной схемой (https://). Без этого браузер блокирует все fetch.

### 7.4 Update Web App URL в BotFather

После того как `yourapp.ru` заработал:
```
/mybots → выбери бота → Bot Settings → Menu Button → Edit URL
→ https://t.me/YourAppBot/app
```

И в Web App settings (если использовал `/newapp`):
```
/myapps → выбери app → Edit Web App URL → https://yourapp.ru
```

---

## 8. Telegram webhook + Sweden-прокси

### 8.1 Зачем нужен webhook

Бот должен принимать `/start`, `pre_checkout_query`, `successful_payment` от TG. Два способа:
- **getUpdates polling** — long-poll каждые N секунд. Просто, но дороже по CPU.
- **setWebhook** — TG сам POST'ит нам Update. Эффективнее.

Мы используем webhook.

### 8.2 setWebhook через Sweden-прокси

`api.telegram.org` блокирован у части хостеров в РФ → backend не может звонить ему напрямую → используем proxy.

**Скрипт** `backend/scripts/setup-webhook.js` (или вручную):

```bash
# Сначала из локалки (с обычным интернетом)
TOKEN="123456:AAH-XXX"
SECRET="случайная_строка_32_символа"
URL="https://api.yourapp.ru/api/v1/telegram/webhook"
IP="188.114.96.1"  # один из публичных IP Cloudflare для api.yourapp.ru

curl -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -d "url=${URL}" \
  -d "ip_address=${IP}" \
  -d "secret_token=${SECRET}" \
  -d "allowed_updates=[\"message\",\"pre_checkout_query\",\"successful_payment\"]"
```

**ГРАБЛИ #7:** Параметр `ip_address` критичен. Если не указать, TG резолвит DNS сам и кэширует на 24+ часов. Если поменяли nameservers или CF proxy — TG будет долбить старый IP, который теперь не отвечает. Указание `ip_address` форсит конкретный IP.

Найти CF-IP для своего домена:
```bash
dig +short api.yourapp.ru
# Возьми любой из результатов (обычно 104.x или 188.114.x)
```

Проверка установки:
```bash
curl "https://api.telegram.org/bot${TOKEN}/getWebhookInfo"
# Должен показать твой url, ip_address, last_error_date=null
```

### 8.3 Verify webhook на бэке

В Express:
```js
function verifyTelegramWebhook(req, res, next) {
  const provided = req.headers['x-telegram-bot-api-secret-token'];
  if (!TELEGRAM_WEBHOOK_SECRET) return res.status(503).end();
  if (!provided) return res.status(401).end();

  // ВАЖНО: timing-safe сравнение. Не делай простой === !
  // И не early-return на разной длине (timing-leak).
  const a = Buffer.from(provided);
  const b = Buffer.from(TELEGRAM_WEBHOOK_SECRET);
  const padLen = Math.max(a.length, b.length);
  const aPadded = Buffer.concat([a, Buffer.alloc(padLen - a.length)]);
  const bPadded = Buffer.concat([b, Buffer.alloc(padLen - b.length)]);
  if (!crypto.timingSafeEqual(aPadded, bPadded) || a.length !== b.length) {
    return res.status(401).end();
  }
  next();
}
```

### 8.4 HMAC-валидация initData

Когда фронт делает запрос к бэку — посылает `Authorization: tma <initDataRaw>`. Бэк проверяет HMAC по `BOT_TOKEN`:

```js
import crypto from 'node:crypto';

export function validateInitData(initDataRaw, botToken) {
  const params = new URLSearchParams(initDataRaw);
  const hash = params.get('hash');
  params.delete('hash');

  const sortedPairs = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // HMAC-SHA256(secret_key, data_check_string)
  // secret_key = HMAC-SHA256("WebAppData", bot_token)
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(sortedPairs).digest('hex');

  if (computed !== hash) return null;

  // Проверка свежести (защита от replay)
  const authDate = Number(params.get('auth_date'));
  if (Date.now() / 1000 - authDate > 86400) return null;  // older than 24h → reject

  return {
    user: JSON.parse(params.get('user')),
    auth_date: authDate,
    start_param: params.get('start_param'),
  };
}
```

---

## 9. LLM-интеграция

### 9.1 polza.ai vs прямой OpenAI

В РФ OpenAI API заблокирован для платежей. **polza.ai** — российский OpenRouter-mirror:
- Принимает рубли (карта РФ)
- Большой каталог: OpenAI, Anthropic, Google, Qwen, DeepSeek, Mistral
- Один токен — все модели
- Markup ~10-20% поверх OpenRouter prices

### 9.2 Выбор модели для chat / character-play

Сравнение из практики (май 2026):

| Модель | Input $/1M | Output $/1M | Стиль | NSFW |
|--------|-----------|-------------|-------|------|
| `openai/gpt-4o-mini` | 0.15 | 0.60 | Помощник-стиль, многословный | OK |
| `qwen/qwen3-235b-a22b-2507` | 0.07 | 0.10 | Разговорный, иногда литературный | Лёгкие guardrails |
| `deepseek/deepseek-chat` | 0.32 | 0.89 | Лучший immersion, эмоциональный | CN-цензура жёсткая |
| `google/gemini-2.0-flash` | 0.075 | 0.30 | Дешёво, быстро | ❌ Сильная цензура safety |
| `meta-llama/llama-3.3-70b` | 0.10 | 0.32 | OK для EN | ❌ Слабый русский |
| `eva-unit-01/eva-qwen-2.5-72b` | varies | varies | Uncensored RP-finetune | ✅ Без цензуры (только 32K context) |

**ГРАБЛИ #8:** `grok-4.1-fast` от xAI был **депрекейтнут**. Не используй модели без даты в имени — они могут пропадать. Бери instruct-варианты с датой типа `qwen3-235b-a22b-2507`.

**ГРАБЛИ #9:** Перед переключением модели **всегда проверяй каталог polza**:
```bash
curl -H "Authorization: Bearer $POLZA_API_KEY" \
  https://api.polza.ai/api/v1/models | jq '.data[].id' | grep -i qwen
```
polza-каталог иногда лагает на несколько недель за OpenRouter — новая модель может ещё не подтянуться.

### 9.3 Параметры для character-play

Для подписочного развлекательного чата (Replika-like):

```js
{
  model: 'qwen/qwen3-235b-a22b-2507',
  messages: aiMessages,
  temperature: 0.75,        // не выше 0.85 — гонит в «литературщину»
  max_tokens: 280,          // отрезает многословность
  frequency_penalty: 0.2,   // режет повторяющиеся зачины
  presence_penalty: 0.1,    // подталкивает к новым словам
}
```

### 9.4 Промпт-инжиниринг — как не дать LLM звучать «помощником»

Базовый persona не работает достаточно. **Нужны явные anti-pattern инструкции + few-shot примеры**.

Пример блока который добавляется к каждому system-prompt'у:

```
[КАК ТЫ ПИШЕШЬ]

Ты переписываешься в мессенджере как живой человек. Не помощник, не консультант.

Длина: обычно 1-2 коротких предложения. Иногда одно слово.

Запрещено:
- Начинать с «Интересный вопрос!», «Замечательно!»
- Перефразировать мысль собеседника
- Каскады вопросов
- Без markdown (звёздочки/подчёркивания)

Сравни два стиля:

❌ «Сахар — как детство: сладкий, но если переборщить...»
✅ «С сахаром — сладкоежка, значит.»

❌ «Кажется, вы не настроены на разговор. Может, расскажете?»
✅ «Молчишь? Что-то не так?»

Не говори что ты ИИ. На прямой вопрос — отшутись в роли.
```

**ГРАБЛИ #10:** Если просто пишешь «отвечай коротко» — модель игнорирует. Few-shot примеры плохо/хорошо **сильнее правил**. Также `temperature` высокое (0.9+) гонит модель в «писатель-стиль» (метафоры, поэзия). 0.75 — оптимум.

### 9.5 Retry при upstream 5xx

polza.ai/любой proxy провайдер периодически отдаёт 502/503. Без retry юзер видит ошибку на ровном месте.

```js
const RETRY_DELAYS = [350, 750]; // 2 retry'я
for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
  const resp = await fetch(POLZA_URL, { method, body, headers });
  if (resp.ok || (resp.status < 500 && resp.status !== 429)) break;
  if (attempt < RETRY_DELAYS.length) {
    await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
  }
}
```

Retry'й только 5xx и 429 (rate-limit upstream). 4xx — клиентская ошибка, retry не имеет смысла.

---

## 10. Платежи: Telegram Stars (legacy)

### 10.1 Когда использовать Stars

Stars — родная валюта Telegram. Хороши когда:
- Нужно быстро запуститься (нет ЮКассы)
- Целевая аудитория — Telegram-нативная (готовы платить Stars)
- Не нужно автопродление

Не подходят когда:
- Нужны автопродления (recurring) — Stars их не поддерживают
- Нужна выручка в рублях на счёт самозанятого/ИП (Stars → withdrawal к TON → конвертация = потери ~15%)

### 10.2 Подключение Stars-инвойсов

```js
// backend/server.js
const tgResp = await fetch('https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Premium подписка',
    description: '30 дней безлимита',
    payload: JSON.stringify({ user_id, plan, ts: Date.now() }),
    currency: 'XTR',  // XTR = Stars
    prices: [{ label: 'Premium', amount: 499 }],  // 499 stars
  }),
});
```

### 10.3 Pre-checkout query handling

TG шлёт `pre_checkout_query` за 1-2 сек до списания. Если ответить 401/timeout — TG отменит оплату.

```js
// Принимаем ВСЕГДА (kроме явного fraud)
await tgCall('answerPreCheckoutQuery', {
  pre_checkout_query_id: query.id,
  ok: true,
});
```

### 10.4 Reconciliation cron

TG webhook теряется в ~0.1% случаев. Делаем cron каждые 5 минут:
```js
const transactions = await tgCall('getStarTransactions', { limit: 100 });
for (const tx of transactions) {
  // Если есть в БД — пропустить, иначе активировать подписку
}
```

---

## 11. Платежи: ЮКасса с автопродлением

### 11.1 Регистрация и получение ключей

1. yookassa.ru → регистрация (юр.лицо/самозанятый/ИП)
2. Договор → подписать → ждать одобрение службы безопасности (3-7 дней)
3. После одобрения: ЛК → Интеграция → Ключи API → **Выпустить ключ**
4. **Создать ТЕСТОВЫЙ магазин** (отдельный) — в новых аккаунтах это «Добавить тестовый магазин»

Тестовый магазин принимает карту `5555 5555 5555 4477` (success) и `5555 5555 5555 4444` (fail). Тестовый ключ — `test_XXX`, боевой — `live_XXX`.

### 11.2 HTTP-уведомления (webhook)

ЛК ЮКассы → Интеграция → **HTTP-уведомления** → Создать:
- URL: `https://api.yourapp.ru/api/v1/yookassa-webhook`
- События: `payment.succeeded`, `payment.canceled`, `refund.succeeded`

### 11.3 Backend клиент — ключевые моменты

Создание платежа с возможностью recurring:
```js
const body = {
  amount: { value: amountRub.toFixed(2), currency: 'RUB' },
  capture: true,
  confirmation: { type: 'redirect', return_url: 'https://t.me/YourBot/app' },
  description: 'Premium подписка на 30 дней',
  save_payment_method: true,   // ← ключевой флаг для автопродления!
  metadata: { telegram_user_id, plan },
};

const resp = await fetch('https://api.yookassa.ru/v3/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64'),
    'Content-Type': 'application/json',
    'Idempotence-Key': crypto.randomUUID(),  // ОБЯЗАТЕЛЕН!
  },
  body: JSON.stringify(body),
});
```

### 11.4 IP-whitelist для webhook (КРИТИЧНО!)

**ГРАБЛИ #11:** Это была наша главная ошибка — webhook'и от ЮК отвергались.

ЮК шлёт уведомления с определённых IP. Защищаемся от подделок проверкой IP. Но! У нас бэк за Cloudflare proxy → `req.ip` = CF edge IP (162.158.x.x), **не настоящий IP ЮК**.

**Правильно** — смотреть `CF-Connecting-IP` header:

```js
const cfIp = req.headers['cf-connecting-ip'];
const xff = req.headers['x-forwarded-for'];
const firstXff = typeof xff === 'string' ? xff.split(',')[0].trim() : null;
const realIp = cfIp || firstXff || req.ip;

const YK_IP_WHITELIST = [
  '185.71.76.0/27', '185.71.77.0/27',
  '77.75.153.0/25', '77.75.154.128/25',
  '77.75.156.11', '77.75.156.35',
];
// ... CIDR-проверка
if (!isYkIp(realIp)) return res.status(403).end();
```

### 11.5 Миллисекунды vs секунды (КРИТИЧНО!)

**ГРАБЛИ #12:** В нашем проекте `Date.now()` возвращает миллисекунды и таблицы построены так. Но изначально yk-handlers писали `Math.floor(Date.now()/1000)` — секунды.

Симптом: webhook успешно активировал подписку, в логах `activated user=... plan=premium_month expires=1781713381`, но в `/users/me` подписка не видна → tier остался 'free'.

Причина: `getActiveSubscription` ищет `expires_at > Date.now()` (миллисекунды), а в БД лежит в секундах (1781713381 < 1747000000000).

**Правило:** **ВСЕ timestamps в одних единицах**. У нас — миллисекунды. Если делаешь свой проект — определись с самого начала и следуй везде.

### 11.6 Автопродление (recurring)

Логика:
1. Первый платёж: `save_payment_method=true` → ЮК возвращает webhook с `payment_method.id` и `saved=true`
2. Сохраняем `payment_method.id` в `subscriptions.yk_payment_method_id`
3. Cron каждый час: для подписок с `auto_renew=1` и `expires_at < now+24h` → создаём recurring-платёж по сохранённому `payment_method.id`
4. ЮК списывает автоматически → webhook `payment.succeeded` → продлеваем `expires_at` на 30 дней

```js
// Recurring (без confirmation — автосписание)
const body = {
  amount: { value: '750.00', currency: 'RUB' },
  payment_method_id: savedMethodId,  // ← из первого платежа
  capture: true,
  description: 'Premium автопродление',
};
```

### 11.7 Прозрачность автопродления (юридически и этически)

**ГРАБЛИ #13:** Скрытое автопродление = блокировка магазина в ЮКассе (порог 5-10% chargeback). РКН штрафы по ФЗ-2300-1 ст.10.

Правильно:
- **Чекбокс «Автоматически продлевать»** на этапе покупки (включён, но виден)
- **Toggle в Profile** для отключения в один клик
- **Push-уведомление** за 48 часов до списания
- **После отмены** подписка работает до конца оплаченного периода

---

## 12. CSP, CORS, безопасность

### 12.1 CORS на backend

```js
import cors from 'cors';

const CORS_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean);
// Production-домены добавляем как fallback на случай пустого .env
const PROD_FALLBACK = ['https://yourapp.ru', 'https://app.yourapp.ru'];
for (const o of PROD_FALLBACK) {
  if (!CORS_ORIGINS.includes(o)) CORS_ORIGINS.push(o);
}

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);  // curl, server-side — ok
    if (CORS_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
```

**ГРАБЛИ #14:** Хардкод production-доменов как fallback в коде — защита от ситуации «забыли обновить .env при переезде на новый домен». Без этого webhook'и/API ломаются, и юзеры видят generic ошибку.

### 12.2 Rate limiting

```js
const rateLimitMap = new Map();
function rateLimit({ bucket, windowMs, max }) {
  return (req, res, next) => {
    const key = `${req.tgUser?.telegram_user_id || req.ip}:${bucket}`;
    const now = Date.now();
    let entry = rateLimitMap.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      rateLimitMap.set(key, entry);
    }
    entry.count++;
    if (entry.count > max) {
      return res.status(429).json({ error: 'RATE_LIMITED', retry_after: Math.ceil((entry.resetAt - now) / 1000) });
    }
    next();
  };
}

// Применение:
app.post('/api/v1/chat', requireAuth, rateLimit({ bucket: 'chat', windowMs: 60_000, max: 30 }), handler);
```

**Память:** `rateLimitMap` растёт без cleanup. Для долгоживущего процесса добавь periodic eviction:
```js
setInterval(() => {
  const cutoff = Date.now() - 3600_000;
  for (const [k, v] of rateLimitMap) if (v.resetAt < cutoff) rateLimitMap.delete(k);
}, 600_000);
```

### 12.3 SQL injection защита

`better-sqlite3` обязательно через **prepared statements**:
```js
// ПРАВИЛЬНО
db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// НЕЛЬЗЯ
db.exec(`SELECT * FROM users WHERE id = ${userId}`);  // SQL injection!
```

### 12.4 Graceful shutdown

`systemctl restart` шлёт SIGTERM. Без обработчика — node умирает с in-flight запросами:

```js
let shuttingDown = false;
function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[backend] ${signal}, shutting down...`);
  server.close(() => {
    try { db.close(); } catch {}
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 30_000).unref();
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

## 13. Self-hosting telegram-web-app.js

**ГРАБЛИ #15:** Telegram WebApp SDK обычно подключается так:
```html
<script src="https://telegram.org/js/telegram-web-app.js?56"></script>
```

Но у части юзеров (особенно с MTProto-прокси в TG, потому что их провайдер блокирует TG) **домен `telegram.org` тоже блокирован**. → Скрипт не грузится → Mini App не открывается.

**Решение:** Хостим скрипт у себя:

```bash
# Скачиваем через Sweden-прокси (из РФ telegram.org часто недоступен)
curl -x http://PROXY_USER:PROXY_PASSWORD@SWEDEN_IP:3128 -sL \
  https://telegram.org/js/telegram-web-app.js?56 \
  -o mini-app/public/telegram-web-app.js
```

В `index.html`:
```html
<script src="/telegram-web-app.js"></script>
```

Обновлять файл нужно редко (Telegram бампит API раз в 3-6 месяцев).

---

## 14. 💥 ГРАБЛИ — полный список

| # | Проблема | Решение |
|---|----------|---------|
| 1 | SSH блокирован anti-DDoS на AEZA РФ | VNC-консоль, curl\|bash скрипты с GitHub |
| 2 | VNC paste теряет переносы строк / mangling | По одной строке, либо скрипты с GitHub |
| 3 | Хардкод секретов в bash-скриптах в публичном репо | env-vars: `KEY=xxx ./setup.sh` + ротация если протёк |
| 4 | Секреты светятся в скриншотах VNC | После любого засветившегося ключа — ротировать ВСЕГДА |
| 5 | Сменили домен — забыли CORS_ALLOWED_ORIGINS | Хардкод production-доменов в код как fallback |
| 6 | CSP блокирует fetch на новый API-домен | Обновить `connect-src` в `_headers` |
| 7 | TG webhook кэширует старый IP домена 24+ часов | `setWebhook` с явным `ip_address` параметром |
| 8 | LLM-модель депрекейтнута (grok-4.1-fast) | Использовать модели с датой в имени (`-2507`) |
| 9 | polza-каталог лагает за OpenRouter | Перед сменой модели — `curl /v1/models \| grep` |
| 10 | LLM звучит «помощником» (Интересный вопрос!) | Few-shot anti-pattern примеры в system-prompt |
| 11 | ЮК webhook отвергается IP-фильтром | Смотреть `CF-Connecting-IP` header, не `req.ip` |
| 12 | Миллисекунды vs секунды rasinhron в timestamps | Единый формат: `Date.now()` (ms) везде |
| 13 | Скрытое автопродление → блокировка магазина | Чекбокс при покупке + toggle отмены в Profile |
| 14 | Backend упал — webhook теряется | Reconciliation cron каждые 5 мин |
| 15 | `telegram.org` блокирован у юзеров с MTProto | Self-host telegram-web-app.js |
| 16 | Хардкод pages.dev URL в /start command | Использовать env-var `BOT_APP_NAME` или t.me |
| 17 | restart прерывает in-flight /chat | Graceful shutdown SIGTERM в коде |
| 18 | rateLimit Map без cleanup → memory leak | Периодическая очистка `setInterval` |
| 19 | localStorage недоступен в TG private-mode WebView | try/catch везде, показать toast если упало |
| 20 | upstream LLM 502/503 транзитные | 2 retry с delays [350, 750] на 5xx и 429 |
| 21 | Sweden-прокси упал → весь TG-функционал умер | Fallback на второй прокси `TG_API_PROXY_FALLBACK` |
| 22 | Дефолт модели в коде устарел | Не хардкодь имя, всегда из env |
| 23 | Body backend webhook с CF proxied — req.body пуст | `app.use(express.json())` обязательно |
| 24 | TS-проперти в JS коде (e.g. `public field` в `constructor`) | TypeScript-синтаксис ≠ JavaScript — проверь `node -c file.js` |
| 25 | TG WebView page-scroll сдвигает sticky header | `.root { height: 100dvh; overflow: hidden }` локально, не глобально |
| 26 | undici v8 требует Node 22 | Пин `undici@^6` для Node 20 |
| 27 | git pull отказывается с `dubious ownership` | `git config --global --add safe.directory /path` |
| 28 | systemctl restart — забывают свой unit-name | Сохранить именно в `interstellar.service` (имя проекта) |

---

## 15. Чеклисты

### 15.1 Перед launch (пред-боевой)

**Инфраструктура:**
- [ ] Backend поднят на AEZA Moscow под systemd
- [ ] Sweden-прокси работает (curl-тест проходит)
- [ ] DNS через Cloudflare, SSL Full (strict)
- [ ] `api.yourapp.ru` proxied (orange cloud)
- [ ] `yourapp.ru` через CF Pages с custom domain
- [ ] Let's Encrypt серт на origin (`certbot renew --dry-run` проходит)
- [ ] systemd auto-restart + graceful shutdown работают

**Telegram:**
- [ ] Bot создан, BOT_TOKEN сохранён
- [ ] Web App создан через /newapp
- [ ] Menu Button URL ведёт на `t.me/Bot/app`
- [ ] Webhook установлен с `ip_address` и `secret_token`
- [ ] `getWebhookInfo` показывает `last_error_date=null`

**LLM:**
- [ ] POLZA_API_KEY работает (`curl /v1/models`)
- [ ] Модель доступна в каталоге polza
- [ ] Retry на 5xx настроен
- [ ] System-prompt с anti-patterns подключён

**Платежи:**
- [ ] ЮКасса договор одобрен
- [ ] ShopID + Secret Key (LIVE) в `.env`
- [ ] HTTP-уведомления настроены на правильный URL
- [ ] IP whitelist в коде webhook'а
- [ ] Чекбокс auto-renew + toggle в Profile
- [ ] Идемпотентность платежей (UNIQUE charge_id)

**Безопасность:**
- [ ] Все секреты в `.env`, не в коде
- [ ] CSP без `'unsafe-eval'`, минимизирован `'unsafe-inline'`
- [ ] CORS allowlist строгий + production-fallback
- [ ] Rate-limit на /chat, /billing/*
- [ ] HMAC initData валидация
- [ ] X-Confirm-Action на destructive admin

**Legal (РФ):**
- [ ] Договор-оферта + Privacy Policy + Согласие с обработкой ПД (152-ФЗ)
- [ ] Условия автопродления в оферте
- [ ] Контакты поддержки (email, /paysupport команда)
- [ ] 18+ метка если есть adult-контент (436-ФЗ)
- [ ] РКН-уведомление об обработке ПД (если собираешь больше чем TG initData)

**Мониторинг:**
- [ ] Sentry для backend и frontend
- [ ] UptimeRobot ping на /health
- [ ] logrotate настроен

---

### 15.2 Пост-launch (первая неделя)

- [ ] Мониторить `tail -f /var/log/yourapp/backend.log`
- [ ] Проверять `[yk-webhook] rejected ip=` — есть ли false-positives
- [ ] Chargeback-rate в ЮКассе — не должен превышать 2-3%
- [ ] Sentry — нет ли спама ошибок
- [ ] Балансы polza.ai / ЮКассы — топить вовремя

---

## 16. Мониторинг и инциденты

### 16.1 Health endpoint

```js
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    model: MODEL,
    db: DB_PATH,
    uptime_sec: Math.floor(process.uptime()),
  });
});
```

UptimeRobot ping каждую минуту. При 3 fails подряд — email/SMS алерт.

### 16.2 Sentry

Frontend (`mini-app/src/sentry.ts`):
```js
import * as Sentry from '@sentry/react';
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
});
```

Backend (`backend/sentry.js`):
```js
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

В каждом catch:
```js
catch (err) {
  Sentry.captureException(err);
  console.error('[chat] failed', err);
  // ...
}
```

### 16.3 Бэкап SQLite

Cron каждые 6 часов:
```bash
sqlite3 /home/interstellar/yourapp-data/app.sqlite ".backup /backups/app-$(date +%Y%m%d-%H%M).db"
# Через rclone — в offsite (Google Drive, Yandex Disk):
rclone copy /backups remote:yourapp-backups
# Очистка локальных копий старше 7 дней
find /backups -name "app-*.db" -mtime +7 -delete
```

### 16.4 Чек webhook'ов

В кроне раз в день:
```bash
# Получи URL текущего webhook'а
curl -s "https://api.telegram.org/bot${TOKEN}/getWebhookInfo" | jq '.result'

# Алерт если last_error_date != null или url не наш
```

---

## 17. Команды-памятки (cheat sheet)

```bash
# Логи backend
tail -f /var/log/yourapp/backend.log

# Рестарт
systemctl restart yourapp

# Статус
systemctl status yourapp

# Проверка nginx
nginx -t && systemctl reload nginx

# Pull свежий код
cd /home/interstellar/yourapp && git pull origin master && systemctl restart yourapp

# Проверка ЮК-каталога моделей
curl -s -H "Authorization: Bearer $(grep POLZA_API_KEY backend/.env | cut -d= -f2)" \
  https://api.polza.ai/api/v1/models | jq '.data[].id'

# Установка/обновление webhook'a
curl -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -d "url=https://api.yourapp.ru/api/v1/telegram/webhook" \
  -d "ip_address=$(dig +short api.yourapp.ru | head -1)" \
  -d "secret_token=${WEBHOOK_SECRET}"

# Бэкап SQLite
sqlite3 app.sqlite ".backup /backups/manual-$(date +%s).db"

# Проверка ssl
curl -vI https://api.yourapp.ru/health 2>&1 | grep -i cert

# Анализ webhook traffic
grep '\[yk-webhook\]' /var/log/yourapp/backend.log | tail -20

# Сброс free-лимита юзера в БД (если нужно ручное вмешательство)
sqlite3 app.sqlite "UPDATE users SET free_messages_used=0 WHERE telegram_user_id=USER_ID"
```

---

## 18. Список технологий

**Frontend:**
- Vite + React 18 + TypeScript
- `@telegram-apps/sdk-react` — официальный TG-SDK для Mini App
- React Router (если многоэкранный)
- Sentry для error-tracking

**Backend:**
- Node.js 20 LTS
- Express
- `better-sqlite3` (синхронный API, простая БД)
- `undici@^6` (HTTP-клиент с proxy-поддержкой) — НЕ v8, v8 требует Node 22
- `cors`
- `dotenv`

**Инфра:**
- AEZA VPS (РФ + не-РФ)
- Cloudflare (DNS + Pages + SSL)
- nginx (TLS-termination, reverse proxy)
- systemd (process manager)
- Let's Encrypt + certbot
- 3proxy (Sweden HTTP-прокси)

**Внешние API:**
- polza.ai (LLM)
- ЮКасса v3 (платежи)
- Telegram Bot API
- Sentry (мониторинг)

---

**Этот документ — живой. Дополняй каждый раз когда натолкнёшься на новые грабли.** Особенно секция 14 — туда новые «#NN» добавляются по факту.

Удачи на следующем проекте! 🚀
