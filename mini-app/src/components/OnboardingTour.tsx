import { useMemo, useState } from 'react'

import { CosmosIcon, DialogueIcon, BrainIcon, QuillIcon, RocketIcon } from '../icons'
import { useApp } from '../context/AppContext'

import styles from './OnboardingTour.module.css'

/**
 * OnboardingTour — космический онбординг при первом запуске Mini App.
 *
 * Показывается через App.tsx если в localStorage нет флага
 * 'interstellar_onboarded'. Можно пропустить (skip) либо пройти все шаги —
 * в обоих случаях ставится флаг и больше не показывается.
 *
 * Дизайн: чёрный фон, фиолетово-розовый градиент свечения, мерцающие
 * звёзды на заднем плане. Floaty-анимация иконки + pulse-halo.
 */

interface OnboardingStep {
  Icon: React.ComponentType<{ size?: number; color?: string }>
  title: string
  subtitle: string
  /** true → шаг-форма «О тебе» (пол + возраст) вместо обычного слайда. */
  interactive?: boolean
}

const STEPS: OnboardingStep[] = [
  {
    Icon: CosmosIcon,
    title: 'Добро пожаловать в Интерстеллар',
    subtitle:
      'Общайся с историческими личностями, философами и литературными героями через ИИ.',
  },
  {
    Icon: DialogueIcon,
    title: 'Каталог из 56+ персонажей',
    subtitle:
      'Толстой, Пушкин, Шерлок Холмс, Эйнштейн — выбери любого и начни диалог одним тапом.',
  },
  {
    Icon: BrainIcon,
    title: 'Реалистичные диалоги',
    subtitle:
      'Каждый персонаж говорит в своём стиле, помнит контекст разговора и реагирует индивидуально.',
  },
  {
    Icon: QuillIcon,
    title: 'Создавай своих персонажей',
    subtitle:
      'Не нашёл нужного? Создай любой образ — задай характер, манеру речи и общайся как захочешь.',
  },
  {
    Icon: PersonIcon,
    title: 'Расскажи немного о себе',
    subtitle:
      'Персонажи будут учитывать твой пол и возраст — диалоги станут естественнее. Можно пропустить или изменить позже в профиле.',
    interactive: true,
  },
  {
    Icon: RocketIcon,
    title: 'Готов к запуску',
    subtitle:
      '10 бесплатных сообщений каждый день. Хочешь больше — подписка от 75 ₽. Поехали!',
  },
]

function ArrowRight() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Иконка шага «О тебе» — голова + плечи в стиле остальных line-иконок.
function PersonIcon({ size = 54, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <circle cx="27" cy="18" r="9" stroke={color} strokeWidth="1.6" fill="none" />
      <path
        d="M10 46 Q10 30 27 30 Q44 30 44 46"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Звёздное поле — генерируем фиксированный набор позиций при mount.
// Не useEffect — нужно один раз и не зависит ни от чего.
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    big: Math.random() > 0.85,
    delay: Math.random() * 3,
  }))
}

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const { setUserProfile } = useApp()
  const [step, setStep] = useState(0)

  // Self-info, собираемая на шаге «О тебе». Оба поля опциональны.
  const [gender, setGender] = useState<'male' | 'female' | undefined>(undefined)
  const [ageStr, setAgeStr] = useState('')

  // Звёзды генерируем один раз — useMemo с пустыми deps. Меняется только
  // когда компонент монтируется заново (а он одноразовый).
  const stars = useMemo(() => generateStars(40), [])

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]
  const Icon = current.Icon

  // Сохраняем введённую self-info (если есть) и завершаем онбординг.
  // Вызывается и из «Начать общение», и из «Пропустить» — чтобы введённое
  // не терялось при скипе.
  const finish = () => {
    const ageNum = parseInt(ageStr, 10)
    const validAge =
      Number.isFinite(ageNum) && ageNum >= 1 && ageNum <= 120 ? ageNum : undefined
    if (gender || validAge) {
      setUserProfile({
        ...(gender ? { gender } : {}),
        ...(validAge ? { age: validAge } : {}),
      })
    }
    onComplete()
  }

  const handleNext = () => {
    if (isLast) {
      finish()
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-label="Знакомство с приложением">
      <div className={styles.bg} />
      <div className={styles.stars} aria-hidden="true">
        {stars.map((s) => (
          <span
            key={s.id}
            className={`${styles.star} ${s.big ? styles.big : ''}`}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Top: dots indicator + skip */}
      <div className={styles.topBar}>
        <div className={styles.dots} aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
            />
          ))}
        </div>
        <button className={styles.skipBtn} onClick={finish}>
          {isLast ? '' : 'Пропустить'}
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* key={step} — пересоздаём DOM чтобы анимация slideIn запускалась
            заново на каждой смене шага. */}
        <div key={step} className={styles.slide}>
          <div className={`${styles.iconWrap} ${current.interactive ? styles.iconWrapCompact : ''}`}>
            <Icon size={current.interactive ? 58 : 68} color="#fff" />
          </div>
          <h1 className={styles.title}>{current.title}</h1>
          <p className={styles.subtitle}>{current.subtitle}</p>

          {/* Шаг «О тебе» — опциональные пол + возраст для immersion в чате. */}
          {current.interactive && (
            <div className={styles.selfInfoForm}>
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Пол</span>
                <div className={styles.genderRow}>
                  <button
                    type="button"
                    className={`${styles.genderBtn} ${gender === 'male' ? styles.genderBtnActive : ''}`}
                    onClick={() => setGender((g) => (g === 'male' ? undefined : 'male'))}
                  >
                    Мужской
                  </button>
                  <button
                    type="button"
                    className={`${styles.genderBtn} ${gender === 'female' ? styles.genderBtnActive : ''}`}
                    onClick={() => setGender((g) => (g === 'female' ? undefined : 'female'))}
                  >
                    Женский
                  </button>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Возраст</span>
                <input
                  className={styles.ageInput}
                  value={ageStr}
                  onChange={(e) => setAgeStr(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
                  inputMode="numeric"
                  placeholder="Например, 24"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: next / start */}
      <div className={styles.bottom}>
        <button className={styles.nextBtn} onClick={handleNext}>
          {isLast ? 'Начать общение' : 'Далее'}
          <span className={styles.arrowIcon}>
            <ArrowRight />
          </span>
        </button>
      </div>
    </div>
  )
}
