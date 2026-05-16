import { useNavigate, useLocation } from 'react-router-dom'
import { theme } from '../theme'
import { NavHomeIcon, NavCatalogIcon, NavMyIcon, NavProfileIcon } from '../icons'
import { useApp } from '../context/AppContext'
import styles from './BottomNav.module.css'

export type ActiveTab = 'home' | 'library' | 'mine' | 'profile'

interface Props {
  activeTab?: ActiveTab
}

export function BottomNav({ activeTab }: Props) {
  const nav = useNavigate()
  const loc = useLocation()
  const { setLibraryFilter } = useApp()

  // Если activeTab не передан — выводим из текущего пути.
  const tab: ActiveTab = activeTab ?? deriveTabFromPath(loc.pathname)
  const c = (t: ActiveTab) => (tab === t ? theme.accentLight : theme.text3)

  const goLibrary = (filter: 'all' | 'mine') => {
    setLibraryFilter(filter)
    nav('/library')
  }

  return (
    <nav className={styles.container}>
      <button className={styles.item} onClick={() => nav('/')}>
        <NavHomeIcon color={c('home')} />
        <span className={styles.label} style={{ color: c('home') }}>Главная</span>
      </button>

      <button className={styles.item} onClick={() => goLibrary('all')}>
        <NavCatalogIcon color={c('library')} />
        <span className={styles.label} style={{ color: c('library') }}>Каталог</span>
      </button>

      <button className={styles.item} onClick={() => nav('/create')} aria-label="Создать персонажа">
        <span className={styles.addBtn}>
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M3 9h12" stroke="black" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <button className={styles.item} onClick={() => goLibrary('mine')}>
        <NavMyIcon color={c('mine')} />
        <span className={styles.label} style={{ color: c('mine') }}>Мои</span>
      </button>

      <button className={styles.item} onClick={() => nav('/profile')}>
        <NavProfileIcon color={c('profile')} />
        <span className={styles.label} style={{ color: c('profile') }}>Профиль</span>
      </button>
    </nav>
  )
}

function deriveTabFromPath(path: string): ActiveTab {
  if (path.startsWith('/library')) return 'library'
  if (path.startsWith('/profile')) return 'profile'
  if (path.startsWith('/create')) return 'home' // нет вкладки Create, но + в центре — visually neutral
  return 'home'
}
