import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSignal, initData } from '@telegram-apps/sdk-react'

import { SentryErrorBoundary } from './sentry'
import { AppProvider, useApp } from './context/AppContext'
import { AppDialogs } from './components/AppDialogs'

import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { ChatPage } from './pages/ChatPage'
import { CreatePage } from './pages/CreatePage'
import { ProfilePage } from './pages/ProfilePage'
import { PaywallPage } from './pages/PaywallPage'
import { LegalPage } from './pages/LegalPage'
import { AdminPage } from './pages/AdminPage'
import { PartnerPage } from './pages/PartnerPage'

export function App() {
  return (
    <SentryErrorBoundary fallback={<FallbackError />}>
      <AppProvider>
        <BrowserRouter>
          <DevDiagnostics />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/chat/:characterId" element={<ChatPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/partner" element={<PartnerPage />} />
            <Route path="/legal/:docId?" element={<LegalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <PaywallOverlay />
          <AppDialogs />
        </BrowserRouter>
      </AppProvider>
    </SentryErrorBoundary>
  )
}

/**
 * Paywall — модальный оверлей поверх текущего роута. Открывается через
 * useApp().openPaywall(reason). Зачем оверлей, а не отдельный роут:
 *  - Возврат «куда был» автоматический (закрытие модалки оставляет тот же роут)
 *  - Браузерная история не плодится лишним state'ом
 *  - Удобно показывать поверх Chat / Create когда юзер уперся в лимит
 */
function PaywallOverlay() {
  const { paywallReason } = useApp()
  if (!paywallReason) return null
  return <PaywallPage />
}

/**
 * DEV-only: один раз выводит initData/start_param в консоль чтобы было ясно
 * что SDK завёлся и мы видим юзера. На проде ничего не делает.
 */
function DevDiagnostics() {
  const user = useSignal(initData.user)
  const startParam = useSignal(initData.startParam)

  useEffect(() => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[app] initData snapshot:', {
        user: user
          ? { id: user.id, first_name: user.first_name, username: user.username }
          : null,
        startParam,
      })
    }
  }, [user, startParam])

  return null
}

function FallbackError() {
  return (
    <div className="error-screen">
      <h2>Что-то пошло не так</h2>
      <p style={{ opacity: 0.7 }}>Попробуй закрыть и открыть Mini App ещё раз.</p>
    </div>
  )
}
