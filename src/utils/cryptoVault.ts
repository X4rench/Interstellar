import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';
import { secureGet, secureSet } from './secureStore';

/**
 * Локальное шифрование чувствительных AsyncStorage-данных (D2).
 *
 * Threat model:
 *   - Защищаемся от: чтения AsyncStorage через ADB pull / iTunes backup /
 *     обычный root explorer на rooted-устройстве.
 *   - НЕ защищаемся от: malware с правами root которая прочитает Keychain
 *     (ключ всё равно лежит в SecureStore — на rooted Android Keystore
 *     иногда обходим). Это inherent ограничение клиентского шифрования.
 *
 * Ключ: 256-bit, генерируется один раз при первом запуске, лежит в
 * Keychain/Keystore. Если Keychain недоступен (web) — фолбэк на AsyncStorage,
 * шифрование при этом теряет смысл (ключ и шифр в одном месте), но код
 * продолжает работать.
 *
 * Алгоритм: AES-256-CBC с HMAC-SHA256 для integrity (encrypt-then-MAC).
 * Используем CBC а не GCM потому что crypto-js не поддерживает GCM.
 * Random IV (16 байт) для каждой записи, конкатенируется с ciphertext.
 *
 * Формат encrypted blob (base64):
 *   IV (16 bytes) || HMAC (32 bytes) || ciphertext
 */

const KEY_STORE_NAME = 'vault_key_v1';
const KEY_BYTES = 32; // AES-256
const HMAC_BYTES = 32; // SHA-256

let _cachedKey: CryptoJS.lib.WordArray | null = null;

/**
 * Получить (или сгенерировать при первом запуске) мастер-ключ из SecureStore.
 * Ключ хранится как hex-строка.
 */
async function getOrCreateKey(): Promise<CryptoJS.lib.WordArray> {
  if (_cachedKey) return _cachedKey;

  let keyHex = await secureGet(KEY_STORE_NAME);
  if (!keyHex) {
    // Первый запуск — генерируем CSPRNG-ключ.
    const bytes = await Crypto.getRandomBytesAsync(KEY_BYTES);
    keyHex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    await secureSet(KEY_STORE_NAME, keyHex);
  }
  _cachedKey = CryptoJS.enc.Hex.parse(keyHex);
  return _cachedKey;
}

/**
 * Шифрует строку. Возвращает base64-blob (IV + HMAC + ciphertext).
 * Если шифрование падает — пробрасываем исключение (вызывающий код
 * должен решить, писать plaintext или отказаться).
 */
export async function vaultEncrypt(plaintext: string): Promise<string> {
  const masterKey = await getOrCreateKey();

  // Разделяем мастер-ключ на encryption key и MAC key (KDF-light).
  // Простой подход — SHA256(key || 'enc') и SHA256(key || 'mac').
  const encKey = CryptoJS.SHA256(masterKey.toString() + 'enc');
  const macKey = CryptoJS.SHA256(masterKey.toString() + 'mac');

  // Random IV — 16 байт CSPRNG. crypto-js собственный random — не CSPRNG,
  // используем expo-crypto.
  const ivBytes = await Crypto.getRandomBytesAsync(16);
  const ivHex = Array.from(ivBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  const ciphertext = CryptoJS.AES.encrypt(plaintext, encKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).ciphertext;

  // HMAC over IV || ciphertext (encrypt-then-MAC).
  const macInput = iv.clone().concat(ciphertext);
  const mac = CryptoJS.HmacSHA256(macInput, macKey);

  // Финальный blob: IV (16) || MAC (32) || ciphertext, → base64.
  const blob = iv.clone().concat(mac).concat(ciphertext);
  return CryptoJS.enc.Base64.stringify(blob);
}

/**
 * Расшифровывает base64-blob. Возвращает plaintext или null при любой
 * ошибке (corrupted blob, неверный HMAC, неправильный ключ).
 *
 * Дизайн-выбор: тихо null при failure. Вызывающий код решает что делать —
 * показывать "история повреждена" или просто пустой стейт.
 */
export async function vaultDecrypt(blobBase64: string): Promise<string | null> {
  try {
    const masterKey = await getOrCreateKey();
    const encKey = CryptoJS.SHA256(masterKey.toString() + 'enc');
    const macKey = CryptoJS.SHA256(masterKey.toString() + 'mac');

    const blob = CryptoJS.enc.Base64.parse(blobBase64);
    const totalBytes = blob.sigBytes;
    if (totalBytes < 16 + HMAC_BYTES + 1) return null; // слишком короткий

    // Разрезаем blob: IV (16) || MAC (32) || ciphertext.
    const iv          = CryptoJS.lib.WordArray.create(blob.words.slice(0, 4),  16);
    const expectedMac = CryptoJS.lib.WordArray.create(blob.words.slice(4, 12), 32);
    const ciphertext  = CryptoJS.lib.WordArray.create(
      blob.words.slice(12),
      totalBytes - 16 - 32,
    );

    // Проверяем HMAC ДО decrypt (предотвращаем padding oracle).
    const macInput = iv.clone().concat(ciphertext);
    const actualMac = CryptoJS.HmacSHA256(macInput, macKey);
    if (actualMac.toString() !== expectedMac.toString()) return null;

    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, encKey, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}

/**
 * Эвристика для определения encrypted vs legacy plaintext в AsyncStorage.
 * Encrypted blob — base64-строка длиной кратной 4, начинающаяся не с '{' или '['.
 * Legacy plaintext — JSON строка, начинается с '{' или '['.
 *
 * Используется в миграции при загрузке старых чатов.
 */
export function looksEncrypted(s: string): boolean {
  if (!s || s.length < 50) return false;
  const first = s[0];
  if (first === '{' || first === '[') return false;
  // base64 alphabet
  return /^[A-Za-z0-9+/=]+$/.test(s);
}
