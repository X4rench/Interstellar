import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useApp, type Message } from '../context/AppContext'
import { sendMessage as apiSendMessage, type ChatMessage, ApiError } from '../utils/api'
import { composePersona, getMoodLabel } from '../utils/moods'
import { isConsentValid } from '../utils/consent'
import { getCharacterGradient } from '../utils/gradients'
import { getMockResponse } from '../utils/mockAI'

import {
  BackIcon,
  SendIcon,
  SmileIcon,
  LightningIcon,
  ChevronRightIcon,
} from '../icons'
import { CharacterIcon } from '../components/CharacterIcon'
import { MoodPickerModal } from '../components/MoodPickerModal'
import { AgeGateModal } from '../components/AgeGateModal'
import { appConfirm } from '../components/AppDialogs'

import styles from './ChatPage.module.css'

function StarIconSmall({ filled, color = '#888', size = 18 }: { filled?: boolean; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1l2 6h6L12 11l2 6-5-3.5L4 17l2-6L1 7h6z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </svg>
  )
}

function MoreIcon({ color = '#888', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx={9} cy={9} r={1.5} fill={color} />
      <circle cx={14} cy={9} r={1.5} fill={color} />
      <circle cx={4} cy={9} r={1.5} fill={color} />
    </svg>
  )
}

function ClockIcon({ color = '#888' }: { color?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <circle cx={9} cy={9} r={7.5} stroke={color} strokeWidth={1.4} />
      <path d="M9 5v4l3 2" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  )
}

function formatTime() {
  const now = new Date()
  return now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0')
}

export function ChatPage() {
  const nav = useNavigate()
  const { characterId = '' } = useParams<{ characterId: string }>()

  const {
    characters,
    chats,
    addMessage,
    clearChat,
    deleteCharacter,
    userAvatarLetter,
    favorites,
    toggleFavorite,
    characterMoods,
    setCharacterMood,
    tier,
    dailyLimitReached,
    freeMessagesRemaining,
    freeMessagesLifetime,
    openPaywall,
    refreshSubscription,
  } = useApp()

  const character = characters.find((c) => c.id === characterId)

  // ── State ─────────────────────────────────────────────────────────
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [moodPickerVisible, setMoodPickerVisible] = useState(false)
  const [nsfwGateVisible, setNsfwGateVisible] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  const messages: Message[] = character ? chats[character.id] || [] : []
  const isEmptyChat = messages.length === 0
  const isFavorite = character ? favorites.includes(character.id) : false
  const currentMood = character ? characterMoods[character.id] ?? null : null

  // Если персонаж не нашёлся — редирект на главную (URL мог быть стейл).
  useEffect(() => {
    if (characterId && !character) nav('/', { replace: true })
  }, [characterId, character, nav])

  // Возрастной gate при первом открытии NSFW персонажа.
  useEffect(() => {
    if (!character?.isNSFW) return
    isConsentValid('age_18').then((ok) => {
      if (!ok) setNsfwGateVisible(true)
    })
  }, [character?.id, character?.isNSFW])

  // Первое сообщение — добавляем когда чат пустой (включая после clearChat).
  useEffect(() => {
    if (!character || !isEmptyChat) return
    addMessage(character.id, {
      id: `${character.id}_first`,
      role: 'character',
      text: character.firstMessage,
      time: formatTime(),
      date: new Date().toISOString(),
    })
  }, [character?.id, isEmptyChat, addMessage, character])

  // Скролл вниз на новых сообщениях.
  useEffect(() => {
    const el = messagesRef.current
    if (!el) return
    // Лёгкая задержка чтобы DOM успел отрисовать новый bubble.
    const t = setTimeout(() => {
      el.scrollTop = el.scrollHeight
    }, 50)
    return () => clearTimeout(t)
  }, [messages.length, isTyping])

  // ── Send message ──────────────────────────────────────────────────
  const sendMessageToChar = useCallback(async () => {
    if (!character) return
    const text = inputText.trim()
    if (!text || isTyping) return

    if (dailyLimitReached) {
      openPaywall('limit')
      return
    }
    setInputText('')

    addMessage(character.id, {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text,
      time: formatTime(),
      date: new Date().toISOString(),
    })
    setIsTyping(true)

    const persona = composePersona(character.persona, currentMood, character.gender)
    const history: ChatMessage[] = [
      ...messages.map((m) => ({ role: m.role, content: m.text })),
      { role: 'user', content: text },
    ]

    try {
      const responseText = await apiSendMessage(persona, history)
      addMessage(character.id, {
        id: `msg_${Date.now()}_c`,
        role: 'character',
        text: responseText,
        time: formatTime(),
        date: new Date().toISOString(),
      })
    } catch (err) {
      // Если бэк вернул LIFETIME_LIMIT_EXCEEDED (free юзер исчерпал 10 msg)
      // или DAILY_LIMIT_EXCEEDED (платный юзер на дневном лимите) — открываем
      // paywall вместо ошибки в чате. Это критично для UX: юзер должен
      // понять что он упёрся в лимит, а не «глюки сети».
      if (err instanceof ApiError && err.status === 429) {
        if (err.code === 'LIFETIME_LIMIT_EXCEEDED' || err.code === 'DAILY_LIMIT_EXCEEDED') {
          // Освежим subscription/tier чтобы UI обновился.
          refreshSubscription()
          openPaywall('limit')
          return
        }
      }

      // Production: явная ошибка вместо mock'а — честнее по отношению к юзеру.
      // В DEV mock-фолбэк остаётся, чтобы не блокировать разработку.
      let errorText = 'Не удалось получить ответ. Проверьте интернет и попробуйте снова.'
      if (import.meta.env.DEV) {
        try {
          errorText = await getMockResponse(character.id)
        } catch {
          /* fallback to hardcoded text */
        }
      }
      addMessage(character.id, {
        id: `msg_${Date.now()}_err`,
        role: 'character',
        text: errorText,
        time: formatTime(),
        date: new Date().toISOString(),
      })
    } finally {
      setIsTyping(false)
    }
  }, [
    character,
    inputText,
    isTyping,
    dailyLimitReached,
    messages,
    currentMood,
    addMessage,
    openPaywall,
    refreshSubscription,
  ])

  // ── Confirms (in-app модалки, защита от блокировки native dialog в TG-WebView) ──
  const handleClearChat = useCallback(async () => {
    if (!character) return
    const ok = await appConfirm({
      title: 'Очистить чат?',
      message: 'Все сообщения с этим персонажем будут удалены.',
      confirmLabel: 'Очистить',
      danger: true,
    })
    if (ok) clearChat(character.id)
  }, [character, clearChat])

  const handleDeleteCharacter = useCallback(async () => {
    if (!character) return
    setMenuVisible(false)
    const ok = await appConfirm({
      title: `Удалить ${character.name}?`,
      message: 'Персонаж и вся история чата с ним будут удалены навсегда.',
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (ok) {
      deleteCharacter(character.id)
      nav('/', { replace: true })
    }
  }, [character, deleteCharacter, nav])

  // ── Early return ──────────────────────────────────────────────────
  if (!character) return null

  const grad = getCharacterGradient(character)
  const gradStyle = { background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }
  const userMsgCount = messages.filter((m) => m.role === 'user').length
  const charMsgCount = messages.filter((m) => m.role === 'character').length

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.iconBtn} onClick={() => nav('/')} aria-label="Назад">
          <BackIcon />
        </button>

        <button className={styles.charInfo}>
          <span className={styles.charAvatar} style={gradStyle}>
            <CharacterIcon iconType={character.iconType} size={20} avatarUri={character.avatarUri} />
          </span>
          <span style={{ minWidth: 0 }}>
            <p className={styles.charName}>{character.name}</p>
            <span className={styles.statusRow}>
              <span className={styles.statusDot} />
              <span className={styles.statusText}>В роли</span>
            </span>
          </span>
        </button>

        <div className={styles.headerActions}>
          <button
            className={styles.iconBtn}
            onClick={() => setMoodPickerVisible(true)}
            aria-label="Стиль общения"
          >
            <SmileIcon size={18} color={currentMood ? '#fff' : '#888'} />
            {currentMood && <span className={styles.moodIndicatorDot} />}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => toggleFavorite(character.id)}
            aria-label="В избранное"
          >
            <StarIconSmall filled={isFavorite} color={isFavorite ? '#fff' : '#888'} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setStatsVisible(true)}
            aria-label="Статистика"
          >
            <ClockIcon />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setMenuVisible(true)}
            aria-label="Ещё"
          >
            <MoreIcon />
          </button>
        </div>
      </header>

      {/* Mood pill */}
      {currentMood && (
        <span className={styles.moodPill}>
          <SmileIcon size={11} color="#888" />
          Стиль: {getMoodLabel(currentMood)}
        </span>
      )}

      {/* Limit warning — показываем только Free юзерам когда осталось мало */}
      {tier === 'free' && freeMessagesRemaining !== null && freeMessagesRemaining <= 5 && (
        <button className={styles.limitBar} onClick={() => openPaywall('limit')}>
          <LightningIcon size={14} color="#fff" />
          <span className={styles.limitBarText}>
            {freeMessagesRemaining === 0
              ? 'Бесплатные сообщения закончились · Открыть подписку'
              : `Осталось ${freeMessagesRemaining}/${freeMessagesLifetime} бесплатных · Подписка для безлимита`}
          </span>
          <ChevronRightIcon color="#888" size={14} />
        </button>
      )}

      {/* Messages */}
      <div className={styles.messages} ref={messagesRef}>
        <div className={styles.dateDivider}>
          <span className={styles.dateLine} />
          <span className={styles.dateText}>Сегодня</span>
          <span className={styles.dateLine} />
        </div>

        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <div
              key={msg.id}
              className={`${styles.msgRow} ${isUser ? styles.msgRowUser : ''}`}
            >
              {!isUser ? (
                <span className={styles.msgAvatar} style={gradStyle}>
                  <CharacterIcon iconType={character.iconType} size={16} avatarUri={character.avatarUri} />
                </span>
              ) : (
                <span className={styles.msgAvatar} style={{ background: '#2A2A2A' }}>
                  {userAvatarLetter}
                </span>
              )}
              <div className={styles.msgContent}>
                <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleChar}`}>
                  {msg.text}
                </div>
                <span className={`${styles.msgTime} ${isUser ? styles.msgTimeUser : ''}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className={styles.typingRow}>
            <span className={styles.msgAvatar} style={gradStyle}>
              <CharacterIcon iconType={character.iconType} size={16} avatarUri={character.avatarUri} />
            </span>
            <div className={styles.typingBubble}>
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
              <span className={styles.typingDot} />
            </div>
          </div>
        )}
      </div>

      {/* Input / limit CTA */}
      <div className={styles.inputWrap}>
        {dailyLimitReached ? (
          <button className={styles.limitCta} onClick={() => openPaywall('limit')}>
            Открыть Pro · безлимит сообщений
          </button>
        ) : (
          <div className={styles.inputRow}>
            <textarea
              className={styles.textInput}
              placeholder={`Написать ${character.name.split(' ')[0]}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                // Enter без Shift — отправка. Shift+Enter — перенос строки.
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessageToChar()
                }
              }}
              maxLength={2000}
              rows={1}
            />
            <button
              className={`${styles.sendBtn} ${!inputText.trim() || isTyping ? styles.sendBtnDisabled : ''}`}
              onClick={sendMessageToChar}
              disabled={!inputText.trim() || isTyping}
              aria-label="Отправить"
            >
              <SendIcon size={16} color="#000" />
            </button>
          </div>
        )}
      </div>

      {/* Menu modal */}
      {menuVisible && (
        <div className={styles.modalOverlay} onClick={() => setMenuVisible(false)}>
          <div className={styles.menuCard} onClick={(e) => e.stopPropagation()}>
            <span className={styles.menuHandle} />
            <p className={styles.menuTitle}>{character.name}</p>
            <button
              className={`${styles.menuItem} ${styles.menuItemDanger}`}
              onClick={() => {
                setMenuVisible(false)
                handleClearChat()
              }}
            >
              Очистить чат
            </button>
            {character.userCreated && (
              <button
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                onClick={handleDeleteCharacter}
              >
                Удалить персонажа
              </button>
            )}
            <span className={styles.menuDivider} />
            <button
              className={`${styles.menuItem} ${styles.menuItemCancel}`}
              onClick={() => setMenuVisible(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Mood picker */}
      <MoodPickerModal
        visible={moodPickerVisible}
        currentMood={currentMood}
        characterIsNsfw={Boolean(character.isNSFW)}
        onSelect={(moodId) => setCharacterMood(character.id, moodId)}
        onClose={() => setMoodPickerVisible(false)}
      />

      {/* Age gate */}
      <AgeGateModal
        visible={nsfwGateVisible}
        onConfirm={() => setNsfwGateVisible(false)}
        onCancel={() => {
          setNsfwGateVisible(false)
          nav('/', { replace: true })
        }}
      />

      {/* Stats modal */}
      {statsVisible && (
        <div className={styles.statsOverlay} onClick={() => setStatsVisible(false)}>
          <div className={styles.statsCard} onClick={(e) => e.stopPropagation()}>
            <span className={styles.statsAvatar} style={gradStyle}>
              <CharacterIcon iconType={character.iconType} size={28} avatarUri={character.avatarUri} />
            </span>
            <h2 className={styles.statsName}>{character.name}</h2>
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{userMsgCount}</span>
                <span className={styles.statLbl}>Ваших</span>
              </div>
              <span className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statVal}>{charMsgCount}</span>
                <span className={styles.statLbl}>Ответов</span>
              </div>
              <span className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statVal}>{messages.length}</span>
                <span className={styles.statLbl}>Всего</span>
              </div>
            </div>
            <button className={styles.statsClose} onClick={() => setStatsVisible(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
