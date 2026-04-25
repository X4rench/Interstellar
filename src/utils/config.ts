// URL бэкенда берётся из .env (EXPO_PUBLIC_API_URL).
// Для локальной разработки создай .env с нужным значением.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const DAILY_MESSAGE_LIMIT = 50;
