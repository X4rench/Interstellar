import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceId } from './deviceId';
import { API_BASE_URL } from './config';

// ── HTTP helper ─────────────────────────────────────────────────────────────

async function post<T = any>(path: string, body: object): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function get<T = any>(path: string, deviceId: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'X-Device-Id': deviceId },
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// ── Пользователь ────────────────────────────────────────────────────────────

export async function identifyUser() {
  const device_id = await getDeviceId();
  return post('/users/identify', { device_id });
}

export async function getUserStats() {
  const device_id = await getDeviceId();
  return get('/users/stats', device_id);
}

// ── Сессии чата (симулятор) ─────────────────────────────────────────────────

const SESSIONS_KEY = 'chat_session_ids';

async function loadSessions(): Promise<Record<string, string>> {
  try {
    const json = await AsyncStorage.getItem(SESSIONS_KEY);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

async function saveSessions(sessions: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)).catch(() => {});
}

export async function getOrCreateSession(characterId: string, persona: string): Promise<string> {
  const sessions = await loadSessions();
  if (sessions[characterId]) return sessions[characterId];

  const device_id = await getDeviceId();
  const data = await post<{ ok: boolean; session_id: string }>('/simulator/start', {
    device_id,
    typazh: persona,
    place: 'онлайн-чат',
    difficulty: 'medium',
  });

  sessions[characterId] = data.session_id;
  await saveSessions(sessions);
  return data.session_id;
}

export async function clearSession(characterId: string): Promise<void> {
  const sessions = await loadSessions();
  delete sessions[characterId];
  await saveSessions(sessions);
}

// ── Отправка сообщения ───────────────────────────────────────────────────────

export async function sendMessage(sessionId: string, message: string): Promise<string> {
  const device_id = await getDeviceId();
  const data = await post<{ ok: boolean; response: string }>('/simulator/message', {
    device_id,
    session_id: sessionId,
    message,
  });
  if (!data.response) throw new Error('Empty response from server');
  return data.response;
}
