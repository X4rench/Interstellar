# Interstellar — Telegram Mini App

Веб-приложение, открывается внутри Telegram через бота. Заменяет архивный RN-проект `../CharacterChatRN/` (RN остаётся как legacy, не развивается).

Стек: **Vite + React 18 + TypeScript + `@telegram-apps/sdk-react@3.x`**.

## Quick start (DEV)

```bash
cd mini-app
npm install
cp .env.example .env       # отредактируй, если нужно
npm run dev
```

Откроется `https://localhost:5173` с self-signed сертификатом (через `vite-plugin-mkcert`). В обычном браузере это работает — SDK подсунет mock initData (см. `src/mock-env.ts`).

Чтобы протестировать в реальном Telegram-клиенте:

1. Запусти бэкенд (`cd ../backend && npm run dev`)
2. Подними туннель снаружи на `localhost:5173`:
   ```bash
   cloudflared tunnel --url https://localhost:5173
   # либо: ngrok http https://localhost:5173
   ```
3. Скопируй HTTPS-URL туннеля
4. В `@BotFather`:
   - `/newbot` → создай бота, получи токен
   - `/newapp` → выбери бота → задай URL туннеля как Web App URL
5. Открой `https://t.me/<bot_username>/<app_short_name>` в любом TG-клиенте

## Что нужно от тебя сейчас

Чек-лист, чтобы Phase 1 закрылась полностью:

- [ ] **Зарегистрировать бота** в `@BotFather`:
  - `/newbot` → выбери имя (например `Interstellar`) и username (например `InterstellarChatBot`)
  - Получи `BOT_TOKEN` (формат `123456:AABBCC-...`)
  - Положи в `../backend/.env` строкой `BOT_TOKEN=...` (Phase 2 будет его читать)
- [ ] **Туннель + Mini App URL**:
  - Установи `cloudflared` ([Win-installer](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)) или `ngrok`
  - Запусти туннель к `localhost:5173`
  - В BotFather: `/myapps` → твой бот → подключи URL туннеля как Mini App
- [ ] (Опционально) **Sentry DSN** для error-tracking — создай проект в Sentry, положи DSN в `mini-app/.env`

После этого Phase 1 закрыта, можно стартовать Phase 2 (бэк-обвязка).

## Структура

```
mini-app/
├── index.html               ← подключает telegram-web-app.js + entry
├── package.json
├── vite.config.ts           ← плагины (react, mkcert) + chunk split
├── tsconfig.json
├── .env.example
├── ASSUMPTIONS.md           ← дефолты, выбранные при отсутствии ответа автора
├── README.md                ← этот файл
├── public/                  ← статика (favicon, манифесты)
└── src/
    ├── main.tsx             ← entry: init Sentry + SDK + render React
    ├── init.ts              ← полная инициализация TG SDK
    ├── mock-env.ts          ← DEV-only фейковый TG environment
    ├── sentry.ts            ← Sentry config + ErrorBoundary export
    ├── env.d.ts             ← типы для VITE_*  переменных
    ├── App.tsx              ← Router + ErrorBoundary
    ├── styles/globals.css   ← TG theme vars + safe-area
    ├── pages/HomePage.tsx   ← placeholder Phase 1
    ├── components/          ← (Phase 3)
    ├── context/             ← (Phase 3) AppContext, аналог RN
    ├── data/                ← (Phase 3) копия characters.ts из RN
    ├── icons/               ← (Phase 3) SVG-иконки персонажей
    └── utils/               ← (Phase 3) персона/moods/api/storage
```

## Конвенции

- **TG-тема** прокидывается через `themeParams.bindCssVars()` в `init.ts`. В CSS использовать переменные `--tg-theme-*`.
- **Safe-area** — переменные `--safe-top/right/bottom/left` (см. `globals.css`). Используются для BottomNav и sticky-headers.
- **iOS quirks**:
  - Не использовать `100vh` — берём `100dvh` или `viewport.height` из SDK
  - `position: fixed` снизу — обязательно с `padding-bottom: var(--safe-bottom)`
  - `overscroll-behavior: none` уже выставлен глобально
- **Eruda** — только в DEV. На iOS WebView нет devtools, eruda даёт минимальную замену.

## Команды

```bash
npm run dev          # dev-сервер с HTTPS на :5173
npm run build        # tsc --noEmit + vite build → dist/
npm run preview      # локальный просмотр build'а
npm run typecheck    # tsc --noEmit
npm run analyze      # vite-bundle-visualizer → stats.html
```

## Дальше по фазам

- **Phase 2** — расширить `../backend/`: `auth` middleware (HMAC initData), `/users/me`, SQLite миграции (`users`, `subscriptions`, `attributions`)
- **Phase 3** — портировать UI экраны из `../CharacterChatRN/src/screens/` (HTML+CSS+SDK)
- **Phase 4** — Telegram Stars: `createInvoiceLink` + webhook `successful_payment`
- **Phase 5** — Polish: тема, MainButton/BackButton, haptics, bundle ≤ 1 MB
- **Phase 6** — Deploy: Cloudflare Pages + Render
