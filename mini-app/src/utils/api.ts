import { initData } from '@telegram-apps/sdk-react'

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
).replace(/\/$/, '')

const REQUEST_TIMEOUT_MS = 65_000

export class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message || code)
    this.name = 'ApiError'
  }
}

// ─── Базовый запрос с TG-аутентификацией ──────────────────────────────────

/**
 * Отправляет запрос к защищённому эндпоинту backend'а с заголовком
 * `Authorization: tma <initDataRaw>`. Backend проверяет HMAC и кладёт
 * расшифрованного юзера в req.tgUser.
 *
 * Если initData ещё не восстановлен (SDK не успел инициализироваться) —
 * бросает ApiError(0, 'NO_INIT_DATA'). Это редкий race; в нормальном flow
 * initApp() блокирует render до завершения init.
 */
export async function fetchAuthed<T>(path: string, init?: RequestInit): Promise<T> {
  const raw = initData.raw()
  if (!raw) throw new ApiError(0, 'NO_INIT_DATA')

  const headers = new Headers(init?.headers)
  headers.set('Authorization', `tma ${raw}`)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      signal: init?.signal ?? controller.signal,
    })

    let data: unknown = null
    try {
      data = await res.json()
    } catch {
      /* не JSON — оставляем null */
    }

    if (!res.ok || (data as { ok?: boolean } | null)?.ok === false) {
      const code = (data as { error?: string } | null)?.error || `HTTP_${res.status}`
      throw new ApiError(res.status, code)
    }

    return data as T
  } finally {
    clearTimeout(timer)
  }
}

// ─── Чат: stateless прокси к polza.ai ─────────────────────────────────────

export type ChatRole = 'user' | 'character'

export interface ChatMessage {
  role: ChatRole
  content: string
}

/**
 * Отправляет сообщение в чат. C2-fix: /chat теперь требует initData-auth
 * + rate-limit. На клиенте история живёт локально, каждый запрос шлёт
 * всю переписку целиком (stateless backend).
 *
 * При 429 (rate limit) — ApiError кидается, UI показывает «слишком часто».
 */
export async function sendMessage(persona: string, messages: ChatMessage[]): Promise<string> {
  type ChatResponse = { ok: true; response: string }
  const data = await fetchAuthed<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ persona, messages }),
  })
  if (typeof data?.response !== 'string' || !data.response.trim()) {
    throw new ApiError(502, 'EMPTY_RESPONSE')
  }
  return data.response
}

// ─── /users/me: профиль + подписка ────────────────────────────────────────

export interface MeUser {
  telegram_user_id: number
  username: string | null
  first_name: string
  last_name: string | null
  language_code: string | null
  photo_url: string | null
}

export interface MeSubscription {
  plan: string
  started_at: string
  expires_at: string
  is_trial: boolean
  cancelled_at: string | null
}

export interface MeBot {
  username: string | null
  app_name: string
}

export type Tier = 'free' | 'basic' | 'premium'

export interface MeResponse {
  ok: true
  user: MeUser
  subscription: MeSubscription | null
  role?: 'regular' | 'partner' | 'admin'
  partner?: { blogger_slug: string; revenue_share_bps: number; pii_provided: boolean } | null
  bot?: MeBot
  /** Тариф юзера. Free для всех без активной подписки. */
  tier?: Tier
  /** Активный Day Pass — снимает дневной лимит в текущем тире на 24h. */
  day_pass_active?: boolean
  /** Сколько у юзера осталось бесплатных сообщений (one-shot Free). */
  free_messages_remaining?: number
  /** Total lifetime квота Free тарифа (для прогресс-бара). */
  free_messages_lifetime?: number
}

export function getMe(): Promise<MeResponse> {
  return fetchAuthed<MeResponse>('/users/me')
}

// ─── Billing (Stars-инвойсы) ──────────────────────────────────────────────

export type PlanCode = 'basic_month' | 'premium_month' | 'day_pass'

export interface CreateInvoiceResponse {
  ok: true
  invoice_link: string
  payload: string
  amount_stars: number
  plan: PlanCode
}

/**
 * Создаёт Stars-инвойс на бэке. Бэк фиксирует attribution/share-snapshot
 * и возвращает t.me/invoice/xxx URL, который мы открываем через
 * `invoice.open(url, 'url')`.
 *
 * Plan codes:
 *   - 'basic_month'   → 199⭐ / 30 дней / 50 msg/день
 *   - 'premium_month' → 499⭐ / 30 дней / 200 msg/день / NSFW
 *   - 'day_pass'      → 50⭐ / 24h без лимита в текущем тире
 *
 * Rate-limit: 5/min (превышение → 429).
 */
export function createInvoice(plan: PlanCode = 'basic_month'): Promise<CreateInvoiceResponse> {
  return fetchAuthed<CreateInvoiceResponse>('/billing/create-invoice', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })
}

/**
 * Метаданные тарифов (точка истины для UI).
 * Цены и фичи синхронизированы с backend/payments.js getPlanConfig().
 */
export interface PlanMeta {
  code: PlanCode | 'free'
  title: string
  shortDescription: string
  stars: number
  approxRub: number   // ~1.5₽/Star для отображения юзеру
  /** Дневной лимит. Для Free используется lifetime — см. lifetime_msg_limit. */
  daily_msg_limit: number
  /** Lifetime лимит, имеет смысл только для Free. */
  lifetime_msg_limit?: number
  history_window: number
  /** unlimited — кастомные персонажи бесплатны для нас (localStorage). */
  custom_characters: 'unlimited'
  nsfw_access: boolean
  duration_days: number | 'one-time-24h' | 'lifetime'
}

export const PLANS: Record<PlanCode | 'free', PlanMeta> = {
  free: {
    code: 'free',
    title: 'Free',
    shortDescription: '10 сообщений на пробу',
    stars: 0,
    approxRub: 0,
    daily_msg_limit: 0, // не используется для Free
    lifetime_msg_limit: 10,
    history_window: 5,
    custom_characters: 'unlimited',
    nsfw_access: false,
    duration_days: 'lifetime',
  },
  basic_month: {
    code: 'basic_month',
    title: 'Basic',
    shortDescription: '50 сообщений в день',
    stars: 199,
    approxRub: 300,
    daily_msg_limit: 50,
    history_window: 15,
    custom_characters: 'unlimited',
    nsfw_access: false,
    duration_days: 30,
  },
  premium_month: {
    code: 'premium_month',
    title: 'Premium',
    shortDescription: '200 сообщений/день + 18+',
    stars: 499,
    approxRub: 750,
    daily_msg_limit: 200,
    history_window: 30,
    custom_characters: 'unlimited',
    nsfw_access: true,
    duration_days: 30,
  },
  day_pass: {
    code: 'day_pass',
    title: 'Day Pass',
    shortDescription: '24h без лимита',
    stars: 50,
    approxRub: 75,
    daily_msg_limit: 0, // снимает лимит
    history_window: 0, // используется лимит текущего тира
    custom_characters: 'unlimited',
    nsfw_access: false, // не апгрейд тира, только убирает day-cap
    duration_days: 'one-time-24h',
  },
}

export type InvoiceStatus = 'paid' | 'pending' | 'expired' | 'failed' | 'refunded' | 'unknown'

export interface InvoiceStatusResponse {
  ok: true
  status: InvoiceStatus
}

/**
 * Запрашивает текущий статус инвойса. Используется в polling-цикле после
 * того как `invoice.open()` вернул 'paid' — клиентский callback неточен
 * (TG-bug), webhook = единственный источник истины.
 */
export function getInvoiceStatus(payload: string): Promise<InvoiceStatusResponse> {
  return fetchAuthed<InvoiceStatusResponse>(`/billing/invoice-status/${encodeURIComponent(payload)}`)
}

// ─── ЮКасса (API напрямую) ──────────────────────────────────────────────

export interface YkCreatePaymentResponse {
  ok: true
  yk_payment_id: string
  confirmation_url: string | null
  status: 'pending' | 'succeeded' | 'canceled' | string
  /** 'test' — тестовый магазин (карты 5555 5555 5555 4477), 'live' — боевой. */
  mode: 'test' | 'live'
}

/**
 * Создаёт платёж в ЮКассе и возвращает URL для редиректа юзера.
 * Бэк проверит plan, создаст YK payment с save_payment_method=auto_renew
 * (для подписок) и вернёт confirmation_url. Юзер уходит на сайт ЮК,
 * платит, возвращается на returnUrl. Параллельно YK шлёт webhook —
 * подписка активируется на бэке.
 *
 * После открытия confirmation_url фронт начинает поллить
 * /billing/yk-status/:id пока не получит 'succeeded'.
 */
export function ykCreatePayment(
  plan: PlanCode,
  returnUrl: string,
  autoRenew: boolean = true,
): Promise<YkCreatePaymentResponse> {
  return fetchAuthed<YkCreatePaymentResponse>('/billing/yk-create-payment', {
    method: 'POST',
    body: JSON.stringify({ plan, return_url: returnUrl, auto_renew: autoRenew }),
  })
}

export interface YkStatusResponse {
  ok: true
  status: 'pending' | 'succeeded' | 'canceled' | 'unknown' | string
}

export function ykGetPaymentStatus(paymentId: string): Promise<YkStatusResponse> {
  return fetchAuthed<YkStatusResponse>(
    `/billing/yk-status/${encodeURIComponent(paymentId)}`,
  )
}

// ─── /auth/validate-init-data: smoke-test ─────────────────────────────────

export interface ValidateInitDataResponse {
  ok: true
  telegram_user_id: number
  first_name: string
}

/**
 * Проверка что бэк принимает наш initData. Используется при старте mini-app
 * для быстрого выявления проблемы с конфигурацией (например BOT_TOKEN
 * не совпадает между фронтом и бэком).
 */
export function validateInitData(): Promise<ValidateInitDataResponse> {
  return fetchAuthed<ValidateInitDataResponse>('/auth/validate-init-data', {
    method: 'POST',
  })
}

// ─── X-Confirm-Action (защита destructive admin-операций) ────────────────

/**
 * Каноничная сериализация: ключи отсортированы. Должна 1-в-1 совпадать с
 * backend/roles.js canonicalize. Если расходимся — все подтверждённые
 * запросы будут падать 412.
 */
function canonicalize(obj: unknown): string {
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'number' || typeof obj === 'boolean') return JSON.stringify(obj)
  if (typeof obj === 'string') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']'
  if (typeof obj === 'object') {
    const keys = Object.keys(obj as Record<string, unknown>).sort()
    return (
      '{' +
      keys
        .map((k) => JSON.stringify(k) + ':' + canonicalize((obj as Record<string, unknown>)[k]))
        .join(',') +
      '}'
    )
  }
  return 'null'
}

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Версия fetchAuthed для destructive admin-операций. Считает X-Confirm-Action
 * хеш от body и добавляет в headers. Использовать ТОЛЬКО после явного юзер-
 * confirm-диалога (иначе теряет смысл).
 */
export async function fetchAuthedConfirm<T>(path: string, init: RequestInit & { jsonBody?: unknown }): Promise<T> {
  const body = init.jsonBody ?? {}
  const canonical = canonicalize(body)
  const hash = await sha256hex(canonical)
  const headers = new Headers(init.headers)
  headers.set('X-Confirm-Action', hash)
  return fetchAuthed<T>(path, {
    ...init,
    body: JSON.stringify(body),
    headers,
  })
}

// ─── Admin API ──────────────────────────────────────────────────────────

export interface AdminUser {
  telegram_user_id: number
  username: string | null
  first_name: string
  last_name: string | null
  language_code: string | null
  first_seen_at: number
  last_seen_at: number
  attribution_slug: string | null
  is_partner: 0 | 1
  is_pro: 0 | 1
}

export interface AdminPartner {
  telegram_user_id: number
  blogger_slug: string
  revenue_share_bps: number
  status: 'active' | 'revoked'
  granted_at: number
  granted_by_admin_id: number
  revoked_at: number | null
  revoke_reason: string | null
  pii_provided: 0 | 1
  pii_consent_at: number | null
  notes: string | null
  partner_first_name: string | null
  partner_username: string | null
  referrals_count: number
  conversions_count?: number
  earned_stars: number
  pending_payouts_stars?: number
  paid_out_stars: number
  balance_stars?: number
}

export interface AdminPayout {
  id: number
  partner_telegram_user_id: number
  amount_stars: number
  status: 'requested' | 'awaiting_receipt' | 'approved' | 'paid' | 'rejected'
  receipt_number: string | null
  receipt_uploaded_at: number | null
  external_payout_ref: string | null
  external_payout_at: number | null
  external_payout_amount_rub: number | null
  requested_at: number
  decided_at: number | null
  decided_by_admin_id: number | null
  rejection_reason: string | null
  partner_slug: string | null
  partner_first_name: string | null
  partner_username: string | null
}

export interface AdminAuditEntry {
  id: number
  occurred_at: number
  actor_user_id: number
  actor_role: string
  action: string
  target_user_id: number | null
  target_resource: string | null
  target_id: string | null
  payload: Record<string, unknown>
  ip: string | null
  request_id: string | null
}

export function adminListUsers(params: {
  q?: string
  has_subscription?: boolean
  attribution_slug?: string
  limit?: number
  offset?: number
}): Promise<{ ok: true; users: AdminUser[]; total: number; limit: number; offset: number }> {
  const q = new URLSearchParams()
  if (params.q) q.set('q', params.q)
  if (params.has_subscription !== undefined) q.set('has_subscription', String(params.has_subscription))
  if (params.attribution_slug) q.set('attribution_slug', params.attribution_slug)
  if (params.limit) q.set('limit', String(params.limit))
  if (params.offset) q.set('offset', String(params.offset))
  return fetchAuthed(`/admin/users?${q.toString()}`)
}

export function adminListPartners(
  status: 'all' | 'active' | 'revoked' = 'all',
): Promise<{ ok: true; partners: AdminPartner[] }> {
  return fetchAuthed(`/admin/partners?status=${status}`)
}

export function adminGetPartner(id: number): Promise<{ ok: true; partner: AdminPartner }> {
  return fetchAuthed(`/admin/partners/${id}`)
}

export function adminGrantPartner(body: {
  target_user_id: number
  blogger_slug: string
  revenue_share_bps: number
  notes?: string
}): Promise<{ ok: true; partner: AdminPartner }> {
  return fetchAuthedConfirm('/admin/partners', { method: 'POST', jsonBody: body })
}

export function adminUpdatePartner(
  id: number,
  body: { blogger_slug?: string; revenue_share_bps?: number; notes?: string },
): Promise<{ ok: true; partner: AdminPartner }> {
  return fetchAuthedConfirm(`/admin/partners/${id}`, { method: 'PATCH', jsonBody: body })
}

export function adminRevokePartner(
  id: number,
  reason?: string,
): Promise<{ ok: true; partner: AdminPartner }> {
  return fetchAuthedConfirm(`/admin/partners/${id}/revoke`, {
    method: 'POST',
    jsonBody: reason ? { reason } : {},
  })
}

export function adminListPayouts(
  status?: AdminPayout['status'],
): Promise<{ ok: true; payouts: AdminPayout[] }> {
  const q = status ? `?status=${encodeURIComponent(status)}` : ''
  return fetchAuthed(`/admin/payouts${q}`)
}

export function adminApprovePayout(id: number): Promise<{ ok: true; new_status: string }> {
  return fetchAuthedConfirm(`/admin/payouts/${id}/approve`, { method: 'POST', jsonBody: {} })
}

export function adminMarkPayoutPaid(
  id: number,
  body: { external_ref: string; amount_rub: number },
): Promise<{ ok: true }> {
  return fetchAuthedConfirm(`/admin/payouts/${id}/mark-paid`, { method: 'POST', jsonBody: body })
}

export function adminRejectPayout(id: number, reason: string): Promise<{ ok: true }> {
  return fetchAuthedConfirm(`/admin/payouts/${id}/reject`, { method: 'POST', jsonBody: { reason } })
}

// ─── Partner API ────────────────────────────────────────────────────────

export interface PartnerSummary {
  blogger_slug: string
  revenue_share_bps: number
  status: 'active' | 'revoked'
  granted_at: number
  referrals_count: number
  conversions_count: number
  earned_stars: number
  paid_out_stars: number
  pending_payouts_stars: number
  balance_stars: number
  can_request_payout: boolean
  min_payout_stars: number
  monthly: { month: string; earned: number; conversions: number }[]
  business_inn: string | null
  business_name: string | null
}

export interface PartnerProfile {
  full_name: string | null
  inn: string | null
  email: string | null
  phone: string | null
  bank_details: { account: string; bik: string; bank_name: string } | null
  pii_provided: boolean
  pii_consent_at: number | null
  pii_consent_version?: string
}

export interface PartnerPayoutItem {
  id: number
  amount_stars: number
  status: 'requested' | 'awaiting_receipt' | 'approved' | 'paid' | 'rejected'
  receipt_number: string | null
  receipt_uploaded_at: number | null
  external_payout_ref: string | null
  external_payout_at: number | null
  external_payout_amount_rub: number | null
  requested_at: number
  decided_at: number | null
  rejection_reason: string | null
}

export function partnerGetSummary(): Promise<{ ok: true; summary: PartnerSummary }> {
  return fetchAuthed('/partner/summary')
}

export function partnerGetProfile(): Promise<{ ok: true; profile: PartnerProfile }> {
  return fetchAuthed('/partner/profile')
}

export function partnerUpdateProfile(body: {
  full_name: string
  inn: string
  email: string
  phone: string
  bank_details: { account: string; bik: string; bank_name: string }
  consent: boolean
}): Promise<{ ok: true }> {
  return fetchAuthedConfirm('/partner/profile', { method: 'PATCH', jsonBody: body })
}

export function partnerListPayouts(): Promise<{ ok: true; payouts: PartnerPayoutItem[] }> {
  return fetchAuthed('/partner/payouts')
}

export function partnerCreatePayout(amountStars?: number): Promise<{ ok: true; payout_id: number; amount_stars: number }> {
  return fetchAuthedConfirm('/partner/payouts', {
    method: 'POST',
    jsonBody: amountStars ? { amount_stars: amountStars } : {},
  })
}

export function partnerUploadReceipt(payoutId: number, receiptNumber: string): Promise<{ ok: true }> {
  return fetchAuthedConfirm(`/partner/payouts/${payoutId}/receipt`, {
    method: 'PATCH',
    jsonBody: { receipt_number: receiptNumber },
  })
}

export function adminListAudit(params: {
  action?: string
  target_user_id?: number
  actor_user_id?: number
  limit?: number
  offset?: number
}): Promise<{ ok: true; entries: AdminAuditEntry[]; total: number }> {
  const q = new URLSearchParams()
  if (params.action) q.set('action', params.action)
  if (params.target_user_id) q.set('target_user_id', String(params.target_user_id))
  if (params.actor_user_id) q.set('actor_user_id', String(params.actor_user_id))
  if (params.limit) q.set('limit', String(params.limit))
  if (params.offset) q.set('offset', String(params.offset))
  return fetchAuthed(`/admin/audit?${q.toString()}`)
}
