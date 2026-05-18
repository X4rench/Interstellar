# Playbook: Telegram Mini App с платежами и LLM-чатом

> Полное руководство по развёртыванию подписочного Telegram Mini App для РФ-аудитории.
> Собран из опыта развёртывания «Интерстеллар» (AI-чат с историческими личностями).
> Покрывает все грабли которые мы прошли. Используй для следующих проектов чтобы их не повторить.

**Версия:** 3.0 (май 2026, после triple-аудита)
**Стек:** Node.js + Express + better-sqlite3 + Vite/React + Cloudflare Pages + AEZA VPS + ЮКасса + Telegram Bot API

---

## ⚠️ КРИТИЧНОЕ ПРЕДУПРЕЖДЕНИЕ — прочитай ПЕРЕД деплоем

Этот playbook покрывает **технологию**. Но запуск платного сервиса в РФ имеет **юридические риски**, которые могут стоить **уголовной ответственности или штрафов до миллионов рублей**. Перед запуском обязательно прочитай раздел **44** ("Legal CRITICAL gaps").

**Самые опасные риски** (детально в разделе 44):

| Риск | Закон | Возможное наказание |
|------|-------|---------------------|
| 🔴 LLM генерит контент с несовершеннолетними (CSAM) даже фикшн | УК ст. 242.1 | **До 15 лет лишения свободы** |
| 🔴 LLM генерит порнографические описания (даже взрослых) | УК ст. 242 | До 6 лет |
| 🔴 Хранение ПД россиян за пределами РФ (CF US, Sentry DE) | 152-ФЗ ст. 18 ч. 5 | Штраф **до 18 млн ₽** + блокировка домена |
| 🔴 Трансграничная передача ПД без уведомления РКН | 152-ФЗ ст. 12 | До 6 млн ₽ |
| 🔴 Партнёрские выплаты как самозанятый | 422-ФЗ ст. 4 ч. 2 п. 5 | Снятие с НПД, пересчёт под НДФЛ 13% |
| 🔴 Немаркированная реклама без `erid` через ОРД | 38-ФЗ + ст. 14.3 КоАП | До 500 тыс ₽ **за каждое нарушение** |
| 🟠 AI выдаёт мнения за реальных людей (Эйнштейн, Фрейд, и т.п.) | ст. 152.1 ГК | Иск от наследников + моральный вред |

**Минимальные защитные меры:**
1. **Pre-filter и post-filter на LLM** — блокировать запросы с возрастными маркерами (<18) рядом с сексуальным контекстом
2. **Self-host Sentry на VPS в РФ** (вместо sentry.io в DE)
3. **Первичное хранение всех ПД на VPS в РФ**, CF Pages — только как CDN-кеш
4. **Подать уведомления в РКН** перед запуском (об обработке ПД + о трансграничной передаче)
5. **Whitelist персонажей**: только умершие >70 лет назад + публичные фигуры античности
6. **Партнёрскую программу — только на ИП/УСН**, не на НПД
7. **Маркировать всю рекламу через ОРД** (Яндекс, ВК, Сбер) и получать erid

Если что-то из этого кажется сложным — **проконсультируйся с юристом до запуска**. Один час юриста дешевле одного штрафа.

---

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
17. [Команды-памятки](#17-команды-памятки)
18. [Стек технологий](#18-стек-технологий)
19. [Юридические документы (152-ФЗ, 436-ФЗ, оферта)](#19-юридические-документы)
20. [База данных и миграции](#20-база-данных-и-миграции)
21. [Идемпотентность и audit log платежей](#21-идемпотентность-и-audit-log-платежей)
22. [RBAC и admin-операции](#22-rbac-и-admin-операции)
23. [Шифрование PII (AES-256-GCM)](#23-шифрование-pii)
24. [NSFW контент и age-gate (436-ФЗ)](#24-nsfw-контент-и-age-gate)
25. [DEV-режим и тестирование](#25-dev-режим-и-тестирование)
26. [Кеш Telegram WebView и форс-обновление](#26-кеш-telegram-webview)
27. [Bot commands (обязательные)](#27-bot-commands)
28. [Что делать когда что-то пошло не так](#28-troubleshooting)
29. [iOS Safari / Telegram WebView viewport грабли](#29-ios-safari--telegram-webview--viewport-грабли)
30. [Telegram WebApp API — обязательные вызовы](#30-telegram-webapp-api--обязательные-вызовы)
31. [CI/CD через GitHub Actions](#31-cicd-через-github-actions)
32. [Cost-monitoring LLM (polza.ai)](#32-cost-monitoring-llm-polzaai)
33. [Конкретный bot-api.js через прокси](#33-конкретный-bot-apijs-через-прокси)
34. [ЮКасса edge cases (recurring failed, 3DS, partial refund)](#34-юкасса-edge-cases)
35. [Чеки 54-ФЗ для самозанятого](#35-чеки-54-фз-для-самозанятого)
36. [Telegram Stars — withdrawal в рубли](#36-telegram-stars--withdrawal-в-рубли)
37. [Privacy Policy — конкретный скелет](#37-privacy-policy--конкретный-скелет)
38. [Multi-region fallback / Disaster recovery](#38-multi-region-fallback--disaster-recovery)
39. [HSTS preload + SRI + WAF rules](#39-hsts-preload--sri--waf-rules)
40. [Menu Button vs t.me/bot/app deeplink](#40-menu-button-vs-tmebotapp-deeplink)
41. [i18n даже если стартуете на одном языке](#41-i18n--даже-если-стартуете-на-одном-языке)
42. [Self-hosted telegram-web-app.js — процесс обновления](#42-self-hosted-telegram-web-appjs--процесс-обновления)
43. [DevOps hardening (fail2ban, swap, mTLS, SQLCipher, env-validation)](#43-devops-hardening-production-maturity)
44. **[🔴 Legal CRITICAL gaps — РФ-законодательство](#44-legal-critical-gaps--рф-законодательство)** ⚠️ читать обязательно

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

---

## 19. Юридические документы

> **Без этих документов ЮКасса не одобрит, РКН может оштрафовать, AppStore забанит. Юзеры подадут в суд по ЗоЗПП. ОБЯЗАТЕЛЬНО.**

Все документы должны быть **доступны юзеру В Mini App** (не только email/PDF) — это требование модерации платёжных систем.

### 19.1 Список обязательных документов

| Документ | Зачем | Срок чтения |
|----------|-------|-------------|
| **Договор-оферта** | ЗоЗПП, GDPR-аналог в РФ. Главный legally binding документ. | Юзер видит ссылку до первой оплаты |
| **Политика конфиденциальности** | 152-ФЗ. Какие данные собираем, зачем, куда передаём. | Доступна в Profile + при первом старте |
| **Согласие на обработку ПД** | 152-ФЗ. Чекбокс «соглашаюсь» при первом входе. | Сохраняем факт согласия в БД с timestamp |
| **Условия подписки** | Условия autorenew, отмена, refund. Можно частью оферты. | До покупки подписки |
| **Контакты для жалоб** | ЗоЗПП ст. 23. Email + бот-команда /paysupport. | В Profile «Контакты» |

### 19.2 Что обязательно в оферте

```
1. Полное наименование правообладателя
   - Самозанятый: «Иванов Иван Иванович, ИНН 123456789012»
   - ИП: «ИП Иванов И.И., ОГРНИП ..., ИНН ...»
   - ООО: «ООО "Компания", ОГРН ..., ИНН ...»
2. Описание услуг (что покупает юзер)
3. Цены (точно копейка в копейку)
4. Способы оплаты (карта, СБП, ЮMoney, etc.)
5. Условия автопродления (явно прописать что recurring)
6. Порядок отмены — где, как, сроки
7. Возврат денежных средств:
   - ЗоЗПП ст. 32: можно отказаться в любой момент с возвратом
     неиспользованной части. Для digital — обычно прорейтно или нет
     возврата если услуга оказана.
   - Day Pass = «расходный» цифровой контент, возврату не подлежит после
     активации (ПП РФ № 55).
8. Срок предоставления услуги (30 дней для подписки)
9. Ответственность сторон
10. Дата вступления в силу
```

### 19.3 Структура хранения документов в проекте

В `mini-app/src/utils/legalContent.ts`:

```ts
export const LEGAL_DOCS = {
  privacy_policy: {
    title: 'Политика конфиденциальности',
    effectiveDate: '17 мая 2026',
    content: `...полный текст...`,
  },
  terms_of_service: {
    title: 'Условия использования',
    effectiveDate: '17 мая 2026',
    content: `...`,
  },
  personal_data: {
    title: 'Обработка персональных данных (152-ФЗ)',
    effectiveDate: '17 мая 2026',
    content: `...`,
  },
  subscription: {
    title: 'Условия подписки',
    effectiveDate: '17 мая 2026',
    content: `...`,
  },
  about: {
    title: 'О приложении',
    content: `Правообладатель: ${HOLDER_NAME}\nИНН: ${HOLDER_INN}\n...`,
  },
};
```

### 19.4 Согласие пользователя (152-ФЗ обязательное)

При первом входе показываешь модалку:
- ☑ «Я подтверждаю что мне 18 лет» (если есть 18+ контент)
- ☑ «Я согласен с обработкой персональных данных» + ссылка на 152-ФЗ doc
- ☑ «Я ознакомлен с условиями оферты» + ссылка

В БД храним факт + timestamp + версия документа:
```sql
CREATE TABLE legal_consents (
  telegram_user_id INTEGER,
  doc_id TEXT,           -- 'privacy_policy', 'age_18', etc.
  doc_version TEXT,      -- '2026-05-17' — дата вступления в силу
  consented_at INTEGER,  -- timestamp
  PRIMARY KEY (telegram_user_id, doc_id)
);
```

При изменении документа (новая версия) — **спросить согласие заново**.

### 19.5 РКН-уведомление (152-ФЗ)

Если собираешь ПД (имя, email, ID юзера, IP) — нужно подать **уведомление об обработке ПД** в РКН.
- Подаётся через [pd.rkn.gov.ru](https://pd.rkn.gov.ru/)
- Бесплатно
- Срок рассмотрения 30 дней
- Без штрафов если просто не подал, но при жалобе РКН может выписать предписание

Для **самозанятого** работающего только с TG initData (publicly visible через клиента) — порог риска низкий. Но **подать уведомление = чистая совесть**.

### 19.6 Контактные данные для покупателей

ЗоЗПП обязывает указывать:
- **Email поддержки** — отвечаешь в течение 10 рабочих дней
- **Telegram бот-команда** `/paysupport` — обязательно для платёжных вопросов (требование TG)
- Реквизиты правообладателя (см. 19.2)

В Mini App → Profile → «Контакты»:
```
Email: support@yourapp.ru
Telegram: @YourSupportBot или команда /paysupport
Правообладатель: [имя/ИНН]
```

---

## 20. База данных и миграции

### 20.1 Схема (минимальная для подписочного приложения)

```sql
-- 001_init.sql
CREATE TABLE users (
  telegram_user_id INTEGER PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  first_seen_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  free_messages_used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id INTEGER NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('basic_month', 'premium_month')),
  started_at INTEGER NOT NULL,    -- ms!
  expires_at INTEGER NOT NULL,    -- ms!
  is_trial INTEGER NOT NULL DEFAULT 0,
  cancelled_at INTEGER,
  payment_id INTEGER,
  telegram_payment_charge_id TEXT UNIQUE,  -- идемпотентность
  auto_renew INTEGER NOT NULL DEFAULT 0,
  yk_payment_method_id TEXT,
  source TEXT NOT NULL DEFAULT 'stars',
  FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id)
);

CREATE INDEX idx_subscriptions_active
  ON subscriptions(telegram_user_id, expires_at);

CREATE TABLE day_passes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id INTEGER NOT NULL,
  purchased_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  telegram_payment_charge_id TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'stars'
);

CREATE TABLE chat_usage (
  telegram_user_id INTEGER NOT NULL,
  day_bucket TEXT NOT NULL,    -- 'YYYY-MM-DD' UTC
  count INTEGER NOT NULL DEFAULT 0,
  last_used_at INTEGER NOT NULL,
  PRIMARY KEY (telegram_user_id, day_bucket)
);

CREATE TABLE legal_consents (
  telegram_user_id INTEGER NOT NULL,
  doc_id TEXT NOT NULL,
  doc_version TEXT NOT NULL,
  consented_at INTEGER NOT NULL,
  PRIMARY KEY (telegram_user_id, doc_id)
);

CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at INTEGER NOT NULL,
  actor_user_id INTEGER,
  action TEXT NOT NULL,
  target_resource TEXT,
  target_id TEXT,
  payload_json TEXT,
  ip TEXT,
  request_id TEXT,
  prev_hash TEXT,
  this_hash TEXT NOT NULL
);
```

### 20.2 Версионирование миграций

`backend/migrations/00X_description.sql` — файлы пронумерованы:
```
001_init.sql
002_affiliate.sql
003_chat_usage.sql
004_pricing_tiers.sql
005_free_messages_used.sql
006_yookassa.sql
```

В `backend/db.js`:
```js
function applyMigrations(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS migrations (
    name TEXT PRIMARY KEY,
    applied_at INTEGER NOT NULL
  )`);

  const files = fs.readdirSync('./migrations').sort();
  for (const file of files) {
    const applied = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(file);
    if (applied) continue;

    const sql = fs.readFileSync(`./migrations/${file}`, 'utf-8');
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)').run(file, Date.now());
    })();
    console.log(`[db] applied migration ${file}`);
  }
}
```

### 20.3 SQLite оптимизация для прода

При открытии БД:
```js
db.pragma('journal_mode = WAL');   // Write-Ahead Log — concurrent reads
db.pragma('synchronous = NORMAL'); // балансе между скоростью и надёжностью
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');  // ВАЖНО! При WAL-конфликтах ждать 5s
```

**ГРАБЛИ:** Без `busy_timeout` при одновременном webhook-write + reconciliation-scan может бросить `SQLITE_BUSY`. С таймаутом — ждёт.

### 20.4 Бэкапы

```bash
# Каждые 6 часов в cron
sqlite3 /path/to/app.sqlite ".backup /backups/app-$(date +%Y%m%d-%H%M).db"

# Через rclone в offsite (Google Drive / Яндекс.Диск / S3)
rclone copy /backups remote:yourapp-backups

# Очистка локально старше 7 дней
find /backups -name "app-*.db" -mtime +7 -delete
```

### 20.5 Восстановление из бэкапа

```bash
# Остановить бэк
systemctl stop yourapp

# Восстановить
cp /backups/app-20260518-1200.db /home/interstellar/yourapp-data/app.sqlite

# Запустить
systemctl start yourapp
```

⚠️ Восстановление = потеря всех изменений после бэкапа. Платежи которые прошли webhook но не попали в бэкап — потеряются. Поэтому:
- Бэкап каждые 6 часов минимум
- ЮКасса webhook idempotent — повторить можно через ЛК ЮК (см. секцию 21)

---

## 21. Идемпотентность и audit log платежей

### 21.1 UNIQUE charge_id — главная защита от double-spend

```sql
ALTER TABLE payments ADD COLUMN telegram_payment_charge_id TEXT UNIQUE;
ALTER TABLE subscriptions ADD COLUMN telegram_payment_charge_id TEXT UNIQUE;
```

При обработке webhook'а:
```js
try {
  db.prepare(`
    INSERT INTO subscriptions (telegram_user_id, plan, ..., telegram_payment_charge_id)
    VALUES (?, ?, ..., ?)
  `).run(userId, plan, ..., chargeId);
} catch (err) {
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    // Replay — этот платёж уже обработан, идемпотентность сработала
    console.log(`[payments] replay detected for charge ${chargeId}`);
    return { duplicate: true };
  }
  throw err;
}
```

### 21.2 Audit log с hash-chain (tamper-evident)

Для финансовой аккуратности — каждое значимое действие пишется в `audit_log` с хешем предыдущей записи (как блокчейн):

```js
function appendAudit({ db, action, payload }) {
  const tx = db.transaction(() => {
    const prev = db.prepare('SELECT this_hash FROM audit_log ORDER BY id DESC LIMIT 1').get();
    const prevHash = prev?.this_hash || '0000';
    const now = Date.now();
    const data = JSON.stringify({ action, payload, prevHash, now });
    const thisHash = crypto.createHash('sha256').update(data).digest('hex');
    db.prepare(`
      INSERT INTO audit_log (occurred_at, action, payload_json, prev_hash, this_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(now, action, JSON.stringify(payload), prevHash, thisHash);
  });
  tx();
}

// Использование:
appendAudit({ db, action: 'subscription.activated', payload: { user_id, plan, charge_id } });
appendAudit({ db, action: 'refund.issued', payload: { ... } });
```

Проверка цепочки (cron каждый день):
```js
function verifyAuditChain(db) {
  const rows = db.prepare('SELECT * FROM audit_log ORDER BY id').all();
  let prevHash = '0000';
  for (const row of rows) {
    const data = JSON.stringify({ /* same fields */ prevHash });
    const expected = crypto.createHash('sha256').update(data).digest('hex');
    if (row.this_hash !== expected) {
      console.error(`AUDIT CHAIN BROKEN at row ${row.id}`);
      return false;
    }
    prevHash = row.this_hash;
  }
  return true;
}
```

Если кто-то залез в БД и удалил запись о платеже — цепочка сломается, мы это увидим.

### 21.3 Refund logic — отменяем КОНКРЕТНУЮ подписку

**ГРАБЛИ:** Когда юзер делает refund одного платежа, нельзя `UPDATE subscriptions SET cancelled_at = ?` для всех его активных подписок! Если у него Basic + Premium (нестандартно, но возможно), refund Basic не должен убить Premium.

Правильно — отменять только подписку, созданную **после** этого платежа (`started_at >= payment.succeeded_at`):

```js
db.prepare(`
  UPDATE subscriptions SET cancelled_at = ?
  WHERE telegram_user_id = ?
    AND source = 'yookassa'
    AND plan = ?               -- тот же план
    AND started_at >= ?        -- после этого платежа
    AND cancelled_at IS NULL
`).run(now, userId, plan, paymentSucceededAt);
```

### 21.4 Reconciliation cron (защита от потерянных webhook'ов)

Webhook теряется в 0.1-1% случаев. Каждые 5 минут идём в ЮК/TG API и сверяем:

```js
// Для Telegram Stars
async function reconcileMissingPayments({ db }) {
  const transactions = await tgCall('getStarTransactions', { limit: 100 });
  for (const tx of transactions.transactions) {
    const charge = tx.id;
    const exists = db.prepare('SELECT 1 FROM payments WHERE telegram_payment_charge_id = ?').get(charge);
    if (exists) continue;
    // Webhook не дошёл — активируем подписку вручную
    activateSubscription({ db, telegramUserId: tx.source.user.id, charge });
  }
}

// Для ЮКассы — сложнее, нет /transactions API. Используем check status одной транзакции:
// При получении статуса от фронта через poll если status='pending' старше 30 сек — getPayment(id).
```

---

## 22. RBAC и admin-операции

### 22.1 Роли

```js
export type UserRole = 'regular' | 'partner' | 'admin';

function loadRole(db, telegramUserId, adminIds) {
  if (adminIds.includes(telegramUserId)) return 'admin';
  const partner = db.prepare('SELECT 1 FROM partners WHERE telegram_user_id = ?').get(telegramUserId);
  return partner ? 'partner' : 'regular';
}
```

`ADMIN_TELEGRAM_IDS` хардкодим в `.env` (минимум 1 админ обязателен — иначе никто не может выдать первого partner'а).

### 22.2 Middleware requireRole

```js
function requireRole(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.role)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  };
}

app.get('/api/v1/admin/users', requireAuth, requireRole('admin'), handler);
app.get('/api/v1/partner/summary', requireAuth, requireRole('partner', 'admin'), handler);
```

### 22.3 requireFreshAuth — защита от long-lived initData

initData в TG живёт 24 часа. Для критических операций (refund, grant partner) требуем initData свежий — не старше 1 часа:

```js
function requireFreshAuth(maxAgeSec) {
  return (req, res, next) => {
    const ageSec = Date.now() / 1000 - req.tgUser.auth_date;
    if (ageSec > maxAgeSec) {
      return res.status(401).json({ error: 'AUTH_TOO_OLD', max_age: maxAgeSec });
    }
    next();
  };
}

app.post('/api/v1/admin/partners/:id/revoke',
  requireAuth, requireRole('admin'), requireFreshAuth(3600), handler);
```

### 22.4 X-Confirm-Action — phishing-resistant confirmation

Для destructive операций (grant partner, mark payout paid) клиент должен:
1. Показать confirm-диалог юзеру с деталями
2. SHA-256 от body запроса → передать как `X-Confirm-Action` header
3. Бэк проверяет что хеш = sha256(canonical body)

Если злоумышленник украл initData и шлёт другой body — хеш не совпадёт, операция отклонена.

```js
function canonicalize(obj) {
  // ОЧЕНЬ ВАЖНО: одинаковая сериализация на фронте и бэке.
  // Ключи отсортированы, нет лишних пробелов.
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
}

function requireConfirmAction(req, res, next) {
  const provided = req.headers['x-confirm-action'];
  if (!provided || provided.length !== 64) return res.status(412).json({ error: 'MISSING_CONFIRM' });
  const computed = crypto.createHash('sha256').update(canonicalize(req.body || {})).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(computed))) {
    return res.status(412).json({ error: 'BAD_CONFIRM' });
  }
  next();
}
```

На фронте — после `appConfirm` обязательно посылаем хеш.

---

## 23. Шифрование PII

Партнёрская программа требует хранить PII партнёра (ФИО, ИНН, банковский счёт) для выплат. Это персональные данные → 152-ФЗ требует **шифрования**.

### 23.1 AES-256-GCM

```js
import crypto from 'node:crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.PAYOUT_ENCRYPTION_KEY, 'base64'); // 32 байта

export function encryptPII(plaintext) {
  const iv = crypto.randomBytes(12);  // GCM uses 12-byte IV
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Хранимое: iv(12) + authTag(16) + ciphertext
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptPII(encryptedBase64) {
  const data = Buffer.from(encryptedBase64, 'base64');
  const iv = data.slice(0, 12);
  const authTag = data.slice(12, 28);
  const ciphertext = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf-8');
}
```

Генерация ключа:
```bash
openssl rand -base64 32
# Положить в .env как PAYOUT_ENCRYPTION_KEY=...
```

⚠️ **Если потеряешь ключ — расшифровать данные невозможно.** Бэкап ключа в надёжное место (вне сервера).

### 23.2 Что шифровать

- ФИО партнёра
- Паспортные данные (если запрашиваешь)
- Банковский счёт + БИК
- Email + телефон (опционально)

**Что НЕ шифруем** (нужно для query):
- ИНН (используем для поиска)
- Telegram user_id
- Метаданные (statuses, timestamps)

---

## 24. NSFW контент и age-gate

### 24.1 Юридические требования (РФ)

- **ФЗ-436** «О защите детей от информации» — обязательная маркировка 18+
- Метка **«18+»** в видимом месте интерфейса
- Возрастной фильтр для гостевого доступа (без подтверждения 18+)

### 24.2 Реализация age-gate

При первом входе в NSFW-режим:
```tsx
<AgeGateModal
  onConfirm={() => {
    // Сохраняем consent в БД с timestamp
    saveLegalConsent({ doc_id: 'age_18', version: 'v1', confirmed: true });
    setNsfwUnlocked(true);
  }}
  onCancel={() => {
    // Возврат назад, NSFW недоступен
  }}
>
  <h2>Внимание: контент 18+</h2>
  <p>Подтверждая, вы заявляете что вам исполнилось 18 лет...</p>
</AgeGateModal>
```

### 24.3 Гейтинг NSFW для платных тиров

Стратегия: NSFW = **только для самого высокого тира** (Premium), не Basic.

```js
function canOpenCharacter(char, tier) {
  if (char.isNSFW) return tier === 'premium';
  return true;
}
```

При попытке открыть NSFW персонажа на Free/Basic → paywall с reason='nsfw'.

### 24.4 Скрытие NSFW для не-Premium юзеров

Это **требование модерации платёжных систем** (ЮКасса, App Store). NSFW-контент **не должен быть виден** без активной 18+ подписки.

```ts
// В HomePage / LibraryPage:
const visibleCharacters = useMemo(
  () => characters.filter(c => !c.isNSFW || isPremiumTier),
  [characters, isPremiumTier],
);
```

**Исключение:** **user-created** NSFW-персонажи — юзер ВИДИТ своих собственных (он их создал), но не может их открыть без Premium.

### 24.5 18+ метка в шапке

Если приложение содержит NSFW-контент:
```tsx
<span style={{ background: '#7c5cff', padding: '2px 5px', borderRadius: 4 }}>
  18+
</span>
```

В видимом месте (Header) + в landing-странице.

---

## 25. DEV-режим и тестирование

### 25.1 DEV_BYPASS_INITDATA — без bot_token

Для разработки без BOT_TOKEN (или с другим ботом):
```js
// backend/auth.js
if (DEV_BYPASS && process.env.NODE_ENV !== 'production') {
  // Парсим initData небезопасно, без HMAC
  const user = JSON.parse(initData.user);
  return { telegram_user_id: user.id, first_name: user.first_name, /* ... */ };
}
```

⚠️ **Защита от случайного использования в проде:**
```js
if (DEV_BYPASS && NODE_ENV === 'production') {
  console.error('[fatal] DEV_BYPASS_INITDATA=1 в production!');
  process.exit(1);
}
```

### 25.2 Eruda — debug-консоль для TG WebView

В TG WebView нет dev-tools. В DEV режиме подключаем eruda:

```js
// mini-app/src/main.tsx
if (import.meta.env.DEV) {
  import('eruda').then(({ default: eruda }) => eruda.init());
}
```

Появится floating-кнопка-шарик → клик → консоль/Network/Storage. Минусы: ~200KB бандла. **Только в DEV, в prod НЕ подключать.**

### 25.3 Mock AI для DEV без polza-баланса

`mini-app/src/utils/mockAI.ts`:
```ts
const MOCK_RESPONSES = [
  'Это интересный вопрос. Расскажи подробнее.',
  'Хм. Я об этом не подумал.',
  // ...
];
export async function getMockResponse() {
  await new Promise(r => setTimeout(r, 800)); // имитация задержки
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}
```

При ошибке backend в DEV → показываем mock вместо «не удалось получить ответ».

### 25.4 Тестовые карты ЮКассы

| Карта | Результат | Use case |
|-------|-----------|----------|
| `5555 5555 5555 4477` | succeed | Happy path |
| `5555 5555 5555 4444` | fail (insufficient funds) | Тест failed-flow |
| `5555 5555 5555 4485` | requires_3ds | Тест 3DS challenge |
| `5555 5555 5555 4493` | timeout | Тест поведения при таймауте |

Срок карты: любой будущий (например `12/30`).
CVC: любой `123`.

### 25.5 3DS test flow

После ввода `4477` юзер видит экран **«Card authentication»** с полем «Any number». Это эмуляция SMS-кода от банка. Введи **любое число** → Confirm → платёж succeed.

В реальной жизни (live-магазин) юзер вводит реальный SMS-код от своего банка.

---

## 26. Кеш Telegram WebView

### 26.1 Проблема

После git push фронта в CF Pages новый билд готов через 2-3 минуты. **НО** Telegram WebView (на iOS особенно) **агрессивно кеширует**. Юзер видит старый код часами или сутками.

### 26.2 Кеш-баст через Vite-хеши

Vite **уже** делает hashing бандла (`index-AbCd1234.js`) — при изменениях имя меняется → кеш сбрасывается.

Но `index.html` не хешится. Поэтому он **обязательно** должен иметь `no-cache`:

```
# в _headers
/index.html
  Cache-Control: no-cache, no-store, must-revalidate
```

### 26.3 Service Worker — НЕ использовать

Если случайно добавишь `vite-plugin-pwa` — старая версия будет «висеть» в Service Worker до тех пор пока юзер не очистит storage Telegram. **Не подключай PWA для Mini App.**

### 26.4 Принудительный refresh для юзеров

Если нужно срочно — попроси юзера:
```
Telegram → Settings → Storage → Clear cache → All
```

Или показать в UI «Версия v1.2.3» и юзер видит когда обновилось.

### 26.5 Версия в bundle

```ts
export const APP_VERSION = '0.1.0';
// В Profile:
<p>Interstellar Mini App · v{APP_VERSION}</p>
```

При багрепортах юзер пишет версию → понимаешь устарел ли его клиент.

---

## 27. Bot commands

### 27.1 Обязательные команды (требование Telegram)

| Команда | Зачем | Обязательность |
|---------|-------|----------------|
| `/start` | Приветствие + кнопка открыть Mini App | Telegram-стандарт |
| `/help` | Краткая помощь | Хорошая практика |
| `/paysupport` | Помощь по платежам (refund, отмена) | **ОБЯЗАТЕЛЬНО** для ботов с платежами |

### 27.2 Регистрация команд в BotFather

```
/setcommands
[выбрать бота]
start - Открыть приложение
help - Что я умею
paysupport - Помощь по платежам
```

Появятся в меню «☰» в чате с ботом.

### 27.3 Welcome-message с inline_keyboard

В handler /start:
```js
sendMessage({
  chat_id: chatId,
  text:
    `<b>Привет, ${firstName}!</b> ✨\n\n` +
    `Это <b>YourApp</b> — твой портал в...\n\n` +
    `🎁 Первые сообщения — бесплатно.\n\n` +
    `Жми кнопку ниже чтобы начать ↓`,
  parse_mode: 'HTML',
  reply_markup: {
    inline_keyboard: [
      [{ text: '🚀 Открыть приложение', url: `https://t.me/${BOT_USERNAME}/app` }],
      [{ text: '💎 Тарифы', url: `https://t.me/${BOT_USERNAME}/app?startapp=paywall` }],
    ],
  },
});
```

**ГРАБЛИ:** Не используй хардкод URL типа `https://xxx.pages.dev` — preview-домены CF Pages могут пересоздаваться. Используй `t.me/${BOT_USERNAME}/${BOT_APP_NAME}` — стабильный.

### 27.4 Privacy URL в BotFather

ОБЯЗАТЕЛЬНО для модерации платёжных систем + AppStore.

```
/mybots → выбрать бота → Bot Settings → Privacy Policy URL → https://yourapp.ru/privacy
```

Должна быть страница с политикой конфиденциальности (см. секцию 19).

### 27.5 /paysupport handler

Юзер пишет `/paysupport` → возвращаем info про refund:
```js
if (text === '/paysupport') {
  sendMessage({ chat_id: chatId, text:
    `<b>Помощь по платежам</b>\n\n` +
    `1. Отмена подписки: Mini App → Профиль → toggle «Автопродление»\n` +
    `2. Возврат денежных средств: согласно ЗоЗПП ст. 32, отправь email на ${SUPPORT_EMAIL}\n` +
    `3. Day Pass возврату не подлежит после активации (ПП РФ № 55)\n\n` +
    `Email поддержки: ${SUPPORT_EMAIL}\n` +
    `Срок ответа: 1-3 рабочих дня`,
    parse_mode: 'HTML',
  });
}
```

---

## 28. Troubleshooting

### 28.1 «Webhook от Telegram не приходит»

1. `getWebhookInfo` → проверь `last_error_date` и `last_error_message`
2. Если `last_error_date != null`: смотри `last_error_message` — обычно SSL/connect-fail
3. `tail /var/log/nginx/access.log | grep webhook` — приходит ли вообще запрос?
4. `nginx -t` — конфиг ок?
5. SSL валидный? `curl -vI https://api.yourapp.ru/health`
6. Проверь `secret_token` совпадает между TG-stored и backend `.env`
7. Если webhook URL изменился — `setWebhook` заново с `ip_address`

### 28.2 «Webhook от ЮКассы не приходит»

1. ЛК ЮКассы → Интеграция → HTTP-уведомления → **История** → проверь записи и коды ответа
2. Если код 403 — IP-фильтр блокирует. Смотри `[yk-webhook] rejected ip=...` в логах
3. Если код 5xx — проблема на бэке, смотри `[yk-webhook]` логи
4. Если истории нет вообще — webhook URL неправильный (вероятно вписал `https://yourapp.ru` без `/api/v1/yookassa-webhook`)

### 28.3 «Платёж прошёл, подписка не активировалась»

1. `grep '[yk-webhook] activated' /var/log/yourapp/backend.log` — есть строка?
2. Если есть `activated` но `getActiveSubscription` возвращает null — проверь единицы времени (ms vs seconds, см. ГРАБЛИ #12)
3. Если нет `activated` — webhook не дошёл, см. 28.2
4. В ЛК ЮКассы: Операции → платёж → есть ли кнопка «Повторить уведомление»? Если есть — нажми, повторно протолкнёт

### 28.4 «LLM возвращает 502 UPSTREAM_ERROR»

1. Проверь `POLZA_API_KEY` валиден: `curl -H "Authorization: Bearer $KEY" https://api.polza.ai/api/v1/models` → 200
2. Проверь `POLZA_MODEL` в каталоге: `... | jq '.data[].id' | grep $MODEL`
3. Если модель есть, ключ ок — возможно polza upstream проблема. Retry уже встроен, попробуй позже
4. Если модель **deprecated** — поменяй на актуальную (см. секцию 9.2)

### 28.5 «CORS-ошибка в браузере»

1. F12 → Console → копируй точный текст
2. Origin в ошибке должен быть в `CORS_ALLOWED_ORIGINS` backend `.env`
3. На бэке: `grep CORS_ALLOWED_ORIGINS .env` → если нет нужного origin → добавь
4. `systemctl restart yourapp`

### 28.6 «Юзер видит старый фронт после deploy»

1. Подожди 2-3 минуты — CF Pages билд может ещё идти
2. CF Dashboard → Pages → твой проект → Deployments → должен быть свежий «Success»
3. Юзер: Telegram → Settings → Storage → Clear cache
4. Hard refresh: закрыть Mini App полностью (свайпнуть закрыть бот) → открыть заново

### 28.7 «Magazin заблокирован в ЮКассе»

1. **СРОЧНО** — открой email где ЮКасса прислала уведомление, изучи причину
2. Типичные причины: chargeback >5-10%, fraudulent activity, нарушение оферты ЮК
3. Подай заявление в саппорт ЮК с объяснением
4. **Параллельно** — переключись на Telegram Stars как fallback (код у нас гибкий, нужно только включить)

### 28.8 «Сервер AEZA недоступен»

1. AEZA панель → статус VPS — running?
2. Если running но не пингуется — открой VNC, посмотри что
3. `journalctl -xe | tail -50` — что в системных логах
4. `df -h` — диск не забился?
5. `free -m` — RAM есть?
6. Если ничего не помогло — Reboot через AEZA панель

### 28.9 «git pull: dubious ownership»

```
git config --global --add safe.directory /home/interstellar/yourapp
```

Один раз. Дальше `git pull` работает.

### 28.10 «SQLite database is locked»

1. Бэк должен иметь `db.pragma('busy_timeout = 5000')` (см. секцию 20.3)
2. Если всё равно — нет ли другого процесса с открытой БД? `lsof | grep .sqlite`
3. WAL-файл `.sqlite-wal` существует? Если да — нормально (WAL mode)
4. Если БД действительно зависла — `sqlite3 app.sqlite "PRAGMA wal_checkpoint(FULL); VACUUM;"` (после backup!)

---

## 29. iOS Safari / Telegram WebView — viewport грабли

### 29.1 100vh лжёт на iOS Safari

В iOS Safari `100vh` = высота viewport **БЕЗ** address bar. Когда юзер скроллит и бар прячется — viewport вырастает, контент прыгает. Используй `100dvh` (dynamic viewport height):

```css
.root {
  height: 100vh;       /* fallback */
  height: 100dvh;      /* iOS 15.4+ ловит правильно */
  overscroll-behavior: contain;   /* блокирует pull-to-refresh всей страницы */
}
```

### 29.2 Safe-area для notch и Dynamic Island

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

body {
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
}

/* В index.html */
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

Без `viewport-fit=cover` env() возвращает 0px.

### 29.3 visualViewport API для keyboard

Когда юзер тапает в textarea на iOS, появляется клавиатура → viewport уменьшается → input может уехать ВВЕРХ. Лечится:

```js
function trackKeyboard() {
  const vv = window.visualViewport;
  if (!vv) return;
  function update() {
    document.documentElement.style.setProperty('--vh', `${vv.height}px`);
  }
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}
trackKeyboard();
```

В CSS:
```css
.chat-page { height: var(--vh, 100dvh); }
```

### 29.4 Telegram viewportChanged event

Telegram даёт свой event когда меняется размер Mini App (юзер свайпает шторку):
```js
const tg = window.Telegram.WebApp;
tg.onEvent('viewportChanged', ({ isStateStable }) => {
  if (isStateStable) {
    document.documentElement.style.setProperty('--tg-vh', `${tg.viewportStableHeight}px`);
  }
});
```

### 29.5 disableVerticalSwipes — против случайного закрытия

iOS юзеры свайпают вниз → Mini App сворачивается. Если страница длинная это раздражает. Можно отключить:

```js
tg.disableVerticalSwipes();   // SDK 7.7+
// Юзер всё ещё может закрыть через крестик
```

### 29.6 touch-action + -webkit-overflow-scrolling

```css
.scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;   /* плавный inertia-scroll на iOS */
  touch-action: pan-y;                  /* запретить horizontal-pan */
}
```

---

## 30. Telegram WebApp API — обязательные вызовы

### 30.1 Жизненный цикл

```js
const tg = window.Telegram.WebApp;

// 1. ОБЯЗАТЕЛЬНО при загрузке — иначе TG показывает loading-spinner навсегда
tg.ready();

// 2. На полный экран
tg.expand();

// 3. На прозрачный header (тема)
tg.setHeaderColor('bg_color');  // или конкретный цвет '#0a0612'

// 4. Theme — реагируй на изменения
tg.onEvent('themeChanged', () => {
  // tg.themeParams содержит цвета TG-темы
});
```

### 30.2 BackButton — нативная кнопка «назад»

```js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function useTelegramBackButton() {
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const isRoot = loc.pathname === '/' || loc.pathname === '/home';
    if (isRoot) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      const handler = () => nav(-1);
      tg.BackButton.onClick(handler);
      return () => tg.BackButton.offClick(handler);
    }
  }, [loc.pathname, nav]);
}
```

Без этого нативная «назад» закроет Mini App вместо навигации внутри.

### 30.3 MainButton — главный CTA

```js
tg.MainButton.setText('Купить Premium · 750 ₽');
tg.MainButton.color = '#7c5cff';
tg.MainButton.onClick(handlePurchase);
tg.MainButton.show();
// Скрываем когда не нужен:
tg.MainButton.hide();
```

Полезно для payment-flow — кнопка прибита внизу TG-UI, юзер привычно жмёт.

### 30.4 HapticFeedback — тактильный отклик

```js
function safeHaptic(type = 'light') {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type);
  } catch { /* iOS-only, в Desktop noop */ }
}

// При успехе:
window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
```

**⚠️ В Desktop Telegram → noop.** Не критично, но guard'и обязательно — без них в Desktop падает.

### 30.5 CloudStorage — синхронизация между девайсами

TG даёт key-value storage синхронизируемый между девайсами юзера (до 1024 keys × 4 KB):

```js
function cloudSet(key, value) {
  return new Promise((resolve, reject) => {
    window.Telegram?.WebApp?.CloudStorage?.setItem(key, value, (err, ok) => {
      err ? reject(err) : resolve(ok);
    });
  });
}

// Использование:
await cloudSet('favorites', JSON.stringify([id1, id2, id3]));
```

Хорошая альтернатива localStorage когда нужна синхронизация.

### 30.6 Список платформ и feature parity

| API | iOS | Android | Desktop (Windows/Linux) | macOS |
|-----|-----|---------|-------------------------|-------|
| `ready()` | ✅ | ✅ | ✅ | ✅ |
| `expand()` | ✅ | ✅ | window-resize | ✅ |
| `BackButton` | ✅ | ✅ | partial (иногда не показ.) | ✅ |
| `MainButton` | ✅ | ✅ | ✅ | ✅ |
| `HapticFeedback` | ✅ | ✅ | noop | noop |
| `CloudStorage` | ✅ | ✅ | ✅ | ✅ |
| `BiometricManager` | ✅ | ✅ | ❌ | ❌ |
| `openInvoice` (Stars) | ✅ | ✅ | ✅ | ✅ |
| `openLink` external | ✅ | ✅ | ✅ | ✅ |

Принцип: **всегда guard'и через optional-chaining**:
```js
tg?.HapticFeedback?.impactOccurred?.('medium');
```

### 30.7 platform detection

```js
const platform = window.Telegram?.WebApp?.platform;
// 'ios' | 'android' | 'tdesktop' | 'macos' | 'web' | 'unknown'

if (platform === 'tdesktop') {
  // Без haptic, BackButton может не работать
}
```

---

## 31. CI/CD через GitHub Actions

### 31.1 Зачем

Ручной `git pull && systemctl restart` через VNC — медленно и легко забыть `npm ci` или миграции. Автоматизируем.

### 31.2 SSH-ключ для деплоя

На локалке:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/yourapp_deploy -N ""
# Положи публичный на сервер:
ssh-copy-id -i ~/.ssh/yourapp_deploy.pub interstellar@MOSCOW_IP
```

В GitHub → Settings → Secrets and variables → Actions → New secret:
- `DEPLOY_SSH_KEY` = содержимое `~/.ssh/yourapp_deploy` (приватный ключ)
- `DEPLOY_HOST` = IP/домен сервера
- `DEPLOY_USER` = `interstellar`

### 31.3 Workflow `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend
on:
  push:
    branches: [master]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /home/interstellar/yourapp
            git pull origin master
            cd backend
            npm ci --omit=dev
            sudo systemctl restart yourapp
            sleep 3
            curl -fsS https://api.yourapp.ru/health || (echo "Health failed!" && exit 1)
```

### 31.4 Frontend деплой = автомат CF Pages

Cloudflare Pages при `git push` сама пересобирает фронт. **Ничего настраивать не надо** — связка GitHub ↔ CF Pages работает сразу после привязки репо.

### 31.5 Pre-commit hook (опционально)

`.husky/pre-commit`:
```bash
#!/bin/sh
cd mini-app && npm run typecheck && npm run lint
cd ../backend && node -c server.js && node -c yookassa.js
```

Защищает от пуша с syntax-ошибками.

---

## 32. Cost-monitoring LLM (polza.ai)

### 32.1 Логирование usage в БД

polza.ai возвращает `usage` в каждом ответе:
```json
{
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 567,
    "total_tokens": 1801
  }
}
```

Сохраняй каждый вызов:
```sql
CREATE TABLE llm_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_user_id INTEGER NOT NULL,
  day_bucket TEXT NOT NULL,        -- 'YYYY-MM-DD'
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  cost_usd_x1000000 INTEGER NOT NULL,  -- стоимость × 10^6 для целочисленной арифметики
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_llm_usage_user_day ON llm_usage(telegram_user_id, day_bucket);
```

### 32.2 Calculate cost

```js
const MODEL_COSTS_PER_1M_TOKENS = {
  'openai/gpt-4o-mini': { input: 0.15, output: 0.60 },
  'qwen/qwen3-235b-a22b-2507': { input: 0.071, output: 0.10 },
  'deepseek/deepseek-chat': { input: 0.32, output: 0.89 },
};

function calcCost(model, usage) {
  const m = MODEL_COSTS_PER_1M_TOKENS[model] || { input: 0.30, output: 0.60 };
  const inputCost = (usage.prompt_tokens / 1_000_000) * m.input;
  const outputCost = (usage.completion_tokens / 1_000_000) * m.output;
  return Math.round((inputCost + outputCost) * 1_000_000);  // × 10^6
}
```

### 32.3 Алерт при превышении бюджета

Cron каждый час:
```js
const yesterdaySpend = db.prepare(`
  SELECT SUM(cost_usd_x1000000) AS spend
  FROM llm_usage WHERE day_bucket = ?
`).get(yesterdayBucket);

const spendUsd = yesterdaySpend.spend / 1_000_000;
if (spendUsd > DAILY_BUDGET_USD) {
  // Sentry alert + telegram message админу
  await tgCall('sendMessage', {
    chat_id: ADMIN_TELEGRAM_IDS[0],
    text: `⚠️ LLM spend overrun: $${spendUsd.toFixed(2)} (limit ${DAILY_BUDGET_USD})`,
  });
}
```

### 32.4 Per-user cost limit (anti-abuse)

Один юзер с Premium-подпиской может за ночь сжечь $50+ если делает много запросов. Дополнительно к tier-based rate-limit:

```js
async function checkUserDailyCost(db, userId) {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare(`
    SELECT SUM(cost_usd_x1000000) AS spend
    FROM llm_usage WHERE telegram_user_id = ? AND day_bucket = ?
  `).get(userId, today);
  const spendUsd = (row.spend || 0) / 1_000_000;
  // Premium платит $7.5/мес = $0.25/день. Cap на $1/день — anti-abuse.
  if (spendUsd > 1.0) {
    throw new ApiError(429, 'COST_LIMIT_EXCEEDED');
  }
}
```

---

## 33. Конкретный bot-api.js через прокси

```js
// backend/bot-api.js
import { ProxyAgent, fetch } from 'undici';

const BOT_TOKEN = process.env.BOT_TOKEN;
const PROXY_URL = process.env.TG_API_PROXY;

if (PROXY_URL) {
  console.log(`[bot-api] Using proxy: ${PROXY_URL.replace(/:\/\/[^@]+@/, '://***:***@')}`);
}

const dispatcher = PROXY_URL ? new ProxyAgent(PROXY_URL) : undefined;

export async function tgCall(method, body = {}) {
  if (!BOT_TOKEN) throw new Error('BOT_TOKEN not configured');

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    dispatcher,
  });

  const data = await res.json();
  if (!data.ok) {
    const err = new Error(`TG API: ${data.description}`);
    err.code = data.error_code;
    err.parameters = data.parameters;
    throw err;
  }
  return data.result;
}

// Convenience wrappers
export function sendMessage({ chatId, text, parseMode, replyMarkup }) {
  return tgCall('sendMessage', {
    chat_id: chatId,
    text,
    ...(parseMode && { parse_mode: parseMode }),
    ...(replyMarkup && { reply_markup: replyMarkup }),
  });
}

export function answerPreCheckoutQuery({ queryId, ok, errorMessage }) {
  return tgCall('answerPreCheckoutQuery', {
    pre_checkout_query_id: queryId,
    ok,
    ...(errorMessage && { error_message: errorMessage }),
  });
}

export function refundStarPayment({ userId, chargeId }) {
  return tgCall('refundStarPayment', {
    user_id: userId,
    telegram_payment_charge_id: chargeId,
  });
}
```

**Важно:**
- `undici@^6` (не v8 — требует Node 22+)
- При логе proxy URL **скрывай credentials**: `replace(/:\/\/[^@]+@/, '://***:***@')`

---

## 34. ЮКасса edge cases

### 34.1 Recurring failed (карта истекла, недостаточно средств)

ЮК шлёт webhook `payment.canceled` с `cancellation_details.reason`:
- `expired_card` — карта истекла
- `insufficient_funds` — нет денег на счету
- `3d_secure_failed_on_authentication` — банк требует SCA, которой нет в recurring
- `payment_method_restricted` — банк заблокировал recurring-платежи

Поведение:
```js
if (event === 'payment.canceled' && row.is_recurring) {
  // 1. Помечаем подписку как «recurring failed» — auto_renew=0
  db.prepare('UPDATE subscriptions SET auto_renew = 0 WHERE yk_payment_method_id = ?')
    .run(row.payment_method_id);

  // 2. Шлём юзеру push через бот: «Не удалось продлить подписку: причина X»
  await sendMessage({
    chatId: row.telegram_user_id,
    text: `❗ Не удалось продлить подписку. Причина: ${REASON_NAMES[reason]}.\n` +
          `Подписка работает ещё ${daysLeft} дней. Можно обновить карту в Профиле.`,
  });
}
```

### 34.2 3DS на recurring (SCA-mandate ЕС-стиль)

В ЕС с 2024 банки требуют SCA даже на recurring. В РФ пока проще, но **может стать строже** в 2026-2027. Готовь UX:

Если recurring отдаёт `pending` с `confirmation_url`:
1. Шлёшь юзеру push: «Подтверди продление, тыкни кнопку»
2. Открывается Mini App → /paywall с пред-заполненным `payment_id`
3. Юзер тапает «Подтвердить» → opens confirmation_url
4. После 3DS-успеха → webhook `payment.succeeded`

### 34.3 Partial refund — частичный возврат

Юзер активно пользовался Premium 10 дней из 30, потом передумал. По ЗоЗПП ст. 32 — refund прорейтно:

```js
// 10/30 = 0.333 уже использовано
// Возвращаем 20/30 * 750 = 500₽
const used = (now - startedAt) / (expiresAt - startedAt);
const refundAmount = totalAmount * (1 - used);

await ykRefund({
  payment_id: paymentId,
  amount: refundAmount.toFixed(2),
  reason: 'Customer requested partial refund (ZoZPP ст. 32)',
});

// В webhook refund.succeeded — отменяем подписку с экспирацией = СЕЙЧАС
db.prepare('UPDATE subscriptions SET cancelled_at = ?, expires_at = ? WHERE ...')
  .run(now, now, ...);
```

### 34.4 Refund-окно

ЮКасса разрешает refund **в течение 180 дней** с момента платежа. После — нельзя (надо банку напрямую через спор).

---

## 35. Чеки 54-ФЗ для самозанятого

### 35.1 Нужно ли вообще?

**Самозанятый по НПД (422-ФЗ)** обычно использует приложение «Мой налог» для формирования чеков. ЮКасса по умолчанию **не формирует чек**.

**Варианты:**
1. **Простой вариант:** После каждого `payment.succeeded` webhook'а — вручную формируешь чек через **API Мой налог**:
   ```
   POST https://lknpd.nalog.ru/api/v1/income
   {
     "operationTime": "2026-05-18T19:00:00",
     "requestTime": "2026-05-18T19:00:30",
     "services": [{ "name": "Подписка Premium 30 дней", "amount": 750, "quantity": 1 }],
     "totalAmount": 750,
     "client": { "contactPhone": null, "displayName": null, "incomeType": "FROM_INDIVIDUAL" }
   }
   ```
   Авторизация: получить token через `/auth/lkfl` (только если есть телефон, на котором установлен «Мой налог»)
2. **Полу-ручной:** Формируешь чеки раз в неделю руками через приложение «Мой налог» по выписке ЮКассы

3. **Через ЮКассу:** Передавать `receipt` в createPayment — ЮКасса сама отправит в свой ОФД. Но **это для ОСН/УСН/ЕНВД**, не для самозанятых.

**Совет:** Стартуй с варианта 2, через 6 мес автоматизируй через вариант 1.

### 35.2 Receipt-параметр (если используешь ОФД через ЮКассу)

```js
const body = {
  amount: { value: '750.00', currency: 'RUB' },
  // ...
  receipt: {
    customer: {
      email: 'user@example.com',  // или phone
    },
    items: [{
      description: 'Подписка Premium 30 дней',
      quantity: '1.00',
      amount: { value: '750.00', currency: 'RUB' },
      vat_code: 1,                              // НДС
      payment_subject: 'service',
      payment_mode: 'full_prepayment',
    }],
  },
};
```

`vat_code`:
- 1 = «без НДС» (для самозанятых, УСН)
- 2 = 0%
- 3 = 10%
- 4 = 20%

---

## 36. Telegram Stars — withdrawal в рубли

### 36.1 Процесс

1. **Hold-период:** Stars поступают на твой бот-баланс, но **21 день hold** перед выводом
2. **Минимум:** 1000 Stars (~$13)
3. **BotFather:** `/mybots` → выбери бот → Bot Settings → Payments → Stars Balance → Withdraw to TON
4. **Получаешь TON** на свой TON-кошелёк (Tonkeeper, Telegram Wallet)
5. **TON → рубли:** P2P через @wallet в Telegram, или биржи (Bybit, OKX)

### 36.2 Курс

- Telegram продаёт Stars юзерам по ~1.3-1.5 руб/Star
- Telegram платит тебе при withdrawal ~$0.013/Star = ~1.0 руб/Star (комиссия TG ~30%)
- TON → RUB: курс плавающий, спред ~2-5% на P2P

Итого с 1000 Stars (~$13) получаешь ~1000₽ на руках. Это **значительно меньше чем ЮКасса** (3.5% комиссия vs 30%+).

### 36.3 Когда использовать Stars

- **Старт:** пока ЮКасса не одобрена (1-2 недели ожидания)
- **Цифровой контент 18+:** в некоторых юрисдикциях Stars — единственный вариант
- **Глобальная аудитория:** Stars работают международно, ЮКасса — только РФ

---

## 37. Privacy Policy — конкретный скелет

Минимальный шаблон который проходит модерацию ЮКассы / AppStore:

```
ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
Действует с: 17 мая 2026
Версия: 1.0

1. ОПЕРАТОР ПЕРСОНАЛЬНЫХ ДАННЫХ
   ФИО: [Иванов Иван Иванович]
   Статус: Самозанятый (плательщик НПД), 422-ФЗ
   ИНН: [123456789012]
   Контакты: [support@yourapp.ru]

2. КАКИЕ ДАННЫЕ МЫ СОБИРАЕМ
   Из Telegram (через initData):
   - telegram_user_id (числовой ID, не email)
   - username (если у вас публичный, иначе нет)
   - first_name, last_name (то что вы указали в TG-профиле)
   - language_code (например 'ru')
   - photo_url (если публично доступно)

   От вас при использовании:
   - История чатов с AI-персонажами (хранится в вашем браузере localStorage)
   - Платёжная информация (через ЮКассу) — мы НЕ видим номер карты,
     ЮКасса присылает нам только статус платежа и last4 цифр

   Автоматически:
   - IP-адрес (для антифрод и rate-limit)
   - User-Agent (тип устройства/браузера)
   - Timestamps активности

3. ЦЕЛИ ОБРАБОТКИ
   - Авторизация юзера (HMAC-валидация TG initData)
   - Биллинг подписки
   - Анти-фрод (rate-limit, audit-log)
   - Техподдержка (отвечать на вопросы)
   - Аналитика использования (агрегированно, без identifiable PII)

4. ПРАВОВОЕ ОСНОВАНИЕ
   - 152-ФЗ ст.6 ч.1 п.5 — исполнение договора-оферты
   - Ваше согласие (получаем при первом входе)

5. СРОКИ ХРАНЕНИЯ
   - Аккаунт и переписка: до удаления вами + 30 дней
   - Финансовые записи: 5 лет после последнего платежа (402-ФЗ
     требование для бухучёта)
   - Логи доступа: 90 дней

6. КОМУ ПЕРЕДАЁМ
   - ЮКасса (РФ, NBKO group) — для приёма платежей
   - polza.ai (РФ, LLM-провайдер) — для генерации ответов AI
   - Cloudflare (США) — хостинг фронтенда + DNS, передача
     обезличенных метаданных (IP, request headers)
   - Sentry (Германия) — мониторинг ошибок, обезличенные стеки

7. ТРАНСГРАНИЧНАЯ ПЕРЕДАЧА
   Передача в США (Cloudflare) и ЕС (Sentry) осуществляется на
   основании вашего согласия согласно 152-ФЗ ст.12. Эти страны
   не находятся в списке стран с адекватной защитой ПД по
   приказу РКН №274 от 22.07.2022, поэтому требуется отдельное
   согласие при регистрации.

8. ВАШИ ПРАВА (152-ФЗ ст.14)
   - Получить копию ваших данных: email на [support@yourapp.ru]
   - Исправить неверные данные: email
   - Удалить ваши данные: Профиль → Удалить мои данные.
     Финансовые записи сохраняются 5 лет (402-ФЗ)
   - Отозвать согласие: email

9. COOKIE И ЛОКАЛЬНОЕ ХРАНИЛИЩЕ
   Мы используем localStorage браузера для:
   - Кеширования вашей истории чатов
   - Сохранения настроек (избранное, mood-стили)
   Cookie не используются.

10. КОНТАКТЫ
    Email: [support@yourapp.ru]
    Telegram: [@YourSupportBot] или команда /paysupport в боте
    Срок ответа на запросы: 30 дней (152-ФЗ ст.20)

11. ИЗМЕНЕНИЯ В ПОЛИТИКЕ
    При существенных изменениях запросим повторное согласие.
    История версий доступна по запросу.
```

---

## 38. Multi-region fallback / Disaster recovery

### 38.1 Single point of failure

Текущая архитектура:
- 1 VPS Moscow → если упал = весь backend недоступен
- 1 VPS Sweden → если упал = TG webhook не доходит
- SQLite на одном диске → если диск умер = потеря данных

### 38.2 Литstream — SQLite replication в S3

`litestream` непрерывно реплицирует SQLite в S3-compatible (Selectel/Yandex Cloud Storage). Latency replication ~60 сек.

```bash
# На Moscow VPS:
wget -O- https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-amd64.tar.gz | tar -xzC /usr/local/bin

# Конфиг /etc/litestream.yml:
cat > /etc/litestream.yml <<'YAML'
dbs:
  - path: /home/interstellar/yourapp-data/app.sqlite
    replicas:
      - type: s3
        bucket: yourapp-sqlite-replica
        endpoint: storage.yandexcloud.net
        region: ru-central1
        access-key-id: ENV(S3_ACCESS_KEY)
        secret-access-key: ENV(S3_SECRET_KEY)
YAML

# Systemd service:
systemctl enable --now litestream
```

При катастрофе:
```bash
# На новом VPS:
litestream restore -o /path/to/app.sqlite s3://yourapp-sqlite-replica/app.sqlite
# Запустить backend как обычно
```

### 38.3 Standby VPS на другом провайдере

- Закажи **второй VPS** у Selectel/Timeweb (другой провайдер чем AEZA)
- Заранее установи nginx + Node + clone репо + восстанови `.env`
- НЕ запускай systemd unit (idle)

При падении AEZA Moscow:
1. На standby: `litestream restore` свежей БД
2. Запускаешь backend
3. В Cloudflare DNS: поменяй A-запись `api.yourapp.ru` на IP standby
4. Через 1-3 минуты (CF TTL) трафик идёт на standby

### 38.4 Cloudflare Health Check + auto-failover

Premium план CF ($20/мес) даёт Health Check + автоматический failover:
- CF мониторит `https://api.yourapp.ru/health`
- При 3 fails → автоматически переключает A-запись на secondary
- При восстановлении → возвращает обратно

### 38.5 Runbook восстановления (документируй заранее!)

```
=== RUNBOOK: Восстановление после падения Moscow VPS ===

1. Подтверди что Moscow реально упал:
   ping <MOSCOW_IP>
   curl https://api.yourapp.ru/health  # должен timeout

2. Включи Standby VPS:
   ssh standby
   cd /home/interstellar/yourapp
   sudo systemctl start yourapp

3. Восстанови свежую БД:
   litestream restore -o /home/interstellar/yourapp-data/app.sqlite s3://...

4. Переключи DNS:
   В CF Dashboard → DNS → api.yourapp.ru → A → <STANDBY_IP>
   TTL уже 1 мин → через 60 сек юзеры на standby

5. Проверь webhook:
   curl https://api.yourapp.ru/health
   В TG → отправь /start боту → должен ответить

6. Мониторинг следующие 2 часа:
   tail -f /var/log/yourapp/backend.log
```

---

## 39. HSTS preload + SRI + WAF rules

### 39.1 HSTS preload submission

После HSTS-header в `_headers` (`max-age=31536000; includeSubDomains; preload`):

1. Открой [https://hstspreload.org/](https://hstspreload.org/)
2. Введи `yourapp.ru`
3. Подтверди checklist (все поддомены HTTPS, redirect на HTTPS, и т.д.)
4. Submit → через 12 недель домен в HSTS preload list всех браузеров

После этого **браузеры физически отказываются** делать HTTP-запросы на твой домен — даже первый раз.

### 39.2 Subresource Integrity (SRI) для self-hosted скриптов

Если у тебя `<script src="/telegram-web-app.js">` — добавь integrity hash:

```bash
# Считаем hash
HASH=$(openssl dgst -sha384 -binary mini-app/public/telegram-web-app.js | openssl base64 -A)
echo "sha384-$HASH"
```

В `index.html`:
```html
<script
  src="/telegram-web-app.js"
  integrity="sha384-EpRdY1Q...lJ"
  crossorigin="anonymous"
></script>
```

Если кто-то подменит файл — браузер откажется выполнять. Hash обновляешь когда обновляешь скрипт.

### 39.3 Cloudflare WAF rules

CF Dashboard → твой домен → Security → WAF → Custom rules:

**Rule 1: Block country=CN/KP (если не нужен мировой трафик)**
```
(ip.geoip.country in {"CN" "KP"}) → Block
```

**Rule 2: Challenge при высоком threat score**
```
(cf.threat_score gt 30) → Managed Challenge
```

**Rule 3: Rate-limit на auth endpoints**
Cloudflare → Security → Rate Limiting Rules:
```
URL Path = /api/v1/auth/*
Threshold = 10 requests per 1 min
Action = Block for 10 min
```

---

## 40. Menu Button vs t.me/bot/app deeplink

### 40.1 Различия

| | Menu Button (☰) | t.me/bot/app deeplink |
|---|----------------|----------------------|
| Где появляется | В чате с ботом, рядом с inputом | Открывается по ссылке из любого чата |
| Mode | chat-app (привязан к чату) | standalone |
| Доступ к `chat_instance` | ✅ да | ❌ нет |
| `startapp` параметр | ❌ нет | ✅ да (deeplink routing) |
| Inline-режим (в группах) | ❌ нет | ✅ да |
| Разделение по сценариям | ❌ один URL | ✅ разные через `?startapp=` |

### 40.2 Когда что использовать

**Menu Button**: для постоянных юзеров бота. Они в чате → жмут ☰ → попадают в Mini App.

**Deeplink `t.me/bot/app`**: для распространения. Партнёры публикуют ссылку в каналах/группах. Юзер кликает → попадает прямо в Mini App без захода в чат.

**Deeplink с параметром `?startapp=premium`**: для маркетинга. «Жми кнопку → попадаешь сразу в paywall» — можно так таргетировать рекламу.

### 40.3 Обработка startapp на фронте

```js
const tg = window.Telegram.WebApp;
const startParam = tg.initDataUnsafe.start_param;

if (startParam) {
  // Например, ?startapp=paywall — открыть paywall сразу
  if (startParam === 'paywall') {
    navigate('/paywall');
  } else if (startParam.startsWith('ref_')) {
    // Партнёрская атрибуция
    const slug = startParam.slice(4);
    trackReferral(slug);
  }
}
```

### 40.4 BotFather setup для обоих

```
# Menu Button (в чате с ботом):
/mybots → выбери → Bot Settings → Menu Button → Edit URL
→ https://t.me/YourBot/app   (открывает Web App, не внешний браузер)

# Web App (через /newapp — для deeplink):
/newapp → выбери → название/описание/фото
→ Web App URL: https://yourapp.ru
→ Short name: app   (станет частью URL: t.me/YourBot/app)
```

---

## 41. i18n — даже если стартуете на одном языке

### 41.1 Почему сразу

Через 6 мес захочется EN/UZ/KZ-локализации. **Без foundation** — переписывать все strings в UI неделю.

### 41.2 Минимальная настройка

```bash
cd mini-app
npm install i18next react-i18next i18next-browser-languagedetector
```

```ts
// mini-app/src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './locales/ru.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en } },
  lng: window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default i18n;
```

В компонентах:
```tsx
import { useTranslation } from 'react-i18next';

function HomePage() {
  const { t } = useTranslation();
  return <h1>{t('home.title')}</h1>;
}
```

`locales/ru.json`:
```json
{
  "home": { "title": "Каталог" },
  "paywall": { "buyBasic": "Купить Basic за {{price}} ₽" }
}
```

### 41.3 Telegram language_code

`window.Telegram.WebApp.initDataUnsafe.user.language_code` = 'ru' | 'en' | 'es' | etc. — язык TG-клиента юзера. Хорошее начальное значение.

---

## 42. Self-hosted telegram-web-app.js — процесс обновления

### 42.1 Cron-проверка новых версий

`/etc/cron.d/check-tg-sdk`:
```cron
0 6 * * 1 /home/interstellar/scripts/check-tg-sdk.sh
```

`/home/interstellar/scripts/check-tg-sdk.sh`:
```bash
#!/bin/bash
LOCAL_HASH=$(sha256sum /home/interstellar/yourapp/mini-app/public/telegram-web-app.js | awk '{print $1}')
LIVE_HASH=$(curl -x $TG_API_PROXY -s https://telegram.org/js/telegram-web-app.js | sha256sum | awk '{print $1}')

if [ "$LIVE_HASH" != "$LOCAL_HASH" ]; then
  # Шлём Telegram-уведомление админу
  curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=${ADMIN_ID}" \
    -d "text=⚠️ Telegram WebApp SDK changed. Update mini-app/public/telegram-web-app.js"
fi
```

### 42.2 Процедура обновления

1. Cron уведомил что версия изменилась
2. На локальном ПК:
   ```bash
   curl -x http://user:pass@SWEDEN_IP:3128 -sL \
     https://telegram.org/js/telegram-web-app.js \
     -o mini-app/public/telegram-web-app.js
   ```
3. **Сравни diff** — что изменилось (есть ли breaking changes)
4. **Тестируй на DEV** — запусти Mini App, проверь основные сценарии
5. **Обнови SRI hash** в `index.html` (см. 39.2)
6. Commit + push → CF Pages автодеплой

---

## 43. DevOps hardening (production maturity)

### 43.1 fail2ban — защита SSH от brute-force

```bash
apt install fail2ban
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
maxretry = 3
bantime = 86400
findtime = 600
EOF
systemctl enable --now fail2ban
fail2ban-client status sshd  # проверка
```

### 43.2 Swap для VPS 2GB RAM

OOM-killer убивает Node под нагрузкой если нет swap:
```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
sysctl vm.swappiness=10  # минимизировать swap-usage пока RAM хватает
```

### 43.3 chmod 600 на `.env`

Дефолтный umask = 022 (читаемо всем). `.env` содержит секреты:
```bash
chmod 600 /home/interstellar/yourapp/backend/.env
chown interstellar:interstellar /home/interstellar/yourapp/backend/.env
```

Проверка:
```bash
ls -la backend/.env
# Должно быть -rw------- 1 interstellar interstellar
```

### 43.4 systemd hardening

```ini
[Service]
# ... основные настройки ...
TimeoutStopSec=45
StartLimitIntervalSec=300
StartLimitBurst=5
# Защита от crashloop — если 5 рестартов за 5 мин → systemd перестаёт пытаться

# Sandbox
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=true
ReadWritePaths=/home/interstellar/yourapp-data /var/log/yourapp
LimitNOFILE=65536
MemoryMax=1500M
TasksMax=512

# Heap snapshots для memory-leak debug
Environment=NODE_OPTIONS=--heapsnapshot-near-heap-limit=3 --max-old-space-size=1024
```

### 43.5 sysctl tuning

`/etc/sysctl.d/99-yourapp.conf`:
```
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.tcp_fin_timeout = 20
net.ipv4.ip_local_port_range = 1024 65535
fs.file-max = 200000
```

`sysctl --system`

### 43.6 nginx production-ready config (полный)

```nginx
# /etc/nginx/sites-available/api.yourapp.ru
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=webhook:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=2r/s;

server {
    listen 443 ssl http2;
    listen 443 quic reuseport;        # HTTP/3 для мобильных
    server_name api.yourapp.ru;
    
    ssl_certificate /etc/letsencrypt/live/api.yourapp.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourapp.ru/privkey.pem;
    
    # SSL hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 8.8.8.8 valid=300s;
    
    add_header Alt-Svc 'h3=":443"; ma=86400';
    
    # mTLS — только Cloudflare может ходить на origin
    ssl_client_certificate /etc/ssl/cloudflare-origin-pull.pem;
    ssl_verify_client on;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_types application/json application/javascript text/css text/plain;
    brotli on;          # требует nginx-brotli модуль
    brotli_types application/json application/javascript text/css text/plain;
    
    # Timeouts (защита от slow-loris)
    client_body_timeout 10s;
    client_header_timeout 10s;
    client_max_body_size 256k;
    send_timeout 30s;
    keepalive_timeout 65s;
    
    # Webhook от ЮКассы — отдельный rate-limit (выше)
    location /api/v1/yookassa-webhook {
        limit_req zone=webhook burst=50 nodelay;
        proxy_pass http://127.0.0.1:3001;
        include /etc/nginx/proxy_params;
    }
    
    # Auth — самый строгий
    location ~ ^/api/v1/(auth|users/me) {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://127.0.0.1:3001;
        include /etc/nginx/proxy_params;
    }
    
    # Остальное
    location / {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3001;
        include /etc/nginx/proxy_params;
        proxy_read_timeout 60s;
        proxy_send_timeout 30s;
    }
}
```

`/etc/nginx/proxy_params`:
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
proxy_http_version 1.1;
```

### 43.7 Cloudflare mTLS origin pull (КРИТИЧНО)

Без этого любой кто узнал твой IP (через crt.sh — там видны все LE-сертификаты) **обходит CF WAF**.

1. CF Dashboard → SSL/TLS → Origin Server → Authenticated Origin Pulls → ON
2. Скачай CF Origin Pull CA: `https://developers.cloudflare.com/ssl/static/authenticated_origin_pull_ca.pem`
3. Положи на сервер `/etc/ssl/cloudflare-origin-pull.pem`
4. В nginx: `ssl_client_certificate /etc/ssl/cloudflare-origin-pull.pem; ssl_verify_client on;`

Теперь прямой запрос на IP сервера (минуя CF) получит 400 Bad Certificate.

### 43.8 Cloudflare Tunnel — альтернатива nginx+LE

Если не хочешь возиться с Let's Encrypt + mTLS — используй cloudflared:
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared.deb
cloudflared tunnel login
cloudflared tunnel create yourapp
cloudflared tunnel route dns yourapp api.yourapp.ru

# /etc/cloudflared/config.yml
tunnel: yourapp
credentials-file: /root/.cloudflared/<UUID>.json
ingress:
  - hostname: api.yourapp.ru
    service: http://localhost:3001
  - service: http_status:404

systemctl enable --now cloudflared
```

Преимущества: origin полностью скрыт, не нужен открытый 443 наружу, нет certbot.
Недостаток: vendor lock-in на CF.

### 43.9 SQLite оптимизации (которые не были раньше)

```js
db.pragma('mmap_size = 268435456');  // 256MB memory-mapped — read speedup 30-50%
db.pragma('cache_size = -64000');    // 64MB page cache
db.pragma('temp_store = MEMORY');
db.pragma('busy_timeout = 5000');    // ждать 5s при WAL-конфликтах
```

### 43.10 SQLite VACUUM + integrity check (cron)

`/etc/cron.d/sqlite-maintenance`:
```cron
# WAL checkpoint + optimize каждое воскресенье в 04:00
0 4 * * 0 root sqlite3 /home/interstellar/yourapp-data/app.sqlite "PRAGMA wal_checkpoint(TRUNCATE); PRAGMA optimize; ANALYZE;"

# VACUUM ежемесячно (освобождает место)
0 4 1 * * root sqlite3 /home/interstellar/yourapp-data/app.sqlite "VACUUM;"

# Integrity check — каждое утро в 06:30
30 6 * * * root sqlite3 /backups/app-latest.db "PRAGMA integrity_check;" | grep -v "^ok$" && curl -s "https://api.telegram.org/bot$TOKEN/sendMessage?chat_id=$ADMIN&text=BACKUP_INTEGRITY_FAIL"
```

### 43.11 Backup через VACUUM INTO (не блокирует writers)

```bash
# .backup — блокирует writers
# VACUUM INTO — не блокирует
sqlite3 /home/interstellar/yourapp-data/app.sqlite "VACUUM INTO '/backups/app-$(date +%Y%m%d-%H%M).db'"
```

### 43.12 Шифрование БД at-rest (SQLCipher)

PII шифруется на app-level (раздел 23). Но дамп БД через `.backup` или украденный snapshot диска = всё открыто. Решение — **SQLCipher**:

```bash
npm install @journeyapps/sqlcipher
```

```js
import sqlite from '@journeyapps/sqlcipher';
const db = sqlite.verbose();
const conn = new db.Database('app.encrypted.sqlite');
conn.run(`PRAGMA key = '${process.env.DB_ENCRYPTION_KEY}'`);
```

Минусы: чуть медленнее (5-10%), `better-sqlite3` несовместим, нужна миграция.

### 43.13 Env validation на старте (fail-fast)

```js
// backend/env-validation.js
import { z } from 'zod';

const envSchema = z.object({
  BOT_TOKEN: z.string().min(20),
  POLZA_API_KEY: z.string().startsWith('pza_'),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(32),
  DB_PATH: z.string(),
  YK_SHOP_ID: z.string().optional(),
  YK_SECRET_KEY: z.string().optional(),
  PAYOUT_ENCRYPTION_KEY: z.string().length(44),  // base64 of 32 bytes
  TG_API_PROXY: z.string().url(),
});

export const env = envSchema.parse(process.env);
// Если переменной не хватает — крашится со внятной ошибкой, systemd
// уважает StartLimitBurst и не маскирует bad config бесконечными рестартами.
```

### 43.14 Structured JSON logging (pino)

Не `console.log("text")`, а:
```js
import pino from 'pino';
const log = pino({
  level: 'info',
  formatters: { level: (l) => ({ level: l }) },
});

log.info({ user_id, charge_id, route: 'payment.webhook' }, 'payment received');
```

Можно фильтровать в Grafana Loki / parser в Sentry / grep по полям.

### 43.15 Correlation IDs (request_id)

```js
app.use((req, _res, next) => {
  req.id = req.headers['cf-ray'] || crypto.randomUUID();  // CF даёт cf-ray
  req.log = log.child({ req_id: req.id });
  next();
});

// В обработчиках:
req.log.info({ user_id }, 'fetching user');
```

При багрепорте юзер шлёт cf-ray → ты находишь весь его трейс в логах.

### 43.16 unhandled rejection + uncaught exception

Node 18+ по дефолту крашится при unhandled, но без логирования причины:
```js
process.on('unhandledRejection', (err) => {
  Sentry?.captureException(err);
  log.fatal({ err }, 'unhandledRejection');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  Sentry?.captureException(err);
  log.fatal({ err }, 'uncaughtException');
  process.exit(1);
});
```

### 43.17 LLM AbortController timeout

Без этого зависший polza.ai держит worker:
```js
const ac = new AbortController();
const timer = setTimeout(() => ac.abort(), 30_000);
try {
  const res = await fetch(POLZA_URL, { signal: ac.signal, ... });
  // ...
} finally {
  clearTimeout(timer);
}
```

### 43.18 undici ProxyAgent pool settings

```js
new ProxyAgent({
  uri: PROXY_URL,
  connections: 50,           // дефолт 10 — мало для burst webhook'ов
  keepAliveTimeout: 30_000,
  pipelining: 1,
});
```

### 43.19 BOT_TOKEN compromise runbook

```
1. BotFather → /revoke (revokes current token, генерирует новый)
2. systemctl stop yourapp
3. Обнови backend/.env: BOT_TOKEN=<новый>
4. curl POST setWebhook с новым URL + новый secret_token
5. systemctl start yourapp
6. Проверь: getWebhookInfo → last_error_date=null
7. Опционально: уведоми юзеров если был долгий downtime
```

### 43.20 SQLite corruption recovery

```bash
# 1. Останови backend
systemctl stop yourapp

# 2. Попробуй recover
sqlite3 broken.db ".recover" > recovered.sql
sqlite3 recovered.db < recovered.sql

# 3. Сравни схему с миграциями, восстанови missing FK
sqlite3 recovered.db ".schema" | diff - expected_schema.sql

# 4. Перенеси на место БД
mv broken.db corrupted-$(date +%s).db
mv recovered.db app.sqlite

# 5. Запусти backend, проверь /health
systemctl start yourapp
```

### 43.21 Cloudflare-down runbook

CF blocked РКН (как было в июне 2024 на 24h):
1. На NS-уровне регистратора: переключи NS обратно с CF на дефолтные регистратора (reg.ru)
2. В DNS регистратора заведи прямые A-записи на VPS IP (без CF proxy)
3. У юзера: SSL может ругаться — выпусти серт на origin через `certbot` если ещё не выпущен
4. Когда CF restored → переключи NS обратно на CF, верни proxy mode

Подготовь NS-резерв заранее!

### 43.22 Status page

Простой `status.yourapp.ru` (отдельная статика на BunnyCDN, не на CF):
- Embed [UptimeRobot status badge](https://uptimerobot.com)
- Список сервисов: API, Bot, Payments, LLM
- Текущие инциденты + history

Юзеры идут туда когда «не работает» — снимает нагрузку с саппорта.

### 43.23 Per-incident runbook'и

Не один общий troubleshooting, а **папка** `runbooks/`:
```
runbooks/
  polza-down.md
  yk-not-responding.md
  webhook-429.md
  db-locked.md
  bot-token-leaked.md
  cf-incident.md
```

Каждый файл = чёткие шаги для on-call.

### 43.24 Post-mortem template

`incidents/2026-05-18-yk-webhook-fail.md`:
```markdown
## Incident: YK webhook IP-filter blocking
Date: 2026-05-18
Impact: 6 hours, ~100 users couldn't activate paid subscriptions
Severity: P1

### Timeline (UTC)
- 14:20 — deploy commit ac4f7da (CF-Connecting-IP fix)
- 14:35 — first paid sub activated successfully

### Root cause
isYkIp() smотрел req.ip (CF edge), не настоящий IP YK через CF-Connecting-IP

### Action items
- [x] 2026-05-18: deploy fix (ac4f7da)
- [ ] 2026-06-01: add e2e-test for webhook IP check
- [ ] 2026-06-01: monitoring alert if [yk-webhook] rejected ip rate > 1/min
```

### 43.25 Index health check

После каждой миграции `idx_*` — убедиться что планировщик использует индекс:
```bash
sqlite3 app.sqlite "EXPLAIN QUERY PLAN SELECT * FROM subscriptions WHERE telegram_user_id=? AND expires_at > ?"
# Должно: SEARCH ... USING INDEX idx_subscriptions_active
# НЕ должно: SCAN TABLE subscriptions
```

Если `SCAN TABLE` — индекс не выбран, нужна оптимизация запроса или схемы.

---

## 44. Legal CRITICAL gaps — РФ-законодательство

> ⚠️ **Эта секция — НЕ юридическая консультация.** Она поднимает риски о которых нужно знать. Перед запуском — обратись к практикующему юристу по IT/защите ПД.

### 44.1 🔴 КРИТИЧНО: Локализация ПД в РФ (152-ФЗ ст. 18 ч. 5)

**Закон требует:** запись, систематизация, накопление, хранение, уточнение, извлечение ПД граждан РФ — **первично в БД на территории РФ**. Зарубежные сервисы только как **копия**.

**Что нарушаем сейчас:**
- **Cloudflare Pages (US)** — frontend хостится в США, edge-сервера логируют IP/headers/fingerprints юзеров
- **Cloudflare DNS (US)** — все DNS-запросы логируются в США
- **Sentry (DE)** — error-tracking хранит stack-trace + user-context
- **Polza.ai** — формально в РФ, но проверить что у них есть локализация

**Штраф:** ст. 13.11 КоАП — 1-6 млн ₽ за первое нарушение, 6-18 млн ₽ за повторное + блокировка домена РКН.

**Что делать:**
1. **Self-host Sentry** → GlitchTip на AEZA Moscow (open-source совместимый с Sentry SDK):
   ```bash
   git clone https://gitlab.com/glitchtip/glitchtip
   docker compose up -d
   ```
2. **Первичное хранение ПД** — в SQLite на AEZA VPS (это и так у нас)
3. **CF Pages — только статический фронт** без логирования ПД (отключить CF Web Analytics если был)
4. **Уведомить юзеров** в Privacy Policy что данные хранятся в РФ (Москва), копии — в США (CF) с согласия

### 44.2 🔴 КРИТИЧНО: Уведомление РКН об обработке ПД

**С 1 сентября 2022 (ФЗ-266 поправки)** — уведомление РКН **обязательно** для любого оператора ПД кроме узких исключений (ст. 22 ч. 2 152-ФЗ). Подписочный сервис в исключения **не попадает**.

**Действие:** Подать через [pd.rkn.gov.ru](https://pd.rkn.gov.ru/) **ДО запуска**:
- Категории ПД (TG ID, имя, email, IP)
- Цели (биллинг, аутентификация)
- Трансграничная передача (см. 44.3)
- Срок рассмотрения 30 дней — учесть в timeline

**Штраф за непредставление:** ст. 19.7 КоАП — 3-5 тыс ₽. Не катастрофа, но маркер риска для последующих проверок.

### 44.3 🔴 КРИТИЧНО: Уведомление о трансграничной передаче

**Отдельное уведомление РКН** должно быть подано **за 10 рабочих дней до начала** передачи в страны не из «адекватной защиты» (Приказ РКН №274 от 22.07.2022). **США и Германия — НЕ в списке адекватных**.

**Кому передаём:**
- Cloudflare (US) — frontend + DNS
- Sentry (DE) — errors
- Telegram FZ-LLC (UAE/Ireland) — все сообщения юзера ↔ бота

**Действие:**
1. Подать форму «Уведомление о намерении осуществлять трансграничную передачу ПД» через ЕПГУ
2. РКН может **запретить** передачу → план B (self-host Sentry, использовать только РФ-CDN)
3. **Дождаться решения** перед запуском

**Штраф:** ст. 13.11 ч. 8 КоАП — 1-6 млн ₽.

### 44.4 🔴 КРИТИЧНО: LLM может сгенерить CSAM (УК ст. 242.1)

**Самый страшный риск.** Юзер пишет:
> «Опиши как 17-летняя школьница...»

LLM послушно генерит описание. **Это CSAM (child sexual abuse material) по российскому УК**, даже если это фикшн, даже если AI, даже если юзер был инициатор.

**УК ст. 242.1:** изготовление и оборот порнографических материалов с несовершеннолетними — **до 6 лет лишения свободы**. Ст. 242.2 (с использованием интернета) — **до 15 лет**.

**Защита:**

1. **Pre-filter на INPUT юзера** — детекция возрастных маркеров:
```js
const AGE_BLOCKERS = [
  /(школь(ник|ниц|ный|ом)|детс(ад|кий|кая)|подрост(ок|ков|ков)|малол(етк|етн))/i,
  /\b(\d{1,2})\s*(лет|года?|годик)\b/i,  // числа возраста
  /\b(семнадцат|шестнадцат|пятнадцат|четырнадцат)/i,
];

const SEX_MARKERS = [
  /(секс|половой|интим|эрот|оргазм|трах|обнаж|раздел|голая?)/i,
];

function isCsamRisk(text) {
  let foundAge = false, foundSex = false;
  for (const re of AGE_BLOCKERS) if (re.test(text)) foundAge = true;
  for (const re of SEX_MARKERS) if (re.test(text)) foundSex = true;
  if (foundAge && foundSex) {
    // Дополнительно проверь число < 18
    const m = text.match(/\b(\d{1,2})\s*(лет|года?)/i);
    if (m && Number(m[1]) < 18) return true;
    return true;  // словесные маркеры школьник/etc
  }
  return false;
}

// В /chat handler:
if (isCsamRisk(userMessage)) {
  logSecurityEvent('csam_blocked', { user_id, text_hash: sha256(text) });
  return res.status(400).json({ ok: false, error: 'CONTENT_POLICY' });
}
```

2. **Post-filter на OUTPUT LLM** — те же regex по ответу модели:
```js
const llmResponse = await callPolza(messages);
if (isCsamRisk(llmResponse)) {
  logSecurityEvent('csam_in_llm_output', { user_id, response_hash: sha256(llmResponse) });
  return { ok: false, error: 'CONTENT_POLICY' };
}
```

3. **System prompt — жёсткие запреты**:
```
КРИТИЧНЫЕ ОГРАНИЧЕНИЯ (нарушение = немедленный отказ):
- Не описывай сексуальные сцены с несовершеннолетними
  (под 18 лет — даже фикшн, даже метафорически).
- Не используй слова «школьник/школьница» с эротическим контекстом.
- Не описывай детальные сцены изнасилования.
- Не описывай детальные сцены детальной демонстрации половых органов.
- При запросе на это — отвечай в роли с твёрдым отказом.
```

4. **Audit-log** всех заблокированных запросов с хешем + timestamp + user_id (для аудита при иске).

5. **Bug bounty / red team** — попроси кого-то JAILbreak'нуть фильтр перед запуском.

**Без этих мер NSFW-feature нельзя запускать в РФ.**

### 44.5 🔴 КРИТИЧНО: Порнография запрещена в РФ (УК ст. 242)

**Даже взрослая** порнография в РФ запрещена в обороте (изготовление, хранение, перевозка, распространение). Граница между «эротикой» (легально с 18+) и «порнографией» (запрещено):

| Эротика | Порнография |
|---------|-------------|
| Намёки, флирт, обнажённость | Детальная демонстрация половых актов |
| Художественное изображение | Натуралистичная описательность гениталий |
| Чувственность как часть истории | Сцены изнасилования с подробностями |
| Сексуальное напряжение | Инцест, БДСМ с реальным насилием |

**УК ст. 242:** до 2 лет, ст. 242 ч. 3 (через интернет с использованием организованной группы) — до 6 лет.

**Защита:** LLM system-prompt должен **жёстко** запрещать перечисленные категории. Output-фильтр блокирует детальные описания половых актов даже если юзер не был инициатором (LLM иногда сама уходит туда).

### 44.6 🔴 КРИТИЧНО: AI-генерация с известными именами (ст. 152.1 ГК)

«AI-чат с Эйнштейном» — **ст. 152.1 ГК РФ** требует согласия гражданина на использование его изображения/имени. После смерти — согласия наследников. Право автора **бессрочно** для наследников.

**Whitelist персонажей:**
- ✅ Античность, средневековье (Клеопатра, Цезарь, и т.п.)
- ✅ Умершие >70 лет назад с давно умершими наследниками (Эйнштейн 1955, Фрейд 1939 — пограничные, низкий риск)
- ⚠️ Умершие 30-70 лет назад (Сталин, Хичкок) — высокий риск
- 🚫 Современные / недавно умершие — **полный бан**

**В оферте — оговорка:**
```
Все персонажи представлены как художественная интерпретация
исторических личностей. Ответы AI не отражают реальное мнение
этих лиц, не претендуют на достоверное воспроизведение их
взглядов и являются развлекательным контентом.
```

**Иск от наследников:** компенсация морального вреда + 10K-5M ₽ по ст. 1252 ГК.

### 44.7 🔴 Партнёрская программа НЕСОВМЕСТИМА с НПД

**422-ФЗ ст. 4 ч. 2 п. 5:** самозанятый не может заниматься агентской/комиссионной деятельностью.

Если ты выплачиваешь партнёрам % от продаж — **это агентская схема** (ты получаешь деньги от юзеров, оставляешь часть, отдаёшь часть партнёру). **Запрещено для НПД**.

**Последствия:** ФНС снимает с НПД с даты первого «нарушения» → пересчитывает весь доход за период под НДФЛ 13% + страховые. Может быть **миллионы рублей** доначисления.

**Что делать:**
- Партнёрскую программу запустить **только после перехода на ИП/УСН 6%**
- В playbook'е раздел 22 (RBAC partners) — добавить **предупреждение**
- До запуска affiliate — открыть ИП (онлайн через банк, 1 день)

### 44.8 🔴 Лимит самозанятого 2.4 млн ₽/год — автомониторинг

При превышении НПД **автоматически прекращается**. Следующие платежи облагаются НДФЛ 13%. Если игнорить — ФНС доначислит за весь год.

**Решение** — cron на бэке:
```js
async function checkNpdLimit() {
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1).getTime();
  const totalRub = db.prepare(`
    SELECT SUM(amount_kopecks) / 100.0 AS total
    FROM yk_payments WHERE status = 'succeeded' AND created_at >= ?
  `).get(yearStart).total || 0;

  if (totalRub > 2_000_000) {
    await sendAdminAlert(`⚠️ NPD limit approach: ${totalRub} / 2.4M ₽`);
  }
  if (totalRub > 2_300_000) {
    // Автоматически отключаем приём новых платежей
    db.prepare('UPDATE config SET value = ? WHERE key = ?').run('1', 'payments_paused');
    await sendAdminAlert(`🔴 NPD pause activated`);
  }
}
```

**Заранее зарегистрировать ИП на УСН 6%** как «горячий резерв».

### 44.9 🔴 Чеки «Мой налог» — мгновенно, не «раз в неделю»

**422-ФЗ ст. 14 ч. 3:** чек формируется в момент расчёта. Раздел 35 playbook'а предлагал «вариант 2: раз в неделю» — **это нарушение**.

**Штраф ст. 129.13 НК:** 20% от суммы за неотражение (мин. 1000 ₽ за чек), повторно — 100%.

**Решение** — автоматизировать с самого старта через [API ЛК НПД](https://npd.nalog.ru/). При получении `payment.succeeded` webhook от ЮКассы:
```js
async function emitNpdReceipt({ userId, amountRub, description }) {
  const token = await getNpdToken();  // login через личный кабинет
  const receipt = await fetch('https://lknpd.nalog.ru/api/v1/income', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      operationTime: new Date().toISOString(),
      requestTime: new Date().toISOString(),
      services: [{ name: description, amount: amountRub, quantity: 1 }],
      totalAmount: amountRub,
      client: { contactPhone: null, displayName: null, incomeType: 'FROM_INDIVIDUAL' },
    }),
  });
  return receipt.json();  // { receiptId, receiptUri }
}
```

Сохрани `receiptUri` в БД для аудита.

### 44.10 🔴 ПД-локализация финансовых записей

ПД пользователя после удаления аккаунта (запрос юзера) — **уничтожаем в течение 30 дней** (152-ФЗ ст. 21 ч. 4). НО в финансовых записях оставляем **обезличенную** ссылку (403-ФЗ + 402-ФЗ требуют 5 лет хранить первичные документы).

**Процедура:**
1. Юзер: «удалить меня» → API call
2. В `users`: `UPDATE users SET first_name='deleted', username=NULL, last_seen_at=NULL WHERE telegram_user_id=?`
3. В `payments`/`subscriptions`: **оставляем** charge_id, amount, ts. Ссылка на user_id остаётся (это технический ID, не PII)
4. В audit-log: добавляем запись `user_deletion_requested`
5. Письмо юзеру: «Данные удалены в течение 30 дней, финансовая история сохранена 5 лет per 402-ФЗ»

### 44.11 🔴 Маркировка рекламы (38-ФЗ + erid)

**С 1 сентября 2022** любая интернет-реклама в РФ маркируется через ОРД (Яндекс, ВК, Сбер, OZON) и получает токен `erid`. Без erid — **штраф 500 тыс ₽ за каждое нарушение**.

**Что считается рекламой:**
- Любое продвижение в TG-каналах, чатах, инфлюенсеров
- Партнёрские ссылки (см. 44.7)
- Яндекс.Директ, ВК-реклама
- Размещения у блогеров

**Что делать:**
1. Заключить договор с ОРД (бесплатно — Яндекс или ВК)
2. Перед каждым креативом — отправить в ОРД → получить erid
3. Размещать с меткой: «Реклама. ИНН рекламодателя. erid: XXX»
4. Если есть партнёры — автоматизировать в их кабинете (создание креатива → erid → выдача ссылки)

### 44.12 🔴 ПП РФ № 1830 от 04.11.2022 — подписочные сервисы

**Дополнительно к чекбоксу автопродления:**
- Перед каждым автосписанием — UI с суммой и датой следующего списания
- Отдельное уведомление **за 24 часа** до списания (push в боте)
- Возможность отменить **в один клик** без захода в саппорт

**Штраф ст. 14.8 ч. 1 КоАП:** 5-10 тыс ₽ для ИП за нарушение требований к информации.

В UI Profile добавить:
```
Premium активна до 17.06.2026
Следующее списание: 18.06.2026 — 750 ₽
[Отменить автопродление]
```

### 44.13 🟠 DPO (Data Protection Officer)

**ст. 22.1 152-ФЗ:** оператор обязан назначить ответственное лицо за обработку ПД. Самозанятый = сам себе DPO, но это должно быть **формализовано**.

**Действие:**
- Внутренний документ-приказ «о назначении ответственного» (для самозанятого — просто документ)
- В Privacy Policy указать: «Ответственное лицо за обработку ПД: [ФИО], email: dpo@yourapp.ru» (можно тот же email что общий support)

### 44.14 🟠 Разделение согласий (152-ФЗ ст. 9)

**Согласие должно быть конкретным** — нельзя одним чекбоксом «согласен со всем». Нужно:

| Согласие | Обязательное | Зачем |
|----------|--------------|-------|
| Принимаю оферту | да | договор |
| Согласие на обработку ПД для оказания услуги | да | биллинг, аутентификация |
| Согласие на аналитику/маркетинг | **опционально**, default OFF | retargeting, push-уведомления о новинках |
| Согласие на трансграничную передачу | да (если используешь CF/Sentry) | США, ЕС |

Отказ от опционального не должен блокировать сервис.

### 44.15 🟠 Реквизиты исполнителя (ЗоЗПП ст. 9)

**До покупки** юзер должен видеть:
- ФИО (Иванов Иван Иванович)
- ИНН
- Адрес регистрации (по паспорту)
- ОГРНИП (если ИП)
- Email + телефон поддержки
- Режим работы поддержки

Сейчас «контакты» в Profile — недостаточно. Должно быть в **paywall** до кнопки «Оплатить».

### 44.16 🟠 Telegram = трансграничная передача

Telegram FZ-LLC (UAE/Ireland) — все сообщения юзера ↔ бота проходят через их серверы. Это **автоматическая трансграничная передача** дополнительно к Cloudflare/Sentry.

В Privacy Policy и уведомлении РКН **обязательно** указать Telegram как получателя ПД с указанием страны.

### 44.17 🟠 Возврат денежных средств — 10 дней

**ЗоЗПП ст. 22:** возврат денег — **в течение 10 календарных дней** с момента предъявления требования. Раздел 27.5 playbook'а говорит «срок ответа 1-3 рабочих дня» — это про ответ, не про деньги.

**Штраф ст. 23 ЗоЗПП:** пеня 1% в день за просрочку. Кумулятивно: за месяц = 30% от суммы.

В админке — алерт на refund-запросы старше 7 дней (чтобы успеть в 10 дней).

### 44.18 🟠 ст. 10 ЗоЗПП — детальная информация перед оплатой

Сейчас paywall показывает «Premium 750 ₽» без разбивки. Перед формой оплаты обязательно:
- Что включено (200 сообщений/день, NSFW, и т.д.)
- Срок действия (30 дней)
- Условия автопродления (возобновится по той же цене)
- Условия отмены (в Профиле, 1 клик, работает до конца оплаченного периода)

### 44.19 🟠 Расчётный счёт — уведомить банк

ЦБ РФ разрешает самозанятому приём НПД-выручки на личную дебетовую карту. **Но банк по 115-ФЗ** (антиотмывка) может **заблокировать счёт** за «нетипичные операции».

**Действие до запуска:**
- Уведоми банк через ЛК письмом: «ИНН XXX, статус самозанятого, ожидаются регулярные поступления от ЮКассы / агрегатора платежей, источник — оплата за digital-услуги»
- Лучше — открыть **отдельную карту** только под бизнес (упрощает учёт)

### 44.20 🟠 Запрет на найм сотрудников (НПД)

Если планируешь нанимать модераторов NSFW — **только по ГПХ на разовые задачи**, не на постоянку. Трудовой договор = снятие с НПД.

### 44.21 🟠 Sweden-прокси и 276-ФЗ

Прокси для api.telegram.org **формально** под действие 276-ФЗ (не реестр VPN, но «средство обхода блокировок»). Использование сервисом — grey zone, **но реклама обхода блокировок запрещена**.

В Privacy Policy и публичных материалах **формулируй нейтрально**: «используем прокси-сервер в Швеции для обеспечения отказоустойчивости связи с Telegram API». Без слов «обход блокировок».

### 44.22 🟠 Аннулирование чека НПД при refund

При возврате юзеру деньги — самозанятый должен **аннулировать чек** через API «Мой налог». Сейчас playbook упоминает refund в ЮКассе, но не аннулирование.

**Следствие:** ФНС видит доход без расхода → переплата налога.

**Решение:** в refund-handler после успешного ЮК-refund:
```js
await fetch('https://lknpd.nalog.ru/api/v1/cancel', {
  method: 'POST',
  body: JSON.stringify({
    receiptId: receiptIdFromDB,
    cancelReason: 'Возврат по требованию покупателя (ЗоЗПП ст.32)',
  }),
});
```

### 44.23 🟠 Terms of Service URL в BotFather

С октября 2024 Telegram требует Terms URL для ботов с платежами:
```
BotFather → /mybots → Bot Settings → Terms of Service URL → https://yourapp.ru/terms
```

Без этого Telegram может **ограничить функции бота** (lockdown на новые платежи).

### 44.24 🟠 Bug bounty / red team на NSFW-фильтр

Перед запуском NSFW — попроси нескольких людей попытаться **jailbreak'нуть** фильтр (запросы которые обходят защиту от CSAM). Логируй удачные jailbreak'и → дополняй фильтр.

Это **необходимый шаг** — без него NSFW-feature нельзя запускать.

### 44.25 🟠 Ответственность за оскорбительный AI-контент

Если AI сгенерит клевету в адрес реального лица (ст. 152 ГК), оператор = ответчик.

**Защита:**
- Output-фильтр блокирует имена реальных современников в негативном контексте
- В оферте: «контент генерируется AI, не отражает позицию правообладателя, юзер использует на свой риск»
- Логирование всех генераций для audit-trail при иске

### 44.26 🟡 Cloudflare блокируется РКН (план B)

CF Pages + DNS на CF = single point of failure. РКН периодически блокирует диапазоны CF (последний — июнь 2024 на 24 часа).

**План B:**
- Резервный CDN на РФ-провайдере (Selectel CDN, BunnyCDN РФ)
- DNS-fallback у регистратора домена (не CF)
- Документированная процедура переключения NS (см. 43.21)

### 44.27 🟡 Корпоративные клиенты vs самозанятый

Самозанятый принимает оплату только от **физлиц**. Если хочешь B2B (корпоративные подписки от юрлиц) — **нужно ИП + ККТ**.

В оферте указать: «Сервис предназначен для физических лиц. Юридические лица обращаются в индивидуальном порядке.»

### 44.28 🔴 Регистрация в реестре «организаторов распространения информации» (149-ФЗ ст. 10.1)

**Если** приложение позволяет UGC-публикацию (юзеры делятся персонажами публично) — это ОРИ → регистрация в реестре РКН → хранение данных 1 год → выдача ФСБ по запросу.

**Текущая архитектура** (1:1 чат с AI, custom persona только у автора) — **НЕ ОРИ**. Но если добавишь «поделиться моим персонажем» → попадаешь в категорию.

**Документировать в playbook явно:**
```
❌ НЕ включать без юр. консультации:
- Публичный каталог user-created персонажей
- Шаринг персонажей между юзерами
- Любая UGC-публикация
```

---

## 🔴 SUMMARY РИСКОВ ПО УБЫВАНИЮ

1. **CSAM от LLM** (УК 242.1/242.2) — до 15 лет → раздел 44.4
2. **Порнография в LLM** (УК 242) — до 6 лет → раздел 44.5
3. **Локализация ПД** (152-ФЗ 18.5 + КоАП 13.11) — до 18 млн ₽ + блокировка → раздел 44.1
4. **Трансграничная без РКН** (152-ФЗ 12) — до 6 млн ₽ → раздел 44.3
5. **Реклама без erid** (38-ФЗ) — до 500 тыс/каждое → раздел 44.11
6. **AI-генерация с известными лицами** (152.1 ГК) → раздел 44.6
7. **Партнёры при НПД** (422-ФЗ) — снятие с режима + НДФЛ за весь год → раздел 44.7

**Минимум для запуска без уголовки:** разделы 44.4, 44.5, 44.6 — это **технические защиты в коде**, не «бумаги».

**Минимум для запуска без админ-штрафов:** разделы 44.1, 44.2, 44.3, 44.11 — это **архитектурные изменения** (self-host Sentry, подача уведомлений РКН, ОРД).

---

## 🎓 ПОСЛЕ всего этого

После того как всё развёрнуто:

1. **Запусти на 10 друзьях** — попроси протестировать
2. **Следи за логами 24 часа** — `tail -f` в screen-сессии
3. **Проверяй chargeback-rate ЮК ежедневно** (должно быть <2%)
4. **Спрашивай юзеров что не работает** — багрепорты через бот-команду
5. **Не пиши новые feature** пока эти 4 пункта не проверены неделю

И **ОБНОВЛЯЙ ЭТОТ ДОКУМЕНТ** каждый раз когда находишь новую грабли — это инвестиция в скорость следующих проектов.

---

**Этот документ — живой. Дополняй каждый раз когда натолкнёшься на новые грабли.** Особенно секция 14 — туда новые «#NN» добавляются по факту.

Удачи на следующем проекте! 🚀
