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
  .catch(() => {
    // Mini App запущен ВНЕ Telegram (обычный браузер). Вместо технической
    // ошибки — продающий лендинг с описанием продукта, тарифами и контактами.
    // Это важно для модерации платёжных систем (ЮКасса проверяет URL и
    // должна видеть товары/цены/политику возврата).
    rootEl.innerHTML = renderLandingPage()
  })

function renderLandingPage(): string {
  return `
    <div style="
      min-height: 100dvh;
      background: linear-gradient(180deg, #0a0612 0%, #000 100%);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px 20px 80px;
      box-sizing: border-box;
    ">
      <div style="max-width: 520px; margin: 0 auto;">

        <!-- Hero -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="
            display: inline-flex; align-items: center; gap: 8px;
            margin-bottom: 16px;
          ">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#fff" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="#fff"/>
            </svg>
            <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">интерстеллар</span>
            <span style="
              font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
              background: #7c5cff; padding: 2px 6px; border-radius: 4px;
            ">18+</span>
          </div>
          <h1 style="
            font-size: 32px; font-weight: 800; margin: 0 0 12px;
            letter-spacing: -1px; line-height: 1.1;
            background: linear-gradient(135deg, #c9b8ff, #ff9ee6);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          ">AI-чат с великими людьми</h1>
          <p style="font-size: 15px; color: #aaa; margin: 0; line-height: 1.5;">
            Поговори с Эйнштейном, Фрейдом, Клеопатрой и ещё 50+ персонажами истории
          </p>
        </div>

        <!-- CTA -->
        <a href="https://t.me/InterstellarAiBot/app" style="
          display: block; text-align: center;
          background: linear-gradient(135deg, #7c5cff 0%, #b455e8 50%, #ff5cdb 100%);
          color: #fff; text-decoration: none; font-weight: 700; font-size: 16px;
          padding: 16px; border-radius: 14px;
          box-shadow: 0 4px 18px rgba(124, 92, 255, 0.35);
          margin-bottom: 32px;
        ">🚀 Открыть в Telegram</a>

        <!-- Tariffs -->
        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 16px;">Тарифы</h2>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px;">

          <div style="background: #131313; border: 1px solid #232323; border-radius: 14px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
              <span style="font-size: 16px; font-weight: 700;">Free</span>
              <span style="font-size: 16px; font-weight: 700; color: #aaa;">0 ₽</span>
            </div>
            <p style="margin: 0; font-size: 13px; color: #888;">10 сообщений каждый день бесплатно</p>
          </div>

          <div style="background: #131313; border: 1px solid #232323; border-radius: 14px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
              <span style="font-size: 16px; font-weight: 700;">Basic</span>
              <span style="font-size: 18px; font-weight: 700;">300 ₽ <span style="font-size: 12px; color: #888; font-weight: 500;">/ мес</span></span>
            </div>
            <p style="margin: 0; font-size: 13px; color: #888;">50 сообщений в день · все базовые персонажи · ∞ кастомных</p>
          </div>

          <div style="
            background: linear-gradient(160deg, #1d1538 0%, #14102a 100%);
            border: 1.5px solid rgba(124, 92, 255, 0.5);
            box-shadow: 0 0 24px rgba(124, 92, 255, 0.15);
            border-radius: 14px; padding: 16px; position: relative;
          ">
            <span style="
              position: absolute; top: -10px; right: 14px;
              background: linear-gradient(135deg, #7c5cff, #ff5cdb);
              color: #fff; font-size: 10px; font-weight: 800;
              letter-spacing: 0.5px; padding: 3px 8px; border-radius: 6px;
            ">ХИТ</span>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
              <span style="
                font-size: 16px; font-weight: 700;
                background: linear-gradient(135deg, #c9b8ff, #ff9ee6);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
              ">Premium</span>
              <span style="font-size: 18px; font-weight: 700;">750 ₽ <span style="font-size: 12px; color: #b8a8d8; font-weight: 500;">/ мес</span></span>
            </div>
            <p style="margin: 0; font-size: 13px; color: #b8a8d8;">200 сообщений в день · все персонажи · расширенная память диалогов</p>
          </div>

          <div style="background: #131313; border: 1px solid #232323; border-radius: 14px; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
              <span style="font-size: 16px; font-weight: 700;">Day Pass</span>
              <span style="font-size: 16px; font-weight: 700;">75 ₽</span>
            </div>
            <p style="margin: 0; font-size: 13px; color: #888;">+100 сообщений сверх дневного лимита на 24 часа (только при активной подписке)</p>
          </div>
        </div>

        <!-- Info sections -->
        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px;">Как это работает</h2>
        <ol style="
          color: #aaa; font-size: 14px; line-height: 1.6;
          padding-left: 20px; margin: 0 0 32px;
        ">
          <li style="margin-bottom: 8px;">Открой бот @InterstellarAiBot в Telegram</li>
          <li style="margin-bottom: 8px;">Запусти Mini App кнопкой «Открыть»</li>
          <li style="margin-bottom: 8px;">Выбери персонажа и начни диалог</li>
          <li>Первые 10 сообщений — бесплатно</li>
        </ol>

        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px;">Возврат и отмена подписки</h2>
        <p style="color: #aaa; font-size: 14px; line-height: 1.6; margin: 0 0 32px;">
          Подписка отменяется в любой момент в Telegram (Настройки → Платежи → Подписки)
          или через команду <code style="background:#1a1a1a;padding:2px 6px;border-radius:4px;">/paysupport</code> в боте.
          Возврат средств — в соответствии со ст. 32 ЗоЗПП РФ.
          Day Pass возврату не подлежит после начала использования.
        </p>

        <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px;">Контакты</h2>
        <div style="
          background: #111; border-radius: 14px; padding: 16px;
          color: #aaa; font-size: 13px; line-height: 1.7; margin-bottom: 32px;
        ">
          <div>Telegram: <a href="https://t.me/InterstellarAiBot" style="color: #c9b8ff; text-decoration: none;">@InterstellarAiBot</a></div>
          <div>Email: <a href="mailto:apppartners@mail.ru" style="color: #c9b8ff; text-decoration: none;">apppartners@mail.ru</a></div>
          <div>Поддержка по платежам: команда <code style="background:#1a1a1a;padding:1px 5px;border-radius:3px;font-size:12px;">/paysupport</code> в боте</div>
        </div>

        <p style="
          color: #555; font-size: 11px; line-height: 1.5; text-align: center; margin: 24px 0 0;
        ">
          Все ответы персонажей сгенерированы ИИ и носят развлекательный характер.<br>
          Не используйте для медицинских, юридических или финансовых решений.<br>
          © 2026 Интерстеллар. Самозанятый РФ.
        </p>

      </div>
    </div>
  `
}
