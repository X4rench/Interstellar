# Подготовка к билду — пошаговая инструкция

Всё что нужно заполнить перед тем как собирать приложение.
После всех шагов проект будет полностью готов к релизу.

---

## Шаг 1 — Запустить бэкенд (прокси к polza.ai)

Бэк лежит в папке `backend/` — это stateless-прокси к polza.ai, модель grok-4.1-fast.

```bash
cd backend
cp .env .env
# Открой backend/.env и вставь POLZA_API_KEY (https://polza.ai → API keys)
npm install
npm run dev
```

Бэк поднимается на `http://localhost:3001`. Проверка:
```bash
curl http://localhost:3001/health
# {"ok":true,"model":"grok-4.1-fast"}
```

Подробнее — в [backend/README.md](backend/README.md).

---

## Шаг 2 — URL бэка для клиента

**Файл:** создать `.env` в корне проекта (рядом с `package.json`)

```
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Если запускаешь приложение на физическом телефоне** через Expo Go —
телефону `localhost` не виден. Подставь IP своей машины в локальной сети,
например `http://192.168.1.5:3001/api/v1`. На той же машине должен быть открыт
порт 3001 в файрволе.

Production — деплой бэка на VPS / Render / Fly.io за HTTPS, и
`EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`.

**Важно:** файл `.env` не коммитится в git (уже добавлен в `.gitignore`).
Файл `.env.example` — шаблон, его можно коммитить.

---

## Шаг 3 — Bundle Identifier и Package Name

**Файл:** `app.json`

```json
"ios": {
  "bundleIdentifier": "com.yourcompany.interstellar"
},
"android": {
  "package": "com.yourcompany.interstellar"
}
```

**Что это:** уникальный идентификатор приложения в App Store и Google Play.
Один раз выбрал — не меняй, иначе это будет считаться другим приложением.

**Как придумать:** формат `com.названиекомпании.названиеприложения`
- Только латиница, цифры, точки. Без пробелов и спецсимволов.
- Примеры: `com.ivan.interstellar`, `ru.myapp.chat`, `io.github.username.interstellar`
- Для iOS и Android можно использовать одинаковое значение.

**Где регистрировать:**
- iOS — автоматически создаётся при первом `eas build` в Apple Developer аккаунте
- Android — вводишь при создании приложения в Google Play Console

---

## Шаг 4 — EAS Project ID (для сборки через облако Expo)

**Файл:** `app.json` → поле `extra.eas.projectId`

**Что это:** идентификатор проекта на серверах Expo. Нужен чтобы `eas build` знал
куда загружать сборку и откуда брать сертификаты.

**Как получить:**

```bash
# 1. Установи EAS CLI (один раз)
npm install -g eas-cli

# 2. Войди в аккаунт Expo (зарегистрируйся на expo.dev если нет аккаунта)
eas login

# 3. Запусти в папке проекта — создаст проект и автоматически вставит projectId в app.json
eas project:init
```

После `eas project:init` в `app.json` появится что-то вроде:
```json
"projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

## Шаг 5 — Иконки и сплэш-скрин

**Папка:** `assets/` (уже создана, там есть README.txt с описанием)

Нужно положить 4 файла:

| Файл | Размер | Описание |
|------|--------|----------|
| `icon.png` | 1024×1024 px | Иконка приложения. PNG, без прозрачности, чёрный фон. |
| `splash.png` | 1284×2778 px | Заставка при запуске. Логотип по центру на чёрном фоне. |
| `adaptive-icon.png` | 1024×1024 px | Иконка для Android (может иметь прозрачность). |
| `favicon.png` | 48×48 px | Иконка для веб-версии. Можно пропустить если веб не нужен. |

**Как сделать быстро:**
1. Возьми свой логотип (`src/icons/logo.png`)
2. Открой в любом редакторе (Figma, Photoshop, онлайн: photopea.com)
3. Создай холст 1024×1024, чёрный фон, логотип по центру — сохрани как `icon.png`
4. Создай холст 1284×2778, чёрный фон, логотип по центру — сохрани как `splash.png`
5. `adaptive-icon.png` — то же что `icon.png`
6. `favicon.png` — уменьшенная версия логотипа 48×48

**Важно:** если файлов нет — `expo start` работает, но `eas build` упадёт с ошибкой.

---

## Шаг 6 — Запуск и сборка

### Локальная разработка
```bash
npx expo start
```
Открой на телефоне через Expo Go (приложение в App Store / Google Play).

### Собрать APK для Android (для тестов, без публикации)
```bash
eas build --platform android --profile preview
```
Получишь ссылку на скачивание APK. Установи на телефон напрямую.

### Production сборка для публикации
```bash
# Android (AAB для Google Play)
eas build --platform android --profile production

# iOS (IPA для App Store)
eas build --platform ios --profile production
```

### Опубликовать в магазин
```bash
eas submit --platform android
eas submit --platform ios
```

---

## Чеклист перед билдом

- [ ] В `backend/.env` указан `POLZA_API_KEY`, бэк поднимается без ошибок
- [ ] Создан файл `.env` в корне с правильным `EXPO_PUBLIC_API_URL`
- [ ] В `app.json` заменены `bundleIdentifier` и `package`
- [ ] В `app.json` вставлен `projectId` (после `eas project:init`)
- [ ] В папке `assets/` лежат `icon.png`, `splash.png`, `adaptive-icon.png`
- [ ] Бэкенд задеплоен на HTTPS-хосте, URL прописан в `.env`
- [ ] Выполнен `eas login`

---

## Что уже работает без изменений

- Локальный профиль (имя, аватар, настройки) — без авторизации, без регистрации
- Чат с AI-персонажами через бэкенд → polza.ai (grok-4.1-fast)
- Stateless-протокол: история чата живёт в приложении, бэк не хранит ничего
- В DEV — фолбэк на mock-ответы если бэк не отвечает
- Создание и удаление своих персонажей
- Избранное, статистика, стрик-дни
- Профиль, экран PRO (кнопка покупки — заглушка, нужно подключить платёжку)
- Тёмная тема, поддержка iOS / Android / Web
