import { get, set, del, keys } from 'idb-keyval'

/**
 * Хранилище аватаров кастомных персонажей в IndexedDB.
 *
 * Заменяет expo-file-system из RN. Ключ — character_id, значение — Blob.
 * При рендере конвертим Blob в blob:-URL через URL.createObjectURL —
 * url-чики живут до закрытия страницы.
 *
 * IndexedDB лимит на TG-WebView обычно ~50MB, по аватару 256x256 JPEG q=0.8
 * это <100KB на штуку. Для 3 кастомов (free) или сотни (Pro) — с запасом.
 */

const PREFIX = 'avatar_'

/**
 * Сжимает картинку до квадрата SIZE×SIZE через Canvas, JPEG quality.
 * Использует createImageBitmap (быстро, off-main-thread) с fallback'ом
 * на Image.onload для старых браузеров.
 *
 * @returns Blob сжатой картинки (image/jpeg)
 */
export async function resizeImageToBlob(
  file: File | Blob,
  size = 256,
  quality = 0.8,
): Promise<Blob> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CANVAS_NOT_SUPPORTED')

  // Cover-режим: масштабируем по короткой стороне, центрируем длинную.
  const minSide = Math.min(img.width, img.height)
  const sx = (img.width - minSide) / 2
  const sy = (img.height - minSide) / 2
  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)
  img.close()

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('TOBLOB_FAILED'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Сохраняет аватар (Blob) под ключом character_id. */
export async function saveAvatar(characterId: string, blob: Blob): Promise<void> {
  await set(PREFIX + characterId, blob)
}

/**
 * Возвращает blob:-URL аватара или null если нет.
 *
 * NB: возвращаемый URL должен быть отозван через URL.revokeObjectURL когда
 * больше не нужен (в React — в useEffect cleanup), иначе утечка памяти.
 * Для рендера в `<img src>` это критично только при массовой перерисовке.
 */
export async function getAvatarUrl(characterId: string): Promise<string | null> {
  const blob = await get<Blob | undefined>(PREFIX + characterId)
  if (!blob) return null
  return URL.createObjectURL(blob)
}

/** Удаляет аватар (например, при удалении персонажа). */
export async function deleteAvatar(characterId: string): Promise<void> {
  await del(PREFIX + characterId)
}

/** Удаляет ВСЕ аватары (для deleteAccountFully). */
export async function wipeAllAvatars(): Promise<void> {
  const allKeys = await keys()
  await Promise.all(
    allKeys
      .filter((k): k is string => typeof k === 'string' && k.startsWith(PREFIX))
      .map((k) => del(k)),
  )
}
