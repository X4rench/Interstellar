import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

// Хранилище аватаров кастомных персонажей. На web documentDirectory недоступен,
// поэтому функции no-op. CreateScreen.tsx дополнительно отключает UI на web.

const AVATAR_DIR_NAME = 'avatars';
const TARGET_SIZE = 256;
const JPEG_QUALITY = 0.8;

function getAvatarsDir(): string | null {
  const root = FileSystem.documentDirectory;
  if (!root) return null;
  return `${root}${AVATAR_DIR_NAME}/`;
}

function getAvatarPath(characterId: string): string | null {
  const dir = getAvatarsDir();
  if (!dir) return null;
  // Защита от path-traversal на случай если id когда-нибудь придёт извне.
  const safeId = characterId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${dir}${safeId}.jpg`;
}

async function ensureDir(): Promise<string | null> {
  const dir = getAvatarsDir();
  if (!dir) return null;
  // makeDirectoryAsync с intermediates:true идемпотентен — не падает если папка уже есть.
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

/**
 * Resize → JPEG → копия в documentDirectory/avatars/{id}.jpg. Перезатирает
 * предыдущий аватар того же id. Возвращает финальный путь или null (на web).
 */
export async function saveAvatar(
  characterId: string,
  sourceUri: string,
): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const dir = await ensureDir();
  if (!dir) return null;
  const targetPath = getAvatarPath(characterId);
  if (!targetPath) return null;

  const processed = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: TARGET_SIZE, height: TARGET_SIZE } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );

  await FileSystem.deleteAsync(targetPath, { idempotent: true });
  await FileSystem.copyAsync({ from: processed.uri, to: targetPath });
  // Чистим temp-файл из cache (ОС когда-нибудь и сам почистит, но не ждём).
  FileSystem.deleteAsync(processed.uri, { idempotent: true }).catch(() => {});

  return targetPath;
}

export async function deleteAvatar(characterId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const path = getAvatarPath(characterId);
  if (!path) return;
  await FileSystem.deleteAsync(path, { idempotent: true });
}

export async function wipeAllAvatars(): Promise<void> {
  if (Platform.OS === 'web') return;
  const dir = getAvatarsDir();
  if (!dir) return;
  await FileSystem.deleteAsync(dir, { idempotent: true });
}
