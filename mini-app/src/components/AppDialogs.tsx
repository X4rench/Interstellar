import { useEffect, useState } from 'react'
import styles from './AppDialogs.module.css'

/**
 * In-app замена для window.alert/confirm/prompt.
 *
 * Проблема: на iOS-Telegram-WebView native-диалоги window.* могут быть
 * заблокированы — клик на "Отозвать партнёра" в админке → ничего. Эти
 * модалки рендерятся внутри страницы, не зависят от платформы.
 *
 * API императивный (как window.confirm), но возвращает Promise:
 *
 *   const ok = await appConfirm({ title: 'Удалить?', danger: true })
 *   if (!ok) return
 *
 *   const reason = await appPrompt({ title: 'Причина:', placeholder: '...' })
 *   if (reason === null) return  // юзер нажал Отмена
 *
 *   await appAlert({ title: 'Готово', message: 'Сохранено' })
 */

type DialogType = 'alert' | 'confirm' | 'prompt'

interface DialogBase {
  id: string
  type: DialogType
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  placeholder?: string
  defaultValue?: string
  resolve: (value: unknown) => void
}

// Module-level state + listeners (singleton pattern).
let queue: DialogBase[] = []
const listeners = new Set<(q: DialogBase[]) => void>()

function notify() {
  for (const l of listeners) l(queue)
}

function push(d: DialogBase) {
  queue = [...queue, d]
  notify()
}

function pop(id: string) {
  queue = queue.filter((d) => d.id !== id)
  notify()
}

function randId() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── Public API ────────────────────────────────────────────────────────

export function appAlert(opts: { title: string; message?: string; confirmLabel?: string }): Promise<void> {
  return new Promise((resolve) => {
    push({
      id: randId(),
      type: 'alert',
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? 'OK',
      resolve: () => resolve(),
    })
  })
}

export function appConfirm(opts: {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}): Promise<boolean> {
  return new Promise((resolve) => {
    push({
      id: randId(),
      type: 'confirm',
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? 'OK',
      cancelLabel: opts.cancelLabel ?? 'Отмена',
      danger: opts.danger,
      resolve: (v) => resolve(v as boolean),
    })
  })
}

export function appPrompt(opts: {
  title: string
  message?: string
  placeholder?: string
  defaultValue?: string
  confirmLabel?: string
  cancelLabel?: string
}): Promise<string | null> {
  return new Promise((resolve) => {
    push({
      id: randId(),
      type: 'prompt',
      title: opts.title,
      message: opts.message,
      placeholder: opts.placeholder,
      defaultValue: opts.defaultValue,
      confirmLabel: opts.confirmLabel ?? 'OK',
      cancelLabel: opts.cancelLabel ?? 'Отмена',
      resolve: (v) => resolve(v as string | null),
    })
  })
}

// ─── Component ─────────────────────────────────────────────────────────

export function AppDialogs() {
  const [state, setState] = useState<DialogBase[]>(queue)

  useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  if (state.length === 0) return null

  const dlg = state[0] // показываем по одному, FIFO
  return <DialogRender dlg={dlg} />
}

function DialogRender({ dlg }: { dlg: DialogBase }) {
  const [inputValue, setInputValue] = useState(dlg.defaultValue ?? '')

  const close = (value: unknown) => {
    dlg.resolve(value)
    pop(dlg.id)
  }

  const handleConfirm = () => {
    if (dlg.type === 'prompt') {
      close(inputValue.trim() || null)
    } else if (dlg.type === 'confirm') {
      close(true)
    } else {
      close(undefined)
    }
  }
  const handleCancel = () => {
    if (dlg.type === 'prompt') close(null)
    else if (dlg.type === 'confirm') close(false)
    else close(undefined)
  }

  return (
    <div className={styles.overlay} onClick={dlg.type === 'alert' ? handleConfirm : handleCancel}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{dlg.title}</h2>
        {dlg.message && <p className={styles.message}>{dlg.message}</p>}

        {dlg.type === 'prompt' && (
          <input
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={dlg.placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm()
              if (e.key === 'Escape') handleCancel()
            }}
          />
        )}

        <div className={styles.actions}>
          {dlg.type !== 'alert' && (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={handleCancel}>
              {dlg.cancelLabel}
            </button>
          )}
          <button
            className={`${styles.btn} ${dlg.danger ? styles.btnDanger : styles.btnPrimary}`}
            onClick={handleConfirm}
          >
            {dlg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
