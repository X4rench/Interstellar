import { API_BASE_URL } from './config';

// Stateless-клиент для бэкенда interstellar-backend.
// Бэк проксирует запросы в polza.ai (модель grok-4.1-fast).
// История чата хранится локально (в AppContext.chats), на каждое
// сообщение целиком уезжает в бэк — никаких серверных сессий.

export type ChatRole = 'user' | 'character';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const REQUEST_TIMEOUT_MS = 65_000;

/**
 * Отправить сообщение модели. Возвращает текст ответа персонажа.
 *
 * @param persona  системный prompt персонажа (composePersona / buildPersonaTemplate)
 * @param messages вся история чата для этого персонажа, включая последнее
 *                 сообщение пользователя
 */
export async function sendMessage(
  persona: string,
  messages: ChatMessage[],
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona, messages }),
      signal: controller.signal,
    });

    let data: any = null;
    try { data = await res.json(); } catch { /* not json */ }

    if (!res.ok || data?.ok === false) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    if (typeof data?.response !== 'string' || !data.response.trim()) {
      throw new Error('EMPTY_RESPONSE');
    }
    return data.response;
  } finally {
    clearTimeout(timer);
  }
}
