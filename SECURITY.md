# Security audit & status

Дата первого аудита: **2026-04-26**.
Последнее обновление: **2026-04-26** (третий проход — добавлены D2/D3, App Lock, Screen Capture protection).

Скоп: paywall + связанная логика (custom персонажи, prompt-injection, secure storage, transport security, session-аутентификация, удаление пользовательских данных, шифрование локального хранилища, биометрический доступ).

Все frontend-задачи закрыты. Остались только бэкенд-зависимые блокеры релиза.

---

## ✅ Что сделано

### 1. CSPRNG для `device_id`

**Файлы:** [`src/utils/deviceId.ts`](src/utils/deviceId.ts), [`src/utils/secureStore.ts`](src/utils/secureStore.ts)

- `Math.random()` (XorShift128+ в Hermes) заменён на `Crypto.randomUUID()` из `expo-crypto` — нативный CSPRNG.
- `device_id` теперь хранится в Keychain (iOS) / Keystore (Android) через `expo-secure-store`.
- На web — фолбэк на AsyncStorage.
- Реализована миграция: legacy `device_id` из AsyncStorage автоматически переносится в secure-storage.

**Что закрыто:** угадывание ID через слабый PRNG; коллизии; тривиальное чтение через ADB.

---

### 2. Secure storage для подписки

**Файлы:** [`src/context/AppContext.tsx`](src/context/AppContext.tsx), [`src/utils/secureStore.ts`](src/utils/secureStore.ts)

- `subscription_v1` и `trial_used_v1` в `expo-secure-store`.
- Sanity-check на длительность (≤32 дня) — подделанные записи удаляются и логируются как `tamper_subscription_duration`.
- Миграция legacy AsyncStorage → SecureStore.

**Что закрыто:** тривиальный обход paywall через ADB-edit на нерутованных устройствах.

**Что НЕ закрыто (см. B1):** на rooted устройстве SecureStore читается. Без server-side IAP verification paywall обходим.

---

### 3. Sanitize и лимиты на user-input

**Файл:** [`src/utils/personaTemplate.ts`](src/utils/personaTemplate.ts)

- `FIELD_LIMITS` (name 60 / description 200 / personaRaw 600 / firstMessage 400)
- `sanitizeUserPrompt()` режет control-chars, role-маркеры, chat-template токены, jailbreak-фразы.
- В `buildPersonaTemplate` user-input оборачивается в кавычки с явной пометкой «не инструкция».
- `maxLength` пробитый на все TextInput'ы (CreateScreen, ChatScreen 2000, SplashScreen/ProfileScreen 40 на имя).

---

### 4. Production HTTPS-assert

**Файл:** [`src/utils/config.ts`](src/utils/config.ts)

В release-сборке (`!__DEV__`) бросает ошибку при импорте если `EXPO_PUBLIC_API_URL` не https.

---

### 5. Android security flags

**Файл:** [`app.json`](app.json)

- `android.allowBackup: false` — нет утечки в Google Drive backup
- `android.usesCleartextTraffic: false` — HTTP заблокирован платформой

---

### 6. expo-secure-store config plugin

**Файл:** [`app.json`](app.json) — `plugins: ["expo-asset", "expo-secure-store"]`

---

### 7. Session-token authentication (D1)

**Файлы:** [`src/utils/api.ts`](src/utils/api.ts)

- Единый `apiFetch()` хелпер с `X-Device-Id` + `X-Session-Token`
- Auto-recovery при `401 INVALID_SESSION` → `clearSessionToken()` → `identifyUser()` → ретрай (один раз, с защитой от рекурсии)
- Session-token в SecureStore под `session_token_v1`

---

### 8. Очистка истории чатов (W2)

**Файлы:** [`AppContext.clearAllChats`](src/context/AppContext.tsx), [`ProfileScreen`](src/screens/ProfileScreen.tsx)

Из меню профиля → confirm-модалка → стирает локальный `chats` и invalidate'ит серверные сессии. Подписка и кастомные персонажи остаются.

---

### 9. Удаление аккаунта (W3, 152-ФЗ)

**Файлы:** [`api.deleteAccount`](src/utils/api.ts), [`AppContext.deleteAccountFully`](src/context/AppContext.tsx), [`ProfileScreen`](src/screens/ProfileScreen.tsx)

- `DELETE /users/me` с `X-Session-Token` и `confirm: 'DELETE_MY_ACCOUNT'`
- Полный wipe: SecureStore (4 ключа) + AsyncStorage (10 ключей) + in-memory state + переход на splash
- При offline-бэке — локальная очистка всё равно проходит (приоритет приватности), Alert с информацией

---

### 10. Локальное шифрование чатов AES-256 (D2) — добавлено в третьем проходе

**Файлы:** [`src/utils/cryptoVault.ts`](src/utils/cryptoVault.ts), интеграция в [`AppContext`](src/context/AppContext.tsx)

- **Алгоритм:** AES-256-CBC с HMAC-SHA256 для integrity (encrypt-then-MAC). CBC потому что `crypto-js` не поддерживает GCM — для chat-сообщений с HMAC это эквивалентно по безопасности.
- **Ключ:** 256-bit, генерируется CSPRNG через `expo-crypto.getRandomBytesAsync` при первом запуске, хранится в SecureStore под `vault_key_v1`. Из мастер-ключа через SHA-256 деривируются отдельные encKey и macKey.
- **IV:** 16 байт CSPRNG для каждой записи, конкатенируется с ciphertext.
- **Формат blob:** base64 от `IV (16) || HMAC (32) || ciphertext`. HMAC проверяется ДО decrypt для предотвращения padding oracle.
- **Миграция:** при загрузке detect через `looksEncrypted()` — старый plaintext JSON читается как есть, при следующей записи перезапишется в encrypted-формате.
- **При decrypt fail** — silently null + `logSecurityEvent('vault_decrypt_fail')` + удаляем corrupted blob.
- **Plaintext fallback ОТСУТСТВУЕТ** — лучше не сохранить чат, чем сохранить в plain.

**Что закрыто:** чтение чатов через ADB pull / iTunes backup / простой root explorer. Для расшифровки нужен ключ из Keychain/Keystore.

**Что НЕ закрыто:** malware с правами root, которая прочитает Keystore, или на старых Android где Keystore слабый. Это inherent ограничение клиентского шифрования.

---

### 11. Структурный security-логер (D3) — добавлено в третьем проходе

**Файл:** [`src/utils/securityLog.ts`](src/utils/securityLog.ts)

- Типизированные события: `tamper_subscription_duration`, `tamper_subscription_corrupt`, `session_invalidated`, `session_auto_recovered`, `delete_account_offline`, `vault_decrypt_fail`, `app_lock_fail`, `trial_started`.
- В DEV — `console.warn` с тегом `[security]`.
- В PROD — заглушка `sendToProvider()` с TODO для Sentry / Yandex AppMetrica / Crashlytics.
- Никогда не throws (basic-логика приложения не должна падать из-за телеметрии).

**Расставлено по коду:**
- AppContext load — sanity-check fail → `tamper_subscription_*`, vault decrypt fail → `vault_decrypt_fail`
- AppContext startTrial → `trial_started`
- AppContext deleteAccountFully → `delete_account_offline` при backend-error
- api.ts apiFetch → `session_invalidated` + `session_auto_recovered` при 401-recovery
- appLock.ts → `app_lock_fail` при exception/error в authenticate

**Перед релизом:** подключить провайдер в `sendToProvider()`.

---

### 12. Биометрический App Lock — добавлено в третьем проходе

**Файлы:** [`src/utils/appLock.ts`](src/utils/appLock.ts), [`src/screens/AppLockScreen.tsx`](src/screens/AppLockScreen.tsx), [`App.tsx`](App.tsx) → `LockGate`

**Поведение:**
- Cold start — если флаг `app_lock_enabled_v1=1` в AsyncStorage → показывается `AppLockScreen` поверх всего, биометрия дёргается автоматически.
- Background recovery — при возврате `AppState='active'` после > 15 секунд в background, lock срабатывает снова. Меньше 15 сек (нотификация → возврат) — без проверки.
- Поддерживает все нативные методы: Face ID / Touch ID / Optic ID на iOS, Fingerprint / Face / Iris на Android.
- Fallback на системный пароль устройства разрешён (`disableDeviceFallback: false`) — удобство без потери security.
- На web — `unavailable`, lock автоматически пропускается чтобы не залочить юзера.

**Управление:** в [`ProfileScreen`](src/screens/ProfileScreen.tsx) → пункт «Защита биометрией» с toggle. При включении и выключении требуется auth прямо сейчас (защита от тихого отключения чужими руками). Если в системе биометрия не настроена — Alert «Недоступно».

**Что закрыто:** случайный доступ к чатам человека с физическим доступом к разблокированному устройству.

**Что НЕ закрыто:** украденное устройство (там biometric-пасс уже сломан), malware, физический форензик.

---

### 13. Screen Capture protection — добавлено в третьем проходе

**Файл:** [`src/screens/ChatScreen.tsx`](src/screens/ChatScreen.tsx) — `useEffect` с `ScreenCapture.preventScreenCaptureAsync()` на mount, `allowScreenCaptureAsync()` на unmount.

**Поведение:**
- Android: системные скриншоты блокируются (FLAG_SECURE), запись экрана тоже.
- iOS: запись экрана даёт чёрный кадр для secure-помеченных view. Скриншот платформа не блокирует, но `expo-screen-capture` поднимает observer.
- Web: no-op (функция вызывается, но ничего не делает).

**Что закрыто:** случайные/намеренные скриншоты чатов с приватным контентом.

---

## 🔴 КРИТИЧНО — блокеры релиза (требуют backend)

### B1. Paywall — клиент-онли симуляция

**Файл:** [`src/context/AppContext.tsx`](src/context/AppContext.tsx) — функции `purchase`, `startTrial`, `restorePurchases`, `cancelSubscription`.

В коде стоят `⚠️ КРИТИЧНО ПЕРЕД РЕЛИЗОМ` с детальными TODO. `purchase()` пишет subscription в SecureStore без серверной проверки.

**Что нужно:**

1. Установить `react-native-iap` (Apple/Google) и/или RuStore Billing SDK.
2. Создать продукт `interstellar_pro_month` в консолях (799 ₽/мес, 3-дневный free trial).
3. В `purchase()`:
   ```ts
   const purchase = await RNIap.requestSubscription('interstellar_pro_month');
   const verified = await apiFetch('/subscription/verify', {
     method: 'POST',
     body: { device_id, receipt: purchase.transactionReceipt, platform: Platform.OS },
     requireSession: true,
   });
   // setSubscription из ответа сервера, не локально вычисленного
   ```
4. Поднять `/subscription/verify` на бэке: дёргает Apple verifyReceipt / Google subscriptionsv2.get, сохраняет `users.pro_until` + `users.pro_receipt_hash`.
5. Поднять `/subscription/status` для проверки при каждом запуске (TTL 5 мин).
6. **`trial_used` НА БЭКЕ** в durable-таблице на `hw_hash` (как `feature_trials_durable` для TG-бонусов).

**Импакт без фикса:** 100% выручки = 0 ₽.

**Оценка:** 2-4 дня (1 день клиент + 1-2 дня бэкенд + 1 день sandbox-тестирование).

---

### B2. Server-side validation `typazh` и `message`

Клиентский sanitize обходится через прямой API-вызов.

**На бэке:**
- `/simulator/start` — `typazh`: max 2500 chars, проверка маркеров `<|im_*|>`, `[INST]`, `system:`
- `/simulator/message` — `message`: max 2500 chars, тот же набор маркеров

**Оценка:** 2 часа.

---

### B3. `/users/identify` должен возвращать `session_token`

Из предыдущего бэкенд-аудита `session_token` уже выпускается для Стрел Купидона. Нужно подтвердить, что Character Chat-устройства проходят через тот же flow, или адаптировать endpoint.

Без фикса: `DELETE /users/me` падает с 401 → клиент делает локальный wipe, но серверная запись не помечается deleted → юзер пере-identify тем же device_id и восстанавливает данные.

**Оценка:** 0-1 день.

---

## 🟡 Желательно перед релизом (требуют backend)

### W1. Age-gate на бэке (NSFW characters)

Сейчас `isConsentValid('age_18')` — клиентская. Обходится edit'ом AsyncStorage `legal_consents` на rooted-устройстве.

**Что нужно:** `users.age_18_confirmed_at`, endpoint `POST /users/confirm-age-18`, фильтрация NSFW в `/characters` API. В Character Chat сейчас persons захардкожены — либо переезд на server-driven, либо принять как inherent limit (юридически self-attestation допустимо).

**Оценка:** 1-5 дней в зависимости от архитектуры.

---

## ✅ Frontend-задачи закрыты

Всё что можно сделать без бэкенда — сделано. Раньше планировались как «nice to have»:

- ~~D2 (шифрование чатов)~~ → сделано (#10)
- ~~D3 (security telemetry)~~ → сделано (#11)
- ~~App Lock~~ → сделано (#12)
- ~~Screen capture protection~~ → сделано (#13)

---

## Артефакты аудита

### Изменённые файлы
- `src/context/AppContext.tsx` — secure-store, sanity-check, IAP TODO, `clearAllChats`, `deleteAccountFully`, vault encryption для chats, securityLog
- `src/utils/api.ts` — `apiFetch` единый, session-token, auto-recovery, `deleteAccount`, `clearAllSessions`, `clearSessionToken`, securityLog
- `src/utils/deviceId.ts` — CSPRNG + secure-store + миграция
- `src/utils/personaTemplate.ts` — sanitize + FIELD_LIMITS + injection guard
- `src/utils/config.ts` — production HTTPS-assert
- `src/screens/CreateScreen.tsx` — maxLength через FIELD_LIMITS
- `src/screens/ChatScreen.tsx` — maxLength=2000, screen capture protection
- `src/screens/SplashScreen.tsx` — maxLength=40 на имя
- `src/screens/ProfileScreen.tsx` — App Lock toggle, кнопки очистки/удаления, destructive confirm
- `App.tsx` — `LockGate` обёртка с биометрией
- `app.json` — Android security flags, expo-secure-store plugin

### Новые файлы
- `src/utils/secureStore.ts` — обёртка над expo-secure-store
- `src/utils/cryptoVault.ts` — AES-256 + HMAC шифрование (D2)
- `src/utils/securityLog.ts` — структурный логер security-событий (D3)
- `src/utils/appLock.ts` — биометрия / системный пароль
- `src/screens/AppLockScreen.tsx` — UI экран блокировки

### Новые зависимости
- `expo-crypto` — CSPRNG / UUID
- `expo-secure-store` — Keychain / Keystore
- `expo-local-authentication` — биометрия
- `expo-screen-capture` — защита от скриншотов / записи
- `crypto-js` — AES-256-CBC + HMAC-SHA256 (pure JS)
- `@types/crypto-js` — types

### SecureStore ключи
- `device_id` — раньше в AsyncStorage
- `subscription_v1` — раньше в AsyncStorage
- `trial_used_v1` — раньше в AsyncStorage
- `session_token_v1` — D1
- `vault_key_v1` — D2 (мастер-ключ для шифрования чатов)

### AsyncStorage ключи
- `app_lock_enabled_v1` — флаг включения биометрии
- `chats` — теперь хранит encrypted blob (миграция с plaintext автоматическая)
- `legal_consents`, `customCharacters`, `favorites`, `character_moods`, `chat_session_ids`, `user`, `create_draft` — без изменений

### Требования к бэку
- `/users/identify` (POST) — должен возвращать `session_token` (256-bit CSPRNG)
- `/users/me` (DELETE) — требует `X-Session-Token` + body `confirm: 'DELETE_MY_ACCOUNT'`
- `/subscription/verify` (POST) — нужно поднять, см. B1
- `/subscription/status` (GET) — нужно поднять, см. B1
- Server-side валидация `typazh` и `message` в `/simulator/*`, см. B2

---

## Чек-лист перед публикацией в стор

### Backend
- [ ] B1. IAP-интеграция реализована и протестирована в sandbox
- [ ] B1. `/subscription/verify` поднят и валидирует receipts
- [ ] B1. `trial_used` в durable-таблице на бэке
- [ ] B2. Server-side валидация `typazh`/`message`
- [ ] B3. `/users/identify` возвращает `session_token` для Character Chat-устройств
- [ ] W1. Age-gate перенесён на бэкенд (или принят как inherent limit)

### Frontend / Config
- [ ] `securityLog.sendToProvider()` — подключить Sentry / AppMetrica
- [ ] `EXPO_PUBLIC_API_URL` — production HTTPS endpoint
- [ ] EAS `projectId` подставлен в `app.json` (сейчас placeholder)
- [ ] `bundleIdentifier` / `package` обновлены с `com.yourcompany.*`
- [ ] `npx expo prebuild` для нативных билдов

### Testing
- [ ] Тест на rooted/jailbroken — paywall не обходится тривиально
- [ ] «Удалить аккаунт» при offline-бэкенде — UI не зависает, выводит Alert
- [ ] Повторный `identify` после `delete` — старые данные не возвращаются
- [ ] App Lock — после background > 15 сек требуется биометрия
- [ ] App Lock — на устройстве без настроенной биометрии Alert «Недоступно»
- [ ] Чаты — после `vault_decrypt_fail` не висит экран, чаты пусты
- [ ] Screen capture — на Android FLAG_SECURE срабатывает в чате
- [ ] securityLog — все события появляются в DEV console и в провайдере в PROD
