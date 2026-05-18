# Setup на новом компьютере

> Как перенести проект на другой ПК и продолжать работу (включая беседы с Claude).
> Если потерял доступ к старому ПК — этого документа достаточно чтобы восстановить всё.

---

## 0. TL;DR — что нужно с собой

Весь **код** — в GitHub-репо `github.com/X4rench/Interstellar`. Это автоматически синхронизируется.

Что НЕ в git и нужно перенести **отдельно**:

| Что | Где хранится сейчас | Как перенести |
|-----|---------------------|---------------|
| **.env файлы** (секреты) | Только на твоём ПК + на сервере AEZA | Скопировать вручную (см. §3) |
| **Доступ к GitHub** | Логин + пароль / SSH-ключ | Залогиниться |
| **Доступ к AEZA VPS** | VNC-консоль через панель AEZA | Сохрани логин/пароль панели |
| **Доступ к Cloudflare** | Логин + 2FA | Сохрани backup-коды 2FA |
| **Доступ к ЮКассе** | Логин + 2FA | Backup-коды |
| **Доступ к polza.ai** | Логин/пароль | — |
| **BotFather** | Твой Telegram аккаунт | Twoй TG номер |
| **Sweden-прокси credentials** | В .env на сервере | Скопировать (§3) |

**База данных SQLite** живёт на сервере AEZA — на твоём ПК её нет. Не нужно переносить.

---

## 1. На новом компьютере — установить инструменты

### Windows (как у тебя сейчас)

1. **Git for Windows**: https://git-scm.com/download/win
2. **Node.js 20 LTS**: https://nodejs.org/en (LTS-вариант)
3. **Claude Code CLI** (для продолжения разработки с AI):
   - Подробно: https://docs.claude.com/en/docs/agents-and-tools/claude-code/overview
   - Через `npm install -g @anthropic-ai/claude-code`
4. **VS Code или Cursor** (опционально, но удобно)
5. **Telegram Desktop** — для тестирования бота

Проверка:
```
git --version       # должно быть 2.40+
node --version      # v20.x.x
npm --version       # 10.x+
```

### macOS

```bash
# Через Homebrew
brew install git node@20
# Или скачай Node с nodejs.org
```

### Linux

```bash
# Node через nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
```

---

## 2. Клонировать репо

```bash
cd ~/Desktop  # или куда хочешь
git clone https://github.com/X4rench/Interstellar.git
cd Interstellar
```

Если репо приватный — нужен GitHub-токен или SSH-ключ. Можно через https с Personal Access Token.

После clone у тебя локально появится:
```
Interstellar/
├── backend/              # Node.js API
├── mini-app/             # Vite/React frontend
├── DEPLOYMENT_PLAYBOOK.md  # Полное руководство (4054 строки)
├── SETUP_NEW_MACHINE.md   # ← этот файл
└── README.md
```

---

## 3. Восстановить `.env` файлы

`.env` файлы содержат секреты и **намеренно НЕ в git** (в `.gitignore`). Их нужно создать вручную.

### 3.1 backend/.env

Создай файл `backend/.env`:

```ini
# LLM
POLZA_API_KEY=pza_твой_текущий_ключ
POLZA_API_URL=https://api.polza.ai/api/v1/chat/completions
POLZA_MODEL=qwen/qwen3-235b-a22b-2507

# Сервер
PORT=3001
NODE_ENV=development
TRUST_PROXY_HOPS=0
DB_PATH=./data/interstellar.sqlite

# Telegram
BOT_TOKEN=8887383121:AAH...  # узнать в BotFather: /token
BOT_USERNAME=InterstellarAiBot
BOT_APP_NAME=app
TELEGRAM_WEBHOOK_SECRET=случайная_строка_только_для_продa
TG_API_PROXY=http://interstellar:JXq2kAXVREqoiQLgh28v@176.124.207.161:3128

# DEV bypass (для локального тестирования без HMAC)
DEV_BYPASS_INITDATA=1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173

# RBAC (твой telegram_user_id)
ADMIN_TELEGRAM_IDS=794285476,1920476158

# ЮКасса (тестовый магазин)
YK_SHOP_ID=1361386
YK_SECRET_KEY=test_твой_ключ

# Шифрование PII партнёров
PAYOUT_ENCRYPTION_KEY=случайные_32_байта_base64
```

### 3.2 mini-app/.env

Создай файл `mini-app/.env`:

```ini
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SENTRY_DSN=  # оставь пустым для разработки
```

### 3.3 Где взять текущие значения секретов

Если ты потерял `.env` со старого ПК — восстановить можно так:

| Секрет | Где взять |
|--------|-----------|
| `POLZA_API_KEY` | polza.ai → ЛК → API → создать новый ключ (старый отозвать) |
| `BOT_TOKEN` | Telegram → `@BotFather` → `/mybots` → выбрать бота → API Token |
| `TELEGRAM_WEBHOOK_SECRET` | На VNC сервера AEZA: `grep WEBHOOK_SECRET /home/interstellar/interstellar/backend/.env` |
| `TG_API_PROXY` | Тот же путь — на сервере в `.env` |
| `YK_SHOP_ID` / `YK_SECRET_KEY` | yookassa.ru → Интеграция → Ключи API |
| `PAYOUT_ENCRYPTION_KEY` | На сервере в `.env`. **Если потерял — PII партнёров расшифровать невозможно!** |

**⚠️ Важно**: после переноса лучше **ротировать все ключи** — особенно если старый ПК остался у кого-то.

---

## 4. Запуск проекта локально

### 4.1 Backend (терминал 1)

```bash
cd backend
npm install
mkdir -p data
node server.js
```

Должен увидеть:
```
[backend] listening on http://localhost:3001
[backend] model:    qwen/qwen3-235b-a22b-2507
[yk] enabled, mode=TEST, shop=1361386
```

### 4.2 Frontend (терминал 2)

```bash
cd mini-app
npm install
npm run dev
```

Vite запустит dev-сервер на `http://localhost:5173`.

### 4.3 Открыть в браузере

`http://localhost:5173` — увидишь Mini App. Без Telegram-окружения будет показан **лендинг** (см. `main.tsx` — fallback при отсутствии init data).

Чтобы тестировать с реальным Telegram-контекстом:
- В `backend/.env` `DEV_BYPASS_INITDATA=1` — пропускает HMAC-валидацию
- Открывай через Eruda (DEV-debug автоматически подключается)

### 4.4 Тестирование с реальным Telegram

Деплой через CF Pages работает автоматически — любой `git push` в `master` пересобирает фронт через 2-3 минуты. Так что для теста с реальным TG:
1. Внеси изменения
2. `git push`
3. Подожди CF Pages билд
4. Открой бота в Telegram

---

## 5. Деплой backend на сервер

Так же как делали раньше — через VNC AEZA Moscow:

```bash
ssh / VNC: root@unfortunate-amar
cd /home/interstellar/interstellar
git pull origin master
systemctl restart interstellar
```

Если VNC paste багует — используй короткие команды по одной (см. `DEPLOYMENT_PLAYBOOK.md` §4.3).

---

## 6. Продолжить разговор с Claude на новом ПК

### 6.1 Claude Code CLI

После установки:
```bash
cd ~/Desktop/Interstellar
claude
```

Claude Code запустится в режиме чата прямо в терминале. У него есть доступ к файлам, может редактировать код, запускать команды.

### 6.2 Накормить Claude контекстом

**Проблема:** Claude НЕ помнит предыдущие сессии. На новом ПК он начнёт «с нуля».

**Решение:** В первом сообщении напиши Claude:

```
Контекст проекта: я работаю над Telegram Mini App «Интерстеллар» — AI-чат
с историческими личностями. Стек: Node.js + Express + better-sqlite3 в
backend, Vite/React в mini-app. Деплой: AEZA Moscow VPS + Sweden-proxy
+ Cloudflare Pages.

Полная документация в DEPLOYMENT_PLAYBOOK.md в корне репо (4054 строки,
44 раздела). Прочитай её прежде чем делать что-либо.

Текущий статус: ЮКасса интегрирована в тестовом режиме, Free-юзеры
получают 10 сообщений/день, автопродление с чекбоксом в Paywall и
toggle в Profile.

Что ещё надо сделать:
1. Push-уведомления за 48ч до автосписания подписки
2. Переход с тестового магазина ЮК на боевой
3. CSAM-фильтры на LLM (см. §44.4 playbook'a)
[добавь сюда любые свои пункты]
```

Claude прочитает playbook (он автоматически использует Read tool) и поймёт всю картину.

### 6.3 Альтернатива: Claude в браузере

Если не хочешь устанавливать CLI — можно использовать [claude.ai](https://claude.ai) через браузер:
1. Создай проект
2. Загрузи туда `DEPLOYMENT_PLAYBOOK.md` как файл-документ
3. Опиши задачу
4. Claude поймёт контекст

Минус — Claude не может выполнять команды и редактировать файлы автоматически. Только подсказки.

### 6.4 Cursor / Continue

Альтернативные IDE с встроенным Claude:
- **Cursor**: https://cursor.com/ — VS Code-форк со встроенным AI
- **Continue**: https://continue.dev/ — плагин для VS Code

---

## 7. Чек-лист переноса (ничего не забыть)

Перед уходом со старого ПК:

- [ ] Все изменения закоммитил: `git status` показывает clean
- [ ] Все коммиты запушил: `git push origin master`
- [ ] Сделал копию `backend/.env` (положи в **зашифрованный** Notes / 1Password / Bitwarden)
- [ ] Сделал копию `mini-app/.env`
- [ ] Записал все credentials в безопасное место:
  - GitHub логин/пароль/2FA-backup
  - AEZA панель логин/пароль
  - Cloudflare логин + 2FA
  - ЮКасса логин + 2FA
  - polza.ai логин/пароль
  - Telegram номер (если не свой — синхронизируй сессию)
- [ ] Сделал бэкап БД сервера (`/backups/app-latest.db` через rclone)

На новом ПК:

- [ ] Установил Node 20 + Git + Claude Code
- [ ] `git clone github.com/X4rench/Interstellar.git`
- [ ] Создал `backend/.env` и `mini-app/.env` из копии
- [ ] `cd backend && npm install`
- [ ] `cd mini-app && npm install`
- [ ] Запустил `node server.js` — backend стартует
- [ ] Запустил `npm run dev` — frontend на localhost:5173
- [ ] Открыл Claude Code в папке проекта
- [ ] Накормил Claude контекстом (см. §6.2)

---

## 8. Безопасное хранение секретов

**НЕ делай:**
- ❌ Не пиши секреты в файл `secrets.txt` в проекте — может случайно закоммитить
- ❌ Не отправляй секреты в Telegram-чаты — там сохраняются
- ❌ Не делай скриншоты ЛК с видимыми ключами (мы уже наступали на эти грабли — пришлось ротировать polza ключ 3 раза)

**Делай:**
- ✅ Используй **password manager** (1Password, Bitwarden, KeePass)
- ✅ Backup-коды 2FA → распечатать и сохранить в надёжное место
- ✅ SSH-ключи → отдельно от пароля
- ✅ После каждого «засветившегося» ключа — **сразу** ротируй (см. playbook §43.19)

---

## 9. Что синхронизируется автоматически

| Что | Куда | Через что |
|-----|------|-----------|
| Код frontend | yourapp.ru на Cloudflare Pages | `git push` → CF Pages автодеплой |
| Код backend | AEZA Moscow VPS | Ручной `git pull` + `systemctl restart` |
| Документация (этот файл, playbook) | GitHub репо | `git push` |
| База данных | На сервере, бэкапы через rclone | Не на твоём ПК |
| Подписки юзеров | В БД на сервере | Не на твоём ПК |

---

## 10. Если что-то пошло не так

| Проблема | Решение |
|----------|---------|
| `git clone` отказывается — `Repository not found` | Проверь логин в GitHub, доступ к репо |
| `npm install` падает | Удали `package-lock.json` + `node_modules`, попробуй заново |
| Backend стартует но `[fatal] POLZA_API_KEY is not set` | `.env` не подхватился — проверь путь, кодировку (должно быть UTF-8 без BOM) |
| Frontend стартует но «нет интернета» при чате | Backend не запущен / неправильный `VITE_API_BASE_URL` в `mini-app/.env` |
| Не помнишь нужный ключ | См. §3.3 — где брать каждый ключ заново |
| Claude Code не запускается | https://docs.claude.com/en/docs/agents-and-tools/claude-code/setup |

---

## 11. Дополнительно — что почитать на новом ПК

Перед началом работы открой и прочитай:

1. **`DEPLOYMENT_PLAYBOOK.md`** — полное руководство (4054 строки, 44 раздела). Особенно:
   - §14 — таблица всех 28 граблей которые мы прошли
   - §28 — troubleshooting типовых проблем
   - §44 — **критичные юридические риски** (CSAM фильтры, локализация ПД)

2. **README.md** в корне репо — общее описание проекта

3. Когда нужна конкретика — ищи Ctrl+F по слову (например «webhook», «полza», «migration»)

---

Удачи на новом ПК! 🚀

Если возникнут вопросы — Claude в новой сессии (с переданным контекстом из §6.2) сможет помочь.
