import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApp } from '../context/AppContext'
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
  type AdminPartner,
  type AdminPayout,
  type AdminAuditEntry,
  ApiError,
} from '../utils/api'
import { BackIcon } from '../icons'
import { appAlert, appConfirm, appPrompt } from '../components/AppDialogs'

import styles from './AdminPage.module.css'

type Tab = 'partners' | 'payouts' | 'audit'
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

  useEffect(() => {
    if (tab === 'partners') void loadPartners()
    else if (tab === 'payouts') void loadPayouts(payoutStatusFilter)
    else if (tab === 'audit') void loadAudit()
  }, [tab, payoutStatusFilter, loadPartners, loadPayouts, loadAudit])

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
                      <span className={styles.cardStatVal}>{p.earned_stars} ⭐</span>
                      <span className={styles.cardStatLbl}>Заработано</span>
                    </div>
                    <div className={styles.cardStatItem}>
                      <span className={styles.cardStatVal}>{p.paid_out_stars} ⭐</span>
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
                        #{po.id} · {po.amount_stars} ⭐
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
                            message: `Сумма: ${po.amount_stars} ⭐\n\nЕсли чек ещё не загружен — партнёру придёт инструкция по выставлению. Если чек уже есть — статус перейдёт сразу в "approved".`,
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
                            message: `Сумма: ${po.amount_stars} ⭐\n\nПартнёр получит уведомление с указанной причиной.`,
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
          Выплата #{payout.id} · {payout.amount_stars} ⭐
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
