import { mockTelegramEnv, retrieveLaunchParams } from '@telegram-apps/sdk-react'

/**
 * Подсовывает фейковый Telegram environment в DEV если приложение открыто
 * не из реального TG-клиента (обычный браузер). Без этого SDK падает с
 * "launch params not found" и React не маунтится.
 *
 * Если запущены из TG (есть launch params в URL hash) — `retrieveLaunchParams()`
 * отрабатывает успешно и мы возвращаемся, не подменяя ничего.
 *
 * ⚠️ Hash в моковом initData — фейковый. Backend на проде валидирует HMAC
 * через BOT_TOKEN и отвергнет запрос. Для DEV с реальным бэком:
 *   - либо подключить `DEV_BYPASS_INITDATA=1` env-флаг на бэке (Phase 2)
 *   - либо заходить через настоящего бота через cloudflared/ngrok туннель
 *
 * См. https://docs.telegram-mini-apps.com/platform/getting-started/mock-environment
 */
export function setupMockEnvIfNeeded(): void {
  try {
    retrieveLaunchParams()
    return // запущены из реального TG — не мокаем
  } catch {
    // launch params отсутствуют — продолжаем мокать
  }

  const userId = Number(import.meta.env.VITE_DEV_MOCK_USER_ID) || 99281932
  const username = import.meta.env.VITE_DEV_MOCK_USERNAME || 'devuser'
  const startParam = import.meta.env.VITE_DEV_MOCK_START_PARAM || ''

  const userJson = JSON.stringify({
    id: userId,
    first_name: 'Dev',
    last_name: 'User',
    username,
    language_code: 'ru',
    is_premium: false,
    allows_write_to_pm: true,
    photo_url: '',
  })

  const params: [string, string][] = [
    ['user', userJson],
    ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
    ['signature', 'mock-signature'],
    ['auth_date', String(Math.floor(Date.now() / 1000))],
  ]
  if (startParam) params.push(['start_param', startParam])

  const tgWebAppData = new URLSearchParams(params).toString()

  mockTelegramEnv({
    launchParams: {
      tgWebAppData,
      tgWebAppVersion: '7.10',
      tgWebAppPlatform: 'tdesktop',
      tgWebAppThemeParams: {
        accent_text_color: '#7c5cff',
        bg_color: '#0a0612',
        button_color: '#7c5cff',
        button_text_color: '#ffffff',
        destructive_text_color: '#ec3942',
        header_bg_color: '#100a1e',
        hint_color: '#888888',
        link_color: '#7c5cff',
        secondary_bg_color: '#100a1e',
        section_bg_color: '#181028',
        section_header_text_color: '#7c5cff',
        section_separator_color: '#222222',
        subtitle_text_color: '#888888',
        text_color: '#ffffff',
      },
    },
  })

  // eslint-disable-next-line no-console
  console.info(
    '[mock-env] Подменён TG environment для DEV. user_id=%d start_param=%s',
    userId,
    startParam || '(пусто)',
  )
}
