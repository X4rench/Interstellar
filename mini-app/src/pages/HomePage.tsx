import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApp } from '../context/AppContext'
import { CATEGORIES, type Character } from '../data/characters'
import { getCharacterGradient } from '../utils/gradients'
import {
  LogoImageSmall,
  SearchIcon,
  ChevronRightIcon,
  AgeRestrictedIcon,
} from '../icons'
import { CharacterIcon } from '../components/CharacterIcon'
import { BottomNav } from '../components/BottomNav'

import styles from './HomePage.module.css'
import invertLogo from '../icons/invertLogo.png'

export function HomePage() {
  const nav = useNavigate()
  const {
    characters,
    chats,
    userAvatarLetter,
    isPremium,
    isPremiumTier,
    canOpenCharacter,
    openPaywall,
  } = useApp()

  const [activeCat, setActiveCat] = useState<string>('Все')
  const [search, setSearch] = useState('')

  // Динамические категории: только непустые. Это синхронизировано с
  // LibraryPage — юзер не видит пустых табов на которые ничего не найдётся.
  const availableCats = useMemo(() => {
    const used = new Set(characters.map((c) => c.category))
    return ['Все', ...CATEGORIES.slice(1).filter((cat) => used.has(cat))]
  }, [characters])

  useEffect(() => {
    if (!availableCats.includes(activeCat)) setActiveCat('Все')
  }, [availableCats, activeCat])

  const featured = useMemo(() => characters.slice(0, 4), [characters])

  const filtered = useMemo(() => {
    let list = characters
    if (activeCat !== 'Все') list = list.filter((c) => c.category === activeCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      )
    }
    return list
  }, [characters, activeCat, search])

  const recentChars = useMemo(
    () => characters.filter((c) => chats[c.id] && chats[c.id].length > 0).slice(0, 4),
    [characters, chats],
  )

  // NSFW-гейт: для NSFW-персонажа без премиума — открывается paywall.
  const openChat = (char: Character) => {
    if (!canOpenCharacter(char)) {
      openPaywall('nsfw')
      return
    }
    nav(`/chat/${char.id}`)
  }

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <div style={{ marginTop: 4 }}>
            <LogoImageSmall size={30} />
          </div>
          <span className={styles.logoText}>интерстеллар</span>
          {/* 18+ метка — 436-ФЗ. Часть приложения содержит контент 18+. */}
          <span
            style={{
              marginLeft: 6,
              fontSize: 10,
              fontWeight: 800,
              color: '#fff',
              background: '#7c5cff',
              padding: '2px 5px',
              borderRadius: 4,
              letterSpacing: 0.3,
            }}
            aria-label="Возрастная маркировка 18 плюс"
            title="Часть контента предназначена для совершеннолетних"
          >
            18+
          </span>
        </div>
        <button className={styles.avatar} onClick={() => nav('/profile')} aria-label="Профиль">
          {userAvatarLetter}
        </button>
      </header>

      {/* AI Disclaimer — компактная плашка под header */}
      <div
        style={{
          margin: '14px 16px 10px',
          padding: '10px 14px',
          background: 'rgba(124,92,255,0.08)',
          border: '1px solid rgba(124,92,255,0.2)',
          borderRadius: 10,
          fontSize: 11,
          color: '#a89cff',
          lineHeight: 1.4,
          textAlign: 'center',
        }}
      >
        Ответы персонажей сгенерированы ИИ и носят развлекательный характер. Не используй для медицинских, юридических или финансовых решений.
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <SearchIcon />
        <input
          className={styles.searchInput}
          placeholder="Найти персонажа или кумира..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Категории — пилюли всегда видимы. Тап на категорию = фильтрация.
            Показываем только те категории где реально есть персонажи. */}
        <div className={styles.hScroll}>
          {availableCats.map((cat) => (
            <button
              key={cat}
              className={`${styles.catPill} ${activeCat === cat ? styles.catPillOn : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Если активен фильтр (поиск или категория ≠ Все) — показываем list. */}
        {(search.trim() || activeCat !== 'Все') ? (
          <>
            <div className={styles.secRow}>
              <h2 className={styles.secTitle}>
                {search.trim() && activeCat !== 'Все'
                  ? `${activeCat} + «${search}»: ${filtered.length}`
                  : search.trim()
                    ? `Результаты: ${filtered.length}`
                    : `${activeCat}: ${filtered.length}`}
              </h2>
            </div>
            <div className={styles.recentList}>
              {filtered.map((c) => {
                const grad = getCharacterGradient(c)
                return (
                  <button
                    key={c.id}
                    className={styles.recentItem}
                    onClick={() => openChat(c)}
                  >
                    <div
                      className={styles.recentAvatar}
                      style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
                    >
                      <CharacterIcon iconType={c.iconType} size={26} avatarUri={c.avatarUri} />
                    </div>
                    <div className={styles.recentInfo}>
                      <p className={styles.recentName}>{c.name}</p>
                      <p className={styles.recentMsg}>{c.description}</p>
                    </div>
                    <ChevronRightIcon color="#666" />
                  </button>
                )
              })}
              {filtered.length === 0 && (
                <p className={styles.emptyText}>
                  В категории «{activeCat}» пока нет персонажей. Скоро добавим ✨
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Default Home: Популярные + Недавние + Pro banner */}
            <div className={styles.secRow}>
              <h2 className={styles.secTitle}>Популярные</h2>
              <button className={styles.secMore} onClick={() => nav('/library')}>
                Все →
              </button>
            </div>

            <div className={styles.hScroll}>
              {featured.map((c) => {
                const locked = c.isNSFW && !isPremiumTier
                const grad = getCharacterGradient(c)
                return (
                  <button
                    key={c.id}
                    className={styles.featCard}
                    onClick={() => openChat(c)}
                  >
                    <div
                      className={styles.featImg}
                      style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
                    >
                      <CharacterIcon iconType={c.iconType} size={52} avatarUri={c.avatarUri} />
                    </div>
                    {locked ? (
                      <span className={`${styles.featBadge} ${styles.featBadgeLock}`}>
                        <AgeRestrictedIcon size={10} color="#FFFFFF" />
                        PRO
                      </span>
                    ) : c.isNew ? (
                      <span className={styles.featBadge}>ТОП</span>
                    ) : null}
                    <div className={styles.featInfo}>
                      <p className={styles.featName}>{c.name}</p>
                      <p className={styles.featDesc}>{c.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Pro upgrade */}
            {!isPremium && (
              <button className={styles.upgradeBanner} onClick={() => openPaywall('manual')}>
                <img src={invertLogo} alt="" className={styles.upgradeLogo} />
                <div style={{ flex: 1 }}>
                  <p className={styles.upgradeTitle}>Интерстеллар Pro</p>
                  <p className={styles.upgradeSub}>Безлимит сообщений · 18+ персонажи</p>
                </div>
                <ChevronRightIcon color="#888" />
              </button>
            )}

            {/* Недавние */}
            <div className={styles.secRow}>
              <h2 className={styles.secTitle}>Недавние</h2>
            </div>
            <div className={styles.recentList}>
              {recentChars.length === 0 ? (
                <p className={styles.emptyText}>Начните чат с персонажем →</p>
              ) : (
                recentChars.map((c) => {
                  const msgs = chats[c.id] || []
                  const lastMsg = msgs[msgs.length - 1]
                  const grad = getCharacterGradient(c)
                  return (
                    <button
                      key={c.id}
                      className={styles.recentItem}
                      onClick={() => openChat(c)}
                    >
                      <div
                        className={styles.recentAvatar}
                        style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
                      >
                        <CharacterIcon iconType={c.iconType} size={26} avatarUri={c.avatarUri} />
                      </div>
                      <div className={styles.recentInfo}>
                        <p className={styles.recentName}>{c.name}</p>
                        <p className={styles.recentMsg}>
                          {lastMsg
                            ? (lastMsg.role === 'user' ? 'Вы: ' : '') + lastMsg.text
                            : c.firstMessage}
                        </p>
                      </div>
                      <div className={styles.recentMeta}>
                        <span className={styles.recentTime}>{lastMsg?.time ?? ''}</span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </>
        )}

        <div style={{ height: 16 }} />
      </div>

      <BottomNav activeTab="home" />
    </div>
  )
}
