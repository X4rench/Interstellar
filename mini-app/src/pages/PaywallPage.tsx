import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { openLink } from '@telegram-apps/sdk-react'

import { useApp, type PaywallReason } from '../context/AppContext'
import {
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

  // Disabled только когда мы реально дёргаем YK API (короткое окно ~1-2s).
  // Во время 'opening' / 'paying' (юзер на YK странице или вернулся не оплатив)
  // — позволяем переключиться на другой тариф или повторить попытку.
  // Это фиксит баг "приложение залипает после возврата с ЮК без оплаты".
  const isCreating = flowState === 'creating'
  const isThisCardLocked = isCreating && busy

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
          disabled={isCreating || isThisCardLocked}
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

  // Принудительно отменяет текущий поллинг и возвращает paywall в idle.
  // Используется когда юзер кликает на другой тариф пока висит поллинг
  // от предыдущей попытки, или жмёт «Отменить ожидание».
  const cancelCurrentPolling = () => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
    setBusyPlan(null)
    currentPayloadRef.current = null
  }

  // YK status polling: после возврата с YK-сайта поллим до succeeded.
  // Отдельная функция от Stars-polling — другой endpoint, другая семантика
  // status ('succeeded' вместо 'paid', plus 'pending'/'canceled').
  const startYkPolling = (paymentId: string) => {
    setState('paying')
    let attempts = 0
    const maxAttempts = 60 // 60 × 2s = 2 минуты
    const tick = async () => {
      attempts++
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
    // Блокируем только во время активного запроса к YK API ('creating').
    // В 'opening'/'paying' (юзер на YK-странице или вернулся не оплатив) —
    // разрешаем смену тарифа: отменяем текущий поллинг и запускаем новый.
    if (state === 'creating') return

    // Отменим предыдущий поллинг (если был) — юзер передумал и выбрал другой тариф.
    cancelCurrentPolling()

    setState('creating')
    setBusyPlan(plan)
    setErrorDetail('')

    // ── ТОЛЬКО ЮКасса. Stars-fallback убран (требование: все платежи в рублях).
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
      // confirmation_url нет — статус succeeded сразу (recurring сценарий: уже
      // есть сохранённая карта от прошлой подписки → YK списал сразу без редиректа).
      if (res.status === 'succeeded') {
        setState('success')
        refreshSubscription()
        window.setTimeout(closePaywall, 2000)
        return
      }
      // Неожиданный ответ от YK — нет confirmation_url, нет succeeded.
      setState('error')
      setErrorDetail('Не удалось открыть страницу оплаты. Попробуй ещё раз.')
      setBusyPlan(null)
    } catch (err) {
      // Показываем ошибку юзеру вместо fallback'а на Stars.
      if (err instanceof ApiError && err.code === 'YK_NOT_CONFIGURED') {
        setState('error')
        setErrorDetail('Платежи временно недоступны. Попробуй позже.')
      } else if (err instanceof ApiError && err.status === 429) {
        setState('rate_limited')
        setErrorDetail('Слишком часто. Подожди минуту.')
      } else {
        setState('error')
        setErrorDetail(err instanceof Error ? err.message : 'Не удалось создать платёж')
      }
      setBusyPlan(null)
    }
  }

  const goLegal = (docId: string) => {
    setLegalDocId(docId as never)
    closePaywall()
    nav(`/legal/${docId}`)
  }

  // isPolling — состояния когда юзер открыл YK или вернулся не оплатив.
  // В этих состояниях ВСЁ остаётся интерактивным (отмена, выбор другого тарифа,
  // закрытие пейволла). Это фиксит залипание после возврата с ЮК без оплаты.
  const isPolling = state === 'opening' || state === 'paying'

  // Закрытие пейволла — отменяет любой активный поллинг и закрывает модалку.
  const handleClose = () => {
    cancelCurrentPolling()
    closePaywall()
  }

  // Отмена ожидания: остановить поллинг и вернуться в idle.
  // Юзер не платил — попробует другой тариф или закроет пейволл.
  const handleCancelWait = () => {
    cancelCurrentPolling()
    setState('cancelled')
    setErrorDetail('')
  }

  // Features per tier.
  // Везде убраны упоминания "автопродления" — все тарифы теперь разовые
  // (юзер сам покупает заново после истечения, save_payment_method отключён).
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
    '100 сообщений на 24 часа',
    'Активирует в текущем тарифе',
    'Без подписки и обязательств',
  ]

  return (
    // Оверлей-клик закрывает пейволл во всех состояниях КРОМЕ 'creating'
    // (мы ждём ответа YK API ~1-2s — иначе создадим висящий платёж в БД).
    // В 'opening'/'paying' закрывать можно — это лишь отменит поллинг.
    <div className={styles.overlay} onClick={state === 'creating' ? undefined : handleClose}>
      <style>{`@keyframes paywallSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          // Только во время активного YK API-запроса блокируем крестик.
          // В polling-состояниях крестик работает и отменяет ожидание.
          disabled={state === 'creating'}
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
              200/день — DP бесполезен, max(200,100)=200). Free-юзерам DP
              поднимает лимит с 10 до 100/24h, Basic-юзерам — с 50 до 100/24h.
              Позиционируется как «попробуй на сутки без подписки» — низкий
              barrier для Free. */}
          {tier !== 'premium' && !dayPassActive && (
            <TierCard
              plan="day_pass"
              features={
                tier === 'free'
                  ? [
                      '100 сообщений на 24 часа',
                      'В 10 раз больше чем Free',
                      'Все 56+ персонажей',
                      'Без подписки и обязательств',
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

        {/* Polling-баннер с кнопкой отмены: видим юзеру когда он открыл ЮК
            (или вернулся не оплатив, но visibility-handler не успел сработать).
            Даём явный exit — без этого юзер залипал в "Проверяем…" и не мог
            выбрать другой тариф или закрыть пейволл. */}
        {isPolling && (
          <div
            style={{
              margin: '0 16px 12px',
              padding: '10px 14px',
              background: 'rgba(124, 92, 255, 0.1)',
              border: '1px solid rgba(124, 92, 255, 0.3)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#c9b8ff', fontWeight: 600 }}>
                {state === 'opening' ? 'Открываем ЮКассу…' : 'Ждём подтверждения оплаты…'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8870c8', lineHeight: 1.3 }}>
                Если передумал — нажми «Отмена» и выбери другой тариф.
              </p>
            </div>
            <button
              onClick={handleCancelWait}
              style={{
                background: 'rgba(124, 92, 255, 0.15)',
                border: '1px solid rgba(124, 92, 255, 0.35)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 600,
                color: '#c9b8ff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              Отмена
            </button>
          </div>
        )}

        {/* Error / hints */}
        {errorDetail && !isPolling && (
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
