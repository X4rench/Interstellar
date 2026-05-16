import { useState } from 'react'
import { recordConsent } from '../utils/consent'
import styles from './AgeGateModal.module.css'

interface Props {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Модалка возрастного согласия 18+. Согласно 152-ФЗ для NSFW нужно явное
 * подтверждение возраста. При confirm — пишет recordConsent('age_18'),
 * чтобы повторно не спрашивать в текущей сессии.
 *
 * Используется в:
 *  - CreateScreen при включении тоггла «Режим 18+»
 *  - MoodPickerModal при выборе mood "nsfw18"
 *  - ChatScreen при первом открытии NSFW персонажа
 */
export function AgeGateModal({ visible, onConfirm, onCancel }: Props) {
  const [checked, setChecked] = useState(false)

  if (!visible) return null

  const handleConfirm = async () => {
    if (!checked) return
    await recordConsent('age_18')
    setChecked(false)
    onConfirm()
  }

  const handleCancel = () => {
    setChecked(false)
    onCancel()
  }

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Возрастное ограничение</h2>
        <p className={styles.subtitle}>
          Контент 18+ доступен только совершеннолетним пользователям. Для продолжения
          подтвердите возраст.
        </p>

        <button className={styles.checkRow} onClick={() => setChecked((v) => !v)}>
          <span className={`${styles.checkbox} ${checked ? styles.checkboxOn : ''}`}>
            {checked && (
              <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7l3 3 5-7"
                  stroke="#000"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className={styles.checkLabel}>Мне исполнилось 18 лет</span>
        </button>

        <button
          className={`${styles.primaryBtn} ${!checked ? styles.primaryBtnDisabled : ''}`}
          disabled={!checked}
          onClick={handleConfirm}
        >
          Подтвердить
        </button>

        <button className={styles.cancelBtn} onClick={handleCancel}>
          Отмена
        </button>
      </div>
    </div>
  )
}
