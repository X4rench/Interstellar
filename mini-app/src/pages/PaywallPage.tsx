import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { openInvoice, openLink } from '@telegram-apps/sdk-react'

import { useApp, type PaywallReason } from '../context/AppContext'
import {
  createInvoice as apiCreateInvoice,
  getInvoiceStatus as apiGetInvoiceStatus,
  ykCreatePayment,
  ykGetPaymentStatus,
  PLANS,
  type PlanCode,
  ApiError,
} from '../utils/api'
import { StarIcon } from '../icons'
import invertLogo from '../icons/invertLogo.png'

import styles from './PaywallPage.module.css'

type FlowState =
  | 'idle'
  | 'creating'
  | 'opening'
  | 'paying'
  | 'polling_timeout'
  | 'success'
  | 'cancelled'
  | 'failed'
  | 'rate_limited'
  | 'error'

function getReasonHeading(reason: PaywallReason | null): { title: string; subtitle: string } {
  switch (reason) {
    case 'nsfw':
      return {
        title: 'Откройте персонажи 18+',
        subtitle: 'Premium — без цензуры и без возрастных ограничений',
      }
    case 'limit':
      return {
        title: 'Лимит исчерпан',
        subtitle: 'Подключи подписку чтобы продолжить общение',
      }
    case 'create-limit':
      return {
        title: 'Создавайте без ограничений',
        subtitle: 'Premium — бесконечно своих персонажей',
      }
    case 'manual':
    default:
      return {
        title: 'Открой полный доступ',
        subtitle: 'Каждый день 50-200 сообщений, 18+ персонажи',
      }
  }
}

function CloseIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
      <path d="M3 3l10 10M13 3L3 13" stroke="#888" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  )
}

function CheckIconSmall({ color = '#000' }: { color?: string }) {
  return (
    <svg width={11} height={11} viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 7.5l3 3 6-6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SpinnerIcon() {
  // currentColor — спиннер наследует цвет текста кнопки (белый на любой кнопке).
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" style={{ animation: 'paywallSpin 1s linear infinite', color: 'currentColor' }}>
      <circle cx={12} cy={12} r={10} stroke="currentColor" strokeOpacity={0.25} strokeWidth={3} fill="none" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" fill="none" />
    </svg>
  )
}

interface TierCardProps {
  plan: PlanCode
  popular?: boolean
  features: string[]
  currentTier: 'free' | 'basic' | 'premium'
  flowState: FlowState
  busyPlan: PlanCode | null
  onBuy: (plan: PlanCode) => void
}

function TierCard({ plan, popular, features, currentTier, flowState, busyPlan, onBuy }: TierCardProps) {
  const meta = PLANS[plan]

  // Determine if this is user's current tier (only for subscriptions, not day_pass)
  const isCurrentTier =
    (plan === 'basic_month' && currentTier === 'basic') ||
    (plan === 'premium_month' && currentTier === 'premium')
  // Premium is upgrade if user has Basic; Basic is downgrade if user has Premium (hide).
  const isDowngrade = plan === 'basic_month' && currentTier === 'premium'

  if (isDowngrade) return null

  const busy = busyPlan === plan
  const isWorking = busy && (flowState === 'creating' || flowState === 'opening' || flowState === 'paying')

  return (
    <div className={`${styles.tierCard} ${popular ? styles.tierCardPopular : ''}`}>
      {popular && <span className={styles.tierBadge}>ХИТ</span>}
      <h3 className={styles.tierTitle}>{meta.title}</h3>
      <p className={styles.tierSubtitle}>{meta.shortDescription}</p>

      <div className={styles.tierPriceRow}>
        <span className={styles.tierPriceStars}>{meta.approxRub} ₽</span>
      </div>
      <p className={styles.tierPeriod}>
        {plan === 'day_pass' ? 'разово / 24 часа' : '/ месяц'}
      </p>

      <ul className={styles.tierFeatures}>
        {features.map((f) => (
          <li key={f} className={styles.tierFeatureItem}>
            <span className={styles.tierFeatureCheck}>
              <CheckIconSmall color={popular ? '#fff' : '#000'} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isCurrentTier ? (
        <button className={`${styles.tierBtn} ${styles.tierBtnDisabled}`} disabled>
          ✓ Текущий тариф
        </button>
      ) : (
        <button
          className={`${styles.tierBtn} ${popular ? styles.tierBtnPrimary : styles.tierBtnSecondary}`}
          onClick={() => onBuy(plan)}
          disabled={isWorking || busyPlan !== null}
        >
          {isWorking ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <SpinnerIcon />
              <span>
                {flowState === 'creating' ? 'Создаём…' : flowState === 'paying' ? 'Проверяем…' : 'Открываем…'}
              </span>
            </span>
          ) : currentTier === 'basic' && plan === 'premium_month' ? (
            'Апгрейд'
          ) : (
            `Подписаться за ${meta.approxRub} ₽`
          )}
        </button>
      )}
    </div>
  )
}

export function PaywallPage() {
  const nav = useNavigate()
  const {
    paywallReason,
    closePaywall,
    tier,
    dayPassActive,
    subscription,
    setLegalDocId,
    refreshSubscription,
  } = useApp()

  const heading = useMemo(() => getReasonHeading(paywallReason), [paywallReason])

  const [state, setState] = useState<FlowState>('idle')
  const [busyPlan, setBusyPlan] = useState<PlanCode | null>(null)
  const [errorDetail, setErrorDetail] = useState<string>('')
  const [pollCount, setPollCount] = useState(0)

  const currentPayloadRef = useRef<string | null>(null)
  const pollTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (pollTimerRef.current !== null) window.clearTimeout(pollTimerRef.current)
    }
  }, [])

  // Когда юзер вернулся из внешнего браузера (YK) не заплатив — останавливаем
  // поллинг и сбрасываем в idle. Без этого setPollCount каждые 2с держит
  // paywall в состоянии 'paying', вызывает частые setState и мигание.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Если мы в 'paying' или 'opening' — значит юзер ещё не оплатил
        // (иначе state уже был бы 'success'). Сбрасываем поллинг.
        setState((prev) => {
          if (prev === 'paying' || prev === 'opening') {
            if (pollTimerRef.current !== null) {
              window.clearTimeout(pollTimerRef.current)
              pollTimerRef.current = null
            }
            setBusyPlan(null)
            return 'idle'
          }
          return prev
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const startStatusPolling = (payload: string) => {
    setState('paying')
    setPollCount(0)
    let attempts = 0
    const maxAttempts = 40
    const tick = async () => {
      attempts++
      setPollCount(attempts)
      try {
        const res = await apiGetInvoiceStatus(payload)
        if (res.status === 'paid') {
          setState('success')
          refreshSubscription()
          window.setTimeout(closePaywall, 2000)
          return
        }
        if (res.status === 'expired' || res.status === 'failed') {
          setState('failed')
          setErrorDetail('Инвойс истёк или ошибка оплаты.')
          return
        }
        if (attempts >= maxAttempts) {
          setState('polling_timeout')
          setErrorDetail('Платёж обрабатывается. Подписка появится в Profile через минуту.')
          return
        }
        pollTimerRef.current = window.setTimeout(tick, 1500)
      } catch {
        if (attempts < maxAttempts) {
          pollTimerRef.current = window.setTimeout(tick, 2500)
        } else {
          setState('error')
          setErrorDetail('Сеть нестабильна. Проверь Pro в Profile через минуту.')
        }
      }
    }
    pollTimerRef.current = window.setTimeout(tick, 1500)
  }

  // YK status polling: после возврата с YK-сайта поллим до succeeded.
  // Отдельная функция от Stars-polling — другой endpoint, другая семантика
  // status ('succeeded' вместо 'paid', plus 'pending'/'canceled').
  const startYkPolling = (paymentId: string) => {
    setState('paying')
    setPollCount(0)
    let attempts = 0
    const maxAttempts = 60 // 60 × 2s = 2 минуты
    const tick = async () => {
      attempts++
      setPollCount(attempts)
      try {
        const res = await ykGetPaymentStatus(paymentId)
        if (res.status === 'succeeded') {
          setState('success')
          refreshSubscription()
          window.setTimeout(closePaywall, 2000)
          return
        }
        if (res.status === 'canceled') {
          setState('cancelled')
          return
        }
        if (attempts >= maxAttempts) {
          setState('polling_timeout')
          setErrorDetail('Платёж обрабатывается. Подписка появится в Profile через минуту.')
          return
        }
        pollTimerRef.current = window.setTimeout(tick, 2000)
      } catch {
        if (attempts < maxAttempts) {
          pollTimerRef.current = window.setTimeout(tick, 3000)
        } else {
          setState('error')
          setErrorDetail('Сеть нестабильна. Проверь Pro в Profile через минуту.')
        }
      }
    }
    pollTimerRef.current = window.setTimeout(tick, 2000)
  }

  const handleBuy = async (plan: PlanCode) => {
    if (state !== 'idle' && state !== 'failed' && state !== 'cancelled' && state !== 'error' && state !== 'rate_limited' && state !== 'polling_timeout') {
      return
    }
    setState('creating')
    setBusyPlan(plan)
    setErrorDetail('')

    // ── Попытка №1: ЮКасса (если настроена на бэке) ──
    // Авто-продление включаем по умолчанию для подписок (Day Pass — не имеет
    // смысла). На бэке save_payment_method=true → ЮК запомнит карту юзера
    // и cron каждый час продлит подписку без участия юзера.
    //
    // return_url — t.me ссылка чтобы юзер вернулся ОБРАТНО в TG-приложение
    // (не на лендинг-сайт). Telegram пeрехватит t.me/.../app и откроет
    // Mini App. startapp параметр пробрасывает yk_payment_id, чтобы при
    // re-open мы могли продолжить poll'инг даже если фронт-сессия сбросилась.
    // Бэк whitelist'ит только наш домен и t.me — другие хосты не пройдут.
    const returnUrl = `https://t.me/InterstellarAiBot/app?startapp=yk`
    try {
      // autoRenew: для Day Pass всегда false (разовая покупка),
      // для подписок — всегда true (recurring по умолчанию).
      const autoRenew = plan !== 'day_pass'
      const res = await ykCreatePayment(plan, returnUrl, autoRenew)
      if (res.confirmation_url) {
        currentPayloadRef.current = res.yk_payment_id
        setState('opening')
        // tg.openLink открывает в браузере, а не в WebView.
        // Юзер заплатит → ЮК редиректит на returnUrl → юзер вернётся
        // в TG → mini-app может пересоздаться, но мы уже поллим тут.
        // На случай нативного браузера — fallback на window.open.
        try {
          openLink(res.confirmation_url, { tryInstantView: false })
        } catch {
          window.open(res.confirmation_url, '_blank')
        }
        startYkPolling(res.yk_payment_id)
        return
      }
      // confirmation_url нет — статус succeeded сразу (recurring сценарий)?
      if (res.status === 'succeeded') {
        setState('success')
        refreshSubscription()
        window.setTimeout(closePaywall, 2000)
        return
      }
    } catch (err) {
      // 503 YK_NOT_CONFIGURED → fallback на Stars.
      // Остальные ошибки (429, 500) — показываем юзеру.
      if (err instanceof ApiError && err.code === 'YK_NOT_CONFIGURED') {
        console.warn('[paywall] YK not configured, falling back to Stars')
        // Provod ниже на Stars flow
      } else if (err instanceof ApiError && err.status === 429) {
        setState('rate_limited')
        setErrorDetail('Слишком часто. Подожди минуту.')
        setBusyPlan(null)
        return
      } else {
        // Любая другая ошибка — пробуем Stars как fallback
        console.warn('[paywall] YK failed, falling back to Stars:', err)
      }
    }

    // ── Попытка №2: Telegram Stars (legacy fallback) ──
    let invoiceLink: string
    let payload: string
    try {
      const res = await apiCreateInvoice(plan)
      invoiceLink = res.invoice_link
      payload = res.payload
      currentPayloadRef.current = payload
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setState('rate_limited')
        setErrorDetail('Слишком часто. Подожди минуту.')
      } else {
        setState('error')
        setErrorDetail(err instanceof Error ? err.message : 'Не удалось создать платёж')
      }
      setBusyPlan(null)
      return
    }

    setState('opening')
    let status: string
    try {
      status = await openInvoice(invoiceLink, 'url')
    } catch (err) {
      setState('error')
      setErrorDetail(err instanceof Error ? err.message : 'Не удалось открыть инвойс')
      setBusyPlan(null)
      return
    }

    if (status === 'paid' || status === 'pending') {
      startStatusPolling(payload)
      return
    }
    if (status === 'cancelled') {
      setState('cancelled')
      setBusyPlan(null)
      return
    }
    if (status === 'failed') {
      setState('failed')
      setErrorDetail('Платёж не прошёл. Попробуйте ещё раз или свяжитесь с поддержкой.')
      setBusyPlan(null)
      return
    }
    startStatusPolling(payload)
  }

  const goLegal = (docId: string) => {
    setLegalDocId(docId as never)
    closePaywall()
    nav(`/legal/${docId}`)
  }

  const isWorking = state === 'creating' || state === 'opening' || state === 'paying'
  const isSuccess = state === 'success'

  // Features per tier
  const basicFeatures = [
    '50 сообщений каждый день',
    'Все 56+ персонажей',
    '∞ кастомных персонажей',
    'Все стили общения (mood)',
    'Память на 15 сообщений',
  ]
  const premiumFeatures = [
    '200 сообщений каждый день',
    'Доступ к 18+ персонажам',
    'Память на 30 сообщений',
    'Расширенные mood-стили',
    '∞ кастомных персонажей',
    'Всё из Basic',
  ]
  const dayPassFeatures = [
    'Без лимита на 24 часа',
    'Активирует в текущем тарифе',
    'Не продлевается автоматически',
  ]

  return (
    <div className={styles.overlay} onClick={isWorking ? undefined : closePaywall}>
      <style>{`@keyframes paywallSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={closePaywall}
          disabled={isWorking && !isSuccess}
          aria-label="Закрыть"
        >
          <CloseIcon />
        </button>

        <div className={styles.hero}>
          <div className={styles.heroBadge}>
            <img src={invertLogo} alt="" className={styles.heroLogo} />
          </div>
          <h1 className={styles.heroTitle}>{heading.title}</h1>
          <p className={styles.heroSub}>{heading.subtitle}</p>
        </div>

        {/* Current tier indicator (если уже Pro) */}
        {tier !== 'free' && (
          <div className={styles.currentTierBanner}>
            ✓ Текущий тариф: <b>{PLANS[tier === 'basic' ? 'basic_month' : 'premium_month'].title}</b>
            {dayPassActive && <> · 🎟 Day Pass активен</>}
            {subscription?.expiresAt && (
              <> · до {new Date(subscription.expiresAt).toLocaleDateString('ru')}</>
            )}
          </div>
        )}

        {/* 3 tier cards */}
        <div className={styles.tiers}>
          {/* Basic */}
          <TierCard
            plan="basic_month"
            features={basicFeatures}
            currentTier={tier}
            flowState={state}
            busyPlan={busyPlan}
            onBuy={handleBuy}
          />

          {/* Premium (HIT) */}
          <TierCard
            plan="premium_month"
            popular
            features={premiumFeatures}
            currentTier={tier}
            flowState={state}
            busyPlan={busyPlan}
            onBuy={handleBuy}
          />

          {/* Day Pass — показываем всем кроме Premium-юзеров (им и так
              200 сообщений в день — DP бесполезен). Free-юзерам DP даёт
              24h × 50 сообщений (Basic-лимит), Basic-юзерам — снимает
              дневной лимит на 24h. Позиционируется как «попробуй на
              сутки без подписки» — низкий barrier для Free. */}
          {tier !== 'premium' && !dayPassActive && (
            <TierCard
              plan="day_pass"
              features={
                tier === 'free'
                  ? [
                      '24 часа без лимита',
                      '50 сообщений в день',
                      'Не продлевается автоматически',
                      'Попробуй без подписки',
                    ]
                  : dayPassFeatures
              }
              currentTier={tier}
              flowState={state}
              busyPlan={busyPlan}
              onBuy={handleBuy}
            />
          )}
        </div>

        {/* Error / hints */}
        {errorDetail && (
          <p
            style={{
              margin: '0 16px 12px',
              padding: '10px 14px',
              background: state === 'success' ? 'rgba(60,180,80,0.15)' : 'rgba(255,68,68,0.1)',
              border: `1px solid ${state === 'success' ? 'rgba(60,180,80,0.4)' : 'rgba(255,68,68,0.3)'}`,
              borderRadius: 12,
              fontSize: 12,
              color: state === 'success' ? '#3DBA6F' : '#FF7777',
              lineHeight: 1.5,
            }}
          >
            {state === 'paying' && pollCount > 0 && `Проверяем платёж… (${pollCount}/40) · `}
            {errorDetail}
          </p>
        )}

        <div className={styles.guaranteeRow}>
          <StarIcon size={11} color="#888" />
          <span className={styles.guaranteeText}>
            Безопасная оплата · Отмена в любой момент · Возврат по ЗоЗПП
          </span>
        </div>

        <div className={styles.footer}>
          <button className={styles.footerLink} onClick={() => goLegal('subscription')}>
            Условия
          </button>
          <span className={styles.footerDot}>·</span>
          <button className={styles.footerLink} onClick={() => goLegal('privacy_policy')}>
            Конфиденциальность
          </button>
        </div>
      </div>
    </div>
  )
}
