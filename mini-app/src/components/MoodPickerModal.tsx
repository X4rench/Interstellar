import { useState } from 'react'
import { MOODS } from '../utils/moods'
import { isConsentValid } from '../utils/consent'
import { AgeGateModal } from './AgeGateModal'
import styles from './MoodPickerModal.module.css'

interface Props {
  visible: boolean
  currentMood: string | null
  /** Включён ли NSFW для этого персонажа — иначе mood "nsfw18" disabled */
  characterIsNsfw: boolean
  onSelect: (moodId: string | null) => void
  onClose: () => void
}

function CheckMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <path
        d="M3 9l4 4 7-9"
        stroke="#000"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Модалка выбора стиля общения. При выборе mood "nsfw18" сначала
 * проверяет наличие age_18 consent — если нет, открывается AgeGateModal.
 */
export function MoodPickerModal({
  visible,
  currentMood,
  characterIsNsfw,
  onSelect,
  onClose,
}: Props) {
  const [ageGateVisible, setAgeGateVisible] = useState(false)

  if (!visible) return null

  const handlePick = async (moodId: string | null) => {
    if (moodId === 'nsfw18') {
      if (!characterIsNsfw) return // disabled
      const ok = await isConsentValid('age_18')
      if (!ok) {
        setAgeGateVisible(true)
        return
      }
    }
    onSelect(moodId)
    onClose()
  }

  const onAgeConfirmed = () => {
    setAgeGateVisible(false)
    onSelect('nsfw18')
    onClose()
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.card} onClick={(e) => e.stopPropagation()}>
          <span className={styles.handle} />
          <h2 className={styles.title}>Стиль общения</h2>
          <p className={styles.subtitle}>
            Влияет на тон ответов персонажа. Меняется в любое время.
          </p>

          <div className={styles.list}>
            {/* "Без стиля" — возврат к чистой persona */}
            <button
              className={`${styles.row} ${currentMood === null ? styles.rowOn : ''}`}
              onClick={() => handlePick(null)}
            >
              <span className={styles.rowText}>
                <span className={`${styles.rowLabel} ${currentMood === null ? styles.rowLabelOn : ''}`}>
                  Без стиля
                </span>
                <span className={styles.rowHint}>Базовая persona персонажа</span>
              </span>
              {currentMood === null && <CheckMark />}
            </button>

            {MOODS.map((m) => {
              const isOn = currentMood === m.id
              const disabled = m.requires18 && !characterIsNsfw
              return (
                <button
                  key={m.id}
                  className={`${styles.row} ${isOn ? styles.rowOn : ''} ${
                    disabled ? styles.rowDisabled : ''
                  }`}
                  disabled={disabled}
                  onClick={() => handlePick(m.id)}
                >
                  <span className={styles.rowText}>
                    <span
                      className={`${styles.rowLabel} ${isOn ? styles.rowLabelOn : ''} ${
                        disabled ? styles.rowLabelDisabled : ''
                      }`}
                    >
                      {m.label}
                    </span>
                    <span
                      className={`${styles.rowHint} ${disabled ? styles.rowLabelDisabled : ''}`}
                    >
                      {disabled ? 'Только для 18+ персонажей' : m.hint ?? ''}
                    </span>
                  </span>
                  {isOn && <CheckMark />}
                </button>
              )
            })}
          </div>

          <button className={styles.cancelBtn} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>

      <AgeGateModal
        visible={ageGateVisible}
        onConfirm={onAgeConfirmed}
        onCancel={() => setAgeGateVisible(false)}
      />
    </>
  )
}
