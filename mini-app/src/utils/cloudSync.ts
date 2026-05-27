import { cloudStorage } from '@telegram-apps/sdk-react'

import type { Character } from '../data/characters'

/**
 * cloudSync — синхронизация пользовательских данных между устройствами
 * через Telegram CloudStorage (Bot API 6.9+).
 *
 * Зачем: кастомные персонажи, избранное, настроения и self-info профиль
 * раньше жили только в localStorage конкретного устройства. Зайдя на тот же
 * Telegram-аккаунт с другого устройства, юзер не видел своих персонажей.
 * Подписка синкалась (она на бэке по telegram_user_id), а это — нет.
 *
 * CloudStorage привязан к Telegram-аккаунту и автоматически синкается между
 * всеми устройствами пользователя силами самого Telegram. Нам не нужен ни
 * бэкенд, ни хранение переписки на сервере (важно для приватности).
 *
 * Ограничения Telegram CloudStorage:
 *   - до 1024 ключей на пользователя;
 *   - ключ: [A-Za-z0-9_-], до 128 символов;
 *   - значение: до 4096 символов.
 * Поэтому:
 *   - каждый персонаж хранится в ОТДЕЛЬНОМ ключе `cc_<id>` (лимит на персонажа,
 *     а не на всех сразу);
 *   - фото-аватары (blob/binary) сюда НЕ кладём — при сериализации они
 *     вырезаются, на другом устройстве персонаж рисуется по iconType (fallback);
 *   - история чатов сюда НЕ кладётся (слишком большая) — это отдельная задача
 *     для бэкенда, если понадобится.
 *
 * Все операции безопасны вне Telegram (dev / обычный браузер): если API
 * недоступно — функции тихо превращаются в no-op, приложение продолжает
 * работать на одном localStorage как раньше.
 */

const CHAR_PREFIX = 'cc_'

export const CK_FAVORITES = 'favs'
export const CK_MOODS = 'moods'
export const CK_PROFILE = 'profile'

/** Безопасный предел длины значения (лимит Telegram — 4096, берём с запасом). */
const MAX_VALUE_LEN = 4000

/**
 * Доступен ли CloudStorage прямо сейчас. False вне Telegram, в старых
 * клиентах (< 6.9) и до инициализации SDK.
 */
export function cloudSyncAvailable(): boolean {
  try {
    return (
      cloudStorage.setItem.isAvailable() &&
      cloudStorage.getKeys.isAvailable() &&
      cloudStorage.getItem.isAvailable() &&
      cloudStorage.deleteItem.isAvailable()
    )
  } catch {
    return false
  }
}

/** Ключ персонажа в CloudStorage. id уже генерится в safe-формате, но чистим на всякий. */
function charKey(id: string): string {
  return CHAR_PREFIX + id.replace(/[^A-Za-z0-9_-]/g, '')
}

/**
 * Сериализует персонажа для облака, вырезая device-local поля.
 * avatarUri (blob:/data: URL) и photo_url бессмысленны на другом устройстве —
 * там останется iconType как fallback-иконка.
 */
function serializeChar(c: Character): string {
  const clone: Record<string, unknown> = { ...c, userCreated: true }
  delete clone.avatarUri
  delete clone.photo_url
  return JSON.stringify(clone)
}

/** Кладёт/обновляет одного персонажа в облако. Идемпотентно. */
export async function cloudPushCharacter(c: Character): Promise<void> {
  if (!cloudSyncAvailable()) return
  try {
    const payload = serializeChar(c)
    // Слишком большой persona не влезет в 4 КБ — пропускаем (персонаж
    // останется локальным, синк просто не покроет этот edge case).
    if (payload.length > MAX_VALUE_LEN) return
    await cloudStorage.setItem(charKey(c.id), payload)
  } catch {
    /* ignore — синк не критичен, локальная копия уже сохранена */
  }
}

/** Удаляет персонажа из облака. Идемпотентно (нет ключа — no-op). */
export async function cloudRemoveCharacter(id: string): Promise<void> {
  if (!cloudSyncAvailable()) return
  try {
    await cloudStorage.deleteItem(charKey(id))
  } catch {
    /* ignore */
  }
}

/** Тянет всех пользовательских персонажей из облака. */
export async function cloudPullCharacters(): Promise<Character[]> {
  if (!cloudSyncAvailable()) return []
  try {
    const keys = await cloudStorage.getKeys()
    const charKeys = keys.filter((k) => k.startsWith(CHAR_PREFIX))
    if (charKeys.length === 0) return []
    const map = await cloudStorage.getItem(charKeys)
    const out: Character[] = []
    for (const k of charKeys) {
      const raw = map[k]
      if (!raw) continue
      try {
        const c = JSON.parse(raw) as Character
        if (c && typeof c.id === 'string' && typeof c.name === 'string') {
          // На чужом устройстве blob-URL невалиден — рисуем по iconType.
          delete (c as Partial<Character>).avatarUri
          delete (c as Partial<Character>).photo_url
          c.userCreated = true
          out.push(c)
        }
      } catch {
        /* битая запись — пропускаем */
      }
    }
    return out
  } catch {
    return []
  }
}

/** Универсальный push небольшого JSON-значения (избранное / настроения / профиль). */
export async function cloudPushKV(key: string, value: unknown): Promise<void> {
  if (!cloudSyncAvailable()) return
  try {
    const s = JSON.stringify(value)
    if (s.length > MAX_VALUE_LEN) return
    await cloudStorage.setItem(key, s)
  } catch {
    /* ignore */
  }
}

/** Универсальный pull JSON-значения. null если ключа нет или ошибка. */
export async function cloudPullKV<T>(key: string): Promise<T | null> {
  if (!cloudSyncAvailable()) return null
  try {
    const raw = await cloudStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** Полностью стирает наши данные из облака (для «удалить аккаунт», 152-ФЗ). */
export async function cloudWipeAll(): Promise<void> {
  if (!cloudSyncAvailable()) return
  try {
    const keys = await cloudStorage.getKeys()
    const ours = keys.filter(
      (k) =>
        k.startsWith(CHAR_PREFIX) ||
        k === CK_FAVORITES ||
        k === CK_MOODS ||
        k === CK_PROFILE,
    )
    if (ours.length > 0) await cloudStorage.deleteItem(ours)
  } catch {
    /* ignore */
  }
}
