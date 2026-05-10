# Interstellar Backend

Минимальный stateless-прокси к [polza.ai](https://polza.ai) для приложения Interstellar.
Без авторизации, без БД, без сессий — клиент шлёт всю историю чата каждый запрос,
бэк подмешивает system prompt персонажа и вызывает grok-4.1-fast.

## Быстрый старт

```bash
cd backend
cp .env .env
# открой .env, вставь POLZA_API_KEY
npm install
npm run dev
```

Бэк поднимается на `http://localhost:3001`.

В корне приложения создай `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Перезапусти Expo (`npm start`).

## Контракт

### `POST /api/v1/chat`

Запрос:
```json
{
  "persona": "Зигмунд Фрейд, психолог...",
  "messages": [
    { "role": "user", "content": "Привет" },
    { "role": "character", "content": "Здравствуйте..." },
    { "role": "user", "content": "Расскажите про Эго" }
  ]
}
```

`role` принимает `user` или `character` (последний маппится на `assistant`
для OpenAI-совместимого API polza.ai).

Ответ (200):
```json
{ "ok": true, "response": "Эго — это часть психики..." }
```

Ошибки:
- `400 BAD_PERSONA` / `BAD_MESSAGES` / `PERSONA_TOO_LONG` / `HISTORY_TOO_LONG`
- `502 UPSTREAM_ERROR` — polza.ai вернул не-200
- `502 EMPTY_RESPONSE` — polza.ai вернул пустой ответ
- `504 TIMEOUT` — превышен таймаут (60 сек)
- `500 INTERNAL_ERROR` — всё остальное

### `GET /health`

```json
{ "ok": true, "model": "grok-4.1-fast" }
```

## Деплой

На любой Node 18+ хост: Render, Fly.io, Railway, обычный VPS.
Ключевое — `POLZA_API_KEY` в env, **не в коде**.

Для production:
- Поставь nginx/Caddy перед Express для HTTPS
- Добавь rate-limiting (`express-rate-limit`) если бэк публичный
- Логи в нормальное хранилище, не в stdout

## Лимиты

- `persona` ≤ 8000 симв.
- одно сообщение ≤ 4000 симв.
- история ≤ 60 сообщений
- таймаут запроса в polza.ai — 60 сек
