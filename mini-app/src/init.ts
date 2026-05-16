import {
  init,
  miniApp,
  themeParams,
  viewport,
  initData,
  backButton,
  mainButton,
} from '@telegram-apps/sdk-react'

import { setupMockEnvIfNeeded } from './mock-env'

let initStarted = false

/**
 * Инициализация Telegram-SDK. Вызывается ровно один раз перед mount React.
 *
 * Шаги:
 *  1. (DEV-only) подсунуть mock environment если запущены вне TG
 *  2. init() — общая инициализация SDK (signal stores, event listeners)
 *  3. mount() для каждого компонента, который мы используем
 *  4. bindCssVars() — прокидываем тему и safe-area в CSS-переменные
 *  5. viewport.expand() — раскрываем приложение на полный экран
 *  6. miniApp.ready() — сообщаем TG что splash можно убирать
 *
 * Идемпотентность: повторный вызов — no-op (флаг initStarted).
 *
 * NB: API @telegram-apps/sdk-react@3.x — все mount() async-функции.
 * Если после `npm install` версия окажется другой — поправить здесь.
 */
export async function initTelegramApp(): Promise<void> {
  if (initStarted) return
  initStarted = true

  if (import.meta.env.DEV) {
    setupMockEnvIfNeeded()
  }

  init()

  await miniApp.mount()
  miniApp.bindCssVars()

  themeParams.mount()
  themeParams.bindCssVars()

  await viewport.mount()
  viewport.bindCssVars()

  initData.restore()

  // backButton/mainButton могут быть недоступны на старых TG-клиентах.
  // SDK кидает в этом случае исключение — глушим, фичи опциональные.
  try {
    backButton.mount()
  } catch {
    /* not supported on this client */
  }
  try {
    mainButton.mount()
  } catch {
    /* not supported on this client */
  }

  // expand до фуллскрина и ready — после успешного mount всех компонентов.
  try {
    viewport.expand()
  } catch {
    /* not supported */
  }
  miniApp.ready()
}
