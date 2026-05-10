import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Тонкая обёртка над expo-secure-store с фолбэком на AsyncStorage для web
 * и платформ, где Keychain/Keystore недоступны.
 *
 * Использовать ТОЛЬКО для чувствительных значений:
 *  - device_id (единственный аутентифицирующий токен на бэке)
 *  - subscription state (защита от тривиального обхода paywall)
 *  - session tokens (если появятся)
 *
 * Для обычных данных (chats, favorites, settings) — AsyncStorage напрямую.
 *
 * Лимит SecureStore: 2048 байт на значение. Для bigger payload — fallback
 * на AsyncStorage (но с понимание, что это не secure).
 */

const MAX_SECURE_BYTES = 2000; // запас от лимита 2048

function isSecureAvailable(): boolean {
  // На web SecureStore не работает.
  return Platform.OS !== 'web';
}

export async function secureGet(key: string): Promise<string | null> {
  if (!isSecureAvailable()) {
    return AsyncStorage.getItem(key).catch(() => null);
  }
  try {
    const v = await SecureStore.getItemAsync(key);
    return v ?? null;
  } catch {
    // SecureStore может бросать на эмуляторах / старых девайсах
    return AsyncStorage.getItem(key).catch(() => null);
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  // Если значение слишком большое — деградируем до AsyncStorage с warn.
  if (value.length > MAX_SECURE_BYTES || !isSecureAvailable()) {
    if (__DEV__ && value.length > MAX_SECURE_BYTES) {
      console.warn(`[secureStore] value for "${key}" too large, falling back to AsyncStorage`);
    }
    await AsyncStorage.setItem(key, value).catch(() => {});
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value).catch(() => {});
  }
}

export async function secureDelete(key: string): Promise<void> {
  if (isSecureAvailable()) {
    await SecureStore.deleteItemAsync(key).catch(() => {});
  }
  // Удаляем и из AsyncStorage на случай legacy-значения.
  await AsyncStorage.removeItem(key).catch(() => {});
}
