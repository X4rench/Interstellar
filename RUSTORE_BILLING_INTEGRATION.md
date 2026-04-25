# Интеграция RuStore Billing

Проект: CharacterChatRN (Expo ~52, React Native 0.76)  
Цена: 299 ₽/месяц  
Кнопка оплаты: `ProfileScreen.tsx` → `proBuyBtn`

---

## Важно перед началом

Этот проект использует **Expo Managed Workflow**. RuStore SDK — это нативный Android-модуль,
поэтому нужно перейти на **Expo Dev Client** (bare workflow).  
Это не страшно — Expo-пакеты продолжат работать.

---

## Шаг 1 — Переход на Dev Client

```bash
npx expo install expo-dev-client
npx expo prebuild --platform android
```

После этого появится папка `/android`. Теперь ты управляешь нативным кодом.

Запуск теперь через:
```bash
npx expo run:android
```

---

## Шаг 2 — Зарегистрировать приложение в RuStore

1. Зайди на https://dev.rustore.ru
2. Создай приложение с package name из `app.json`:
   ```
   com.yourcompany.interstellar
   ```
   (Смени на нормальный, например `com.characterchat.app` — до публикации)
3. В разделе **"Подписки"** создай продукт:
   - ID: `premium_monthly`
   - Цена: 299 ₽
   - Тип: Подписка, 1 месяц

---

## Шаг 3 — Установить RuStore Billing SDK

RuStore пока не имеет официального React Native npm-пакета.  
Есть два пути:

### Вариант A — Готовый community-пакет (проще)

```bash
npm install react-native-rustore-billing
```

Репозиторий: https://github.com/rustore-dev/rustore-react-native-sdk  
(Официальный от команды RuStore)

### Вариант B — Нативный мост вручную (надёжнее)

Добавь в `/android/app/build.gradle`:
```groovy
dependencies {
    implementation "ru.rustore.sdk:billingclient:7.0.0"
}
```

Добавь в `/android/build.gradle` в `repositories`:
```groovy
maven { url "https://artifactory.rustore.ru/artifactory/libs-release" }
```

---

## Шаг 4 — Инициализация SDK

### Если используешь Вариант A (npm-пакет)

Создай файл `/src/services/ruStoreBilling.ts`:

```typescript
import { RuStoreBillingClient } from 'react-native-rustore-billing';
import { Platform } from 'react-native';

const RUSTORE_APP_ID = 'ТВОЙ_APP_ID_ИЗ_RUSTORE_КОНСОЛИ'; // число, напр. "123456"

export async function initRuStore(): Promise<void> {
  if (Platform.OS !== 'android') return;
  
  await RuStoreBillingClient.init({
    consoleApplicationId: RUSTORE_APP_ID,
    deeplinkScheme: 'characterchat', // любая строка, уникальная для приложения
  });
}

export async function isRuStoreAvailable(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const result = await RuStoreBillingClient.checkPurchasesAvailability();
    return result.isAvailable;
  } catch {
    return false;
  }
}

export async function buyPremium(): Promise<boolean> {
  const available = await isRuStoreAvailable();
  if (!available) {
    throw new Error('RuStore недоступен');
  }
  
  // Запускает платёжный экран RuStore
  const purchase = await RuStoreBillingClient.purchaseProduct({
    productId: 'premium_monthly',
  });
  
  if (purchase.finishCode === 'PAID_SUCCESS') {
    // Верифицируй на своём бэкенде (см. Шаг 6)
    const valid = await verifyPurchaseOnBackend(purchase.purchaseId);
    return valid;
  }
  
  return false;
}

export async function checkExistingSubscription(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const purchases = await RuStoreBillingClient.getPurchases();
    return purchases.some(p => 
      p.productId === 'premium_monthly' && p.purchaseState === 'CONFIRMED'
    );
  } catch {
    return false;
  }
}

async function verifyPurchaseOnBackend(purchaseId: string): Promise<boolean> {
  // TODO: реализовать свой бэкенд (см. Шаг 6)
  // Временно доверяем клиенту:
  return true;
}
```

---

## Шаг 5 — Подключить к AppContext

Открой `/src/context/AppContext.tsx` и добавь:

```typescript
// 1. Добавь в интерфейс состояния:
interface AppState {
  // ... существующие поля
  isPremium: boolean;
  setPremium: (val: boolean) => void;
}

// 2. Добавь в начальное состояние:
const [isPremium, setIsPremium] = useState(false);

// 3. При старте приложения проверяй подписку:
useEffect(() => {
  async function checkSubscription() {
    const { checkExistingSubscription, initRuStore } = await import('../services/ruStoreBilling');
    await initRuStore();
    const active = await checkExistingSubscription();
    setIsPremium(active);
  }
  checkSubscription();
}, []);

// 4. Передай в value контекста:
value={{ ..., isPremium, setPremium: setIsPremium }}
```

---

## Шаг 6 — Заменить кнопку в ProfileScreen

Открой `/src/screens/ProfileScreen.tsx`, найди `proBuyBtn` (~строка 212) и замени:

```typescript
// БЫЛО:
<TouchableOpacity style={s.proBuyBtn} activeOpacity={0.9}
  onPress={() => { setProVisible(false); Alert.alert('Скоро', '...'); }}>
  <Text style={s.proBuyText}>299 ₽ / месяц</Text>
</TouchableOpacity>

// СТАЛО:
import { buyPremium } from '../services/ruStoreBilling';

const [loading, setLoading] = useState(false);
const { setPremium } = useAppContext();

async function handleBuy() {
  setLoading(true);
  try {
    const success = await buyPremium();
    if (success) {
      setPremium(true);
      setProVisible(false);
      Alert.alert('Готово', 'Подписка активирована!');
    } else {
      Alert.alert('Оплата отменена', 'Попробуй снова');
    }
  } catch (e) {
    Alert.alert('Ошибка', 'RuStore недоступен. Установи приложение RuStore.');
  } finally {
    setLoading(false);
  }
}

<TouchableOpacity style={s.proBuyBtn} activeOpacity={0.9} onPress={handleBuy} disabled={loading}>
  <Text style={s.proBuyText}>{loading ? 'Загрузка...' : '299 ₽ / месяц'}</Text>
</TouchableOpacity>
```

---

## Шаг 7 — Использовать isPremium в логике

Найди в коде лимит 50 сообщений (`ProfileScreen.tsx` ~строка 136) и добавь проверку:

```typescript
const { isPremium } = useAppContext();

// Лимит сообщений:
const dailyLimit = isPremium ? Infinity : 50;
const isLimitReached = todayMessageCount >= dailyLimit;
```

---

## Шаг 8 — Бэкенд верификация (опционально, но важно)

Без бэкенда пользователи могут подделать покупку. Минимальный вариант:

```
POST /verify-purchase
Body: { purchaseId, userId }

Сервер делает запрос к RuStore API:
GET https://public-api.rustore.ru/public/v1/purchase/{purchaseId}
Headers: Public-Token: <твой токен из консоли RuStore>

Если статус CONFIRMED — активируешь премиум в своей БД
```

---

## Шаг 9 — Deep link для возврата из RuStore

В `app.json` добавь:
```json
{
  "expo": {
    "scheme": "characterchat"
  }
}
```

В `AndroidManifest.xml` (`/android/app/src/main/AndroidManifest.xml`):
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="characterchat" />
</intent-filter>
```

---

## Порядок тестирования

1. Установи RuStore на тестовый Android-телефон
2. Войди в тестовый аккаунт RuStore
3. В консоли RuStore добавь тестовых пользователей
4. Собери APK: `npx expo run:android`
5. Нажми "299 ₽ / месяц" — должен открыться экран оплаты RuStore
6. В тестовом режиме деньги не списываются

---

## Итоговая структура файлов

```
src/
  services/
    ruStoreBilling.ts     ← новый файл (Шаг 4)
  context/
    AppContext.tsx         ← добавить isPremium (Шаг 5)
  screens/
    ProfileScreen.tsx     ← заменить кнопку (Шаг 6)
android/
  app/build.gradle        ← добавить SDK (Шаг 3)
  build.gradle            ← добавить maven (Шаг 3)
  app/src/main/
    AndroidManifest.xml   ← deep link (Шаг 9)
app.json                  ← scheme (Шаг 9)
```

---

## Частые проблемы

| Проблема | Решение |
|---|---|
| "RuStore не установлен" | Показывай кнопку только если `isRuStoreAvailable()` вернул true |
| Платёж зависает | Проверь deep link scheme в AndroidManifest |
| После оплаты премиум не активируется | Проверь `finishCode === 'PAID_SUCCESS'` |
| Ошибка сборки | Убедись что в `/android/build.gradle` добавлен maven RuStore |

---

## Если пользователь пришёл из Google Play

```typescript
import { getInstallerPackageName } from 'react-native-device-info';

async function getPaymentMethod() {
  const installer = await getInstallerPackageName();
  if (installer === 'com.android.vending') {
    // Google Play — используй Google Play Billing
    return 'google';
  }
  // Остальные (RuStore, APK, сайт) — используй RuStore
  return 'rustore';
}
```
