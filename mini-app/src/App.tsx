import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSignal, initData } from '@telegram-apps/sdk-react'

import { SentryErrorBoundary } from './sentry'
import { AppProvider, useApp } from './context/AppContext'
import { AppDialogs } from './components/AppDialogs'
import { OnboardingTour } from './components/OnboardingTour'

import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { ChatPage } from './pages/ChatPage'
import { CreatePage } from './pages/CreatePage'
import { ProfilePage } from './pages/ProfilePage'
import { PaywallPage } from './pages/PaywallPage'
import { LegalPage } from './pages/LegalPage'
import { AdminPage } from './pages/AdminPage'
import { PartnerPage } from './pages/PartnerPage'

/**
 * Ключ в localStorage для отметки прохождения онбординга.
 * Если когда-то понадобится переонбординг (например после большого
 * редизайна) — поменяй версию: 'interstellar_onboarded_v2' и т.д.
 */
const ONBOARDING_KEY = 'interstellar_onboarded_v1'

export function App() {
  // Показываем онбординг при первом заходе. SSR-safe: на сервере
  // typeof localStorage === undefined, поэтому делаем lazy init и
  // защищаем try/catch (Telegram in-app browser может в редких случаях
  // запретить localStorage — лучше тогда не показывать онбординг, чем
  // упасть с белым экраном).
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) !== '1'
    } catch {
      return false
    }
  })

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, '1')
    } catch {
      /* localStorage недоступен — просто закрываем для этой сессии */
    }
    setShowOnboarding(false)
  }

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
          {showOnboarding && <OnboardingTour onComplete={completeOnboarding} />}
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
