import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { secureGet, secureSet } from './secureStore';

let _cached: string | null = null;

/**
 * Безопасный UUID v4 на основе CSPRNG (expo-crypto).
 * До этого использовался Math.random() — XorShift128+ в Hermes,
 * не криптографически стойкий. CSPRNG нужен потому, что device_id
 * — единственный аутентифицирующий идентификатор пользователя на бэке.
 */
function uuidv4(): string {
  // expo-crypto.randomUUID() — нативный CSPRNG.
  // На web падает на crypto.getRandomValues (тоже CSPRNG).
  return Crypto.randomUUID();
}

/**
 * device_id хранится в secure-storage (Keychain на iOS, Keystore на Android).
 * На web SecureStore недоступен — фолбэк на AsyncStorage.
 *
 * Миграция: при первом запуске после апгрейда читаем старое значение
 * из AsyncStorage('device_id') и переносим в secure-storage. Старый ключ
 * не удаляем сразу — оставляем как тёплый кэш для отладки.
 *
 * После переезда на stateless polza.ai-прокси device_id напрямую не
 * отправляется в бэк, но генератор оставлен — может пригодиться для
 * локальной аналитики или будущих фич.
 */
const DEVICE_ID_KEY = 'device_id';

export async function getDeviceId(): Promise<string> {
  if (_cached) return _cached;
  try {
    // 1) пробуем из secure-store (или AsyncStorage на web)
    let id = await secureGet(DEVICE_ID_KEY);

    // 2) миграция: если в secure ничего нет, но есть legacy в AsyncStorage —
    //    переносим. Не удаляем legacy, чтобы не сломать другие потоки.
    if (!id && Platform.OS !== 'web') {
      const legacy = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (legacy) {
        id = legacy;
        await secureSet(DEVICE_ID_KEY, legacy);
      }
    }

    // 3) если ничего нет — генерируем новый CSPRNG-UUID
    if (!id) {
      id = uuidv4();
      await secureSet(DEVICE_ID_KEY, id);
    }
    _cached = id;
    return id;
  } catch {
    // Полный fallback: одноразовый UUID на сессию.
    return uuidv4();
  }
}
