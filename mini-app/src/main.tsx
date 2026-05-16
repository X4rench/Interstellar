import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { initTelegramApp } from './init'
import { initSentry } from './sentry'
import './styles/globals.css'

// DEV-only: eruda — мобильный console-debug для TG WebView.
// На iOS-WebView нет нативного devtools, eruda даёт минимальную замену.
// В prod не подключаем — лишние ~200kb и навязчивая кнопка-шарик.
if (import.meta.env.DEV) {
  import('eruda')
    .then(({ default: eruda }) => eruda.init())
    .catch(() => {
      /* eruda не критичен — игнорируем ошибку загрузки */
    })
}

initSentry()

const rootEl = document.getElementById('root')!

initTelegramApp()
  .then(() => {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    rootEl.innerHTML = `
      <div class="error-screen">
        <h2>Не удалось запустить приложение</h2>
        <p style="opacity:.7">Открой ссылку через Telegram-бот, не в обычном браузере.</p>
        <pre style="opacity:.5;font-size:12px;white-space:pre-wrap;background:#1a1228;padding:12px;border-radius:8px;margin-top:12px">${escapeHtml(msg)}</pre>
      </div>
    `
  })

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
