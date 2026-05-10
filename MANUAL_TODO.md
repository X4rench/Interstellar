# Что нужно сделать руками перед релизом

Этот файл — **обязательный чек-лист для тебя**, заданий, которые я не могу сделать без доступа к твоим аккаунтам, бэкенду, юристам и тестовым устройствам.

Время указано примерно — для опытного человека. Если что-то впервые — может занять больше.

---

## 🔴 БЛОКЕРЫ — без этого приложение не пройдёт ревью

### 1. Bundle ID / Package name
**Время:** 15 минут.

Сейчас в [`app.json`](app.json) стоят placeholder'ы:
```json
"ios.bundleIdentifier": "com.yourcompany.interstellar",
"android.package": "com.yourcompany.interstellar"
```

Что сделать:
- Выбрать домен (например, `com.berez.interstellar` если у тебя нет компании, или `com.yourrealdomain.interstellar`)
- Обновить **оба значения** в `app.json` идентично
- Зарегистрировать тот же ID в App Store Connect / Google Play Console / RuStore Console

⚠️ После первой публикации **сменить нельзя** — выбирай продуманно.

### 2. EAS Project ID
**Время:** 10 минут.

В [`app.json`](app.json):
```json
"extra.eas.projectId": "ВСТАВЬ_СВОЙ_EAS_PROJECT_ID"
```

Что сделать:
1. Зарегистрироваться на https://expo.dev
2. `npx eas init` в корне проекта — создаст проект и автоматически вставит ID
3. Без этого `npx eas build` работать не будет

### 3. `.env` для production
**Время:** 5 минут.

Сейчас есть только `.env.example`. Создай `.env` в корне:
```bash
EXPO_PUBLIC_API_URL=https://api.твоё-доменное-имя.ru/api/v1
EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

⚠️ `.env` уже в `.gitignore` (если нет — добавь). Никогда не коммить продовые DSN/URL.

### 4. Bundle подписи (iOS / Android)
**Время:** 30-60 минут на платформу, при первом разе — больше.

**iOS:**
- Apple Developer Program аккаунт (99$/год)
- Provisioning profile + certificates (через `eas credentials`)
- App Store Connect — создать app, заполнить описание, скриншоты, privacy

**Android:**
- Google Play Console аккаунт (25$ единоразово)
- Keystore: `eas credentials` сгенерирует или использует существующий
- Play Console — описание, скриншоты, classification, privacy

**RuStore:**
- Регистрация юр. лица или ИП
- Подписать APK через keystore (тот же что для Play или отдельный)
- Загрузить через [console.rustore.ru](https://console.rustore.ru)

### 5. IAP — реальная платёжка
**Время:** 2-4 дня.

Сейчас [`AppContext.purchase()`](src/context/AppContext.tsx) — заглушка. Без неё **выручка = 0 ₽**, любой включит Pro локально.

Что сделать:
1. Установить `react-native-iap` (для Apple/Google) или RuStore Billing SDK
2. Создать продукт `interstellar_pro_month` в каждой консоли:
   - **App Store Connect:** Subscriptions → Create → Auto-renewable, цена 799 ₽, 3-day free trial для new subscribers
   - **Google Play Console:** Monetization → Subscriptions → Create, аналогично
   - **RuStore Console:** аналогично
3. В коде заменить body `purchase()` на:
   ```ts
   const productId = 'interstellar_pro_month';
   const result = await RNIap.requestSubscription({ sku: productId });
   const verified = await apiFetch('/subscription/verify', {
     method: 'POST',
     body: { device_id, receipt: result.transactionReceipt, platform: Platform.OS },
     requireSession: true,
   });
   // setSubscription из ответа сервера, не локально
   ```
4. Поднять `/subscription/verify` на бэке (см. SECURITY.md → B1)
5. Поднять `/subscription/status` для проверки при каждом запуске

**Тестирование:** sandbox-аккаунты Apple, тестовые продукты в Play, тестовая среда RuStore. Не релизься без полного прогона.

### 6. Backend задачи (B1, B2, B3 в SECURITY.md)
**Время:** 3-5 дней суммарно (бэкенд-разработчик).

- **B1.** `/subscription/verify` + `/subscription/status` + durable-таблица `feature_trials` для триалов
- **B2.** Server-side валидация `typazh` и `message` (max 2500 chars + injection-маркеры)
- **B3.** `/users/identify` должен возвращать `session_token` (256-bit CSPRNG) — может уже работает если бэкенд из предыдущего аудита (см. твой большой список фиксов)

Без бэкенда:
- B2 — обходится через Postman за минуту
- B3 — `DELETE /users/me` будет падать с 401 → данные сотрутся локально, но не на сервере

### 7. Юридические документы — проверка юристом
**Время:** 1-2 недели (юрист), 1 неделя в среднем.

В [`legalContent.ts`](src/utils/legalContent.ts) уже есть шаблонные тексты на 282 строки, соответствующие 152-ФЗ. **Но в комментарии явно:**
> «тексты — техническая основа. Перед публикацией в RuStore требуется проверка юристом»

Что юристу проверить и обновить:
- Реальные реквизиты юр. лица / ИП / самозанятого
- Реальный хост обработки данных (где живёт твой бэкенд, с чьим оператором ПД договор)
- Контактные данные оператора ПД (email, адрес для письменных запросов)
- Условия NSFW-контента (особенно если RuStore — у них требования жёстче)
- Ссылки на оферту и описание подписки (App Store / Google Play / RuStore требования)

Без юриста есть риск:
- Отказ в RuStore (152-ФЗ строго)
- Жалоба в РКН → штраф
- Возврат денег по подписке через ЗоЗПП

---

## 🟠 СИЛЬНО ЖЕЛАТЕЛЬНО — иначе будут проблемы после релиза

### 8. Sentry DSN
**Время:** 30 минут.

1. Создать аккаунт на https://sentry.io (free до 5K events/мес)
2. New Project → React Native → скопировать DSN
3. Положить в `.env`: `EXPO_PUBLIC_SENTRY_DSN=https://...`
4. (опционально, рекомендую) Подключить sourcemap upload через `sentry-expo`:
   ```bash
   npm install -D sentry-expo
   # И настроить в eas.json
   ```

Без Sentry — на проде ты **не узнаешь о крэшах**. Юзер просто удалит приложение и поставит 1 звезду.

### 9. Push-notifications
**Время:** 1-2 дня.

Сейчас toggle в профиле помечен как «Появятся в следующей версии». Если хочешь push-нотификации к релизу:
1. `npx expo install expo-notifications expo-device`
2. iOS: APNs cert через `eas credentials`
3. Android: FCM Server Key (Google Cloud Console)
4. Бэкенд должен принимать push-token и хранить per-user
5. Бэкенд endpoint для отправки нотификаций
6. На клиенте — registration flow + handler для разных типов

Если не успеваешь к релизу — оставь disabled, как сейчас. Это нормально для v1.0.0.

### 10. Иконка приложения и splash-screen
**Время:** 2-4 часа (если делаешь сам) / 1-2 дня (через дизайнера).

Сейчас в [`app.json`](app.json):
```json
"icon": "./assets/icon.png",
"splash.image": "./assets/splash.png",
"android.adaptiveIcon.foregroundImage": "./assets/adaptive-icon.png"
```

Проверь что в `assets/` лежат **правильные** PNG, а не дефолтные expo-шаблоны:
- `icon.png` — 1024×1024, без альфа-канала для iOS
- `splash.png` — 1242×2688 минимум, с центрированным логотипом
- `adaptive-icon.png` — 1024×1024, foreground без safe-zone (Android обрежет)
- `favicon.png` — 48×48 для web

Тестируй на реальных устройствах — Android adaptive icon часто странно обрезается.

### 11. Sentry sourcemaps
**Время:** 2 часа.

Без sourcemap'ов в Sentry стектрейсы будут вида `index.android.bundle:1:84273` — нечитаемо. Нужно настроить автоматическую загрузку:

1. `npm install -D sentry-expo`
2. В `eas.json`:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "SENTRY_AUTH_TOKEN": "..."
         }
       }
     }
   }
   ```
3. См. https://docs.sentry.io/platforms/react-native/manual-setup/expo/

---

## 🟡 ПОЛИРОВКА — можно делать после релиза

### 12. Тесты
**Время:** 2-3 дня для базового coverage.

Сейчас 0 тестов. Минимум:
1. `npm install -D jest jest-expo @testing-library/react-native`
2. `jest.config.js`:
   ```js
   module.exports = { preset: 'jest-expo' };
   ```
3. Написать unit-тесты для:
   - `vaultEncrypt`/`vaultDecrypt` round-trip и tamper-detect
   - `sanitizeUserPrompt` на injection-паттернах
   - `purchase` / `startTrial` flow с моками
   - `clearAllChats` / `deleteAccountFully` — что всё реально стирается

### 13. CI/CD
**Время:** 4 часа.

GitHub Actions workflow:
- На PR — `npm run typecheck && npm run lint && npm test`
- На merge в `main` — EAS Build для preview
- На tag `v*` — EAS Build production + submit

См. https://docs.expo.dev/build/automating-submissions/

### 14. Streaming ответов в чате
**Время:** 2 дня (клиент + бэкенд).

Сейчас юзер ждёт полный ответ AI. Server-Sent Events или WebSocket дадут «печатающийся» ответ — UX как у ChatGPT. Бэкенд должен отдавать stream через `/simulator/message?stream=true`.

### 15. Deep links
**Время:** 1 день.

Чтобы можно было поделиться ссылкой на персонажа:
- iOS: Universal Links через `apple-app-site-association`
- Android: App Links через `assetlinks.json`
- Expo: настроить `expo-linking`

### 16. Onboarding
**Время:** 1 день дизайн + 1 день код.

Tutorial-экран при первом запуске: «Выбери персонажа → задай вопрос → получи ответ». Резко повышает retention новичков.

### 17. OAuth Social Auth
**Время:** 2-3 дня.

Я скрыл кнопки GitHub/Google/VK ID из SplashScreen. Если хочешь добавить:
1. Зарегистрировать приложение у каждого провайдера (получить client_id)
2. `expo-auth-session` для PKCE-flow
3. Бэкенд должен принимать OAuth-token, валидировать, выдавать session_token

### 18. Локализация (i18n)
**Время:** 3-5 дней.

Сейчас только русский, всё захардкожено в JSX. Если планируешь выход за пределы РФ:
- `i18next` + `expo-localization`
- Вынос всех строк в JSON-словари
- Минимум: ru, en

### 19. Светлая тема
**Время:** 1-2 дня.

Сейчас `userInterfaceStyle: "dark"` зашит. Multi-theme через context + переменные `theme.bg` и т.д.

### 20. Accessibility
**Время:** 1-2 дня.

Добавить `accessibilityLabel`, `accessibilityHint`, `testID` на все интерактивные элементы. Иначе VoiceOver/TalkBack пользователи не смогут пользоваться приложением.

---

## ✅ Что я УЖЕ сделал (можно не трогать)

См. [`SECURITY.md`](SECURITY.md) для полного списка. Кратко:

- Paywall с триалом и тарифом
- Шифрование чатов AES-256
- SecureStore для подписки и device_id
- Биометрический app lock
- Screen capture protection в чатах
- Удаление аккаунта (152-ФЗ compliant)
- Очистка истории чатов
- Session-token authentication с auto-recovery
- Prompt-injection guard на user-input
- HTTPS-assert в production
- Android security flags (allowBackup, cleartextTraffic)
- Mock AI отключён в production
- Error boundary на root
- Sentry init готов (нужен только DSN)
- Offline banner (NetInfo)
- Honest paywall checklist (убрал нереализованные обещания)
- Permissions descriptions в app.json
- ESLint + Prettier конфиги
- Удалены заглушки «Скоро» из UI

---

## Минимальный набор перед первым релизом

Если ты хочешь самый быстрый путь к публикации (`v0.1.0` beta):

1. ✅ Bundle ID + EAS Project ID + Apple/Google аккаунты *(пункты 1-2, 4)* — **2-3 часа**
2. ✅ Бэкенд URL в `.env` *(пункт 3)* — **5 минут**
3. ✅ Sentry DSN *(пункт 8)* — **30 минут**
4. ✅ IAP интеграция *(пункт 5)* + бэкенд `/subscription/verify` — **2-4 дня**
5. ✅ Юр. документы проверены *(пункт 7)* — **1-2 недели параллельно**
6. ✅ Backend `session_token` issue *(B3 в SECURITY.md)* — **0-1 день**
7. ✅ Иконки и splash *(пункт 10)* — **2-4 часа**

**Итого: 1-2 недели работы (с параллельным юристом).** Остальное можно докатывать постепенно после релиза.

---

## Вопросы — ко мне

Если по какому-то пункту нужны детали, фрагменты кода, или интеграция новой библиотеки — спрашивай. Большую часть из «🟡 Полировки» я могу сделать сам, если решишь что нужно.
