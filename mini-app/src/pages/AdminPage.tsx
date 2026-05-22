import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../data/characters'
import {
  adminListPartners,
  adminListPayouts,
  adminListAudit,
  adminGrantPartner,
  adminUpdatePartner,
  adminRevokePartner,
  adminApprovePayout,
  adminMarkPayoutPaid,
  adminRejectPayout,
  adminGetAnalyticsSummary,
  adminGetUsersChart,
  adminGetRevenueChart,
  adminListBroadcasts,
  adminGetBroadcast,
  adminCreateBroadcast,
  adminCancelBroadcast,
  adminListCharacters,
  adminCreateCharacter,
  adminUpdateCharacter,
  adminDeleteCharacter,
  adminUploadCharacterPhoto,
  adminGetUserSubscription,
  adminGrantSubscription,
  adminRevokeSubscription,
  getBackendRoot,
  type AdminPartner,
  type AdminPayout,
  type AdminAuditEntry,
  type AnalyticsSummary,
  type ChartPoint,
  type BroadcastRecord,
  type DbCharacter,
  type AdminUserSubscriptionStatus,
  type AdminSubscriptionInfo,
  type AdminDayPassInfo,
  ApiError,
} from '../utils/api'
import { BackIcon } from '../icons'
import { appAlert, appConfirm, appPrompt } from '../components/AppDialogs'

import styles from './AdminPage.module.css'

type Tab = 'partners' | 'payouts' | 'audit' | 'analytics' | 'broadcast' | 'characters' | 'subscriptions'
type PayoutStatus = AdminPayout['status'] | 'all'

function fmtDate(ts: number | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('ru', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function bpsToPercent(bps: number) {
  return (bps / 100).toFixed(bps % 100 === 0 ? 0 : 2) + '%'
}

const statusLabel: Record<string, string> = {
  active: 'Активен',
  revoked: 'Отозван',
  requested: 'Запрошена',
  awaiting_receipt: 'Ждём чек',
  approved: 'Одобрена',
  paid: 'Выплачена',
  rejected: 'Отклонена',
}

const statusClass: Record<string, string> = {
  active: styles.statusActive,
  revoked: styles.statusRevoked,
  requested: styles.statusRequested,
  awaiting_receipt: styles.statusAwaiting,
  approved: styles.statusApproved,
  paid: styles.statusPaid,
  rejected: styles.statusRejected,
}

export function AdminPage() {
  const nav = useNavigate()
  const { userName } = useApp()
  // Получаем role через AppContext в Phase 4.E когда добавим role в стейт.
  // Сейчас checkим через /users/me (которое уже обновлено) — но для скорости
  // полагаемся на серверную проверку: если API возвращает 403 — выкидываем.
  // На безопасность это не влияет — сервер строгий.

  const [tab, setTab] = useState<Tab>('partners')
  const [forbidden, setForbidden] = useState(false)

  // ── Partners
  const [partners, setPartners] = useState<AdminPartner[]>([])
  const [partnersLoading, setPartnersLoading] = useState(false)
  const [partnersError, setPartnersError] = useState<string | null>(null)

  const loadPartners = useCallback(async () => {
    setPartnersLoading(true)
    setPartnersError(null)
    try {
      const res = await adminListPartners('all')
      setPartners(res.partners)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true)
      } else {
        setPartnersError(err instanceof Error ? err.message : 'Не удалось загрузить')
      }
    } finally {
      setPartnersLoading(false)
    }
  }, [])

  // ── Subscriptions (admin grant/revoke)
  // userIdInput — что юзер набирает (string чтобы хранить промежуточный пустой ввод).
  // subResult — последний загруженный статус юзера или null.
  const [userIdInput, setUserIdInput] = useState('')
  const [subQueryLoading, setSubQueryLoading] = useState(false)
  const [subResult, setSubResult] = useState<{
    user: AdminUserSubscriptionStatus
    subscription: AdminSubscriptionInfo | null
    day_pass: AdminDayPassInfo | null
  } | null>(null)
  const [subError, setSubError] = useState<string | null>(null)
  const [subBusy, setSubBusy] = useState(false)
  // Кастомный duration для grant — если 0, используется дефолт (30 дней для подписки, 1 для DP).
  const [grantDurationDays, setGrantDurationDays] = useState<number>(0)

  const loadSubStatus = useCallback(async (uid: number) => {
    setSubQueryLoading(true)
    setSubError(null)
    setSubResult(null)
    try {
      const res = await adminGetUserSubscription(uid)
      setSubResult({ user: res.user, subscription: res.subscription, day_pass: res.day_pass })
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
      else if (err instanceof ApiError && err.status === 404) setSubError('Юзер не найден. Проверь Telegram ID — юзер должен хоть раз зайти в приложение.')
      else setSubError(err instanceof Error ? err.message : 'Не удалось загрузить')
    } finally {
      setSubQueryLoading(false)
    }
  }, [])

  // ── Payouts
  const [payouts, setPayouts] = useState<AdminPayout[]>([])
  const [payoutsLoading, setPayoutsLoading] = useState(false)
  const [payoutsError, setPayoutsError] = useState<string | null>(null)
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<PayoutStatus>('all')

  const loadPayouts = useCallback(async (status: PayoutStatus) => {
    setPayoutsLoading(true)
    setPayoutsError(null)
    try {
      const res = await adminListPayouts(status === 'all' ? undefined : status)
      setPayouts(res.payouts)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
      else setPayoutsError(err instanceof Error ? err.message : 'Не удалось загрузить')
    } finally {
      setPayoutsLoading(false)
    }
  }, [])

  // ── Audit
  const [audit, setAudit] = useState<AdminAuditEntry[]>([])
  const [auditLoading, setAuditLoading] = useState(false)

  const loadAudit = useCallback(async () => {
    setAuditLoading(true)
    try {
      const res = await adminListAudit({ limit: 50 })
      setAudit(res.entries)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
    } finally {
      setAuditLoading(false)
    }
  }, [])

  // ── Analytics
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'users' | 'revenue'>('users')
  const [chartDays, setChartDays] = useState(30)
  const [usersChart, setUsersChart] = useState<ChartPoint[]>([])
  const [starsChart, setStarsChart] = useState<ChartPoint[]>([])
  const [ykChart, setYkChart] = useState<ChartPoint[]>([])
  const [chartLoading, setChartLoading] = useState(false)

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    setAnalyticsError(null)
    try {
      const res = await adminGetAnalyticsSummary()
      setAnalytics(res)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
      else setAnalyticsError(err instanceof Error ? err.message : 'Не удалось загрузить')
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  const loadChart = useCallback(async (type: 'users' | 'revenue', days: number) => {
    setChartLoading(true)
    try {
      if (type === 'users') {
        const res = await adminGetUsersChart(days)
        setUsersChart(res.new_users)
      } else {
        const res = await adminGetRevenueChart(days)
        setStarsChart(res.stars_by_day)
        setYkChart(res.yk_rub_by_day)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
    } finally {
      setChartLoading(false)
    }
  }, [])

  // ── Broadcast
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([])
  const [broadcastsLoading, setBroadcastsLoading] = useState(false)
  const [activeBroadcastId, setActiveBroadcastId] = useState<number | null>(null)
  const [activeBroadcast, setActiveBroadcast] = useState<BroadcastRecord | null>(null)
  const broadcastPollRef = useRef<number | null>(null)

  const loadBroadcasts = useCallback(async () => {
    setBroadcastsLoading(true)
    try {
      const res = await adminListBroadcasts({ limit: 20 })
      setBroadcasts(res.broadcasts)
      // Если есть рассылка в процессе — начинаем её поллить
      const running = res.broadcasts.find(b => b.status === 'sending' || b.status === 'pending')
      if (running) setActiveBroadcastId(running.id)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
    } finally {
      setBroadcastsLoading(false)
    }
  }, [])

  // ── Characters
  const [dbChars, setDbChars] = useState<DbCharacter[]>([])
  const [charsLoading, setCharsLoading] = useState(false)
  const [charsError, setCharsError] = useState<string | null>(null)
  const [charModalOpen, setCharModalOpen] = useState(false)
  const [charEdit, setCharEdit] = useState<DbCharacter | null>(null)

  const loadChars = useCallback(async () => {
    setCharsLoading(true)
    setCharsError(null)
    try {
      const res = await adminListCharacters()
      setDbChars(res.characters)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true)
      else setCharsError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setCharsLoading(false)
    }
  }, [])

  // Polling активной рассылки каждые 2 секунды
  useEffect(() => {
    if (!activeBroadcastId) {
      if (broadcastPollRef.current !== null) { window.clearInterval(broadcastPollRef.current); broadcastPollRef.current = null }
      return
    }
    const poll = async () => {
      try {
        const res = await adminGetBroadcast(activeBroadcastId)
        setActiveBroadcast(res.broadcast)
        // Обновляем список
        setBroadcasts(prev => prev.map(b => b.id === res.broadcast.id ? res.broadcast : b))
        if (res.broadcast.status === 'done' || res.broadcast.status === 'cancelled') {
          setActiveBroadcastId(null)
          setActiveBroadcast(null)
        }
      } catch {
        // игнорируем polling-ошибки
      }
    }
    void poll()
    broadcastPollRef.current = window.setInterval(poll, 2000)
    return () => {
      if (broadcastPollRef.current !== null) { window.clearInterval(broadcastPollRef.current); broadcastPollRef.current = null }
    }
  }, [activeBroadcastId])

  useEffect(() => {
    if (tab === 'partners') void loadPartners()
    else if (tab === 'payouts') void loadPayouts(payoutStatusFilter)
    else if (tab === 'audit') void loadAudit()
    else if (tab === 'analytics') { void loadAnalytics(); void loadChart(chartType, chartDays) }
    else if (tab === 'broadcast') void loadBroadcasts()
    else if (tab === 'characters') void loadChars()
  }, [tab, payoutStatusFilter, loadPartners, loadPayouts, loadAudit, loadAnalytics, loadBroadcasts, loadChars]) // eslint-disable-line react-hooks/exhaustive-deps

  // Перезагружаем график при смене типа или периода.
  // Начальное значение ref совпадает с дефолтными chartType/chartDays,
  // поэтому при первом открытии вкладки этот эффект не дублирует запрос.
  const prevChartKey = useRef('users-30')
  useEffect(() => {
    const key = `${chartType}-${chartDays}`
    if (key === prevChartKey.current) return
    prevChartKey.current = key
    if (tab === 'analytics') void loadChart(chartType, chartDays)
  }, [chartType, chartDays, tab, loadChart])

  // ── Modals
  const [grantOpen, setGrantOpen] = useState(false)
  const [editPartner, setEditPartner] = useState<AdminPartner | null>(null)
  const [payoutModal, setPayoutModal] = useState<AdminPayout | null>(null)

  if (forbidden) {
    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => nav('/profile')}>
            <BackIcon />
          </button>
          <h1 className={styles.title}>Доступ запрещён</h1>
        </header>
        <div className={styles.body}>
          <div className={styles.errorBox}>
            Ваш telegram_user_id не в списке ADMIN_TELEGRAM_IDS на бэке. Узнайте свой ID
            через @userinfobot и добавьте в backend/.env.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => nav('/profile')} aria-label="Назад">
          <BackIcon />
        </button>
        <h1 className={styles.title}>Админка</h1>
        <span className={styles.adminBadge}>{userName}</span>
      </header>

      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'analytics' ? styles.tabOn : ''}`}
          onClick={() => setTab('analytics')}
        >
          📊 Аналитика
        </button>
        <button
          className={`${styles.tab} ${tab === 'broadcast' ? styles.tabOn : ''}`}
          onClick={() => setTab('broadcast')}
        >
          📣 Рассылка
        </button>
        <button
          className={`${styles.tab} ${tab === 'characters' ? styles.tabOn : ''}`}
          onClick={() => setTab('characters')}
        >
          🎭 Персонажи
        </button>
        <button
          className={`${styles.tab} ${tab === 'subscriptions' ? styles.tabOn : ''}`}
          onClick={() => setTab('subscriptions')}
        >
          🎟 Подписки
        </button>
        <button
          className={`${styles.tab} ${tab === 'partners' ? styles.tabOn : ''}`}
          onClick={() => setTab('partners')}
        >
          Партнёры
        </button>
        <button
          className={`${styles.tab} ${tab === 'payouts' ? styles.tabOn : ''}`}
          onClick={() => setTab('payouts')}
        >
          Выплаты
        </button>
        <button
          className={`${styles.tab} ${tab === 'audit' ? styles.tabOn : ''}`}
          onClick={() => setTab('audit')}
        >
          Аудит
        </button>
      </nav>

      <div className={styles.body}>
        {tab === 'partners' && (
          <>
            <div className={styles.actionRow}>
              <button className={styles.actionBtn} onClick={() => setGrantOpen(true)}>
                + Выдать роль партнёра
              </button>
              <button className={styles.actionBtnGhost} onClick={loadPartners}>
                Обновить
              </button>
            </div>

            {partnersError && <div className={styles.errorBox}>{partnersError}</div>}
            {partnersLoading && <p className={styles.emptyText}>Загрузка…</p>}
            {!partnersLoading && partners.length === 0 && (
              <p className={styles.emptyText}>Партнёров пока нет. Нажми «Выдать роль» чтобы добавить первого.</p>
            )}

            <div className={styles.list}>
              {partners.map((p) => (
                <div key={p.telegram_user_id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.cardTitle}>
                        {p.partner_first_name || `User #${p.telegram_user_id}`}{' '}
                        {p.partner_username && (
                          <span style={{ fontWeight: 400, color: '#888' }}>@{p.partner_username}</span>
                        )}
                      </p>
                      <p className={styles.cardSubtitle}>
                        slug: <code style={{ color: '#7c5cff' }}>{p.blogger_slug}</code> · доля {bpsToPercent(p.revenue_share_bps)}
                      </p>
                    </div>
                    <span className={`${styles.statusPill} ${statusClass[p.status]}`}>
                      {statusLabel[p.status]}
                    </span>
                  </div>

                  <div className={styles.cardStats}>
                    <div className={styles.cardStatItem}>
                      <span className={styles.cardStatVal}>{p.referrals_count}</span>
                      <span className={styles.cardStatLbl}>Рефералов</span>
                    </div>
                    <div className={styles.cardStatItem}>
                      <span className={styles.cardStatVal}>
                        {p.earned_rub != null ? `${p.earned_rub.toLocaleString('ru')} ₽` : `${p.earned_stars} ⭐`}
                      </span>
                      <span className={styles.cardStatLbl}>Заработано</span>
                    </div>
                    <div className={styles.cardStatItem}>
                      <span className={styles.cardStatVal}>
                        {p.paid_out_rub != null ? `${p.paid_out_rub.toLocaleString('ru')} ₽` : `${p.paid_out_stars} ⭐`}
                      </span>
                      <span className={styles.cardStatLbl}>Выплачено</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    {p.status === 'active' && (
                      <>
                        <button className={styles.smallBtn} onClick={() => setEditPartner(p)}>
                          Изменить
                        </button>
                        <button
                          className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                          onClick={async () => {
                            const reason = await appPrompt({
                              title: `Отозвать роль у @${p.partner_username || p.telegram_user_id}?`,
                              message: 'Партнёр потеряет доступ к кабинету. Существующие платежи и атрибуции сохранятся.',
                              placeholder: 'Причина (опционально)',
                              confirmLabel: 'Отозвать',
                            })
                            if (reason === null) return
                            try {
                              await adminRevokePartner(p.telegram_user_id, reason || undefined)
                              await loadPartners()
                            } catch (err) {
                              await appAlert({ title: 'Ошибка', message: (err as Error).message })
                            }
                          }}
                        >
                          Отозвать
                        </button>
                      </>
                    )}
                    {p.status === 'revoked' && p.revoke_reason && (
                      <span className={styles.cardSubtitle}>Причина: {p.revoke_reason}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'payouts' && (
          <>
            <div className={styles.statusFilter}>
              {(['all', 'requested', 'awaiting_receipt', 'approved', 'paid', 'rejected'] as PayoutStatus[]).map(
                (s) => (
                  <button
                    key={s}
                    className={`${styles.filterPill} ${payoutStatusFilter === s ? styles.filterPillOn : ''}`}
                    onClick={() => setPayoutStatusFilter(s)}
                  >
                    {s === 'all' ? 'Все' : statusLabel[s] || s}
                  </button>
                ),
              )}
            </div>

            {payoutsError && <div className={styles.errorBox}>{payoutsError}</div>}
            {payoutsLoading && <p className={styles.emptyText}>Загрузка…</p>}
            {!payoutsLoading && payouts.length === 0 && (
              <p className={styles.emptyText}>
                Запросов на выплату нет. Они появятся когда партнёры начнут зарабатывать.
              </p>
            )}

            <div className={styles.list}>
              {payouts.map((po) => (
                <div key={po.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <p className={styles.cardTitle}>
                        #{po.id} · {po.amount_rub != null ? `${po.amount_rub.toLocaleString('ru')} ₽` : `${po.amount_stars} ⭐`}
                      </p>
                      <p className={styles.cardSubtitle}>
                        {po.partner_first_name || `User #${po.partner_telegram_user_id}`}{' '}
                        {po.partner_slug && <code style={{ color: '#7c5cff' }}>({po.partner_slug})</code>}
                      </p>
                      <p className={styles.cardSubtitle}>Запрошена {fmtDate(po.requested_at)}</p>
                      {po.receipt_number && (
                        <p className={styles.cardSubtitle}>Чек: <code>{po.receipt_number}</code></p>
                      )}
                      {po.external_payout_ref && (
                        <p className={styles.cardSubtitle}>
                          Платёж: <code>{po.external_payout_ref}</code>
                          {po.external_payout_amount_rub && ` · ${po.external_payout_amount_rub}₽`}
                        </p>
                      )}
                      {po.rejection_reason && (
                        <p className={styles.cardSubtitle}>Отклонена: {po.rejection_reason}</p>
                      )}
                    </div>
                    <span className={`${styles.statusPill} ${statusClass[po.status]}`}>
                      {statusLabel[po.status]}
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    {(po.status === 'requested' || po.status === 'awaiting_receipt') && (
                      <button
                        className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
                        onClick={async () => {
                          const ok = await appConfirm({
                            title: `Одобрить выплату #${po.id}?`,
                            message: `Сумма: ${po.amount_rub != null ? po.amount_rub.toLocaleString('ru') + ' ₽' : po.amount_stars + ' ⭐'}\n\nЕсли чек ещё не загружен — партнёру придёт инструкция по выставлению. Если чек уже есть — статус перейдёт сразу в "approved".`,
                            confirmLabel: 'Одобрить',
                          })
                          if (!ok) return
                          try {
                            await adminApprovePayout(po.id)
                            await loadPayouts(payoutStatusFilter)
                          } catch (err) {
                            await appAlert({ title: 'Ошибка', message: (err as Error).message })
                          }
                        }}
                      >
                        Одобрить
                      </button>
                    )}
                    {po.status === 'approved' && (
                      <button
                        className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
                        onClick={() => setPayoutModal(po)}
                      >
                        Отметить выплаченным
                      </button>
                    )}
                    {(po.status === 'requested' ||
                      po.status === 'awaiting_receipt' ||
                      po.status === 'approved') && (
                      <button
                        className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                        onClick={async () => {
                          const reason = await appPrompt({
                            title: `Отклонить выплату #${po.id}?`,
                            message: `Сумма: ${po.amount_rub != null ? po.amount_rub.toLocaleString('ru') + ' ₽' : po.amount_stars + ' ⭐'}\n\nПартнёр получит уведомление с указанной причиной.`,
                            placeholder: 'Причина отказа',
                            confirmLabel: 'Отклонить',
                          })
                          if (!reason) return
                          try {
                            await adminRejectPayout(po.id, reason)
                            await loadPayouts(payoutStatusFilter)
                          } catch (err) {
                            await appAlert({ title: 'Ошибка', message: (err as Error).message })
                          }
                        }}
                      >
                        Отклонить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'subscriptions' && (
          <>
            <p className={styles.emptyText} style={{ marginBottom: 12, color: '#888' }}>
              Выдай или отбери подписку у юзера по Telegram ID. Юзер должен хоть раз зайти в Mini App.
            </p>

            {/* Поиск юзера */}
            <div className={styles.actionRow}>
              <input
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="Telegram ID (например 123456789)"
                inputMode="numeric"
                style={{
                  flex: 1,
                  background: '#0c0c0c',
                  border: '1px solid #232323',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'inherit',
                }}
              />
              <button
                className={styles.actionBtn}
                disabled={subQueryLoading || !userIdInput}
                onClick={() => {
                  const uid = Number(userIdInput)
                  if (Number.isFinite(uid) && uid > 0) void loadSubStatus(uid)
                }}
              >
                {subQueryLoading ? 'Ищем…' : 'Найти'}
              </button>
            </div>

            {subError && <div className={styles.errorBox}>{subError}</div>}

            {subResult && (
              <div className={styles.card} style={{ marginTop: 12 }}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.cardTitle}>
                      {subResult.user.first_name}
                      {subResult.user.last_name ? ` ${subResult.user.last_name}` : ''}
                      {subResult.user.username && (
                        <span style={{ fontWeight: 400, color: '#888', marginLeft: 6 }}>
                          @{subResult.user.username}
                        </span>
                      )}
                    </p>
                    <p className={styles.cardSubtitle}>
                      Telegram ID: <code>{subResult.user.telegram_user_id}</code>
                    </p>
                  </div>
                </div>

                {/* Текущее состояние */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #1a1a1a' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Текущая подписка
                  </p>
                  {subResult.subscription ? (
                    <p style={{ margin: 0, fontSize: 13, color: '#fff' }}>
                      <b>{subResult.subscription.plan === 'premium_month' ? 'Premium' : 'Basic'}</b>
                      {' '}· до {fmtDate(subResult.subscription.expires_at)}
                      {' '}· source: <code style={{ color: '#7c5cff' }}>{subResult.subscription.source}</code>
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Нет активной подписки (Free)</p>
                  )}

                  <p style={{ margin: '10px 0 6px', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Day Pass
                  </p>
                  {subResult.day_pass ? (
                    <p style={{ margin: 0, fontSize: 13, color: '#fff' }}>
                      Активен · до {fmtDate(subResult.day_pass.expires_at)}
                      {' '}· source: <code style={{ color: '#7c5cff' }}>{subResult.day_pass.source}</code>
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: '#666' }}>Нет активного Day Pass</p>
                  )}
                </div>

                {/* Управление длительностью для grant */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #1a1a1a' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Длительность (дней)
                  </p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    {[0, 1, 7, 30, 90, 365].map((d) => (
                      <button
                        key={d}
                        onClick={() => setGrantDurationDays(d)}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          background: grantDurationDays === d ? 'linear-gradient(135deg, #7c5cff, #ff5cdb)' : '#1a1a1a',
                          color: grantDurationDays === d ? '#fff' : '#aaa',
                          border: 0,
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {d === 0 ? 'Дефолт' : `${d}д`}
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 10, color: '#666' }}>
                    "Дефолт" = 30 дней для подписки, 1 для Day Pass.
                  </p>
                </div>

                {/* Кнопки grant/revoke */}
                <div className={styles.cardActions} style={{ flexWrap: 'wrap' }}>
                  {(['basic_month', 'premium_month', 'day_pass'] as const).map((plan) => {
                    const label = plan === 'basic_month' ? 'Выдать Basic' : plan === 'premium_month' ? 'Выдать Premium' : 'Выдать Day Pass'
                    return (
                      <button
                        key={plan}
                        className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
                        disabled={subBusy}
                        onClick={async () => {
                          const ok = await appConfirm({
                            title: `${label}?`,
                            message: `Юзеру #${subResult.user.telegram_user_id} (${subResult.user.first_name}) будет выдан тариф ${plan}${grantDurationDays > 0 ? ` на ${grantDurationDays} дней` : ' на дефолтный срок'}. Активная подписка (если есть) будет отменена.`,
                            confirmLabel: 'Выдать',
                          })
                          if (!ok) return
                          setSubBusy(true)
                          try {
                            await adminGrantSubscription(subResult.user.telegram_user_id, {
                              plan,
                              duration_days: grantDurationDays > 0 ? grantDurationDays : undefined,
                            })
                            await appAlert({ title: 'Готово', message: `${label} ✓` })
                            await loadSubStatus(subResult.user.telegram_user_id)
                          } catch (err) {
                            await appAlert({ title: 'Ошибка', message: (err as Error).message })
                          } finally {
                            setSubBusy(false)
                          }
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}

                  {(subResult.subscription || subResult.day_pass) && (
                    <button
                      className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                      disabled={subBusy}
                      onClick={async () => {
                        const reason = await appPrompt({
                          title: 'Отозвать подписку?',
                          message: `Активная подписка и Day Pass юзера #${subResult.user.telegram_user_id} будут немедленно прекращены. Юзеру придёт уведомление.`,
                          placeholder: 'Причина (опционально)',
                          confirmLabel: 'Отозвать',
                        })
                        if (reason === null) return // отмена
                        setSubBusy(true)
                        try {
                          const res = await adminRevokeSubscription(
                            subResult.user.telegram_user_id,
                            reason || undefined,
                          )
                          await appAlert({
                            title: 'Готово',
                            message: `Отозвано: подписок ${res.subscriptions_cancelled}, day pass ${res.day_passes_expired}`,
                          })
                          await loadSubStatus(subResult.user.telegram_user_id)
                        } catch (err) {
                          await appAlert({ title: 'Ошибка', message: (err as Error).message })
                        } finally {
                          setSubBusy(false)
                        }
                      }}
                    >
                      Отозвать всё
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'audit' && (
          <>
            {auditLoading && <p className={styles.emptyText}>Загрузка…</p>}
            {!auditLoading && audit.length === 0 && (
              <p className={styles.emptyText}>Журнал пуст</p>
            )}
            {audit.map((e) => (
              <div key={e.id} className={styles.auditEntry}>
                <span className={styles.auditAction}>{e.action}</span>
                <div className={styles.auditMeta}>
                  {fmtDate(e.occurred_at)} · actor #{e.actor_user_id} ({e.actor_role})
                  {e.target_user_id !== null && ` · target #${e.target_user_id}`}
                  {e.target_resource && ` · ${e.target_resource}/${e.target_id}`}
                </div>
                {Object.keys(e.payload).length > 0 && (
                  <pre className={styles.auditPayload}>{JSON.stringify(e.payload, null, 2)}</pre>
                )}
              </div>
            ))}
          </>
        )}

        {tab === 'analytics' && (
          <>
            <div className={styles.actionRow}>
              <button className={styles.actionBtnGhost} onClick={() => { void loadAnalytics(); void loadChart(chartType, chartDays) }}>
                Обновить
              </button>
            </div>

            {analyticsError && <div className={styles.errorBox}>{analyticsError}</div>}
            {analyticsLoading && <p className={styles.emptyText}>Загрузка…</p>}

            {analytics && (
              <>
                {/* ─ Сводные карточки ─ */}
                <div className={styles.statGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statVal}>{analytics.users.total.toLocaleString('ru')}</span>
                    <span className={styles.statLbl}>Всего юзеров</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statVal}>{analytics.users.dau.toLocaleString('ru')}</span>
                    <span className={styles.statLbl}>DAU (24ч)</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statVal}>{analytics.users.new_today.toLocaleString('ru')}</span>
                    <span className={styles.statLbl}>Новых сегодня</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statVal}>{analytics.users.new_week.toLocaleString('ru')}</span>
                    <span className={styles.statLbl}>Новых за 7д</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statVal}>{analytics.subscriptions.active.toLocaleString('ru')}</span>
                    <span className={styles.statLbl}>Активных подписок</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statVal}>{analytics.subscriptions.conversion}%</span>
                    <span className={styles.statLbl}>Конверсия</span>
                  </div>
                </div>

                {/* ─ Доход ─ */}
                <div className={styles.revenueRow}>
                  <div className={styles.revenueCard}>
                    <p className={styles.revTitle}>⭐ Stars</p>
                    <div className={styles.revGrid}>
                      <div><span className={styles.revVal}>{analytics.stars.today.toLocaleString('ru')}</span><span className={styles.revLbl}>сегодня</span></div>
                      <div><span className={styles.revVal}>{analytics.stars.week.toLocaleString('ru')}</span><span className={styles.revLbl}>7д</span></div>
                      <div><span className={styles.revVal}>{analytics.stars.month.toLocaleString('ru')}</span><span className={styles.revLbl}>30д</span></div>
                      <div><span className={styles.revVal}>{analytics.stars.all.toLocaleString('ru')}</span><span className={styles.revLbl}>всё время</span></div>
                    </div>
                  </div>
                  <div className={styles.revenueCard}>
                    <p className={styles.revTitle}>₽ ЮКасса</p>
                    <div className={styles.revGrid}>
                      <div><span className={styles.revVal}>{analytics.yk_rub.today.toFixed(0)}</span><span className={styles.revLbl}>сегодня</span></div>
                      <div><span className={styles.revVal}>{analytics.yk_rub.week.toFixed(0)}</span><span className={styles.revLbl}>7д</span></div>
                      <div><span className={styles.revVal}>{analytics.yk_rub.month.toFixed(0)}</span><span className={styles.revLbl}>30д</span></div>
                      <div><span className={styles.revVal}>{analytics.yk_rub.all.toFixed(0)}</span><span className={styles.revLbl}>всё время</span></div>
                    </div>
                  </div>
                </div>

                {/* ─ Подписки по планам ─ */}
                {analytics.subscriptions.by_plan.length > 0 && (
                  <div className={styles.card} style={{ marginBottom: 16 }}>
                    <p className={styles.cardTitle} style={{ marginBottom: 8 }}>Подписки по тарифам</p>
                    <div className={styles.cardStats} style={{ gridTemplateColumns: `repeat(${analytics.subscriptions.by_plan.length}, 1fr)` }}>
                      {analytics.subscriptions.by_plan.map((p) => (
                        <div key={p.plan} className={styles.cardStatItem}>
                          <span className={styles.cardStatVal}>{p.cnt}</span>
                          <span className={styles.cardStatLbl}>{p.plan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ─ График ─ */}
            <div className={styles.chartSection}>
              <div className={styles.chartControls}>
                <div className={styles.chartTypePills}>
                  <button
                    className={`${styles.filterPill} ${chartType === 'users' ? styles.filterPillOn : ''}`}
                    onClick={() => setChartType('users')}
                  >Пользователи</button>
                  <button
                    className={`${styles.filterPill} ${chartType === 'revenue' ? styles.filterPillOn : ''}`}
                    onClick={() => setChartType('revenue')}
                  >Доход</button>
                </div>
                <div className={styles.chartTypePills}>
                  {([7, 14, 30] as const).map((d) => (
                    <button
                      key={d}
                      className={`${styles.filterPill} ${chartDays === d ? styles.filterPillOn : ''}`}
                      onClick={() => setChartDays(d)}
                    >{d}д</button>
                  ))}
                </div>
              </div>

              {chartLoading && <p className={styles.emptyText} style={{ padding: '20px 0' }}>Загрузка графика…</p>}

              {!chartLoading && chartType === 'users' && usersChart.length > 0 && (
                <div className={styles.chartWrap}>
                  <p className={styles.chartTitle}>Новые пользователи</p>
                  <LineChart points={usersChart} color="#7c5cff" gradId="grad-users" />
                  <div className={styles.chartAxisRow}>
                    <span>{usersChart[0]?.day?.slice(5)}</span>
                    <span>{usersChart[Math.floor(usersChart.length / 2)]?.day?.slice(5)}</span>
                    <span>{usersChart[usersChart.length - 1]?.day?.slice(5)}</span>
                  </div>
                </div>
              )}

              {!chartLoading && chartType === 'revenue' && starsChart.length > 0 && (
                <>
                  <div className={styles.chartWrap}>
                    <p className={styles.chartTitle}>⭐ Stars по дням</p>
                    <LineChart points={starsChart} color="#ffd700" gradId="grad-stars" />
                    <div className={styles.chartAxisRow}>
                      <span>{starsChart[0]?.day?.slice(5)}</span>
                      <span>{starsChart[Math.floor(starsChart.length / 2)]?.day?.slice(5)}</span>
                      <span>{starsChart[starsChart.length - 1]?.day?.slice(5)}</span>
                    </div>
                  </div>
                  <div className={styles.chartWrap} style={{ marginTop: 12 }}>
                    <p className={styles.chartTitle}>₽ ЮКасса по дням</p>
                    <LineChart points={ykChart} color="#3DBA6F" gradId="grad-yk" />
                    <div className={styles.chartAxisRow}>
                      <span>{ykChart[0]?.day?.slice(5)}</span>
                      <span>{ykChart[Math.floor(ykChart.length / 2)]?.day?.slice(5)}</span>
                      <span>{ykChart[ykChart.length - 1]?.day?.slice(5)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {tab === 'broadcast' && (
          <>
            {/* ─ Активная рассылка (progress) ─ */}
            {activeBroadcast && (activeBroadcast.status === 'sending' || activeBroadcast.status === 'pending') && (
              <div className={styles.broadcastProgress}>
                <div className={styles.broadcastProgressHeader}>
                  <span className={styles.broadcastProgressTitle}>Идёт рассылка #{activeBroadcast.id}</span>
                  <button
                    className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                    onClick={async () => {
                      const ok = await appConfirm({ title: 'Остановить рассылку?', message: 'Сообщения которые уже отправлены — не отзываются. Продолжение невозможно.', confirmLabel: 'Остановить' })
                      if (!ok) return
                      try { await adminCancelBroadcast(activeBroadcast.id) } catch { /* ignore */ }
                    }}
                  >Стоп</button>
                </div>
                <div className={styles.progressBarTrack}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${activeBroadcast.total_users > 0 ? Math.round(((activeBroadcast.sent_count + activeBroadcast.failed_count + activeBroadcast.blocked_count) / activeBroadcast.total_users) * 100) : 0}%` }}
                  />
                </div>
                <p className={styles.progressStats}>
                  ✅ {activeBroadcast.sent_count} · ❌ {activeBroadcast.failed_count} · 🚫 {activeBroadcast.blocked_count} из {activeBroadcast.total_users}
                </p>
              </div>
            )}

            {/* ─ Форма создания рассылки ─ */}
            <BroadcastCompose
              onSent={async (id) => {
                setActiveBroadcastId(id)
                await loadBroadcasts()
              }}
            />

            {/* ─ История рассылок ─ */}
            <p className={styles.sectionTitle}>История рассылок</p>
            {broadcastsLoading && <p className={styles.emptyText}>Загрузка…</p>}
            {!broadcastsLoading && broadcasts.length === 0 && (
              <p className={styles.emptyText}>Рассылок ещё не было</p>
            )}
            <div className={styles.list}>
              {broadcasts.map((bc) => (
                <div key={bc.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={styles.cardTitle}>Рассылка #{bc.id}</p>
                      <p className={styles.cardSubtitle}>{fmtDate(bc.created_at)}</p>
                      <p className={styles.cardSubtitle} style={{ marginTop: 4, fontSize: 12, color: '#ccc', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {bc.text.length > 100 ? bc.text.slice(0, 100) + '…' : bc.text}
                      </p>
                    </div>
                    <span className={`${styles.statusPill} ${broadcastStatusClass[bc.status]}`}>
                      {broadcastStatusLabel[bc.status]}
                    </span>
                  </div>
                  {(bc.status === 'done' || bc.status === 'sending') && (
                    <div className={styles.cardStats} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                      <div className={styles.cardStatItem}>
                        <span className={styles.cardStatVal}>{bc.total_users}</span>
                        <span className={styles.cardStatLbl}>Всего</span>
                      </div>
                      <div className={styles.cardStatItem}>
                        <span className={styles.cardStatVal} style={{ color: '#3DBA6F' }}>{bc.sent_count}</span>
                        <span className={styles.cardStatLbl}>Доставлено</span>
                      </div>
                      <div className={styles.cardStatItem}>
                        <span className={styles.cardStatVal} style={{ color: '#FF7777' }}>{bc.failed_count}</span>
                        <span className={styles.cardStatLbl}>Ошибок</span>
                      </div>
                      <div className={styles.cardStatItem}>
                        <span className={styles.cardStatVal} style={{ color: '#888' }}>{bc.blocked_count}</span>
                        <span className={styles.cardStatLbl}>Заблокировали</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'characters' && (
          <>
            <div className={styles.actionRow}>
              <button
                className={styles.actionBtn}
                onClick={() => { setCharEdit(null); setCharModalOpen(true) }}
              >
                + Новый персонаж
              </button>
              <button className={styles.actionBtnGhost} onClick={loadChars}>
                Обновить
              </button>
            </div>

            {charsError && <div className={styles.errorBox}>{charsError}</div>}
            {charsLoading && <p className={styles.emptyText}>Загрузка…</p>}
            {!charsLoading && dbChars.length === 0 && (
              <p className={styles.emptyText}>
                Персонажей в БД нет. Нажми «+ Новый персонаж» чтобы добавить первого.
              </p>
            )}

            <div className={styles.list}>
              {dbChars.map((c) => (
                <div
                  key={c.id}
                  className={styles.card}
                  style={{ opacity: c.is_active ? 1 : 0.5 }}
                >
                  <div className={styles.cardHeader}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0 }}>
                      {/* Mini avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: '#1a1a1a', border: '1px solid #303030',
                        overflow: 'hidden', position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {c.photo_url
                          ? <img src={getBackendRoot() + c.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 20 }}>🎭</span>
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p className={styles.cardTitle}>{c.name}</p>
                        <p className={styles.cardSubtitle}>
                          <code style={{ color: '#666', fontSize: 10 }}>{c.id}</code>
                          {' · '}
                          {c.category}
                          {c.isNSFW && <span style={{ color: '#FF7777', marginLeft: 4 }}>18+</span>}
                          {c.isNew && <span style={{ color: '#7c5cff', marginLeft: 4 }}>new</span>}
                        </p>
                        <p className={styles.cardSubtitle}>sort: {c.sort_order}</p>
                      </div>
                    </div>
                    <span
                      className={`${styles.statusPill} ${c.is_active ? styles.statusActive : styles.statusRevoked}`}
                    >
                      {c.is_active ? 'Активен' : 'Скрыт'}
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
                      onClick={() => { setCharEdit(c); setCharModalOpen(true) }}
                    >
                      Редактировать
                    </button>
                    <button
                      className={styles.smallBtn}
                      onClick={async () => {
                        try {
                          await adminUpdateCharacter(c.id, { isActive: !c.is_active })
                          await loadChars()
                        } catch (err) {
                          await appAlert({ title: 'Ошибка', message: (err as Error).message })
                        }
                      }}
                    >
                      {c.is_active ? 'Скрыть' : 'Показать'}
                    </button>
                    <button
                      className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                      onClick={async () => {
                        const ok = await appConfirm({
                          title: `Удалить «${c.name}»?`,
                          message: `Персонаж будет помечен неактивным и скрыт из приложения. Данные сохраняются в БД.\n\nID: ${c.id}`,
                          confirmLabel: 'Удалить',
                        })
                        if (!ok) return
                        try {
                          await adminDeleteCharacter(c.id)
                          await loadChars()
                        } catch (err) {
                          await appAlert({ title: 'Ошибка', message: (err as Error).message })
                        }
                      }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Grant partner modal */}
      {grantOpen && (
        <GrantPartnerModal
          onClose={() => setGrantOpen(false)}
          onDone={async () => {
            setGrantOpen(false)
            await loadPartners()
          }}
        />
      )}

      {/* Edit partner modal */}
      {editPartner && (
        <EditPartnerModal
          partner={editPartner}
          onClose={() => setEditPartner(null)}
          onDone={async () => {
            setEditPartner(null)
            await loadPartners()
          }}
        />
      )}

      {/* Mark payout paid modal */}
      {payoutModal && (
        <MarkPayoutPaidModal
          payout={payoutModal}
          onClose={() => setPayoutModal(null)}
          onDone={async () => {
            setPayoutModal(null)
            await loadPayouts(payoutStatusFilter)
          }}
        />
      )}

      {/* Character create/edit modal */}
      {charModalOpen && (
        <CharacterEditModal
          char={charEdit}
          onClose={() => setCharModalOpen(false)}
          onDone={async () => {
            setCharModalOpen(false)
            await loadChars()
          }}
        />
      )}
    </div>
  )
}

// ─── Broadcast status maps ───────────────────────────────────────────────

const broadcastStatusLabel: Record<string, string> = {
  pending:   'Ждёт',
  sending:   'Отправка',
  done:      'Готово',
  cancelled: 'Отменена',
}

const broadcastStatusClass: Record<string, string> = {
  pending:   styles.statusRequested,
  sending:   styles.statusAwaiting,
  done:      styles.statusPaid,
  cancelled: styles.statusRevoked,
}

// ─── LineChart ───────────────────────────────────────────────────────────

function LineChart({ points, color, gradId }: { points: ChartPoint[]; color: string; gradId: string }) {
  if (!points.length) return <div style={{ height: 80 }} />
  const W = 320, H = 80, PAD = 4
  const vals = points.map(p => p.value)
  const max  = Math.max(...vals, 1)
  const n    = points.length
  const xs   = points.map((_, i) => PAD + (i / Math.max(n - 1, 1)) * (W - PAD * 2))
  const ys   = points.map(p => H - PAD - (p.value / max) * (H - PAD * 2 - 4))

  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const areaD = `${pathD} L${(W - PAD).toFixed(1)},${H} L${PAD},${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ─── BroadcastCompose ────────────────────────────────────────────────────

function BroadcastCompose({ onSent }: { onSent: (id: number) => void | Promise<void> }) {
  const [text, setText] = useState('')
  const [parseMode, setParseMode] = useState<'HTML' | 'MarkdownV2'>('HTML')
  const [showButton, setShowButton] = useState(false)
  const [btnText, setBtnText] = useState('')
  const [btnUrl,  setBtnUrl]  = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSend = !busy && text.trim().length > 0 && text.length <= 4096 &&
    (!showButton || (btnText.trim().length > 0 && /^https?:\/\//.test(btnUrl.trim())))

  const send = async () => {
    const ok = await appConfirm({
      title: 'Отправить рассылку?',
      message: `Сообщение уйдёт всем пользователям бота. Это действие нельзя отменить для уже отправленных сообщений.\n\nПервые несколько символов:\n${text.trim().slice(0, 80)}…`,
      confirmLabel: 'Отправить',
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      const res = await adminCreateBroadcast({
        text: text.trim(),
        parse_mode: parseMode,
        button_text: showButton ? btnText.trim() : undefined,
        button_url:  showButton ? btnUrl.trim()  : undefined,
      })
      setText('')
      setBtnText('')
      setBtnUrl('')
      setShowButton(false)
      await onSent(res.broadcast_id)
    } catch (err) {
      if (err instanceof ApiError) setError(`${err.code}: ${err.message}`)
      else setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.card} style={{ marginBottom: 16 }}>
      <p className={styles.cardTitle} style={{ marginBottom: 12 }}>Новая рассылка</p>

      <div className={styles.field}>
        <label className={styles.label}>Текст сообщения</label>
        <textarea
          className={styles.textarea}
          rows={5}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={'Привет! 👋\nСегодня у нас <b>новинка</b>...'}
        />
        <p className={styles.hint}>{text.length}/4096 · форматирование HTML (теги &lt;b&gt;, &lt;i&gt;, &lt;a href&gt;)</p>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Разметка</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['HTML', 'MarkdownV2'] as const).map(m => (
            <button
              key={m}
              className={`${styles.filterPill} ${parseMode === m ? styles.filterPillOn : ''}`}
              onClick={() => setParseMode(m)}
            >{m}</button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={showButton}
            onChange={e => setShowButton(e.target.checked)}
            style={{ accentColor: '#7c5cff' }}
          />
          Добавить кнопку
        </label>
      </div>

      {showButton && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>Текст кнопки</label>
            <input className={styles.input} value={btnText} onChange={e => setBtnText(e.target.value)} placeholder="Открыть приложение" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>URL кнопки</label>
            <input className={styles.input} value={btnUrl} onChange={e => setBtnUrl(e.target.value)} placeholder="https://t.me/YourBot/app" />
          </div>
        </>
      )}

      {error && <div className={styles.errorBox}>{error}</div>}

      <button
        className={styles.actionBtn}
        style={{ width: '100%', opacity: canSend ? 1 : 0.4, cursor: canSend ? 'pointer' : 'not-allowed' }}
        onClick={send}
        disabled={!canSend}
      >
        {busy ? 'Запускаем…' : '📣 Отправить рассылку'}
      </button>
    </div>
  )
}

// ─── Grant partner modal ─────────────────────────────────────────────────
function GrantPartnerModal({ onClose, onDone }: { onClose: () => void; onDone: () => void | Promise<void> }) {
  const [targetId, setTargetId] = useState('')
  const [slug, setSlug] = useState('')
  const [sharePct, setSharePct] = useState('50')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    !busy &&
    /^\d+$/.test(targetId) &&
    /^[\w-]{3,32}$/.test(slug) &&
    /^\d+(\.\d{1,2})?$/.test(sharePct) &&
    Number(sharePct) >= 0 &&
    Number(sharePct) <= 100

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await adminGrantPartner({
        target_user_id: Number(targetId),
        blogger_slug: slug.trim(),
        revenue_share_bps: Math.round(Number(sharePct) * 100),
        notes: notes.trim() || undefined,
      })
      await onDone()
    } catch (err) {
      if (err instanceof ApiError) setError(`${err.code}: ${err.message}`)
      else setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <h2 className={styles.modalTitle}>Выдать роль партнёра</h2>

        <div className={styles.field}>
          <label className={styles.label}>Telegram user_id</label>
          <input
            className={styles.input}
            value={targetId}
            onChange={(e) => setTargetId(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="123456789"
          />
          <p className={styles.hint}>
            Юзер должен сначала открыть Mini App хотя бы раз (мы его пишем в users). Узнать ID
            можно через @userinfobot или в админ-таблицах.
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Реферальный slug</label>
          <input
            className={styles.input}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="vasya_blogger"
          />
          <p className={styles.hint}>
            3-32 символа: латиница, цифры, _ и -. Будет использоваться в ссылке{' '}
            <code>t.me/&lt;bot&gt;/&lt;app&gt;?startapp={slug || 'vasya_blogger'}</code>
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Доля от платежей, %</label>
          <input
            className={styles.input}
            value={sharePct}
            onChange={(e) => setSharePct(e.target.value)}
            placeholder="50"
          />
          <p className={styles.hint}>50 = партнёр получает 50% от Stars. По умолчанию 50%.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Заметка для админа (опционально)</label>
          <input
            className={styles.input}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Канал @example, договор от ..."
          />
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.modalActions}>
          <button className={`${styles.modalBtn} ${styles.modalBtnGhost}`} onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button
            className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
            onClick={submit}
            disabled={!canSubmit}
          >
            {busy ? 'Сохраняем…' : 'Выдать роль'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit partner modal ──────────────────────────────────────────────────
function EditPartnerModal({
  partner,
  onClose,
  onDone,
}: {
  partner: AdminPartner
  onClose: () => void
  onDone: () => void | Promise<void>
}) {
  const [slug, setSlug] = useState(partner.blogger_slug)
  const [sharePct, setSharePct] = useState((partner.revenue_share_bps / 100).toString())
  const [notes, setNotes] = useState(partner.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    !busy &&
    /^[\w-]{3,32}$/.test(slug) &&
    /^\d+(\.\d{1,2})?$/.test(sharePct) &&
    Number(sharePct) >= 0 &&
    Number(sharePct) <= 100

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await adminUpdatePartner(partner.telegram_user_id, {
        blogger_slug: slug.trim(),
        revenue_share_bps: Math.round(Number(sharePct) * 100),
        notes: notes.trim() || undefined,
      })
      await onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <h2 className={styles.modalTitle}>Изменить партнёра</h2>
        <p className={styles.cardSubtitle} style={{ marginBottom: 16 }}>
          {partner.partner_first_name || `User #${partner.telegram_user_id}`}
        </p>

        <div className={styles.field}>
          <label className={styles.label}>Slug</label>
          <input className={styles.input} value={slug} onChange={(e) => setSlug(e.target.value)} />
          <p className={styles.hint}>
            При смене старые атрибуции остаются за партнёром (matched_partner_id).
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Доля, %</label>
          <input className={styles.input} value={sharePct} onChange={(e) => setSharePct(e.target.value)} />
          <p className={styles.hint}>
            Применится к НОВЫМ платежам. Старые остаются с зафиксированной долей.
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Заметка</label>
          <input className={styles.input} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.modalActions}>
          <button className={`${styles.modalBtn} ${styles.modalBtnGhost}`} onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button
            className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
            onClick={submit}
            disabled={!canSubmit}
          >
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Character create/edit modal ────────────────────────────────────────
// Resize + compress image to ≤600×600 JPEG@75% so payload stays under 512kb
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objUrl)
      const MAX = 600
      let w = img.width, h = img.height
      if (w > MAX || h > MAX) {
        if (w >= h) { h = Math.round(h * MAX / w); w = MAX }
        else        { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Не удалось прочитать изображение')) }
    img.src = objUrl
  })
}

const CHAR_CATEGORIES = CATEGORIES.filter(c => c !== 'Все')

interface CharForm {
  id: string
  name: string
  description: string
  category: string
  gender: string
  tags: string          // comma-separated
  gradientKey: string
  iconType: string
  sortOrder: string
  isNSFW: boolean
  isNew: boolean
  firstMessage: string
  persona: string
  signature: string
  opinions: string
  eraEnabled: boolean
  bornYear: string
  diedYear: string
  eraContext: string
  knewWell: string      // one per line
  didntKnow: string     // one per line
}

function emptyForm(): CharForm {
  return {
    id: '', name: '', description: '', category: 'Другие', gender: '',
    tags: '', gradientKey: 'default', iconType: 'brain', sortOrder: '0',
    isNSFW: false, isNew: false, firstMessage: '', persona: '',
    signature: '', opinions: '', eraEnabled: false,
    bornYear: '', diedYear: '', eraContext: '', knewWell: '', didntKnow: '',
  }
}

function charToForm(c: DbCharacter): CharForm {
  return {
    id:           c.id,
    name:         c.name,
    description:  c.description,
    category:     c.category,
    gender:       c.gender ?? '',
    tags:         (c.tags ?? []).join(', '),
    gradientKey:  c.gradientKey,
    iconType:     c.iconType,
    sortOrder:    String(c.sort_order),
    isNSFW:       c.isNSFW,
    isNew:        c.isNew,
    firstMessage: c.firstMessage,
    persona:      c.persona,
    signature:    c.signature ?? '',
    opinions:     c.opinions ?? '',
    eraEnabled:   !!c.era,
    bornYear:     c.era ? String(c.era.bornYear) : '',
    diedYear:     c.era?.diedYear != null ? String(c.era.diedYear) : '',
    eraContext:   c.era?.context ?? '',
    knewWell:     (c.era?.knewWell ?? []).join('\n'),
    didntKnow:    (c.era?.didntKnow ?? []).join('\n'),
  }
}

function formToPayload(f: CharForm) {
  const era = f.eraEnabled && f.bornYear ? {
    bornYear:  Number(f.bornYear),
    diedYear:  f.diedYear ? Number(f.diedYear) : null,
    context:   f.eraContext.trim() || undefined,
    knewWell:  f.knewWell.split('\n').map(s => s.trim()).filter(Boolean),
    didntKnow: f.didntKnow.split('\n').map(s => s.trim()).filter(Boolean),
  } : undefined

  return {
    name:         f.name.trim(),
    description:  f.description.trim(),
    category:     f.category,
    gender:       f.gender || undefined,
    tags:         f.tags.split(',').map(s => s.trim()).filter(Boolean),
    gradientKey:  f.gradientKey.trim() || 'default',
    iconType:     f.iconType.trim() || 'brain',
    sortOrder:    Number(f.sortOrder) || 0,
    isNSFW:       f.isNSFW,
    isNew:        f.isNew,
    firstMessage: f.firstMessage.trim(),
    persona:      f.persona.trim(),
    signature:    f.signature.trim() || undefined,
    opinions:     f.opinions.trim() || undefined,
    era,
  }
}

function CharacterEditModal({
  char,
  onClose,
  onDone,
}: {
  char: DbCharacter | null
  onClose: () => void
  onDone: () => void | Promise<void>
}) {
  const isEdit = char !== null
  const [form, setForm] = useState<CharForm>(() => char ? charToForm(char) : emptyForm())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    char?.photo_url ? getBackendRoot() + char.photo_url : null
  )
  const [photoBusy, setPhotoBusy] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof CharForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))
  const setCheck = (field: keyof CharForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.checked }))

  const canSubmit = !busy && form.name.trim().length > 0 && (isEdit || form.id.trim().length > 0)

  const submit = async () => {
    setBusy(true); setError(null)
    try {
      if (isEdit) {
        await adminUpdateCharacter(char.id, formToPayload(form))
      } else {
        await adminCreateCharacter({ id: form.id.trim(), ...formToPayload(form) })
      }
      await onDone()
    } catch (err) {
      if (err instanceof ApiError) setError(`${err.code}: ${err.message}`)
      else setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handlePhotoFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoBusy(true); setError(null)
    try {
      const dataUrl = await compressImage(file)
      setPhotoPreview(dataUrl)
      if (isEdit) {
        const res = await adminUploadCharacterPhoto(char.id, dataUrl)
        setPhotoPreview(getBackendRoot() + res.photo_url)
      }
      // If creating: store compressed data URL in form state for later upload after create
      // For simplicity here, photo upload is only available after character creation
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPhotoBusy(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <h2 className={styles.modalTitle}>
          {isEdit ? `Редактировать: ${char.name}` : 'Новый персонаж'}
        </h2>

        {/* Photo upload (edit mode only) */}
        {isEdit && (
          <div className={styles.field} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 12, background: '#1a1a1a',
              border: '1px solid #303030', overflow: 'hidden', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {photoPreview
                ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 28 }}>🎭</span>
              }
            </div>
            <div>
              <button
                className={styles.smallBtn}
                onClick={() => photoInputRef.current?.click()}
                disabled={photoBusy}
              >
                {photoBusy ? 'Загрузка…' : photoPreview ? 'Сменить фото' : 'Загрузить фото'}
              </button>
              <p className={styles.hint}>JPEG/PNG до 600×600 · автосжатие</p>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhotoFile}
            />
          </div>
        )}

        {/* ID — only when creating */}
        {!isEdit && (
          <div className={styles.field}>
            <label className={styles.label}>ID персонажа *</label>
            <input
              className={styles.input}
              value={form.id}
              onChange={set('id')}
              placeholder="freud, my-new-hero"
            />
            <p className={styles.hint}>Только a-z, 0-9, дефис. Нельзя изменить после создания.</p>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Имя *</label>
          <input className={styles.input} value={form.name} onChange={set('name')} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Краткое описание</label>
          <textarea className={styles.textarea} rows={2} value={form.description} onChange={set('description')} placeholder="Отец психоанализа" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className={styles.field}>
            <label className={styles.label}>Категория</label>
            <select className={styles.input} value={form.category} onChange={set('category')}>
              {CHAR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Другие">Другие</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Пол</label>
            <select className={styles.input} value={form.gender} onChange={set('gender')}>
              <option value="">Не указан</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className={styles.field}>
            <label className={styles.label}>Иконка (iconType)</label>
            <input className={styles.input} value={form.iconType} onChange={set('iconType')} placeholder="brain" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Градиент</label>
            <input className={styles.input} value={form.gradientKey} onChange={set('gradientKey')} placeholder="default" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Теги (через запятую)</label>
          <input className={styles.input} value={form.tags} onChange={set('tags')} placeholder="психолог, история, наука" />
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#ccc', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isNSFW} onChange={setCheck('isNSFW')} style={{ accentColor: '#ff5cdb' }} />
            18+ (NSFW)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#ccc', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isNew} onChange={setCheck('isNew')} style={{ accentColor: '#7c5cff' }} />
            Новинка
          </label>
          <div className={styles.field} style={{ margin: 0, flex: 1 }}>
            <label className={styles.label} style={{ textTransform: 'none', fontSize: 11 }}>Порядок</label>
            <input className={styles.input} type="number" value={form.sortOrder} onChange={set('sortOrder')} style={{ padding: '6px 8px' }} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Первое сообщение персонажа</label>
          <textarea className={styles.textarea} rows={3} value={form.firstMessage} onChange={set('firstMessage')} placeholder="Добрый день! Чем могу помочь?" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Системный промпт (persona)</label>
          <textarea className={styles.textarea} rows={6} value={form.persona} onChange={set('persona')} placeholder="Ты — Зигмунд Фрейд, отец психоанализа..." />
          <p className={styles.hint}>{form.persona.length} симв. · видно только LLM, не пользователю</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Фирменный ход (signature) — опционально</label>
          <textarea className={styles.textarea} rows={2} value={form.signature} onChange={set('signature')} placeholder="переводишь разговор на детство и сны" />
          <p className={styles.hint}>Как персонаж типично реагирует на эмоциональные темы</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Убеждения (opinions) — опционально</label>
          <textarea className={styles.textarea} rows={2} value={form.opinions} onChange={set('opinions')} placeholder="считаешь, что поведение определяется бессознательным" />
        </div>

        {/* Era */}
        <div className={styles.field}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ccc', cursor: 'pointer', marginBottom: 8 }}>
            <input type="checkbox" checked={form.eraEnabled} onChange={setCheck('eraEnabled')} style={{ accentColor: '#7c5cff' }} />
            <span className={styles.label} style={{ margin: 0 }}>Эпоха персонажа</span>
          </label>
          {form.eraEnabled && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className={styles.label}>Год рождения *</label>
                  <input className={styles.input} type="number" value={form.bornYear} onChange={set('bornYear')} placeholder="1856" />
                </div>
                <div>
                  <label className={styles.label}>Год смерти</label>
                  <input className={styles.input} type="number" value={form.diedYear} onChange={set('diedYear')} placeholder="1939 или пусто" />
                </div>
              </div>
              <div className={styles.field} style={{ marginTop: 8 }}>
                <label className={styles.label}>Описание эпохи</label>
                <input className={styles.input} value={form.eraContext} onChange={set('eraContext')} placeholder="Вена конца 19 — начала 20 в." />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Что хорошо знал (по одному на строку)</label>
                <textarea className={styles.textarea} rows={3} value={form.knewWell} onChange={set('knewWell')} placeholder={"психоанализ\nинтерпретация снов\nвенское общество"} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Чего не знал (по одному на строку)</label>
                <textarea className={styles.textarea} rows={3} value={form.didntKnow} onChange={set('didntKnow')} placeholder={"интернет\nсмартфоны\nсоциальные сети"} />
              </div>
            </>
          )}
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.modalActions}>
          <button className={`${styles.modalBtn} ${styles.modalBtnGhost}`} onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button
            className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
            onClick={submit}
            disabled={!canSubmit}
          >
            {busy ? 'Сохраняем…' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Mark payout paid modal ──────────────────────────────────────────────
function MarkPayoutPaidModal({
  payout,
  onClose,
  onDone,
}: {
  payout: AdminPayout
  onClose: () => void
  onDone: () => void | Promise<void>
}) {
  const [externalRef, setExternalRef] = useState('')
  const [amountRub, setAmountRub] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = !busy && externalRef.trim().length >= 3 && Number(amountRub) > 0

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await adminMarkPayoutPaid(payout.id, {
        external_ref: externalRef.trim(),
        amount_rub: Number(amountRub),
      })
      await onDone()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <h2 className={styles.modalTitle}>Отметить выплаченным</h2>
        <p className={styles.cardSubtitle} style={{ marginBottom: 16 }}>
          Выплата #{payout.id} · {payout.amount_rub != null ? `${payout.amount_rub.toLocaleString('ru')} ₽` : `${payout.amount_stars} ⭐`}
          {payout.receipt_number && <> · чек {payout.receipt_number}</>}
        </p>

        <div className={styles.field}>
          <label className={styles.label}>Номер платёжки из банк-клиента</label>
          <input
            className={styles.input}
            value={externalRef}
            onChange={(e) => setExternalRef(e.target.value)}
            placeholder="P/N 1234567890"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Сумма в рублях</label>
          <input
            className={styles.input}
            value={amountRub}
            onChange={(e) => setAmountRub(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="2000"
            inputMode="decimal"
          />
          <p className={styles.hint}>Для бухгалтерии. Партнёр увидит эту сумму в уведомлении.</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.modalActions}>
          <button className={`${styles.modalBtn} ${styles.modalBtnGhost}`} onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button
            className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
            onClick={submit}
            disabled={!canSubmit}
          >
            {busy ? 'Сохраняем…' : 'Отметить выплаченным'}
          </button>
        </div>
      </div>
    </div>
  )
}
