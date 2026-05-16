import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../data/characters'
import { getCharacterGradient } from '../utils/gradients'
import { SearchIcon, MessageIcon, StarIcon } from '../icons'
import { CharacterIcon } from '../components/CharacterIcon'
import { BottomNav } from '../components/BottomNav'

import styles from './LibraryPage.module.css'

type SortKey = 'rating' | 'messages' | 'alpha' | 'new'

const TABS = ['Все', ...CATEGORIES.slice(1)]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'По рейтингу' },
  { key: 'messages', label: 'По популярности' },
  { key: 'alpha', label: 'По алфавиту' },
  { key: 'new', label: 'Сначала новые' },
]

function FilterIcon({ color = '#888', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M4 8h8M6 12h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M3 8l4 4 6-7" stroke="#000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
  return String(n)
}

export function LibraryPage() {
  const nav = useNavigate()
  const { characters, libraryFilter, setLibraryFilter } = useApp()

  const [activeTab, setActiveTab] = useState<string>('Все')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('rating')
  const [sortVisible, setSortVisible] = useState(false)

  const isMine = libraryFilter === 'mine'

  const filtered = useMemo(() => {
    let list = isMine ? characters.filter((c) => c.userCreated) : characters
    if (activeTab !== 'Все') list = list.filter((c) => c.category === activeTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    return [...list].sort((a, b) => {
      if (sortKey === 'rating') return b.rating - a.rating
      if (sortKey === 'messages') return b.messages - a.messages
      if (sortKey === 'alpha') return a.name.localeCompare(b.name, 'ru')
      if (sortKey === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      return 0
    })
  }, [characters, activeTab, search, sortKey, isMine])

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? ''

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{isMine ? 'Мои персонажи' : 'Каталог'}</h1>
          {isMine && (
            <button className={styles.showAll} onClick={() => setLibraryFilter('all')}>
              Все →
            </button>
          )}
        </div>

        <div className={styles.searchRow}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            placeholder="Поиск персонажей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={styles.filterBtn}
            onClick={() => setSortVisible(true)}
            aria-label="Сортировка"
          >
            <FilterIcon />
          </button>
        </div>

        <div className={styles.sortHint}>
          <span className={styles.sortHintText}>{currentSortLabel}</span>
        </div>

        <div className={styles.tabsRow}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabOn : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.grid}>
          {filtered.length === 0 && (
            <p className={styles.emptyText}>
              {isMine ? 'Вы ещё не создали персонажей' : 'Ничего не найдено'}
            </p>
          )}
          {filtered.map((c) => {
            const grad = getCharacterGradient(c)
            return (
              <button key={c.id} className={styles.card} onClick={() => nav(`/chat/${c.id}`)}>
                <div
                  className={styles.cardImg}
                  style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
                >
                  <CharacterIcon iconType={c.iconType} size={52} avatarUri={c.avatarUri} />
                  {c.isNSFW && <span className={styles.nsfwBadge}>18+</span>}
                  {(c.isNew || c.userCreated) && (
                    <span
                      className={`${styles.newBadge} ${
                        c.userCreated ? styles.newBadgeMine : ''
                      }`}
                    >
                      {c.userCreated ? 'МОЙ' : 'НОВЫЙ'}
                    </span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardName}>{c.name}</p>
                  <p className={styles.cardSub}>{c.tags.join(' • ')}</p>
                  <div className={styles.cardStats}>
                    <span className={styles.cardStatRow}>
                      <MessageIcon size={10} color="#888" />
                      <span className={styles.cardStat}>{fmtNum(c.messages)}</span>
                    </span>
                    <span className={styles.cardStatRow}>
                      <StarIcon size={10} color="#888" />
                      <span className={styles.cardStat}>{c.rating}</span>
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <div style={{ height: 16 }} />
      </div>

      <BottomNav activeTab={isMine ? 'mine' : 'library'} />

      {sortVisible && (
        <div className={styles.modalOverlay} onClick={() => setSortVisible(false)}>
          <div className={styles.sortCard} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.sortTitle}>Сортировка</h2>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`${styles.sortItem} ${sortKey === opt.key ? styles.sortItemOn : ''}`}
                onClick={() => {
                  setSortKey(opt.key)
                  setSortVisible(false)
                }}
              >
                {opt.label}
                {sortKey === opt.key && <CheckIcon />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
