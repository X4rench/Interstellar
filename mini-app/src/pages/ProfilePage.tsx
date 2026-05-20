import { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignal, initData } from '@telegram-apps/sdk-react'

import { useApp } from '../context/AppContext'
import { ChevronRightIcon } from '../icons'
import { BottomNav } from '../components/BottomNav'
import { appConfirm, appAlert } from '../components/AppDialogs'
import { ykToggleAutoRenew } from '../utils/api'
import invertLogo from '../icons/invertLogo.png'

import styles from './ProfilePage.module.css'

/**
 * Переключатель автопродления подписки.
 * Видим только юзерам с активной yookassa-подпиской.
 * Логика:
 *  - Если включаешь — без подтверждения (юзер хочет, чтобы списали).
 *  - Если выключаешь — confirm-диалог («подписка останется до X»).
 *  - После успеха — refreshSubscription чтобы UI обновился.
 */
function AutoRenewToggle({
  enabled,
  expiresAt,
  onChanged,
}: {
  enabled: boolean
  expiresAt: string
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [localEnabled, setLocalEnabled] = useState(enabled)

  // Синхронизируем local-state с props если subscription обновилась снаружи.
  useEffect(() => {
    setLocalEnabled(enabled)
  }, [enabled])

  const handleToggle = async () => {
    if (busy) return
    const newValue = !localEnabled

    // При ВЫКЛЮЧЕНИИ — confirm-диалог. Это legal requirement и хорошая
    // практика чтобы юзер не «случайно» убил автопродление.
    if (!newValue) {
      const expiresStr = new Date(expiresAt).toLocaleDateString('ru')
      const ok = await appConfirm({
        title: 'Отключить автопродление?',
        message: `Подписка останется активной до ${expiresStr}. После этой даты доступ к Premium закроется.`,
        confirmLabel: 'Отключить',
        danger: true,
      })
      if (!ok) return
    }

    setBusy(true)
    setLocalEnabled(newValue) // оптимистично

    try {
      await ykToggleAutoRenew(newValue)
      onChanged() // refreshSubscription из родителя
    } catch (err) {
      // Откатываем оптимистичное обновление.
      setLocalEnabled(!newValue)
      await appAlert({
        title: 'Ошибка',
        message: 'Не удалось изменить настройку. Попробуй ещё раз позже.',
      })
      // eslint-disable-next-line no-console
      console.error('[profile] toggleAutoRenew failed', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      style={{
        margin: '12px 20px 0',
        padding: '14px 16px',
        background: '#131313',
        border: '1px solid #232323',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: 'calc(100% - 40px)',
        cursor: busy ? 'wait' : 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        opacity: busy ? 0.6 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>
          Автопродление
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#888', lineHeight: 1.4 }}>
          {localEnabled
            ? 'Подписка автоматически продлевается через 30 дней. Можно отключить в любой момент.'
            : 'Подписка истечёт без продления. Включи если хочешь продолжать.'}
        </p>
      </div>
      {/* iOS-style toggle. Цвет фона зависит от состояния. */}
      <span
        style={{
          width: 42,
          height: 26,
          borderRadius: 13,
          background: localEnabled ? 'linear-gradient(135deg, #7c5cff, #ff5cdb)' : '#3a3a3a',
          position: 'relative',
          transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: localEnabled ? 19 : 3,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: '#fff',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </span>
    </button>
  )
}

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
          <button
            className={styles.statBox}
            onClick={() => {
              setLibraryFilter('mine')
              nav('/library')
            }}
            style={{
              background: 'inherit',
              border: 0,
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span className={styles.statVal}>{myCharsCount}</span>
            <span className={styles.statLbl}>Свои</span>
          </button>
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

        {/* Автопродление: переключатель только для yookassa-подписок
            (Stars-подписки одноразовые, не recurring). При выключении —
            confirm через appConfirm, потом /yk-toggle-auto-renew. */}
        {isPremium && subscription?.source === 'yookassa' && (
          <AutoRenewToggle
            enabled={subscription.autoRenew ?? false}
            expiresAt={subscription.expiresAt}
            onChanged={refreshSubscription}
          />
        )}

        {/* ── Секции — все завёрнуты в контейнер с отступом сверху,
              чтобы между последней карточкой (подписка / autorenew)
              и первым заголовком секции был зазор. ── */}
        <div style={{ marginTop: 24 }}>

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
