import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useSignal, initData } from '@telegram-apps/sdk-react'

import { BUILT_IN_CHARACTERS, type Character } from '../data/characters'
import { getMe, publicGetCharacters, getBackendRoot, type MeSubscription, type Tier, ApiError } from '../utils/api'
import { logSecurityEvent } from '../utils/securityLog'
import { deleteAvatar, wipeAllAvatars } from '../utils/avatarStorage'
import type { LegalDocId } from '../utils/consent'

// ─── типы ────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  role: 'user' | 'character'
  text: string
  time: string
  date: string
}

export type PaywallReason = 'nsfw' | 'limit' | 'create-limit' | 'manual'

// Plan-коды subscriptions. После миграции 004 бэк возвращает basic_month |
// premium_month. 'month' оставляем как legacy-алиас на случай если у юзера
// в локальном кеше Subscription лежит старый формат (мы его сразу освежим
// при refreshSubscription).
export type PlanId = 'basic_month' | 'premium_month' | 'month'

// На клиенте используется упрощённый Subscription — то, что приходит с бэка
// /users/me. ISO-строки, без cancelledAt/payment_id (бэк сам разруливает).
export interface Subscription {
  plan: PlanId
  startedAt: string
  expiresAt: string
  isTrial: boolean
  cancelledAt?: string | null
  /** Для yookassa-подписок: включено ли автопродление (cron спишет через 30 дней). */
  autoRenew?: boolean
  /** Источник подписки. Кнопка отмены автопродления нужна только для 'yookassa'. */
  source?: 'stars' | 'yookassa'
}

// Free-tier лимиты — точка истины. Тюнить отсюда.
// FREE_DAILY_MESSAGES — устарел (used только в legacy frontend warning).
// Реальный лимит Free теперь — pожизненный, см. freeMessagesLifetime из /users/me.
export const FREE_DAILY_MESSAGES = 10
// Custom characters теперь доступны ВСЕМ юзерам без лимита — они хранятся
// в localStorage пользователя и не стоят нам ничего. Removed paywall gate.
export const FREE_CUSTOM_CHARS = Infinity

// ─── localStorage ключи ─────────────────────────────────────────────────

const LS_CHATS = 'chats_v1'
const LS_CUSTOM_CHARS = 'customCharacters_v1'
const LS_FAVORITES = 'favorites_v1'
const LS_MOODS = 'character_moods_v1'
const LS_LIBRARY_FILTER = 'library_filter_v1'

// ─── Context shape ───────────────────────────────────────────────────────

export type UserRole = 'admin' | 'partner' | 'regular'

export interface PartnerPublicInfo {
  blogger_slug: string
  revenue_share_bps: number
  pii_provided: boolean
}

interface AppContextValue {
  // Профиль из TG initData (в отличие от RN, отдельного login flow нет).
  userName: string
  userAvatarLetter: string

  // RBAC роль (из /users/me). По умолчанию 'regular' пока запрос не дошёл.
  role: UserRole
  isAdmin: boolean
  isPartner: boolean
  partnerInfo: PartnerPublicInfo | null
  /** Реквизиты бота (для генерации партнёрских ссылок). Из /users/me. */
  botUsername: string | null
  botAppName: string

  // Персонажи: встроенные + кастомные.
  characters: Character[]
  addCharacter: (c: Character) => void
  deleteCharacter: (id: string) => void
  customCharsCount: number

  // Чаты.
  chats: Record<string, Message[]>
  addMessage: (characterId: string, m: Message) => void
  clearChat: (characterId: string) => void
  clearAllChats: () => void

  // Избранное.
  favorites: string[]
  toggleFavorite: (id: string) => void

  // Mood per character.
  characterMoods: Record<string, string>
  setCharacterMood: (characterId: string, moodId: string | null) => void

  // Library filter. 'all' = весь каталог, 'mine' = user-created,
  // 'favorites' = всё что юзер пометил ❤ (любая категория).
  libraryFilter: 'all' | 'mine' | 'favorites'
  setLibraryFilter: (f: 'all' | 'mine' | 'favorites') => void

  // Premium / подписка (источник истины — бэкенд).
  subscription: Subscription | null
  isPremium: boolean              // true для basic ИЛИ premium tier (любая платная)
  /** Тарифная градация. Используется для фича-гейтов (NSFW = только premium). */
  tier: Tier
  /** Активный Day Pass — снимает дневной лимит. */
  dayPassActive: boolean
  /** Удобный флаг: реальный Premium (а не просто Basic). */
  isPremiumTier: boolean
  /** Сколько осталось бесплатных сообщений сегодня (null = ещё не загрузили). */
  freeMessagesRemaining: number | null
  /** Total дневная квота Free (для прогресс-бара / paywall копии). */
  freeMessagesLifetime: number
  refreshSubscription: () => Promise<void>
  subscriptionLoading: boolean
  /** Сообщение об ошибке /users/me, если бэк недоступен или 401. */
  subscriptionError: string | null

  // Paywall.
  paywallReason: PaywallReason | null
  openPaywall: (reason: PaywallReason) => void
  closePaywall: () => void

  // Derived limits.
  todayMessageCount: number
  streakDays: number
  dailyLimitReached: boolean
  customLimitReached: boolean
  canOpenCharacter: (c: Character) => boolean

  // Legal — текущий открытый документ (для модалки legal-screen).
  legalDocId: LegalDocId | null
  setLegalDocId: (id: LegalDocId | null) => void

  // Полное удаление аккаунта (152-ФЗ): чистит локальные данные.
  // Серверного аккаунта в строгом смысле нет — есть только трекинг
  // в users/subscriptions/attributions, юзер их не запрашивал явно
  // (создались автоматически при первом /users/me).
  // Phase 3 — только локальный wipe; Phase 5/6 — добавим server-side
  // /users/delete-me с зачисткой PII.
  deleteAccountFully: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── localStorage helpers ───────────────────────────────────────────────

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota exceeded или private mode — игнорируем */
  }
}

// Преобразование Subscription из бэк-формата в клиентский.
function fromMeSubscription(s: MeSubscription | null): Subscription | null {
  if (!s) return null
  return {
    plan: s.plan as PlanId,
    startedAt: s.started_at,
    expiresAt: s.expires_at,
    isTrial: s.is_trial,
    cancelledAt: s.cancelled_at,
    autoRenew: s.auto_renew,
    source: s.source,
  }
}

// ─── Provider ───────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const tgUser = useSignal(initData.user)

  // Initial state из localStorage (синхронно — localStorage sync API).
  const [characters, setCharacters] = useState<Character[]>(() => {
    const custom = loadJSON<Character[]>(LS_CUSTOM_CHARS, [])
    return [...BUILT_IN_CHARACTERS, ...custom]
  })
  const [chats, setChats] = useState<Record<string, Message[]>>(() =>
    loadJSON<Record<string, Message[]>>(LS_CHATS, {}),
  )
  const [favorites, setFavorites] = useState<string[]>(() => loadJSON<string[]>(LS_FAVORITES, []))
  const [characterMoods, setCharacterMoodsState] = useState<Record<string, string>>(() =>
    loadJSON<Record<string, string>>(LS_MOODS, {}),
  )
  const [libraryFilter, setLibraryFilterState] = useState<'all' | 'mine' | 'favorites'>(() => {
    // Backwards-compat: старый формат был 'all' | 'mine'. Если в LS что-то
    // невалидное — fallback на 'all'.
    const raw = loadJSON<'all' | 'mine' | 'favorites'>(LS_LIBRARY_FILTER, 'all')
    return raw === 'mine' || raw === 'favorites' ? raw : 'all'
  })
  const [legalDocId, setLegalDocId] = useState<LegalDocId | null>(null)

  // Premium state — приходит с бэка.
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [tier, setTier] = useState<Tier>('free')
  const [dayPassActive, setDayPassActive] = useState(false)
  // Сколько у юзера осталось бесплатных сообщений на сегодня.
  // Сбрасывается в полночь UTC. Если 0 и tier='free' — лимит дня исчерпан.
  const [freeMessagesRemaining, setFreeMessagesRemaining] = useState<number | null>(null)
  const [freeMessagesLifetime, setFreeMessagesLifetime] = useState<number>(10)

  // Role state (с бэка через /users/me). Default 'regular' пока запрос не дошёл.
  const [role, setRole] = useState<UserRole>('regular')
  const [partnerInfo, setPartnerInfo] = useState<PartnerPublicInfo | null>(null)
  const [botUsername, setBotUsername] = useState<string | null>(null)
  const [botAppName, setBotAppName] = useState<string>('app')

  // Paywall.
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null)

  // ─── refreshSubscription (+ role) ──────────────────────────────────
  const refreshSubscription = useCallback(async () => {
    setSubscriptionLoading(true)
    setSubscriptionError(null)
    try {
      const me = await getMe()
      setSubscription(fromMeSubscription(me.subscription))
      // Role, tier, partner-info — из того же endpoint'а.
      // Backwards-compat: если бэк старый и не возвращает поля — оставляем default.
      type MeWithExtras = typeof me & {
        role?: UserRole
        partner?: PartnerPublicInfo | null
      }
      const m = me as MeWithExtras
      if (m.role) setRole(m.role)
      setPartnerInfo(m.partner ?? null)
      setTier(me.tier ?? 'free')
      setDayPassActive(me.day_pass_active === true)
      // One-shot Free квота. Если бэк не вернул (старая версия) — оставляем null.
      if (typeof me.free_messages_remaining === 'number') {
        setFreeMessagesRemaining(me.free_messages_remaining)
      }
      if (typeof me.free_messages_lifetime === 'number') {
        setFreeMessagesLifetime(me.free_messages_lifetime)
      }
      if (me.bot) {
        setBotUsername(me.bot.username)
        setBotAppName(me.bot.app_name)
      }
    } catch (err) {
      const code = err instanceof ApiError ? err.code : String(err)
      setSubscriptionError(code)
      if (err instanceof ApiError && err.status === 401) {
        logSecurityEvent('init_data_rejected', { code })
      }
    } finally {
      setSubscriptionLoading(false)
    }
  }, [])

  // На старте — один раз дёргаем /users/me (создаёт юзера на бэке +
  // фиксирует start_param + возвращает текущий subscription).
  useEffect(() => {
    refreshSubscription()
  }, [refreshSubscription])

  // На возврате focus (например, юзер вышел оплатить Stars и вернулся) —
  // пере-поллим, чтобы поймать свежий subscription.
  // Debounce 600ms: iOS/Telegram WebView может стрельнуть несколько событий
  // подряд при возврате из браузера → без debounce множественные
  // refreshSubscription() вызывают каскад setState и мигание PaywallPage.
  useEffect(() => {
    let debounceTimer: number | undefined
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(debounceTimer)
        debounceTimer = window.setTimeout(() => {
          refreshSubscription()
        }, 600)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimeout(debounceTimer)
    }
  }, [refreshSubscription])

  // ─── DB Characters (from backend) ───────────────────────────────────
  // Loaded once on mount; merged with BUILT_IN_CHARACTERS (DB takes precedence
  // on id collision, allowing overrides) and user-created custom chars.
  useEffect(() => {
    publicGetCharacters()
      .then((res) => {
        if (res.characters.length === 0) return
        const backendRoot = getBackendRoot()
        const dbChars: Character[] = res.characters.map((c) => ({
          id:          c.id,
          name:        c.name,
          description: c.description,
          category:    c.category,
          iconType:    c.iconType,
          gradientKey: c.gradientKey,
          tags:        c.tags,
          messages:    c.messages,
          rating:      c.rating,
          isNew:       c.isNew,
          isNSFW:      c.isNSFW,
          firstMessage: c.firstMessage,
          persona:     c.persona,
          gender:      c.gender as Character['gender'],
          era:         c.era,
          signature:   c.signature,
          opinions:    c.opinions,
          // Resolve relative /uploads/... path to absolute URL
          avatarUri:   c.photo_url ? backendRoot + c.photo_url : undefined,
          photo_url:   c.photo_url ? backendRoot + c.photo_url : undefined,
        }))

        setCharacters((prev) => {
          const dbIds   = new Set(dbChars.map((c) => c.id))
          const custom  = prev.filter((c) => c.userCreated) // keep user-created
          // Remove any built-ins that DB overrides, keep user-created untouched
          const others  = prev.filter((c) => !c.userCreated && !dbIds.has(c.id))
          return [...dbChars, ...others, ...custom]
        })
      })
      .catch(() => {
        /* Fail silently — built-in characters still work without DB */
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Characters ─────────────────────────────────────────────────────
  const addCharacter = useCallback((c: Character) => {
    setCharacters((prev) => {
      const updated = [...prev, c]
      saveJSON(LS_CUSTOM_CHARS, updated.filter((x) => x.userCreated))
      return updated
    })
  }, [])

  const deleteCharacter = useCallback((id: string) => {
    setCharacters((prev) => {
      const updated = prev.filter((c) => c.id !== id)
      saveJSON(LS_CUSTOM_CHARS, updated.filter((c) => c.userCreated))
      return updated
    })
    setChats((prev) => {
      const updated = { ...prev }
      delete updated[id]
      saveJSON(LS_CHATS, updated)
      return updated
    })
    // Удаляем аватар из IndexedDB. Идемпотентно: если файла не было — no-op.
    deleteAvatar(id).catch(() => {
      /* swallow — основная логика уже сработала */
    })
  }, [])

  // ─── Chats ──────────────────────────────────────────────────────────
  const addMessage = useCallback((characterId: string, m: Message) => {
    setChats((prev) => {
      const updated = { ...prev, [characterId]: [...(prev[characterId] || []), m] }
      saveJSON(LS_CHATS, updated)
      return updated
    })
  }, [])

  const clearChat = useCallback((characterId: string) => {
    setChats((prev) => {
      const updated = { ...prev, [characterId]: [] }
      saveJSON(LS_CHATS, updated)
      return updated
    })
  }, [])

  const clearAllChats = useCallback(() => {
    setChats({})
    try {
      localStorage.removeItem(LS_CHATS)
    } catch {
      /* ignore */
    }
  }, [])

  // ─── Favorites / Moods / Filter ─────────────────────────────────────
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      saveJSON(LS_FAVORITES, updated)
      return updated
    })
  }, [])

  const setCharacterMood = useCallback((characterId: string, moodId: string | null) => {
    setCharacterMoodsState((prev) => {
      const updated = { ...prev }
      if (moodId === null) delete updated[characterId]
      else updated[characterId] = moodId
      saveJSON(LS_MOODS, updated)
      return updated
    })
  }, [])

  const setLibraryFilter = useCallback((f: 'all' | 'mine' | 'favorites') => {
    setLibraryFilterState(f)
    saveJSON(LS_LIBRARY_FILTER, f)
  }, [])

  // ─── Paywall ────────────────────────────────────────────────────────
  const openPaywall = useCallback((reason: PaywallReason) => setPaywallReason(reason), [])
  const closePaywall = useCallback(() => setPaywallReason(null), [])

  // ─── Derived ────────────────────────────────────────────────────────
  // isPremium теперь = любая платная подписка (Basic или Premium).
  // Для NSFW и эксклюзивных фич используй isPremiumTier (только true Premium).
  const isPremium = useMemo(() => tier !== 'free', [tier])
  const isPremiumTier = useMemo(() => tier === 'premium', [tier])

  const customCharsCount = useMemo(
    () => characters.filter((c) => c.userCreated).length,
    [characters],
  )

  const todayMessageCount = useMemo(() => {
    const todayStr = new Date().toDateString()
    let n = 0
    for (const msgs of Object.values(chats)) {
      for (const m of msgs) {
        if (m.role === 'user' && new Date(m.date || '').toDateString() === todayStr) n++
      }
    }
    return n
  }, [chats])

  const streakDays = useMemo(() => {
    const dates = new Set<string>()
    for (const msgs of Object.values(chats)) {
      for (const m of msgs) {
        if (m.role !== 'user' || !m.date) continue
        dates.add(new Date(m.date).toDateString())
      }
    }
    if (dates.size === 0) return 0

    const sorted = Array.from(dates)
      .map((d) => new Date(d).getTime())
      .sort((a, b) => b - a)

    const oneDay = 24 * 60 * 60 * 1000
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = today.getTime() - oneDay

    if (sorted[0] < yesterday) return 0

    let streak = 1
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1] - sorted[i] === oneDay) streak++
      else break
    }
    return streak
  }, [chats])

  // dailyLimitReached — фронт-only pre-check (server всё равно enforce'ит через 429).
  // Для Free: используем server-side freeMessagesRemaining (lifetime квота).
  // Для Basic/Premium: фронт точно не знает текущий day count, поэтому false —
  // server-side 429 покажет paywall ретроактивно.
  const dailyLimitReached =
    tier === 'free' && freeMessagesRemaining !== null && freeMessagesRemaining <= 0
  // customLimitReached: теперь всегда false (custom characters unlimited для всех).
  // Оставляем переменную для backward-compat (consumers её читают).
  const customLimitReached = false

  // NSFW: требует Premium (Basic недостаточно — это upsell-driver).
  const canOpenCharacter = useCallback(
    (c: Character) => {
      if (c.isNSFW) return isPremiumTier
      return true
    },
    [isPremiumTier],
  )

  // ─── Профиль из TG initData ─────────────────────────────────────────
  const userName = tgUser?.first_name || 'Гость'
  // Array.from корректно итерирует по grapheme/code points, поддерживает emoji.
  const firstChar = Array.from(userName)[0] || 'И'
  const userAvatarLetter = /\p{Letter}/u.test(firstChar) ? firstChar.toUpperCase() : firstChar

  // ─── deleteAccountFully ─────────────────────────────────────────────
  const deleteAccountFully = useCallback(async () => {
    // Локальный wipe — всё что мы пишем в localStorage.
    const keys = [LS_CHATS, LS_CUSTOM_CHARS, LS_FAVORITES, LS_MOODS, LS_LIBRARY_FILTER, 'legal_consents']
    for (const k of keys) {
      try {
        localStorage.removeItem(k)
      } catch {
        /* ignore */
      }
    }
    // Аватары — отдельно из IndexedDB.
    await wipeAllAvatars().catch(() => {
      /* ignore — основной wipe уже сработал */
    })
    // Сброс in-memory state.
    setCharacters(BUILT_IN_CHARACTERS)
    setChats({})
    setFavorites([])
    setCharacterMoodsState({})
    setLibraryFilterState('all')
    // Подписку и server-side данные — TODO Phase 5/6 (DELETE /users/me).
  }, [])

  const value: AppContextValue = {
    userName,
    userAvatarLetter,

    role,
    isAdmin: role === 'admin',
    isPartner: role === 'partner',
    partnerInfo,
    botUsername,
    botAppName,

    characters,
    addCharacter,
    deleteCharacter,
    customCharsCount,

    chats,
    addMessage,
    clearChat,
    clearAllChats,

    favorites,
    toggleFavorite,

    characterMoods,
    setCharacterMood,

    libraryFilter,
    setLibraryFilter,

    subscription,
    isPremium,
    tier,
    dayPassActive,
    isPremiumTier,
    freeMessagesRemaining,
    freeMessagesLifetime,
    refreshSubscription,
    subscriptionLoading,
    subscriptionError,

    paywallReason,
    openPaywall,
    closePaywall,

    todayMessageCount,
    streakDays,
    dailyLimitReached,
    customLimitReached,
    canOpenCharacter,

    legalDocId,
    setLegalDocId,

    deleteAccountFully,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
