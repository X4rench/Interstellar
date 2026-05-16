# Деплой Interstellar: AEZA Moscow + зарубежный прокси

Инструкция step-by-step для развёртывания Telegram Mini App с архитектурой:
- **Backend** на AEZA Moscow (РФ, для 152-ФЗ/242-ФЗ соответствия)
- **Прокси** на Hetzner Helsinki (зарубеж, для надёжного доступа к api.telegram.org)
- **Frontend** на Cloudflare Pages (бесплатно, edge-CDN)

**Бюджет**: ~$13/мес (≈1200₽) на оба сервера.

**Время на развёртывание**: 2-3 часа с нуля.

---

## Архитектура

```
┌─────────────────────────┐
│ Cloudflare Pages        │  ← Frontend (mini-app/dist)
│ static React build      │     бесплатно, edge-cached
└──────────┬──────────────┘
           │ HTTPS API calls
           ▼
┌─────────────────────────┐
│ AEZA Moscow MSKs-1      │  ← Backend (Node.js + SQLite)
│ Россия, 593₽/мес        │     данные граждан РФ хранятся здесь
│ Express + better-sqlite3│     (242-ФЗ локализация)
└──────────┬──────────────┘
           │ TG_API_PROXY (HTTP/SOCKS5)
           ▼
┌─────────────────────────┐
│ Hetzner CX22 Helsinki   │  ← Прокси к api.telegram.org
│ Финляндия, €5.83/мес    │     стабильный канал к TG
│ 3proxy (HTTP+SOCKS5)    │     не зависит от RU-блокировок
└──────────┬──────────────┘
           │
           ▼
   api.telegram.org
   (Bot API + Webhook outbound)
```

**Почему такая схема**:
- AEZA Moscow в РФ → данные пользователей и партнёров хранятся на территории РФ (соответствие 242-ФЗ)
- Hetzner Helsinki как буфер к Telegram API → защита от потенциальных проблем с маршрутизацией к api.telegram.org из РФ-сетей
- Cloudflare Pages → быстрая загрузка frontend для пользователей по всему миру

---

## 0. Что нужно иметь перед началом

- [ ] GitHub-аккаунт + код Interstellar в репозитории (приватном или публичном)
- [ ] Telegram-аккаунт для @BotFather и @userinfobot
- [ ] Банковская карта для Hetzner (международная, Russia cards могут не работать — иногда требуется альтернативный платёжный метод)
- [ ] Доступ к Госуслугам с КЭП (для подачи уведомления в РКН — отдельный шаг, не блокирует деплой, но обязательный по 152-ФЗ)
- [ ] POLZA_API_KEY с polza.ai (уже есть из RN-проекта)
- [ ] Решённые юридические placeholder'ы из `legalContent.ts`:
  - [ПРАВООБЛАДАТЕЛЬ_ФИО]
  - [ПРАВООБЛАДАТЕЛЬ_ИНН]
  - [ПРАВООБЛАДАТЕЛЬ_СТАТУС]
  - [SUPPORT_EMAIL] / [PRIVACY_EMAIL]
  - [BOT_USERNAME]

---

## Часть 1. Зарубежный прокси на Hetzner

### 1.1. Регистрация на Hetzner Cloud

1. Открой [hetzner.com/cloud](https://www.hetzner.com/cloud)
2. **Sign up** → введи email + пароль → подтверди email
3. Заполни billing-данные:
   - Имя/фамилия как в паспорте (латиницей)
   - Адрес (можно домашний, российский — допустимо)
   - Привяжи карту (Visa/Mastercard)

   **⚠️ Если карта РФ-банка не проходит**:
   - Попробуй карту любого российского банка с международной поддержкой (Тинькофф работает у многих)
   - Альтернатива — карта казахстанского банка, либо карта виртуальная (Cardless, Pyypl)
   - Альтернативный провайдер: **Mevspace** (Польша, принимает РФ-карты), цены похожие

### 1.2. Создание сервера

1. **Cloud → Servers → Add Server**
2. Параметры:
   - **Location**: `Helsinki` (Финляндия) — ближе всего к РФ, низкий latency
   - **Image**: `Ubuntu 22.04`
   - **Type**: `CX22` (€5.83/мес) — 2 vCPU, 4 GB RAM, 40 GB SSD. Для прокси с головой
   - **SSH Keys**:
     - На своей машине: `ssh-keygen -t ed25519 -C "interstellar-proxy"` (если ключа нет)
     - Скопируй содержимое `~/.ssh/id_ed25519.pub`
     - В Hetzner: **Add SSH Key** → вставь публичный ключ
   - **Firewalls**: не выбирай (настроим вручную через ufw)
   - **Name**: `interstellar-proxy`
3. **Create & Buy now** → сервер создастся за ~30 сек
4. Запиши **публичный IP** (вид: `95.217.X.X`) — он понадобится

### 1.3. Базовая настройка сервера

С твоей машины:

```bash
# Подключение
ssh root@95.217.X.X

# Первое что делаем — обновление пакетов
apt update && apt upgrade -y

# Базовые утилиты
apt install -y curl wget htop nano ufw fail2ban

# Создаём непривилегированного пользователя (root-only небезопасно)
adduser interstellar
usermod -aG sudo interstellar

# Копируем SSH-ключ из root в нового пользователя
mkdir -p /home/interstellar/.ssh
cp ~/.ssh/authorized_keys /home/interstellar/.ssh/
chown -R interstellar:interstellar /home/interstellar/.ssh
chmod 700 /home/interstellar/.ssh
chmod 600 /home/interstellar/.ssh/authorized_keys

# Отключение root SSH login (хорошая практика)
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Firewall — пропускаем только SSH (22) + proxy-порты (которые настроим)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw --force enable
```

**Открой новое окно терминала** (не закрывая текущее — на случай если что-то пошло не так) и проверь:

```bash
ssh interstellar@95.217.X.X
```

Должно зайти под новым пользователем. Если работает — текущее root-окно можно закрыть.

### 1.4. Установка 3proxy

`3proxy` — лёгкий, надёжный HTTP/SOCKS5 прокси-сервер. Бэкенд будет ходить через него к api.telegram.org.

```bash
# От interstellar (с sudo для install):
sudo apt install -y build-essential

# Клонируем и собираем 3proxy
cd /tmp
wget https://github.com/3proxy/3proxy/archive/refs/tags/0.9.4.tar.gz
tar xzf 0.9.4.tar.gz
cd 3proxy-0.9.4
make -f Makefile.Linux
sudo make -f Makefile.Linux install

# Конфиг
sudo mkdir -p /etc/3proxy
sudo nano /etc/3proxy/3proxy.cfg
```

Вставь содержимое (замени `STRONG_PASSWORD_HERE` на случайный пароль):

```conf
# 3proxy config для Interstellar
# Только HTTP-прокси на 3128 + SOCKS5 на 1080

nserver 1.1.1.1
nserver 8.8.8.8
nscache 65536

timeouts 1 5 30 60 180 1800 15 60

# Логирование
log /var/log/3proxy/3proxy.log D
logformat "L%d-%m-%Y %H:%M:%S %z %N.%p %E %U %C:%c %R:%r %O %I %h %T"
rotate 30

# Авторизация по логину/паролю
auth strong
users interstellar:CL:STRONG_PASSWORD_HERE

# HTTP proxy на 3128
proxy -p3128 -i0.0.0.0 -e0.0.0.0

# SOCKS5 proxy на 1080
socks -p1080 -i0.0.0.0 -e0.0.0.0
```

**ВАЖНО**: сгенерируй надёжный пароль:
```bash
openssl rand -base64 24
```
Используй его вместо `STRONG_PASSWORD_HERE`. Запиши пароль — он нужен для бэкенда.

```bash
# Папка для логов
sudo mkdir -p /var/log/3proxy
sudo chown nobody:nogroup /var/log/3proxy

# systemd service
sudo nano /etc/systemd/system/3proxy.service
```

Вставь:

```ini
[Unit]
Description=3proxy HTTP/SOCKS5 proxy
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/3proxy /etc/3proxy/3proxy.cfg
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Запускаем
sudo systemctl daemon-reload
sudo systemctl enable 3proxy
sudo systemctl start 3proxy
sudo systemctl status 3proxy

# Открываем порты в firewall
sudo ufw allow 3128/tcp
sudo ufw allow 1080/tcp
sudo ufw status
```

### 1.5. Тест прокси

На своей машине (или с AEZA-сервера позже):

```bash
# HTTP proxy test
curl -x http://interstellar:STRONG_PASSWORD_HERE@95.217.X.X:3128 https://api.telegram.org/bot123456:test/getMe

# SOCKS5 proxy test
curl --socks5 interstellar:STRONG_PASSWORD_HERE@95.217.X.X:1080 https://api.telegram.org/bot123456:test/getMe
```

Должен вернуться JSON `{"ok":false,"error_code":401,"description":"Unauthorized"}` — это значит прокси работает, просто токен фейковый.

✅ Прокси готов. Сохрани:
- IP сервера: `95.217.X.X`
- Логин: `interstellar`
- Пароль: `STRONG_PASSWORD_HERE`
- Порт HTTP: `3128`
- Порт SOCKS5: `1080`

---

## Часть 2. Backend на AEZA Moscow

### 2.1. Базовая настройка AEZA-сервера

После аренды AEZA Moscow MSKs-1 ты получил email с реквизитами:
- IP-адрес: `185.X.X.X`
- root-пароль или SSH-ключ

```bash
# Подключение (от твоей машины)
ssh root@185.X.X.X

# Базовое обновление
apt update && apt upgrade -y
apt install -y curl wget git nano ufw build-essential certbot python3-certbot-nginx nginx
```

Создание пользователя и базовая безопасность (как в Hetzner, см. часть 1.3 — те же команды):

```bash
adduser interstellar
usermod -aG sudo interstellar
mkdir -p /home/interstellar/.ssh
cp ~/.ssh/authorized_keys /home/interstellar/.ssh/ 2>/dev/null || true
chown -R interstellar:interstellar /home/interstellar/.ssh
chmod 700 /home/interstellar/.ssh
chmod 600 /home/interstellar/.ssh/authorized_keys 2>/dev/null || true

# Отключение root SSH
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 2.2. Установка Node.js 20

Через nvm (более гибко чем системный пакет):

```bash
# Перелогинься в interstellar
ssh interstellar@185.X.X.X

# nvm installer
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Обнови shell
source ~/.bashrc

# Установка Node 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Проверка
node --version  # должно быть v20.x.x
npm --version
```

### 2.3. Клонирование и сборка backend

```bash
# Если репо приватный — нужно настроить deploy key или git creds
# Простой вариант — GitHub Personal Access Token:
# github.com/settings/tokens → Generate new token → repo scope

cd ~
git clone https://github.com/YOUR_USERNAME/interstellar.git
# Если приватный:
# git clone https://YOUR_PAT@github.com/YOUR_USERNAME/interstellar.git

cd ~/interstellar/backend
npm ci
```

### 2.4. Конфигурация .env

```bash
cp .env.example .env
nano .env
```

**Критичные поля для production-режима**:

```bash
# polza.ai (LLM)
POLZA_API_KEY=твой_ключ_с_polza_ai
POLZA_API_URL=https://api.polza.ai/api/v1/chat/completions
POLZA_MODEL=openai/gpt-4o-mini

# Server
PORT=3001
NODE_ENV=production
TRUST_PROXY_HOPS=1  # 1 потому что за nginx стоим

# Telegram Bot
BOT_TOKEN=твой_токен_от_BotFather
BOT_USERNAME=InterstellarChatBot
DB_PATH=/home/interstellar/interstellar-data/interstellar.sqlite

# DEV bypass ОТКЛЮЧЁН (продакшен)
DEV_BYPASS_INITDATA=0

# CORS — заполнишь после деплоя frontend
CORS_ALLOWED_ORIGINS=https://interstellar-app.pages.dev

# RBAC
ADMIN_TELEGRAM_IDS=твой_telegram_user_id_от_userinfobot
PAYOUT_ENCRYPTION_KEY=сгенерируй_через_openssl_rand_base64_32
PARTNER_PII_CONSENT_VERSION=2026.05
BUSINESS_INN=твой_ИНН
BUSINESS_NAME=Interstellar

# Тарифы (Stars)
STAR_PRICE_BASIC=199
STAR_PRICE_PREMIUM=499
STAR_PRICE_DAY_PASS=50

# Webhook
TELEGRAM_WEBHOOK_SECRET=сгенерируй_через_openssl_rand_hex_32
PUBLIC_BASE_URL=https://api.yourdomain.ru  # или без домена, см. ниже

# ⭐ КЛЮЧЕВОЕ — прокси к api.telegram.org через Hetzner
TG_API_PROXY=http://interstellar:STRONG_PASSWORD_HERE@95.217.X.X:3128
# Альтернатива — SOCKS5:
# TG_API_PROXY=socks5://interstellar:STRONG_PASSWORD_HERE@95.217.X.X:1080

# Reconciliation
RECONCILE_INTERVAL_MIN=5
```

Сгенерируй секреты:

```bash
echo "PAYOUT_ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo "TELEGRAM_WEBHOOK_SECRET=$(openssl rand -hex 32)"
```

Скопируй их в `.env`.

### 2.5. Создание папки данных + первый запуск

```bash
# Папка для SQLite файла (вне репо)
mkdir -p ~/interstellar-data

# Тестовый запуск
cd ~/interstellar/backend
node server.js
```

Должен вывести:
```
[db] applied migration 001_init.sql
[db] applied migration 002_affiliate.sql
[db] applied migration 003_chat_usage.sql
[db] applied migration 004_pricing_tiers.sql
[db] applied migration 005_free_messages_used.sql
[backend] listening on http://localhost:3001
[backend] model:    openai/gpt-4o-mini
[backend] auth:     BOT_TOKEN HMAC
```

Ctrl+C для остановки.

### 2.6. systemd service

```bash
sudo nano /etc/systemd/system/interstellar.service
```

Содержимое (замени пути если структура другая):

```ini
[Unit]
Description=Interstellar Backend
After=network.target

[Service]
Type=simple
User=interstellar
WorkingDirectory=/home/interstellar/interstellar/backend
ExecStart=/home/interstellar/.nvm/versions/node/v20.x.x/bin/node server.js
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/interstellar/backend.log
StandardError=append:/var/log/interstellar/backend.err.log
EnvironmentFile=/home/interstellar/interstellar/backend/.env

[Install]
WantedBy=multi-user.target
```

⚠️ **Замени `v20.x.x`** на актуальную версию: `ls ~/.nvm/versions/node/`

```bash
# Папка для логов
sudo mkdir -p /var/log/interstellar
sudo chown interstellar:interstellar /var/log/interstellar

# Запуск
sudo systemctl daemon-reload
sudo systemctl enable interstellar
sudo systemctl start interstellar
sudo systemctl status interstellar

# Логи в реальном времени
sudo journalctl -u interstellar -f
# или
tail -f /var/log/interstellar/backend.log
```

### 2.7. nginx reverse proxy + SSL

Тебе понадобится домен. Если нет — купи на reg.ru (от 199₽/год для `.ru`) или используй бесплатный поддомен от Cloudflare/DuckDNS.

Допустим домен: `api.interstellar-app.ru` (направь A-запись на IP AEZA).

```bash
sudo nano /etc/nginx/sites-available/interstellar
```

```nginx
server {
    server_name api.interstellar-app.ru;
    listen 80;

    # Telegram webhooks — приоритетный proxy
    location /api/v1/telegram/webhook {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Telegram-Bot-Api-Secret-Token $http_x_telegram_bot_api_secret_token;
        client_max_body_size 1m;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/interstellar /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# SSL через Let's Encrypt
sudo certbot --nginx -d api.interstellar-app.ru
# Соглашайся со всеми вопросами, выбери redirect HTTP→HTTPS

# Тест
curl https://api.interstellar-app.ru/health
# Должно вернуть {"ok":true,"model":"openai/gpt-4o-mini",...}
```

Авто-обновление SSL уже настроится через systemd timer от certbot.

✅ Backend готов.

---

## Часть 3. Frontend на Cloudflare Pages

### 3.1. Push в GitHub

На своей машине:

```bash
cd "D:\TwinStars\Character Chat\CharacterChatRN"
git status
# Если ещё не закоммичено — закоммить:
git add .
git commit -m "Production deployment"
git push origin main
```

### 3.2. Cloudflare Pages setup

1. Открой [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages → Create → Pages → Connect to Git**
3. Подключи GitHub → выбери репозиторий `interstellar`
4. **Build settings**:
   - Framework preset: `Vite`
   - Build command: `npm ci && npm run build`
   - Build output directory: `dist`
   - Root directory: `mini-app`
5. **Environment variables (Production)**:
   - `VITE_API_BASE_URL` = `https://api.interstellar-app.ru/api/v1`
   - `VITE_SENTRY_DSN` = (опционально, если есть Sentry)
6. **Save and Deploy**

Через 2-3 минуты получишь URL вида `https://interstellar-xxx.pages.dev`.

### 3.3. Обновление CORS на бэкенде

```bash
# На AEZA-сервере:
ssh interstellar@185.X.X.X
nano ~/interstellar/backend/.env

# Найди CORS_ALLOWED_ORIGINS и обнови:
CORS_ALLOWED_ORIGINS=https://interstellar-xxx.pages.dev

# Перезапуск
sudo systemctl restart interstellar
```

---

## Часть 4. Telegram Bot setup

### 4.1. Создание бота в @BotFather

В Telegram:
```
/newbot
→ имя: Интерстеллар
→ username: InterstellarChatBot (любой свободный, оканчивающийся на bot)
```

Запиши **BOT_TOKEN** (формат `123456:AABBCC...`).

Узнай свой `telegram_user_id`:
1. Открой @userinfobot
2. Напиши `/start`
3. Запомни число

Вставь оба значения в `.env` на AEZA:
```bash
ssh interstellar@185.X.X.X
nano ~/interstellar/backend/.env

BOT_TOKEN=123456:AABBCC...
BOT_USERNAME=InterstellarChatBot
ADMIN_TELEGRAM_IDS=твой_user_id

sudo systemctl restart interstellar
```

### 4.2. Регистрация webhook через прокси

Поскольку BOT_TOKEN ещё не был установлен при первом запуске, webhook нужно зарегистрировать вручную:

```bash
cd ~/interstellar/backend
PUBLIC_BASE_URL=https://api.interstellar-app.ru \
  node scripts/setup-webhook.js
```

Скрипт автоматически использует `TG_API_PROXY` из `.env` для обращения к api.telegram.org. Должно вывести:
```
✅ Webhook is configured correctly
```

Если не сработает — вручную через curl (бэкенд автоматически использует прокси для исходящих TG API запросов, но проверить можно так):
```bash
curl -x http://interstellar:STRONG_PASSWORD_HERE@95.217.X.X:3128 \
  "https://api.telegram.org/botBOT_TOKEN/setWebhook" \
  -d url=https://api.interstellar-app.ru/api/v1/telegram/webhook \
  -d secret_token=TELEGRAM_WEBHOOK_SECRET_ИЗ_ENV \
  -d allowed_updates='["message","pre_checkout_query","my_chat_member"]'
```

### 4.3. Подключение Mini App в @BotFather

```
/newapp
→ выбери бота InterstellarChatBot
→ Title: Интерстеллар
→ Description: AI-чат с великими личностями
→ Photo: загрузи 640x360 PNG логотипа
→ Web App URL: https://interstellar-xxx.pages.dev
→ Short name: app (запомни — это `BOT_APP_NAME` в .env)
```

### 4.4. Menu Button

```
/mybots → InterstellarChatBot → Bot Settings → Menu Button → Configure menu button
→ Text: 🚀 Открыть Интерстеллар
→ URL: https://t.me/InterstellarChatBot/app
```

### 4.5. Privacy Policy URL (требование TG)

```
/mybots → InterstellarChatBot → Bot Settings → Configure Mini App → Privacy Policy URL
→ https://interstellar-xxx.pages.dev/legal/privacy_policy
```

---

## Часть 5. Smoke-тест

1. **Открой бота** в Telegram через поиск → нажми Menu Button
2. **Mini App** должен открыться с твоим именем сверху + бейдж `18+` рядом с логотипом
3. **Profile** → должна быть секция «Администрирование» (потому что твой ID в `ADMIN_TELEGRAM_IDS`)
4. **Free тариф** — отправь 10 сообщений с любым персонажем. 11-е должно вернуть `LIFETIME_LIMIT_EXCEEDED` и открыть Paywall
5. **Покупка Basic (199⭐)** — на Paywall нажми «Купить за 199 ⭐» → пройди реальную оплату (купи Stars через @PremiumBot если нет)
6. **Webhook** — в логах AEZA должно появиться `[webhook] successful_payment`:
   ```bash
   sudo journalctl -u interstellar -f
   ```
7. **/paysupport** — напиши боту `/paysupport` напрямую (не в Mini App), должен ответить с инфой по тарифам
8. **NSFW гейт** — после покупки Premium доступны 18+ персонажи

---

## Часть 6. Уведомление в РКН (отдельно от деплоя)

🚨 **Обязательно перед запуском маркетинга** (штраф 100-300к ₽ если не подать):

1. [Госуслуги](https://www.gosuslugi.ru/600178/1/form) — раздел «Уведомление об обработке персональных данных»
2. Нужна КЭП (квалифицированная электронная подпись) — если нет, оформи у любого аккредитованного УЦ (1500-3000₽)
3. Заполни форму:
   - Оператор: ты (ФИО, ИНН, статус самозанятого/ИП)
   - Цель обработки: «Информационно-развлекательный сервис на основе ИИ»
   - Категории субъектов: пользователи Telegram, партнёры
   - Категории ПДн: технические идентификаторы Telegram, тексты сообщений, ФИО/ИНН/реквизиты партнёров
   - Меры безопасности: HTTPS, AES-256-GCM, HMAC-валидация initData
   - Срок обработки: до отзыва согласия
4. Подпиши КЭП и отправь. РКН рассматривает 30 дней, но обработка ПДн можно начать сразу с момента подачи

---

## Часть 7. Troubleshooting

### Backend не стартует

```bash
sudo journalctl -u interstellar -n 100
# Проверь логи на ошибки
```

Частые причины:
- Неверный путь к node в systemd unit → проверь `which node` от пользователя interstellar
- Отсутствует `DB_PATH` папка → `mkdir -p /home/interstellar/interstellar-data`
- Неверный BOT_TOKEN → проверь что нет лишних пробелов/кавычек

### Webhook не приходит

```bash
# Получи текущий webhook info (через прокси)
curl -x http://interstellar:PASS@95.217.X.X:3128 \
  "https://api.telegram.org/botBOT_TOKEN/getWebhookInfo" | jq
```

Что смотреть:
- `url` — должен совпадать с `PUBLIC_BASE_URL/api/v1/telegram/webhook`
- `last_error_message` — если есть, читай его. Часто:
  - `SSL error` → проверь certbot, убедись что HTTPS работает
  - `Bad webhook: invalid HTTPS URL` → должен быть https, не http
  - `Wrong secret token` → секрет в setWebhook ≠ секрет в .env

### Прокси Hetzner не работает

```bash
# На AEZA проверь доступность Hetzner
curl -x http://interstellar:PASS@95.217.X.X:3128 https://api.telegram.org/

# Если timeout — проверь firewall на Hetzner:
ssh interstellar@95.217.X.X
sudo ufw status  # должны быть открыты 3128 и 1080

# Если порт открыт но не отвечает — проверь 3proxy:
sudo systemctl status 3proxy
sudo tail -20 /var/log/3proxy/3proxy.log
```

### CORS error в браузере

```bash
ssh interstellar@185.X.X.X
nano ~/interstellar/backend/.env

# Убедись что URL точный, БЕЗ trailing slash, через запятую без пробелов:
CORS_ALLOWED_ORIGINS=https://interstellar-xxx.pages.dev

sudo systemctl restart interstellar
```

### Пользователи жалуются на медленные ответы

Проверь:
1. polza.ai upstream — `curl -i ... https://api.polza.ai/api/v1/models -H "Authorization: Bearer KEY"` — должно быть быстро (<500ms)
2. AEZA → Hetzner latency — `ping 95.217.X.X` с AEZA. Должно быть 30-60ms (РФ→Финляндия близко)
3. Sentry дашборд (если настроен) — посмотри p95 endpoint'ов

### Пользователи не могут открыть Mini App

1. Проверь BOT_APP_NAME=app (короткое имя совпадает с тем что указано в /newapp)
2. Cloudflare Pages → Deployments → проверь что последний build успешен
3. Браузерные devtools (TG Desktop: View → Open DevTools → Console)

---

## Часть 8. Дальнейшие шаги

После успешного запуска:

- [ ] **Backup SQLite**: настрой автоматический бэкап `/home/interstellar/interstellar-data/interstellar.sqlite` в S3/R2 каждые 6 часов
- [ ] **Sentry**: для error-tracking, бесплатный tier хватит на первое время
- [ ] **Custom domain**: вместо `*.pages.dev` купи свой домен и подключи через CloudFlare DNS (если домен через них — бесплатно)
- [ ] **Monitoring**: UptimeRobot или Freshping (бесплатные) — пинг /health каждые 5 минут
- [ ] **Юридический pre-launch review**: lawvine.ru или digital-rights.center, ~15-30к ₽
- [ ] **Заменить плейсхолдеры в `legalContent.ts`** на реальные данные (ФИО, ИНН, email)
- [ ] **Подать уведомление в РКН** через Госуслуги

---

## Полезные команды для ежедневной работы

```bash
# Логи backend в реальном времени
sudo journalctl -u interstellar -f

# Логи nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Логи прокси (на Hetzner)
sudo tail -f /var/log/3proxy/3proxy.log

# Деплой нового кода
cd ~/interstellar
git pull
cd backend
npm ci
sudo systemctl restart interstellar

# Перенос frontend на новый билд (Cloudflare сам ребилдит при push в main)

# Проверка использования диска
df -h
du -sh ~/interstellar-data

# Размер БД
ls -lh ~/interstellar-data/interstellar.sqlite

# Бэкап БД на лету
sqlite3 ~/interstellar-data/interstellar.sqlite ".backup ~/backup-$(date +%Y%m%d-%H%M).sqlite"
```

---

## Итог: расходы

| Что | Где | Цена/мес |
|---|---|---|
| Backend VPS | AEZA Moscow MSKs-1 | ~593₽ |
| Прокси VPS | Hetzner CX22 Helsinki | €5.83 ≈ 580₽ |
| Frontend | Cloudflare Pages | 0₽ |
| Домен `.ru` | reg.ru | ~17₽/мес (199₽/год) |
| SSL | Let's Encrypt | 0₽ |
| **Итого** | | **~1190₽/мес** |

Дополнительно (one-time):
- КЭП (если нет): 1500-3000₽
- Юридический review: 15-30к ₽ (рекомендую, но не обязательно)

При росте пользователей основным узким местом станет polza.ai LLM-расходы, а не инфраструктура.
