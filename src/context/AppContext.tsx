import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BUILT_IN_CHARACTERS, Character } from '../data/characters'
import { secureGet, secureSet, secureDelete } from '../utils/secureStore'
import { vaultEncrypt, vaultDecrypt, looksEncrypted } from '../utils/cryptoVault'
import { logSecurityEvent } from '../utils/securityLog'
import { deleteAvatar, wipeAllAvatars } from '../utils/avatarStorage'

export interface Message {
  id: string
  role: 'user' | 'character'
  text: string
  time: string
  date: string
}

export interface UserProfile {
  name: string
  handle: string
  since: string
  sinceDate: string
}

export type Screen = 'splash' | 'home' | 'library' | 'chat' | 'create' | 'profile' | 'legal' | 'paywall'

import type { LegalDocId } from '../utils/consent'

// ─── Premium / Paywall ───────────────────────────────────────────────────────
export type PaywallReason = 'nsfw' | 'limit' | 'create-limit' | 'manual'
// Сейчас один тариф — месячный. PlanId оставлен union'ом на случай возврата
// многотарифной модели; добавлять новые значения — здесь.
export type PlanId = 'month'

export interface Subscription {
  plan: PlanId
  startedAt: string      // ISO
  expiresAt: string | null  // ISO
  isTrial: boolean
  /**
   * ISO timestamp когда юзер отменил подписку. Pro остаётся активным до
   * `expiresAt` (требование Apple/Google), но автопродление не сработает.
   * `null` — подписка активна и продолжит автопродлеваться.
   */
  cancelledAt?: string | null
}

// Free-tier лимиты (захардкожены, чтобы не плодить настройки).
// Тюнить отсюда — точка истины.
export const FREE_DAILY_MESSAGES = 30
export const FREE_CUSTOM_CHARS = 3

interface AppContextType {
  screen: Screen
  currentCharacter: Character | null
  navigate: (screen: Screen, character?: Character) => void

  characters: Character[]
  addCharacter: (character: Character) => void
  deleteCharacter: (id: string) => void

  chats: Record<string, Message[]>
  addMessage: (characterId: string, message: Message) => void
  clearChat: (characterId: string) => void
  /** Удалить всю историю чатов со всеми персонажами + серверные сессии. */
  clearAllChats: () => Promise<void>

  user: UserProfile | null
  setUser: (user: UserProfile) => void
  isAuthenticated: boolean
  login: (name: string) => void
  logout: () => void
  /** Удалить аккаунт на бэке + полный локальный wipe (152-ФЗ требование). */
  deleteAccountFully: () => Promise<void>

  favorites: string[]
  toggleFavorite: (id: string) => void

  todayMessageCount: number
  streakDays: number

  libraryFilter: 'all' | 'mine'
  setLibraryFilter: (f: 'all' | 'mine') => void

  // Mood per character (Задача 2). null = без модификатора.
  characterMoods: Record<string, string>
  setCharacterMood: (characterId: string, moodId: string | null) => void

  // Текущий открытый документ в LegalScreen (Задача 4)
  legalDocId: LegalDocId | null
  setLegalDocId: (id: LegalDocId | null) => void

  // ─── Premium ──────────────────────────────────────────────────────────────
  subscription: Subscription | null
  isPremium: boolean
  trialUsed: boolean
  trialAvailable: boolean
  customCharsCount: number
  /** Можно ли открыть конкретного персонажа (NSFW-гейт). */
  canOpenCharacter: (c: Character) => boolean
  /** Достигнут ли дневной лимит сообщений. */
  dailyLimitReached: boolean
  /** Достигнут ли лимит кастомных персонажей. */
  customLimitReached: boolean

  paywallReason: PaywallReason | null
  /** Открыть paywall с указанием причины (для тонкой настройки заголовка). */
  openPaywall: (reason: PaywallReason) => void
  closePaywall: () => void

  /** Имитация покупки. На проде — заменить на StoreKit / RuStore IAP. */
  purchase: (plan: PlanId) => Promise<boolean>
  /** Старт 3-дневного триала. Доступен 1 раз на устройство. */
  startTrial: () => Promise<boolean>
  /** Восстановление покупок (заглушка). */
  restorePurchases: () => Promise<boolean>
  /** Только для отладки: сбросить подписку. */
  cancelSubscription: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

// Ключи для подписки. Хранятся в secure-storage (Keychain/Keystore),
// а не в AsyncStorage — чтобы не было тривиального обхода через ADB-edit.
// Это смягчает, но НЕ заменяет server-side IAP verification (см. TODO в purchase()).
const SUBSCRIPTION_KEY = 'subscription_v1'
const TRIAL_USED_KEY   = 'trial_used_v1'

// Sanity-лимит длительности подписки. Любая запись с expiresAt − startedAt
// большим этого порога — подделка (юзер выкрутил дату вручную).
// Месячный тариф = ~31 день; даём запас на часовые пояса.
const MAX_SUBSCRIPTION_DURATION_MS = 32 * 24 * 60 * 60 * 1000

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('splash')
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)
  const [characters, setCharacters] = useState<Character[]>(BUILT_IN_CHARACTERS)
  const [chats, setChats] = useState<Record<string, Message[]>>({})
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'mine'>('all')
  const [characterMoods, setCharacterMoodsState] = useState<Record<string, string>>({})
  const [legalDocId, setLegalDocId] = useState<LegalDocId | null>(null)

  // Premium state
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [trialUsed, setTrialUsed] = useState(false)
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null)
  // Экран до того, как пользователь попал на paywall — чтобы потом вернуть.
  const [screenBeforePaywall, setScreenBeforePaywall] = useState<Screen | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user')
        if (userJson) {
          setUserState(JSON.parse(userJson))
          setIsAuthenticated(true)
          setScreen('home')
        }
        // Чаты шифруются AES-256 + HMAC (D2). Поддерживаем миграцию
        // legacy plaintext-данных: если запись начинается с '{' — это
        // старый JSON, считываем как есть и при следующей записи
        // перезапишется в encrypted-формате.
        const chatsRaw = await AsyncStorage.getItem('chats')
        if (chatsRaw) {
          if (looksEncrypted(chatsRaw)) {
            const decrypted = await vaultDecrypt(chatsRaw)
            if (decrypted) {
              try { setChats(JSON.parse(decrypted)) } catch {}
            } else {
              // Не расшифровалось — ключ потерян / blob повреждён.
              logSecurityEvent('vault_decrypt_fail', { key: 'chats' })
              await AsyncStorage.removeItem('chats').catch(() => {})
            }
          } else {
            // Legacy plaintext — загружаем, при следующей setChats шифруется.
            try { setChats(JSON.parse(chatsRaw)) } catch {}
          }
        }
        const customJson = await AsyncStorage.getItem('customCharacters')
        if (customJson) {
          const custom: Character[] = JSON.parse(customJson)
          setCharacters([...BUILT_IN_CHARACTERS, ...custom])
        }
        const favsJson = await AsyncStorage.getItem('favorites')
        if (favsJson) setFavorites(JSON.parse(favsJson))
        const moodsJson = await AsyncStorage.getItem('character_moods')
        if (moodsJson) setCharacterMoodsState(JSON.parse(moodsJson))

        // Premium state. Читаем из secure-storage (Keychain/Keystore).
        // Дополнительно делаем sanity-check на длительность подписки —
        // защита от тривиального тампера (поставить expiresAt 2099).
        // Также очищаем старые подписки (week/year/lifetime) с тестов.
        // Миграция: если в secure ничего нет, но есть legacy в AsyncStorage —
        // переносим, потом удаляем legacy.
        let subJson = await secureGet(SUBSCRIPTION_KEY)
        if (!subJson) {
          const legacy = await AsyncStorage.getItem(SUBSCRIPTION_KEY).catch(() => null)
          if (legacy) {
            subJson = legacy
            await secureSet(SUBSCRIPTION_KEY, legacy)
            await AsyncStorage.removeItem(SUBSCRIPTION_KEY).catch(() => {})
          }
        }
        if (subJson) {
          try {
            const parsed = JSON.parse(subJson) as Subscription
            const validShape = parsed?.plan === 'month'
              && typeof parsed.expiresAt === 'string'
              && typeof parsed.startedAt === 'string'
            if (validShape) {
              const span = new Date(parsed.expiresAt!).getTime() - new Date(parsed.startedAt).getTime()
              if (span > 0 && span <= MAX_SUBSCRIPTION_DURATION_MS) {
                setSubscription(parsed)
              } else {
                // Подделка — длительность вне разумного диапазона.
                logSecurityEvent('tamper_subscription_duration', {
                  spanMs: span,
                  plan: parsed.plan,
                })
                await secureDelete(SUBSCRIPTION_KEY)
              }
            } else {
              logSecurityEvent('tamper_subscription_corrupt', { reason: 'shape' })
              await secureDelete(SUBSCRIPTION_KEY)
            }
          } catch {
            logSecurityEvent('tamper_subscription_corrupt', { reason: 'parse' })
            await secureDelete(SUBSCRIPTION_KEY)
          }
        }

        let trialFlag = await secureGet(TRIAL_USED_KEY)
        if (!trialFlag) {
          const legacyTrial = await AsyncStorage.getItem(TRIAL_USED_KEY).catch(() => null)
          if (legacyTrial === '1') {
            trialFlag = '1'
            await secureSet(TRIAL_USED_KEY, '1')
            await AsyncStorage.removeItem(TRIAL_USED_KEY).catch(() => {})
          }
        }
        if (trialFlag === '1') setTrialUsed(true)
      } catch {}
    }
    load()
  }, [])

  const setCharacterMood = useCallback(async (characterId: string, moodId: string | null) => {
    setCharacterMoodsState(prev => {
      const updated = { ...prev }
      if (moodId === null) {
        delete updated[characterId]
      } else {
        updated[characterId] = moodId
      }
      AsyncStorage.setItem('character_moods', JSON.stringify(updated)).catch(() => {})
      return updated
    })
  }, [])

  const navigate = useCallback((newScreen: Screen, character?: Character) => {
    if (character) setCurrentCharacter(character)
    setScreen(newScreen)
  }, [])

  /**
   * Сохранить чаты в AsyncStorage в зашифрованном виде (D2).
   * Если шифрование падает (ключ недоступен) — не пишем вообще,
   * чтобы не оставлять plaintext с ложным ощущением безопасности.
   */
  const persistChats = useCallback(async (chatsToSave: Record<string, Message[]>) => {
    try {
      const blob = await vaultEncrypt(JSON.stringify(chatsToSave))
      await AsyncStorage.setItem('chats', blob)
    } catch {
      // Намеренно глотаем — chats-state уже в памяти, на следующей записи
      // попробуем снова. Plaintext fallback ОТСУТСТВУЕТ.
    }
  }, [])

  const addMessage = useCallback(async (characterId: string, message: Message) => {
    setChats(prev => {
      const updated = { ...prev, [characterId]: [...(prev[characterId] || []), message] }
      persistChats(updated)
      return updated
    })
  }, [persistChats])

  const clearChat = useCallback(async (characterId: string) => {
    setChats(prev => {
      const updated = { ...prev, [characterId]: [] }
      persistChats(updated)
      return updated
    })
  }, [persistChats])

  /**
   * Полная очистка истории чатов. Stateless-архитектура: серверной памяти нет,
   * история живёт только локально. Достаточно стереть state и AsyncStorage.
   */
  const clearAllChats = useCallback(async () => {
    setChats({})
    await AsyncStorage.removeItem('chats').catch(() => {})
  }, [])

  const addCharacter = useCallback(async (character: Character) => {
    setCharacters(prev => {
      const updated = [...prev, character]
      const custom = updated.filter(c => c.userCreated)
      AsyncStorage.setItem('customCharacters', JSON.stringify(custom)).catch(() => {})
      return updated
    })
  }, [])

  const deleteCharacter = useCallback(async (id: string) => {
    setCharacters(prev => {
      const updated = prev.filter(c => c.id !== id)
      const custom = updated.filter(c => c.userCreated)
      AsyncStorage.setItem('customCharacters', JSON.stringify(custom)).catch(() => {})
      return updated
    })
    setChats(prev => {
      const updated = { ...prev }
      delete updated[id]
      AsyncStorage.setItem('chats', JSON.stringify(updated)).catch(() => {})
      return updated
    })
    // Удаляем файл аватара (если был). Идемпотентно: при отсутствии ничего не делает.
    deleteAvatar(id).catch(() => {})
  }, [])

  const setUser = useCallback(async (userData: UserProfile) => {
    setUserState(userData)
    await AsyncStorage.setItem('user', JSON.stringify(userData)).catch(() => {})
  }, [])

  const login = useCallback(async (name: string) => {
    const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
    const now = new Date()
    const since = `с ${months[now.getMonth()]} ${now.getFullYear()}`
    const userData: UserProfile = {
      name,
      handle: `@${name.toLowerCase().replace(/\s+/g, '_')} · ${since}`,
      since,
      sinceDate: now.toISOString(),
    }
    setUserState(userData)
    setIsAuthenticated(true)
    await AsyncStorage.setItem('user', JSON.stringify(userData)).catch(() => {})
    setScreen('home')
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('user').catch(() => {})
    setUserState(null)
    setIsAuthenticated(false)
    setScreen('splash')
  }, [])

  /**
   * Полное удаление аккаунта (152-ФЗ).
   *
   * Stateless-архитектура: на бэке нет учёта пользователей, удалять там нечего.
   * Делаем только локальный wipe: SecureStore + AsyncStorage + state.
   */
  const deleteAccountFully = useCallback(async () => {
    // SecureStore — чувствительное.
    await Promise.all([
      secureDelete(SUBSCRIPTION_KEY),
      secureDelete(TRIAL_USED_KEY),
      secureDelete('device_id'),
    ])

    // AsyncStorage — всё что писали в setItem(...).
    await Promise.all([
      AsyncStorage.removeItem('user'),
      AsyncStorage.removeItem('chats'),
      AsyncStorage.removeItem('customCharacters'),
      AsyncStorage.removeItem('favorites'),
      AsyncStorage.removeItem('character_moods'),
      AsyncStorage.removeItem('legal_consents'),
      AsyncStorage.removeItem('create_draft'),
      // legacy-ключи (могут остаться после миграции)
      AsyncStorage.removeItem(SUBSCRIPTION_KEY),
      AsyncStorage.removeItem(TRIAL_USED_KEY),
      AsyncStorage.removeItem('device_id'),
    ].map(p => p.catch(() => {})))

    // Файлы аватаров кастомных персонажей лежат вне AsyncStorage —
    // удаляем папку целиком.
    await wipeAllAvatars().catch(() => {})

    // Сброс in-memory state.
    setUserState(null)
    setIsAuthenticated(false)
    setSubscription(null)
    setTrialUsed(false)
    setChats({})
    setCharacters(BUILT_IN_CHARACTERS)
    setFavorites([])
    setCharacterMoodsState({})
    setScreen('splash')
  }, [])

  const toggleFavorite = useCallback(async (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      AsyncStorage.setItem('favorites', JSON.stringify(updated)).catch(() => {})
      return updated
    })
  }, [])

  const todayMessageCount = useMemo(() => {
    const todayStr = new Date().toDateString()
    return Object.values(chats).reduce((acc, msgs) =>
      acc + msgs.filter(m => m.role === 'user' && new Date(m.date || '').toDateString() === todayStr).length, 0
    )
  }, [chats])

  /**
   * Streak — количество подряд идущих дней, в которые юзер написал хотя бы
   * одно сообщение. Считается из истории чатов: собираем уникальные даты
   * пользовательских сообщений (toDateString), сортируем по убыванию,
   * проверяем что последняя дата = сегодня или вчера, считаем подряд.
   *
   * Если последняя активность была раньше вчера — streak = 0.
   * Сегодня нет активности но вчера была — streak отображается до конца дня.
   */
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
      .map(d => new Date(d).getTime())
      .sort((a, b) => b - a) // desc

    const oneDay = 24 * 60 * 60 * 1000
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const yesterday = today.getTime() - oneDay

    // Streak считается только если последняя активность была сегодня или вчера.
    if (sorted[0] < yesterday) return 0

    let streak = 1
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1] - sorted[i] === oneDay) {
        streak++
      } else {
        break
      }
    }
    return streak
  }, [chats])

  // ─── Premium computeds ──────────────────────────────────────────────────
  const isPremium = useMemo(() => {
    if (!subscription || !subscription.expiresAt) return false
    return new Date(subscription.expiresAt).getTime() > Date.now()
  }, [subscription])

  const trialAvailable = !trialUsed && !isPremium

  const customCharsCount = useMemo(
    () => characters.filter(c => c.userCreated).length,
    [characters],
  )

  const dailyLimitReached = !isPremium && todayMessageCount >= FREE_DAILY_MESSAGES
  const customLimitReached = !isPremium && customCharsCount >= FREE_CUSTOM_CHARS

  const canOpenCharacter = useCallback((c: Character) => {
    if (isPremium) return true
    if (c.isNSFW) return false
    return true
  }, [isPremium])

  const openPaywall = useCallback((reason: PaywallReason) => {
    setPaywallReason(reason)
    // Запоминаем экран, чтобы вернуть пользователя обратно после закрытия.
    setScreen(prev => {
      if (prev !== 'paywall') setScreenBeforePaywall(prev)
      return 'paywall'
    })
  }, [])

  const closePaywall = useCallback(() => {
    const back = screenBeforePaywall ?? 'home'
    setScreenBeforePaywall(null)
    setPaywallReason(null)
    setScreen(back)
  }, [screenBeforePaywall])

  // ⚠️ КРИТИЧНО ПЕРЕД РЕЛИЗОМ: текущая реализация — клиент-онли симуляция.
  // Любой пользователь может активировать Pro, отредактировав secure-storage
  // (на rooted/jailbroken устройстве). Это убирает 100% выручки.
  //
  // Перед релизом покупка должна:
  //   1) Вызвать платформенное API:
  //      - iOS: react-native-iap → requestSubscription(productId)
  //      - Android Play: react-native-iap → requestSubscription(productId)
  //      - RuStore: ru.rustore.sdk billingclient
  //   2) Получить receipt (purchase token / transaction id).
  //   3) Отправить receipt на бэк: POST /subscription/verify
  //      где бэк дёргает Apple/Google verifyReceipt API, валидирует подпись,
  //      сохраняет в БД (users.pro_until, users.pro_source) и возвращает
  //      {ok, expiresAt, plan, isTrial}.
  //   4) Локально сохранить только результат с бэка (не локально вычисленный).
  //   5) При каждом старте приложения — запрос /subscription/status, обновление
  //      AsyncStorage-кэша. Sanity-лимит длительности (есть выше) — последний рубеж.
  //
  // До релиза НЕ ПУБЛИКОВАТЬ.
  const purchase = useCallback(async (plan: PlanId): Promise<boolean> => {
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setMonth(expiresAt.getMonth() + 1)
    const sub: Subscription = {
      plan,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isTrial: false,
    }
    setSubscription(sub)
    await secureSet(SUBSCRIPTION_KEY, JSON.stringify(sub))
    return true
  }, [])

  const startTrial = useCallback(async (): Promise<boolean> => {
    if (trialUsed || isPremium) return false
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + 3)
    // Триал автоматически переходит в месячную подписку
    // (конвенция App Store / Google Play).
    // ⚠️ Перед релизом trial_used должен жить НА БЭКЕ в durable-таблице
    // на hw_hash (как уже сделано для TG-бонусов), иначе пользователь
    // получит бесконечные триалы переустановкой / очисткой Keychain.
    const sub: Subscription = {
      plan: 'month',
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isTrial: true,
    }
    setSubscription(sub)
    setTrialUsed(true)
    await secureSet(SUBSCRIPTION_KEY, JSON.stringify(sub))
    await secureSet(TRIAL_USED_KEY, '1')
    logSecurityEvent('trial_started')
    return true
  }, [trialUsed, isPremium])

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    // ⚠️ Заглушка. На релизе:
    //   - iOS: InAppUtils.restorePurchases() / react-native-iap
    //   - Android: BillingClient.queryPurchasesAsync()
    //   - бэк дёргает /subscription/restore с receipt'ом и возвращает state
    const subJson = await secureGet(SUBSCRIPTION_KEY)
    if (subJson) {
      try {
        setSubscription(JSON.parse(subJson))
        return true
      } catch {}
    }
    return false
  }, [])

  const cancelSubscription = useCallback(async () => {
    // ⚠️ На релизе: вызвать BillingClient.acknowledgePurchase / Apple
    // unsubscribe, отметить cancellation на бэке. Локально — помечаем
    // cancelledAt, но Pro остаётся активным до expiresAt
    // (требование Apple/Google + good UX).
    setSubscription(prev => {
      if (!prev) return null
      const updated: Subscription = { ...prev, cancelledAt: new Date().toISOString() }
      secureSet(SUBSCRIPTION_KEY, JSON.stringify(updated)).catch(() => {})
      return updated
    })
  }, [])

  return (
    <AppContext.Provider value={{
      screen, currentCharacter, navigate,
      characters, addCharacter, deleteCharacter,
      chats, addMessage, clearChat, clearAllChats,
      user, setUser, isAuthenticated, login, logout, deleteAccountFully,
      favorites, toggleFavorite,
      todayMessageCount, streakDays,
      libraryFilter, setLibraryFilter,
      characterMoods, setCharacterMood,
      legalDocId, setLegalDocId,
      // Premium
      subscription, isPremium, trialUsed, trialAvailable,
      customCharsCount,
      canOpenCharacter, dailyLimitReached, customLimitReached,
      paywallReason, openPaywall, closePaywall,
      purchase, startTrial, restorePurchases, cancelSubscription,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
