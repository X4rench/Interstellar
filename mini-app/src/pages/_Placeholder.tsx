import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

interface Props {
  title: string
  phase: string
}

/**
 * Заглушка страницы. Используется на роутах, которые ещё не портированы
 * (Library/Chat/Create/Profile/Paywall/Legal). После Phase 3.3-3.4
 * заменяется реальными компонентами.
 */
export function PlaceholderPage({ title, phase }: Props) {
  const nav = useNavigate()
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        background: '#000',
        padding: 'calc(40px + var(--safe-top)) 20px 0',
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
        Заглушка — будет портирована в {phase}.
      </p>
      <button
        onClick={() => nav('/')}
        style={{
          alignSelf: 'flex-start',
          background: '#7c5cff',
          color: '#fff',
          border: 0,
          borderRadius: 10,
          padding: '10px 16px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        ← На главную
      </button>
      <div style={{ flex: 1 }} />
      <BottomNav />
    </div>
  )
}
