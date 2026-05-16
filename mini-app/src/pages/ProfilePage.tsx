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

        {/* Pro banner — только если не Pro. Стиль как Premium-карточка в Paywall. */}
        {!isPremium && (
          <button
            className={styles.banner}
            onClick={() => openPaywall('manual')}
            style={{
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
                    : '10 бесплатных сообщений'}
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
                          '10 сообщений всего (пожизненно)',
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

        <p className={styles.versionText}>Interstellar Mini App · v0.1.0</p>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  )
}
