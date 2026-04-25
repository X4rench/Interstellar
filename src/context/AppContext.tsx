import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BUILT_IN_CHARACTERS, Character } from '../data/characters'
import { identifyUser } from '../utils/api'

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

export type Screen = 'splash' | 'home' | 'library' | 'chat' | 'create' | 'profile'

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

  user: UserProfile | null
  setUser: (user: UserProfile) => void
  isAuthenticated: boolean
  login: (name: string) => void
  logout: () => void

  favorites: string[]
  toggleFavorite: (id: string) => void

  todayMessageCount: number
  streakDays: number

  libraryFilter: 'all' | 'mine'
  setLibraryFilter: (f: 'all' | 'mine') => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('splash')
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)
  const [characters, setCharacters] = useState<Character[]>(BUILT_IN_CHARACTERS)
  const [chats, setChats] = useState<Record<string, Message[]>>({})
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'mine'>('all')

  useEffect(() => {
    const load = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user')
        if (userJson) {
          setUserState(JSON.parse(userJson))
          setIsAuthenticated(true)
          setScreen('home')
        }
        const chatsJson = await AsyncStorage.getItem('chats')
        if (chatsJson) setChats(JSON.parse(chatsJson))
        const customJson = await AsyncStorage.getItem('customCharacters')
        if (customJson) {
          const custom: Character[] = JSON.parse(customJson)
          setCharacters([...BUILT_IN_CHARACTERS, ...custom])
        }
        const favsJson = await AsyncStorage.getItem('favorites')
        if (favsJson) setFavorites(JSON.parse(favsJson))
      } catch {}
    }
    load()
    identifyUser().catch(() => {})
  }, [])

  const navigate = useCallback((newScreen: Screen, character?: Character) => {
    if (character) setCurrentCharacter(character)
    setScreen(newScreen)
  }, [])

  const addMessage = useCallback(async (characterId: string, message: Message) => {
    setChats(prev => {
      const updated = { ...prev, [characterId]: [...(prev[characterId] || []), message] }
      AsyncStorage.setItem('chats', JSON.stringify(updated)).catch(() => {})
      return updated
    })
  }, [])

  const clearChat = useCallback(async (characterId: string) => {
    setChats(prev => {
      const updated = { ...prev, [characterId]: [] }
      AsyncStorage.setItem('chats', JSON.stringify(updated)).catch(() => {})
      return updated
    })
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

  const streakDays = useMemo(() => {
    if (!user?.sinceDate) return 1
    const since = new Date(user.sinceDate)
    const now = new Date()
    return Math.max(1, Math.floor((now.getTime() - since.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  }, [user])

  return (
    <AppContext.Provider value={{
      screen, currentCharacter, navigate,
      characters, addCharacter, deleteCharacter,
      chats, addMessage, clearChat,
      user, setUser, isAuthenticated, login, logout,
      favorites, toggleFavorite,
      todayMessageCount, streakDays,
      libraryFilter, setLibraryFilter,
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
