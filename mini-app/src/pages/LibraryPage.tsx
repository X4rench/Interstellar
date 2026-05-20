import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../data/characters'
import { getCharacterGradient } from '../utils/gradients'
import { SearchIcon } from '../icons'
import { CharacterIcon } from '../components/CharacterIcon'
import { BottomNav } from '../components/BottomNav'

import styles from './LibraryPage.module.css'

type SortKey = 'alpha' | 'new'

// TABS вычисляются динамически из персонажей в компоненте (см. useMemo ниже).

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
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


export function LibraryPage() {
  const nav = useNavigate()
  const { characters, libraryFilter, setLibraryFilter, isPremiumTier, favorites } = useApp()

  const [activeTab, setActiveTab] = useState<string>('Все')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('new')
  const [sortVisible, setSortVisible] = useState(false)

  const isMine = libraryFilter === 'mine'
  const isFavorites = libraryFilter === 'favorites'

  // Скрываем 18+ персонажей от не-Premium для каталога/избранного — требование
  // модерации платёжных систем (adult-контент только за подпиской).
  // НО! Для "Мои" фильтр не применяем: юзер всегда видит СВОИХ персонажей,
  // даже если он создал их с NSFW=true и не имеет Premium. Иначе мы бы
  // прятали его собственный контент и он бы думал что "не сохранилось".
  const visibleCharacters = useMemo(
    () => characters.filter((c) => !c.isNSFW || isPremiumTier),
    [characters, isPremiumTier],
  )

  // Источник для всех вычислений на странице. Зависит от libraryFilter.
  // Для 'mine' — берём из characters напрямую (без NSFW-фильтра).
  // Для 'favorites' — пересекаем visibleCharacters с favorites (NSFW сохраняем).
  // Для 'all' — visibleCharacters.
  const sourceCharacters = useMemo(() => {
    if (isMine) return characters.filter((c) => c.userCreated)
    if (isFavorites) return visibleCharacters.filter((c) => favorites.includes(c.id))
    return visibleCharacters
  }, [characters, visibleCharacters, isMine, isFavorites, favorites])

  // Динамические табы: только те категории где реально есть персонажи.
  // Пустые категории — скрываем чтобы юзер не тапал в "Ничего не найдено".
  const TABS = useMemo(() => {
    const usedCats = new Set(sourceCharacters.map((c) => c.category))
    return ['Все', ...CATEGORIES.slice(1).filter((cat) => usedCats.has(cat))]
  }, [sourceCharacters])

  // Reset activeTab если выбранная категория исчезла (например при свитче
  // между фильтрами).
  useEffect(() => {
    if (!TABS.includes(activeTab)) setActiveTab('Все')
  }, [TABS, activeTab])

  const filtered = useMemo(() => {
    let list = sourceCharacters
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
      if (sortKey === 'alpha') return a.name.localeCompare(b.name, 'ru')
      if (sortKey === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      return 0
    })
  }, [sourceCharacters, activeTab, search, sortKey])

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? ''

  // Названия для трёх режимов фильтра — заголовок страницы и empty-state.
  const pageTitle = isMine ? 'Мои персонажи' : isFavorites ? 'Избранное' : 'Каталог'
  const emptyText = isMine
    ? 'Вы ещё не создали персонажей'
    : isFavorites
      ? 'Нет избранных. Открой персонажа и нажми ⭐, чтобы добавить.'
      : 'Ничего не найдено'

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{pageTitle}</h1>
          {(isMine || isFavorites) && (
            <button className={styles.showAll} onClick={() => setLibraryFilter('all')}>
              Все →
            </button>
          )}
        </div>

        {/* Сегмент-контрол: Все / Мои / Избранное.
            Был только переход через BottomNav (Каталог=all, Мои=mine),
            а Избранное вообще было «висячее» — без consumer'а в UI.
            Теперь юзер видит все три режима прямо здесь и в одно касание
            переключается. */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '4px',
            margin: '0 0 10px',
            background: '#131313',
            borderRadius: 12,
            border: '1px solid #232323',
          }}
        >
          {[
            { key: 'all', label: 'Все' },
            { key: 'mine', label: 'Мои' },
            { key: 'favorites', label: 'Избранное' },
          ].map((opt) => {
            const active = libraryFilter === opt.key
            return (
              <button
                key={opt.key}
                onClick={() => setLibraryFilter(opt.key as 'all' | 'mine' | 'favorites')}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#000' : '#aaa',
                  background: active
                    ? 'linear-gradient(135deg, #c9b8ff, #ff9ee6)'
                    : 'transparent',
                  border: 0,
                  borderRadius: 9,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s ease',
                }}
              >
                {opt.label}
                {opt.key === 'favorites' && favorites.length > 0 && (
                  <span style={{ marginLeft: 4, opacity: active ? 0.7 : 0.5 }}>
                    {favorites.length}
                  </span>
                )}
              </button>
            )
          })}
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
            <p className={styles.emptyText}>{emptyText}</p>
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
                </div>
              </button>
            )
          })}
        </div>
        <div style={{ height: 16 }} />
      </div>

      <BottomNav activeTab={isMine ? 'mine' : 'library'} />
      {/* BottomNav подсвечивает Каталог и для 'favorites' — потому что
          в нижней навигации нет отдельной иконки Избранного (5 слотов уже
          заняты). Пользователь переключается на favorites через сегмент
          выше или через карточку «Избранное» в Profile. */}

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
