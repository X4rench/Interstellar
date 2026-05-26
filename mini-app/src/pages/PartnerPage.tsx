import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignal, miniApp } from '@telegram-apps/sdk-react'

import { useApp } from '../context/AppContext'
import {
  partnerGetSummary,
  partnerGetProfile,
  partnerUpdateProfile,
  partnerListPayouts,
  partnerCreatePayout,
  partnerUploadReceipt,
  type PartnerSummary,
  type PartnerProfile,
  type PartnerPayoutItem,
  ApiError,
} from '../utils/api'
import { BackIcon } from '../icons'
import { appAlert, appConfirm } from '../components/AppDialogs'

import styles from './PartnerPage.module.css'

function fmtRub(val: number | null | undefined): string {
  if (val == null) return '—'
  return val.toLocaleString('ru', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ₽'
}

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

const statusLabel: Record<string, string> = {
  requested: 'Запрошена',
  awaiting_receipt: 'Ждём чек',
  approved: 'Одобрена',
  paid: 'Выплачена',
  rejected: 'Отклонена',
}
const statusClass: Record<string, string> = {
  requested: styles.statusRequested,
  awaiting_receipt: styles.statusAwaiting,
  approved: styles.statusApproved,
  paid: styles.statusPaid,
  rejected: styles.statusRejected,
}

export function PartnerPage() {
  const nav = useNavigate()
  const { isPartner, userName, botUsername, botAppName } = useApp()
  // botUsername нужен чтобы сгенерировать реферальную ссылку. На клиенте
  // его не знаем напрямую — возьмём из summary.business_name либо
  // дефолт-плейсхолдер. Лучше пробросить через env-переменную VITE_BOT_USERNAME.

  const [summary, setSummary] = useState<PartnerSummary | null>(null)
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [payouts, setPayouts] = useState<PartnerPayoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [piiModalOpen, setPiiModalOpen] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  const themeColor = useSignal(miniApp.headerColor)
  void themeColor

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, p, po] = await Promise.all([
        partnerGetSummary(),
        partnerGetProfile(),
        partnerListPayouts(),
      ])
      setSummary(s.summary)
      setProfile(p.profile)
      setPayouts(po.payouts)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true)
      } else {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (forbidden || (!loading && !isPartner && !summary)) {
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
            Ты не партнёр. Если хочешь стать партнёром — напиши админу.
          </div>
        </div>
      </div>
    )
  }

  const handleCopyLink = async () => {
    if (!summary) return
    if (!botUsername) {
      await appAlert({
        title: 'Ссылка не готова',
        message: 'Админ не настроил BOT_USERNAME на бэке. Сообщи об этом.',
      })
      return
    }
    const link = `https://t.me/${botUsername}/${botAppName}?startapp=${summary.blogger_slug}`
    try {
      await navigator.clipboard.writeText(link)
      await appAlert({ title: 'Ссылка скопирована', message: link })
    } catch {
      // Fallback: показываем ссылку в модалке чтобы юзер мог выделить и скопировать.
      await appAlert({ title: 'Скопируй вручную', message: link })
    }
  }

  const handleRequestPayout = async () => {
    if (!summary) return
    if (!profile?.pii_provided) {
      await appAlert({
        title: 'Сначала реквизиты',
        message: 'Чтобы запросить выплату, нужно заполнить ФИО, ИНН, банковские реквизиты в разделе «Реквизиты».',
      })
      setPiiModalOpen(true)
      return
    }
    const ok = await appConfirm({
      title: 'Запросить выплату?',
      message: `Сумма: ${fmtRub(summary.balance_rub)}\n\nПосле одобрения админом получишь инструкцию по выставлению чека через «Мой налог».`,
      confirmLabel: 'Запросить',
    })
    if (!ok) return
    try {
      const res = await partnerCreatePayout()
      await appAlert({
        title: `✅ Заявка #${res.payout_id} создана`,
        message: `Сумма: ${fmtRub(res.amount_rub)}\n\nЖди инструкцию от админа по выставлению чека.`,
      })
      await refresh()
    } catch (err) {
      await appAlert({ title: 'Ошибка', message: (err as Error).message })
    }
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => nav('/profile')} aria-label="Назад">
          <BackIcon />
        </button>
        <h1 className={styles.title}>Партнёрский кабинет</h1>
        <span className={styles.partnerPill}>{userName}</span>
      </header>

      <div className={styles.body}>
        {error && <div className={styles.errorBox}>{error}</div>}
        {loading && <p className={styles.emptyText}>Загрузка…</p>}

        {summary && (
          <>
            {/* Banner: slug + share + copy-link */}
            <div className={styles.banner}>
              <p className={styles.bannerSlug}>Твой реферальный slug</p>
              <div className={styles.bannerSlugValue}>{summary.blogger_slug}</div>
              <p className={styles.bannerShare}>
                Доля: {(summary.revenue_share_bps / 100).toFixed(0)}% от каждого платежа
              </p>
              <button className={styles.copyLinkBtn} onClick={handleCopyLink}>
                Скопировать реферальную ссылку
              </button>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{summary.referrals_count}</span>
                <span className={styles.statLbl}>Перешли по ссылке</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{summary.conversions_count}</span>
                <span className={styles.statLbl}>Оплатили Pro</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{fmtRub(summary.earned_rub)}</span>
                <span className={styles.statLbl}>Заработано всего</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{fmtRub(summary.paid_out_rub)}</span>
                <span className={styles.statLbl}>Выплачено</span>
              </div>
            </div>

            {/* Balance + request payout */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Баланс</h3>
              <div className={styles.balanceCard}>
                <p className={styles.balanceLbl}>Доступно к выплате</p>
                <p className={styles.balanceVal}>{fmtRub(summary.balance_rub)}</p>
                <p className={styles.balanceHint}>
                  Минимум для запроса: {fmtRub(summary.min_payout_rub)}
                  {summary.pending_payouts_rub > 0 && (
                    <> · В обработке: {fmtRub(summary.pending_payouts_rub)}</>
                  )}
                </p>
                <button
                  className={styles.payoutBtn}
                  disabled={!summary.can_request_payout || summary.pending_payouts_rub > 0}
                  onClick={handleRequestPayout}
                >
                  {summary.pending_payouts_rub > 0
                    ? 'Заявка уже в обработке'
                    : !summary.can_request_payout
                      ? `Накопи ещё ${fmtRub(summary.min_payout_rub - summary.balance_rub)}`
                      : 'Запросить выплату'}
                </button>
              </div>
            </div>

            {/* PII status */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Реквизиты для выплат</h3>
              {profile?.pii_provided ? (
                <div className={styles.piiFilled}>
                  ✓ Реквизиты заполнены
                </div>
              ) : (
                <div className={styles.piiMissing}>
                  ⚠ Заполни реквизиты чтобы получать выплаты
                </div>
              )}
              <button className={styles.editPiiBtn} onClick={() => setPiiModalOpen(true)}>
                {profile?.pii_provided ? 'Изменить реквизиты' : 'Заполнить реквизиты'}
              </button>
            </div>

            {/* Payouts history */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>История выплат</h3>
              {payouts.length === 0 && <p className={styles.emptyText}>Пока пусто</p>}
              {payouts.map((po) => (
                <div key={po.id} className={styles.payoutItem}>
                  <div className={styles.payoutRow}>
                    <div style={{ flex: 1 }}>
                      <p className={styles.payoutAmount}>#{po.id} · {fmtRub(po.amount_rub)}</p>
                      <p className={styles.payoutDate}>Запрошена {fmtDate(po.requested_at)}</p>
                    </div>
                    <span className={`${styles.statusPill} ${statusClass[po.status]}`}>
                      {statusLabel[po.status]}
                    </span>
                  </div>

                  {/* Инструкция по выставлению чека (когда awaiting_receipt) */}
                  {po.status === 'awaiting_receipt' && (
                    <>
                      <div className={styles.checkInstructionBox}>
                        📋 Выстави нам чек через приложение «Мой налог»:<br />
                        <code>{summary.business_name || 'Interstellar'}</code>
                        {summary.business_inn && (
                          <>
                            <br />ИНН: <code>{summary.business_inn}</code>
                          </>
                        )}
                        <br />Сумма чека: {po.amount_rub ? fmtRub(po.amount_rub) : 'по сумме выплаты'}.
                        <br /><br />
                        После выставления — введи номер чека ниже:
                      </div>
                      <ReceiptUploadForm
                        payoutId={po.id}
                        onDone={() => void refresh()}
                      />
                    </>
                  )}
                  {po.receipt_number && (
                    <div className={styles.payoutDetails}>
                      📋 Чек: <code>{po.receipt_number}</code>
                      {po.receipt_uploaded_at && <> · {fmtDate(po.receipt_uploaded_at)}</>}
                    </div>
                  )}
                  {po.external_payout_ref && (
                    <div className={styles.payoutDetails}>
                      💸 Платёж: <code>{po.external_payout_ref}</code>
                      {po.external_payout_amount_rub && <> · {po.external_payout_amount_rub} ₽</>}
                      <br />Отправлен {fmtDate(po.external_payout_at)}
                    </div>
                  )}
                  {po.rejection_reason && (
                    <div className={styles.payoutDetails}>
                      ❌ Причина отказа: {po.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {piiModalOpen && profile && (
        <PiiModal
          profile={profile}
          onClose={() => setPiiModalOpen(false)}
          onDone={async () => {
            setPiiModalOpen(false)
            await refresh()
          }}
        />
      )}
    </div>
  )
}

// ─── Receipt upload form (inline) ──────────────────────────────────────
function ReceiptUploadForm({ payoutId, onDone }: { payoutId: number; onDone: () => void }) {
  const [receipt, setReceipt] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (receipt.trim().length < 3) return
    setBusy(true)
    try {
      await partnerUploadReceipt(payoutId, receipt.trim())
      onDone()
    } catch (err) {
      await appAlert({ title: 'Ошибка', message: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.receiptForm}>
      <input
        className={styles.receiptInput}
        value={receipt}
        onChange={(e) => setReceipt(e.target.value)}
        placeholder="Номер чека из «Мой налог»"
      />
      <button
        className={styles.smallBtn}
        onClick={submit}
        disabled={busy || receipt.trim().length < 3}
      >
        {busy ? '…' : 'OK'}
      </button>
    </div>
  )
}

// ─── PII modal ─────────────────────────────────────────────────────────
function PiiModal({
  profile,
  onClose,
  onDone,
}: {
  profile: PartnerProfile
  onClose: () => void
  onDone: () => void | Promise<void>
}) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [inn, setInn] = useState(profile.inn || '')
  const [email, setEmail] = useState(profile.email || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [bankAccount, setBankAccount] = useState(profile.bank_details?.account || '')
  const [bik, setBik] = useState(profile.bank_details?.bik || '')
  const [bankName, setBankName] = useState(profile.bank_details?.bank_name || '')
  const [consent, setConsent] = useState(profile.pii_provided) // если уже заполнен — считаем что согласие есть
  const [offerAccepted, setOfferAccepted] = useState(profile.pii_provided) // согласие с договором-офертой

  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (fullName.trim().length < 3) e.full_name = 'Минимум 3 символа'
    if (!/^\d{12}$/.test(inn) && !/^\d{10}$/.test(inn)) e.inn = '12 цифр для самозанятого/ИП или 10 для юр.лица'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Невалидный email'
    if (!/^\+?[\d\s\-()]{10,20}$/.test(phone)) e.phone = 'Номер телефона'
    if (!/^\d{20}$/.test(bankAccount.replace(/\s/g, ''))) e.bank_account = 'Расчётный счёт: 20 цифр'
    if (!/^\d{9}$/.test(bik.replace(/\s/g, ''))) e.bik = 'БИК: 9 цифр'
    if (bankName.trim().length < 3) e.bank_name = 'Название банка'
    if (!consent) e.consent = 'Нужно согласие на обработку ПД'
    if (!offerAccepted) e.offerAccepted = 'Нужно принять условия партнёрской оферты'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setBusy(true)
    setGeneralError(null)
    try {
      await partnerUpdateProfile({
        full_name: fullName.trim(),
        inn: inn.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        bank_details: {
          account: bankAccount.replace(/\s/g, ''),
          bik: bik.replace(/\s/g, ''),
          bank_name: bankName.trim(),
        },
        consent, // UX-5: реально передаём состояние чекбокса
      })
      await onDone()
    } catch (err) {
      if (err instanceof ApiError) setGeneralError(err.code)
      else setGeneralError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHandle} />
        <h2 className={styles.modalTitle}>Реквизиты для выплат</h2>
        <p className={styles.modalSubtitle}>
          Зашифровываются AES-256-GCM. Видны только тебе и админу при подготовке выплаты.
        </p>

        <div className={styles.field}>
          <label className={styles.label}>ФИО полностью</label>
          <input
            className={`${styles.input} ${errors.full_name ? styles.fieldError : ''}`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иванов Иван Иванович"
          />
          {errors.full_name && <p className={`${styles.fieldHint} ${styles.fieldHintError}`}>{errors.full_name}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>ИНН</label>
          <input
            className={`${styles.input} ${errors.inn ? styles.fieldError : ''}`}
            value={inn}
            onChange={(e) => setInn(e.target.value.replace(/\D/g, ''))}
            placeholder="123456789012"
            inputMode="numeric"
            maxLength={12}
          />
          <p className={`${styles.fieldHint} ${errors.inn ? styles.fieldHintError : ''}`}>
            {errors.inn || '12 цифр для самозанятого/ИП, 10 для юр.лица'}
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={`${styles.input} ${errors.email ? styles.fieldError : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="ivan@example.ru"
          />
          {errors.email && <p className={`${styles.fieldHint} ${styles.fieldHintError}`}>{errors.email}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Телефон</label>
          <input
            className={`${styles.input} ${errors.phone ? styles.fieldError : ''}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="+79991234567"
          />
          {errors.phone && <p className={`${styles.fieldHint} ${styles.fieldHintError}`}>{errors.phone}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Расчётный счёт</label>
          <input
            className={`${styles.input} ${errors.bank_account ? styles.fieldError : ''}`}
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
            placeholder="40817810099912345678"
            inputMode="numeric"
            maxLength={20}
          />
          <p className={`${styles.fieldHint} ${errors.bank_account ? styles.fieldHintError : ''}`}>
            {errors.bank_account || '20 цифр расчётного счёта'}
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>БИК банка</label>
          <input
            className={`${styles.input} ${errors.bik ? styles.fieldError : ''}`}
            value={bik}
            onChange={(e) => setBik(e.target.value.replace(/\D/g, ''))}
            placeholder="044525225"
            inputMode="numeric"
            maxLength={9}
          />
          {errors.bik && <p className={`${styles.fieldHint} ${styles.fieldHintError}`}>{errors.bik}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Название банка</label>
          <input
            className={`${styles.input} ${errors.bank_name ? styles.fieldError : ''}`}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="ПАО Сбербанк"
          />
          {errors.bank_name && <p className={`${styles.fieldHint} ${styles.fieldHintError}`}>{errors.bank_name}</p>}
        </div>

        <div className={styles.consentBlock}>
          <label className={styles.consentLabel}>
            <span
              className={`${styles.checkbox} ${consent ? styles.checkboxOn : ''}`}
              onClick={(e) => {
                e.preventDefault()
                setConsent((v) => !v)
              }}
            >
              {consent && (
                <svg width={12} height={12} viewBox="0 0 14 14" fill="none">
                  <path d="M3 7l3 3 5-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span>
              Я согласен на обработку моих персональных данных (ФИО, ИНН, email, телефон, банковские
              реквизиты) для целей выплат партнёрского вознаграждения по 152-ФЗ. Данные хранятся
              в зашифрованном виде, не передаются третьим лицам кроме как для проведения банковского
              перевода.
            </span>
          </label>
          {errors.consent && <p className={`${styles.fieldHint} ${styles.fieldHintError}`}>{errors.consent}</p>}
        </div>

        <div className={styles.consentBlock}>
          <label className={styles.consentLabel}>
            <span
              className={`${styles.checkbox} ${offerAccepted ? styles.checkboxOn : ''}`}
              onClick={(e) => {
                e.preventDefault()
                setOfferAccepted((v) => !v)
              }}
            >
              {offerAccepted && (
                <svg width={12} height={12} viewBox="0 0 14 14" fill="none">
                  <path d="M3 7l3 3 5-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span>
              Я ознакомлен(а) и принимаю условия{' '}
              <a
                href="#/legal/partner_offer"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c9b8ff', textDecoration: 'underline' }}
              >
                Партнёрской оферты
              </a>
              {' '}— в том числе обязанность маркировать рекламу erid-токеном, запрет на размещение
              на платформах Meta (Instagram/Facebook) от имени Заказчика, выставление чека в «Мой налог»
              перед выплатой по ставке 4%.
            </span>
          </label>
          {errors.offerAccepted && <p className={`${styles.fieldHint} ${styles.fieldHintError}`}>{errors.offerAccepted}</p>}
        </div>

        {generalError && <div className={styles.errorBox}>{generalError}</div>}

        <div className={styles.modalActions}>
          <button className={`${styles.modalBtn} ${styles.modalBtnGhost}`} onClick={onClose} disabled={busy}>
            Отмена
          </button>
          <button
            className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
            onClick={submit}
            disabled={busy}
          >
            {busy ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
