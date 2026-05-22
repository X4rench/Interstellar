import { useMemo, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignal, initData } from '@telegram-apps/sdk-react'

import { useApp } from '../context/AppContext'
import { ChevronRightIcon } from '../icons'
import { BottomNav } from '../components/BottomNav'
import { appConfirm } from '../components/AppDialogs'
import { getReferralStats, partnerGetSummary, type ReferralStatsResponse, type PartnerSummary } from '../utils/api'
import invertLogo from '../icons/invertLogo.png'

import styles from './ProfilePage.module.css'

// AutoRenewToggle убран по бизнес-решению: продление управляется иначе
// (либо всегда вкл по умолчанию через save_payment_method=true при покупке,
// либо юзер не управляет этим из приложения). Если в будущем понадобится —
// логика была здесь, эндпоинт /billing/yk-toggle-auto-renew остался на бэке.

const LEGAL_LINKS: { id: 'privacy_policy' | 'terms_of_service' | 'personal_data' | 'subscription' | 'about'; label: string }[] = [
  { id: 'privacy_policy', label: 'Конфиденциальность' },
  { id: 'terms_of_service', label: 'Условия использования' },
  { id: 'personal_data', label: '152-ФЗ' },
  { id: 'subscription', label: 'Подписка' },
  { id: 'about', label: 'О приложении' },
]

// Русское склонение для «персонаж/персонажа/персонажей».
// 1 персонаж, 2-4 персонажа, 5+ персонажей. Исключение: 11-14 → персонажей.
function pluralChars(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return 'персонажей'
  if (mod10 === 1) return 'персонаж'
  if (mod10 >= 2 && mod10 <= 4) return 'персонажа'
  return 'персонажей'
}

function formatRuDate(iso: string | null): string {
  if (!iso) return '—'
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  const d = new Date(iso)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

// ─── Партнёрский блок (видим только партнёрам) ───────────────────────────────

function PartnerBannerBlock({ bloggerSlug, sharePercent }: { bloggerSlug: string; sharePercent: number }) {
  const nav = useNavigate()
  const [summary, setSummary] = useState<PartnerSummary | null>(null)

  useEffect(() => {
    partnerGetSummary()
      .then((r) => setSummary(r.summary))
      .catch(() => {})
  }, [])

  const fmtRub = (v: number) =>
    v.toLocaleString('ru', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₽'

  return (
    <div
      style={{
        margin: '12px 20px 0',
        background: 'linear-gradient(145deg, #1a1030 0%, #12082a 100%)',
        border: '1.5px solid rgba(124, 92, 255, 0.4)',
        boxShadow: '0 0 24px rgba(124, 92, 255, 0.12)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Заголовок */}
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid rgba(124, 92, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7c5cff, #ff5cdb)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 16,
          }}
        >
          🌟
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Партнёрская программа
            </p>
            <span
              style={{
                background: 'linear-gradient(135deg, #7c5cff, #ff5cdb)',
                borderRadius: 5,
                padding: '1px 7px',
                fontSize: 9,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: 0.5,
              }}
            >
              ПАРТНЁР
            </span>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a89cd8', lineHeight: 1.3 }}>
            {bloggerSlug} · {sharePercent}% с каждого платежа
          </p>
        </div>
      </div>

      {/* Быстрая статистика */}
      <div style={{ padding: '12px 16px' }}>
        {summary ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { val: String(summary.referrals_count), lbl: 'Рефералов' },
              { val: String(summary.conversions_count), lbl: 'Оплатили' },
              { val: fmtRub(summary.balance_rub), lbl: 'Баланс' },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(124,92,255,0.2)',
                  borderRadius: 10,
                  padding: '8px 4px',
                  textAlign: 'center',
                }}
              >
                <p style={{ margin: 0, fontSize: lbl === 'Баланс' ? 13 : 18, fontWeight: 700, color: '#fff' }}>{val}</p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#8870c8' }}>{lbl}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: 56, marginBottom: 12 }} />
        )}

        <button
          onClick={() => nav('/partner')}
          style={{
            width: '100%',
            padding: '11px',
            background: 'linear-gradient(135deg, #7c5cff 0%, #b455e8 50%, #ff5cdb 100%)',
            border: 0,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          Партнёрский кабинет
          <ChevronRightIcon color="#fff" />
        </button>
      </div>
    </div>
  )
}

// ─── Реферальный блок ────────────────────────────────────────────────────────

function ReferralBlock() {
  const [stats, setStats] = useState<ReferralStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getReferralStats()
      setStats(data)
    } catch {
      // non-fatal — просто не показываем статистику
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCopy = async () => {
    const link = stats?.referral_link
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback — prompt
      window.prompt('Скопируй ссылку:', link)
    }
  }

  const handleShare = () => {
    const link = stats?.referral_link
    if (!link) return
    const text = 'Попробуй Интерстеллар — чат с историческими персонажами на ИИ!'
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
    try {
      // Используем Telegram openLink если доступен
      ;(window as any).Telegram?.WebApp?.openTelegramLink?.(shareUrl)
    } catch {
      window.open(shareUrl, '_blank')
    }
  }

  return (
    <div
      style={{
        margin: '12px 20px 0',
        background: '#0e0e0e',
        border: '1px solid #232323',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Заголовок */}
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7c5cff, #ff5cdb)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 17,
          }}
        >
          🎁
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>
            Пригласи друга
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#888', lineHeight: 1.3 }}>
            Друг купит Basic → ты получаешь <b style={{ color: '#c9b8ff' }}>3 дня Basic</b>
            {' · '}купит Premium → <b style={{ color: '#ff9ee6' }}>3 дня Premium</b>
          </p>
        </div>
      </div>

      {/* Ссылка + кнопки */}
      <div style={{ padding: '12px 16px' }}>
        {loading ? (
          <p style={{ margin: 0, fontSize: 12, color: '#555', textAlign: 'center', padding: '8px 0' }}>
            Загрузка…
          </p>
        ) : stats?.referral_link ? (
          <>
            {/* Поле со ссылкой */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#161616',
                border: '1px solid #2a2a2a',
                borderRadius: 10,
                padding: '8px 10px 8px 12px',
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 11,
                  color: '#888',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: 'monospace',
                }}
              >
                {stats.referral_link}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  flexShrink: 0,
                  background: copied ? '#1a3a1a' : '#1e1e1e',
                  border: `1px solid ${copied ? 'rgba(61,186,111,0.4)' : '#333'}`,
                  borderRadius: 7,
                  padding: '5px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: copied ? '#3DBA6F' : '#aaa',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Скопировано' : 'Копировать'}
              </button>
            </div>

            {/* Кнопка поделиться */}
            <button
              onClick={handleShare}
              style={{
                width: '100%',
                padding: '11px',
                background: 'linear-gradient(135deg, #7c5cff 0%, #b455e8 50%, #ff5cdb 100%)',
                border: 0,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 3px 12px rgba(124, 92, 255, 0.3)',
              }}
            >
              📤 Поделиться в Telegram
            </button>

            {/* Статистика */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 10,
              }}
            >
              {[
                { val: stats.invited_count, lbl: 'Приглашено' },
                { val: stats.paid_count,    lbl: 'Оплатили' },
                { val: stats.paid_count * 3, lbl: 'Дней получено' },
              ].map(({ val, lbl }) => (
                <div
                  key={lbl}
                  style={{
                    flex: 1,
                    background: '#161616',
                    border: '1px solid #222',
                    borderRadius: 10,
                    padding: '8px 4px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>{val}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: '#666' }}>{lbl}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: '#555', textAlign: 'center', padding: '8px 0' }}>
            Не удалось загрузить реферальную ссылку
          </p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const nav = useNavigate()
  const tgUser = useSignal(initData.user)
  const {
    characters, chats,
    todayMessageCount, streakDays,
    isPremium, isPremiumTier, tier, dayPassActive,
    subscription,
    openPaywall,
    clearAllChats, deleteAccountFully,
    refreshSubscription, subscriptionLoading, subscriptionError,
    isAdmin, isPartner, partnerInfo,
    favorites, setLibraryFilter,
  } = useApp()

  // Лейбл и цвет для tier-badge в шапке.
  const tierLabel = tier === 'premium' ? 'PREMIUM' : tier === 'basic' ? 'BASIC' : null

  // На монтировании дёрнем /users/me ещё раз — на случай если юзер только
  // что вернулся с экрана покупки (Phase 4).
  useEffect(() => {
    refreshSubscription()
  }, [refreshSubscription])

  const totalMessages = useMemo(
    () => Object.values(chats).reduce((acc, msgs) => acc + msgs.length, 0),
    [chats],
  )

  const myCharsCount = useMemo(
    () => characters.filter((c) => c.userCreated).length,
    [characters],
  )

  const [tgPhotoUrl] = useState<string | null>(() => tgUser?.photo_url ?? null)
  const [subExpanded, setSubExpanded] = useState(false)

  const displayName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ') || 'Гость'
  const handle = tgUser?.username ? `@${tgUser.username}` : '(без username)'
  // Array.from корректно итерирует по code points (а не UTF-16 units),
  // поэтому первая буква emoji (например 🫧) не сломается на half-surrogate.
  const firstGrapheme = tgUser?.first_name ? Array.from(tgUser.first_name)[0] : null
  // Если first grapheme — это emoji, оставляем как есть (не toUpperCase эмодзи).
  // Если буква — делаем uppercase. Fallback: «И» (Интерстеллар).
  const avatarLetter = firstGrapheme
    ? (/\p{Letter}/u.test(firstGrapheme) ? firstGrapheme.toUpperCase() : firstGrapheme)
    : 'И'

  const handleClearChats = async () => {
    const ok = await appConfirm({
      title: 'Очистить всю историю?',
      message: 'Все сообщения со всеми персонажами будут удалены. Это нельзя отменить.',
      confirmLabel: 'Очистить',
      danger: true,
    })
    if (ok) clearAllChats()
  }

  const handleDeleteAccount = async () => {
    const ok = await appConfirm({
      title: 'Удалить все мои данные?',
      message:
        'Локальная история, кастомные персонажи и аватары будут удалены. Подписка останется активна до конца оплаченного периода. Это нельзя отменить.',
      confirmLabel: 'Удалить',
      danger: true,
    })
    if (!ok) return
    await deleteAccountFully()
    nav('/')
  }

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        {/* Header */}
        <div className={styles.headerRow}>
          <div className={styles.avatar}>
            {tgPhotoUrl ? (
              <img src={tgPhotoUrl} alt="" className={styles.avatarImg} />
            ) : (
              avatarLetter
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className={styles.userName}>{displayName}</p>
            <p className={styles.userHandle}>{handle}</p>
            {/* Премиум-стиль pill'а: тёмная подложка + glow + градиентный текст.
                Звезда для Premium, ромб для Basic, билет для Day Pass. */}
            {tier === 'premium' && (
              <span className={`${styles.tierPill} ${styles.tierPillPremium}`}>
                <span className={styles.tierPillIcon}>★</span>
                <span className={styles.tierPillText}>Premium</span>
              </span>
            )}
            {tier === 'basic' && (
              <span className={`${styles.tierPill} ${styles.tierPillBasic}`}>
                <span className={styles.tierPillIcon}>◆</span>
                <span className={styles.tierPillText}>Basic</span>
              </span>
            )}
            {dayPassActive && (
              <span
                className={`${styles.tierPill} ${styles.tierPillDayPass}`}
                style={{ marginLeft: tierLabel ? 6 : 0 }}
              >
                <span className={styles.tierPillIcon}>🎟</span>
                <span className={styles.tierPillText}>Day Pass</span>
              </span>
            )}
          </div>
        </div>

        {/* Ошибка загрузки подписки (401 или сеть) — показываем баннер с
            кнопкой «Повторить», чтобы юзер не видел «Free тариф» без объяснений.
            subscriptionError появляется когда /users/me вернул ошибку. */}
        {subscriptionError && !subscriptionLoading && (
          <div
            style={{
              margin: '10px 20px 12px',
              padding: '10px 14px',
              background: 'rgba(255, 80, 80, 0.08)',
              border: '1px solid rgba(255, 80, 80, 0.25)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#ff8888', fontWeight: 600 }}>
                Не удалось загрузить подписку
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#aa6666', lineHeight: 1.3 }}>
                {subscriptionError === 'INVALID_INIT_DATA' || subscriptionError === 'BAD_INIT_DATA'
                  ? 'Сессия устарела — закрой и переоткрой бота'
                  : 'Проверь подключение к сети'}
              </p>
            </div>
            <button
              onClick={refreshSubscription}
              style={{
                background: 'rgba(255,80,80,0.15)',
                border: '1px solid rgba(255,80,80,0.3)',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: '#ff8888',
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              Повторить
            </button>
          </div>
        )}

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{todayMessageCount}</span>
            <span className={styles.statLbl}>Сегодня</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{streakDays}</span>
            <span className={styles.statLbl}>Подряд</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{totalMessages}</span>
            <span className={styles.statLbl}>Всего</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{myCharsCount}</span>
            <span className={styles.statLbl}>Свои</span>
          </div>
        </div>

        {/* Быстрый доступ к Избранному. Видим всегда (даже если 0 — это
            подсказка: «есть такая фича, отметь сердечком в чате»). */}
        <button
          onClick={() => {
            setLibraryFilter('favorites')
            nav('/library')
          }}
          style={{
            margin: '12px 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            background: '#131313',
            border: '1px solid #232323',
            borderRadius: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: 'calc(100% - 40px)',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #c9b8ff, #ff9ee6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1l2 6h6L12 11l2 6-5-3.5L4 17l2-6L1 7h6z"
                fill="#000"
                stroke="#000"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff' }}>
              Избранное
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
              {favorites.length === 0
                ? 'Открой персонажа и нажми ⭐, чтобы сохранить'
                : `${favorites.length} ${pluralChars(favorites.length)}`}
            </p>
          </div>
          <ChevronRightIcon color="#888" />
        </button>

        {/* Pro banner — только если не Pro. Стиль как Premium-карточка в Paywall. */}
        {!isPremium && (
          <button
            className={styles.banner}
            onClick={() => openPaywall('manual')}
            style={{
              marginTop: 12,
              background: 'linear-gradient(160deg, #1d1538 0%, #14102a 55%, #0f0a1e 100%)',
              border: '1.5px solid rgba(124, 92, 255, 0.45)',
              boxShadow:
                '0 0 28px rgba(124, 92, 255, 0.18), 0 4px 18px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <img src={invertLogo} alt="" className={styles.bannerLogo} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                className={styles.bannerTitle}
                style={{
                  background: 'linear-gradient(135deg, #c9b8ff, #ff9ee6)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Открыть Premium
              </p>
              <p className={styles.bannerSub} style={{ color: '#b8a8d8' }}>
                Безлимит сообщений, 18+ персонажи
              </p>
            </div>
            <ChevronRightIcon color="#a89cd8" />
          </button>
        )}

        {/* Активная подписка — явный индикатор */}
        {isPremium && subscription?.expiresAt && (
          <div
            style={{
              margin: '16px 20px 0',
              padding: '14px 16px',
              background: 'linear-gradient(160deg, #1d1538 0%, #14102a 100%)',
              border: '1.5px solid rgba(124, 92, 255, 0.4)',
              boxShadow: '0 0 20px rgba(124, 92, 255, 0.15)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: '#3DBA6F',
                boxShadow: '0 0 8px #3DBA6F',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #c9b8ff, #ff9ee6)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {tier === 'premium' ? 'Premium подписка активна' : 'Basic подписка активна'}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#a89cd8' }}>
                Действует до {formatRuDate(subscription.expiresAt)}
              </p>
            </div>
          </div>
        )}

        {/* Day Pass CTA — единственная точка входа в Day Pass для Premium-юзеров
            (у них нет кнопки апгрейда). Basic/Free могут купить DP через Paywall
            из апгрейд-кнопок, но и здесь видеть удобно. Скрываем только когда
            DP уже активен — две покупки подряд бесполезны (срок не накапливается). */}
        {isPremium && !dayPassActive && (
          <button
            onClick={() => openPaywall('manual')}
            style={{
              margin: '12px 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              background: '#131313',
              border: '1px solid #232323',
              borderRadius: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              width: 'calc(100% - 40px)',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7c5cff, #ff5cdb)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 16,
              }}
            >
              🎟
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff' }}>
                Day Pass · 75 ₽
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888', lineHeight: 1.4 }}>
                +100 сообщений на 24 часа (разово, сверх тарифа)
              </p>
            </div>
            <ChevronRightIcon color="#888" />
          </button>
        )}

        {/* Day Pass активен — показываем что осталось времени */}
        {dayPassActive && (
          <div
            style={{
              margin: '12px 20px 0',
              padding: '14px 16px',
              background: '#131313',
              border: '1px solid rgba(124, 92, 255, 0.3)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7c5cff, #ff5cdb)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 16,
              }}
            >
              🎟
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>
                Day Pass активен
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#888', lineHeight: 1.4 }}>
                +100 сообщений добавлено к лимиту на 24 часа
              </p>
            </div>
          </div>
        )}

        {/* Партнёрский кабинет — видим только partner'у, стоит ПЕРЕД реф.блоком */}
        {isPartner && partnerInfo && (
          <PartnerBannerBlock
            bloggerSlug={partnerInfo.blogger_slug}
            sharePercent={Math.round(partnerInfo.revenue_share_bps / 100)}
          />
        )}

        {/* Реферальный блок — виден всем юзерам */}
        <ReferralBlock />

        {/* ── Секции — все завёрнуты в контейнер с отступом сверху,
              чтобы между последней карточкой (подписка / autorenew)
              и первым заголовком секции был зазор. ── */}
        <div style={{ marginTop: 24 }}>

        {/* Администрирование (видно только admin'у) */}
        {isAdmin && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Администрирование</h3>
            <div className={styles.list}>
              <button className={styles.listItem} onClick={() => nav('/admin')}>
                <span className={styles.listLabel}>
                  Админка
                  <br />
                  <span style={{ fontSize: 11, color: '#7c5cff' }}>
                    Партнёры · Выплаты · Аудит
                  </span>
                </span>
                <ChevronRightIcon color="#888" />
              </button>
            </div>
          </div>
        )}

        {/* Subscription block — тап раскрывает фичи текущего тарифа */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Подписка</h3>
          <div className={styles.list}>
            <button
              className={styles.listItem}
              onClick={() => setSubExpanded((v) => !v)}
            >
              <span className={styles.listLabel}>
                {subscriptionLoading
                  ? 'Загрузка…'
                  : tier === 'premium'
                    ? 'Premium активна'
                    : tier === 'basic'
                      ? 'Basic активна'
                      : 'Free тариф'}
              </span>
              <span className={styles.listValue}>
                {tier === 'premium'
                  ? '750 ₽ / мес'
                  : tier === 'basic'
                    ? '300 ₽ / мес'
                    : '10 сообщений в день'}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  transform: subExpanded ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <ChevronRightIcon color="#888" />
              </span>
            </button>

            {/* Раскрытый блок — фичи текущего тарифа */}
            {subExpanded && (
              <div
                style={{
                  padding: '0 16px 16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <p
                  style={{
                    margin: '14px 0 10px',
                    fontSize: 12,
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Что входит
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(tier === 'premium'
                    ? [
                        '200 сообщений в день',
                        'Доступ к 18+ персонажам',
                        'Память на 30 сообщений',
                        'Расширенные стили общения',
                        '∞ кастомных персонажей',
                      ]
                    : tier === 'basic'
                      ? [
                          '50 сообщений в день',
                          'Все персонажи без 18+',
                          'Память на 15 сообщений',
                          '∞ кастомных персонажей',
                        ]
                      : [
                          '10 сообщений каждый день',
                          'Базовые персонажи',
                          'Создание своих персонажей',
                        ]
                  ).map((feat) => (
                    <li
                      key={feat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        color: '#ddd',
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          background:
                            tier === 'premium' || tier === 'basic'
                              ? 'linear-gradient(135deg, #7c5cff, #ff5cdb)'
                              : '#444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width={9} height={9} viewBox="0 0 14 14" fill="none">
                          <path
                            d="M2.5 7.5l3 3 6-6.5"
                            stroke="#fff"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Кнопка апгрейда — для не-Premium.
                    Free → Basic (минимальный вход, низкий barrier).
                    Basic → Premium (естественный апгрейд).
                    В полном Paywall юзер увидит все тарифы и выберет сам. */}
                {!isPremiumTier && (
                  <button
                    onClick={() => openPaywall('manual')}
                    style={{
                      marginTop: 16,
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #7c5cff 0%, #b455e8 50%, #ff5cdb 100%)',
                      color: '#fff',
                      border: 0,
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(124, 92, 255, 0.35)',
                      fontFamily: 'inherit',
                    }}
                  >
                    {tier === 'basic'
                      ? 'Перейти на Premium за 750 ₽'
                      : 'Открыть Basic за 300 ₽'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Data management */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Данные</h3>
          <div className={styles.list}>
            <button className={styles.listItem} onClick={handleClearChats}>
              <span className={styles.listLabel}>Очистить историю чатов</span>
              <ChevronRightIcon color="#888" />
            </button>
            <button
              className={`${styles.listItem} ${styles.listItemDanger}`}
              onClick={handleDeleteAccount}
            >
              <span className={styles.listLabel}>Удалить все мои данные</span>
              <ChevronRightIcon color="#FF4444" />
            </button>
          </div>
        </div>

        {/* Legal */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Юридическое</h3>
          <div className={styles.legalRow}>
            {LEGAL_LINKS.map((l) => (
              <button
                key={l.id}
                className={styles.legalLink}
                onClick={() => nav(`/legal/${l.id}`)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        </div>{/* end sections wrapper */}

        <p className={styles.versionText}>Interstellar Mini App · v0.1.0</p>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}
