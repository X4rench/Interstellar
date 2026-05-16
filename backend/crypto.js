import crypto from 'node:crypto';

/**
 * AES-256-GCM шифрование PII (ИНН, реквизиты, ФИО партнёров).
 *
 * Ключ берётся из env `PAYOUT_ENCRYPTION_KEY` (32 байта base64).
 * НИКОГДА не логируем plaintext PII. Никогда не возвращаем в API
 * для не-admin endpoint'ов. Для admin — только через явный
 * `/admin/partners/:id/pii` с requireConfirmAction.
 *
 * Threat model:
 *   - SQLite-файл украден отдельно от env → атакующий получит только
 *     ciphertext, ключа нет → данные защищены.
 *   - Бэк скомпрометирован полностью → ключ + ciphertext доступны
 *     → данные раскрыты. От этого защищает только HSM/KMS, что overkill
 *     на MVP и Render. Acceptable trade-off.
 */

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const KEY_LEN = 32;

let cachedKey = null;

function getKey() {
  if (cachedKey) return cachedKey;
  const raw = process.env.PAYOUT_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      '[crypto] PAYOUT_ENCRYPTION_KEY not set. Generate via: ' +
        'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
    );
  }
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== KEY_LEN) {
    throw new Error(
      `[crypto] PAYOUT_ENCRYPTION_KEY must be exactly ${KEY_LEN} bytes when base64-decoded (got ${buf.length})`,
    );
  }
  cachedKey = buf;
  return buf;
}

/**
 * Шифрует строку plaintext. Возвращает { ciphertext, iv, tag } как Buffer'ы.
 * Если plaintext пустой/null — возвращает все три как null (записываем как
 * NULL в БД).
 */
export function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined || plaintext === '') {
    return { ciphertext: null, iv: null, tag: null };
  }
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(plaintext), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return { ciphertext, iv, tag };
}

/**
 * Расшифровывает. Возвращает строку plaintext или null если
 *  - один из аргументов null/undefined,
 *  - tag invalid (значит данные тронуты или ключ другой) → НЕ THROWS, null.
 *
 * Для критичных операций вызывающий код должен явно проверять что результат
 * != null.
 */
export function decrypt(ciphertext, iv, tag) {
  if (!ciphertext || !iv || !tag) return null;
  try {
    const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
  } catch {
    return null;
  }
}

/**
 * Маска для безопасного отображения в admin UI: оставляет видимыми
 * последние `visible` символов, остальное — звёздочки.
 *
 *   maskTail('40817810099912345678', 4) → '****************5678'
 */
export function maskTail(plaintext, visible = 4) {
  if (plaintext === null || plaintext === undefined) return null;
  const s = String(plaintext);
  if (s.length <= visible) return '*'.repeat(s.length);
  return '*'.repeat(s.length - visible) + s.slice(-visible);
}

/**
 * Проверка что ключ настроен. Вызвать при старте чтобы упасть рано, а не
 * на первой выплате. Возвращает true/false без throw.
 */
export function isCryptoConfigured() {
  try {
    getKey();
    return true;
  } catch {
    return false;
  }
}
