# Defaults применённые при миграции

Бриф просил подтвердить набор решений до Phase 1. На момент старта от автора был ответ «токена пока нет, коммитить не надо, поехали по defaults». Зафиксировано ниже — перед production-релизом проверить и при необходимости поправить.

## Бизнес-решения

| Решение | Значение | Где менять |
|---|---|---|
| Имя бота в @BotFather | (пока не зарегистрирован) | После регистрации — `backend/.env` (`BOT_TOKEN`, `BOT_USERNAME`) |
| Цена подписки | 199 Stars/мес | `backend/.env` → `STAR_PRICE_MONTH` (Phase 4) |
| Хостинг бэка | Render (free tier) | `backend/render.yaml` (Phase 6) |
| Хостинг Mini App | Cloudflare Pages | `mini-app/wrangler.toml` (Phase 6) |
| Триал | Убран на старте | Если возвращать — `AppContext.startTrial` (Phase 3) |
| NSFW-доступ | Только Premium | `canOpenCharacter()` (Phase 3) |
| Формат `start_param` | `^[\w-]{1,64}$` | Бриф предлагал до 512, я взял 64 — конс. лимит TG `startapp` |
| БД на бэке | SQLite (`better-sqlite3`) | `backend/src/db.js` (Phase 2). Render держит постоянный диск — подходит. |

## Технические решения

| Решение | Значение | Почему |
|---|---|---|
| SDK | `@telegram-apps/sdk-react@^3.3.9` | бриф просит v3 канон. v2 deprecated. |
| React | `18.3.1` | соответствует RN-проекту, упрощает code-share |
| Router | `react-router-dom@^6.27` | стабильный v6 (брифом не оговорено что v7) |
| Sentry | `@sentry/react@^8.x` | бриф |
| HTTPS в DEV | `vite-plugin-mkcert` | TG требует HTTPS даже на localhost |
| Чанк-разделение | `react`, `telegram`, `sentry` отдельно | iOS WebView медленно парсит большие бандлы |
| Eruda | DEV-only | console-debug в TG WebView; в prod не подключаем |
| UI-кит `@telegram-apps/telegram-ui` | НЕ ставится по умолчанию | Бриф: "опционально, для системных списков в Profile". Дизайн RN — конкурентное преимущество, переносим как есть. Если нужен — добавь в `package.json` и используй для Profile-секций. |

## Открытые на момент Phase 1

- [ ] Реальный bot username — нужен для прод-ссылок и BotFather
- [ ] `BOT_TOKEN` — кладём в `backend/.env`, не коммитим
- [ ] Production API URL — пока локалхост
- [ ] Sentry DSN — пока пусто, ошибки не уходят в облако
- [ ] Telegram Webhook `secret_token` — генерим в Phase 4
