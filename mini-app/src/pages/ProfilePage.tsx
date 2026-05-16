import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignal, initData } from '@telegram-apps/sdk-react'

import { useApp } from '../context/AppContext'
import { ChevronRightIcon } from '../icons'
import { BottomNav } from '../components/BottomNav'
import { appConfirm } from '../components/AppDialogs'
import invertLogo from '../icons/invertLogo.png'

import styles from './ProfilePage.module.css'

const LEGAL_LINKS: { id: 'privacy_policy' | 'terms_of_service' | 'personal_data' | 'subscription' | 'about'; label: string }[] = [
  { id: 'privacy_policy', label: 'Конфиденциальность' },
  { id: 'terms_of_service', label: 'Условия использования' },
  { id: 'personal_data', label: '152-ФЗ' },
  { id: 'subscription', label: 'Подписка' },
  { id: 'about', label: 'О приложении' },
]

function formatRuDate(iso: string | null): string {
  if (!iso) return '—'
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  const d = new Date(iso)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

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
    refreshSubscription, subscriptionLoading,
    isAdmin, isPartner, partnerInfo,
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
            {tierLabel && <span className={styles.proPill}>{tierLabel}</span>}
            {dayPassActive && <span className={styles.proPill} style={{ marginLeft: 6 }}>+ DAY PASS</span>}
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{todayMessageCount}</span>
            <span className={styles.statLbl}>Сегодня</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{streakDays}</span>
            <span className={styles.statLbl}>Streak</span>
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

        {/* Pro banner — только если не Pro */}
        {!isPremium && (
          <button className={styles.banner} onClick={() => openPaywall('manual')}>
            <img src={invertLogo} alt="" className={styles.bannerLogo} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className={styles.bannerTitle}>Открыть Pro</p>
              <p className={styles.bannerSub}>Безлимит сообщений, 18+ персонажи</p>
            </div>
            <ChevronRightIcon color="#888" />
          </button>
        )}

        {/* Партнёрство (видно только partner'у) */}
        {isPartner && partnerInfo && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Партнёрство</h3>
            <div className={styles.list}>
              <button className={styles.listItem} onClick={() => nav('/partner')}>
                <span className={styles.listLabel}>
                  Партнёрский кабинет
                  <br />
                  <span style={{ fontSize: 11, color: '#7c5cff' }}>
                    slug: {partnerInfo.blogger_slug} · {(partnerInfo.revenue_share_bps / 100).toFixed(0)}%
                  </span>
                </span>
                <ChevronRightIcon color="#888" />
              </button>
            </div>
          </div>
        )}

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

        {/* Subscription block */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Подписка</h3>
          <div className={styles.list}>
            <button
              className={styles.listItem}
              onClick={() => (isPremiumTier ? null : openPaywall('manual'))}
              disabled={isPremiumTier}
            >
              <span className={styles.listLabel}>
                {subscriptionLoading
                  ? 'Загрузка…'
                  : tier === 'premium'
                    ? 'Premium активна'
                    : tier === 'basic'
                      ? 'Basic активна'
                      : 'Free'}
              </span>
              <span className={styles.listValue}>
                {isPremium && subscription?.expiresAt
                  ? `до ${formatRuDate(subscription.expiresAt)}`
                  : !isPremium
                    ? 'от 199 ₽ / мес'
                    : ''}
              </span>
              {!isPremiumTier && <ChevronRightIcon color="#888" />}
            </button>
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

        <p className={styles.versionText}>Interstellar Mini App · v0.1.0</p>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}
