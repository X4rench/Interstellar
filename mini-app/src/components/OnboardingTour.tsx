import { useMemo, useState } from 'react'

import { CosmosIcon, DialogueIcon, BrainIcon, QuillIcon, RocketIcon } from '../icons'

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
  const [step, setStep] = useState(0)

  // Звёзды генерируем один раз — useMemo с пустыми deps. Меняется только
  // когда компонент монтируется заново (а он одноразовый).
  const stars = useMemo(() => generateStars(40), [])

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]
  const Icon = current.Icon

  const handleNext = () => {
    if (isLast) {
      onComplete()
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
        <button className={styles.skipBtn} onClick={onComplete}>
          {isLast ? '' : 'Пропустить'}
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* key={step} — пересоздаём DOM чтобы анимация slideIn запускалась
            заново на каждой смене шага. */}
        <div key={step} className={styles.slide}>
          <div className={styles.iconWrap}>
            <Icon size={68} color="#fff" />
          </div>
          <h1 className={styles.title}>{current.title}</h1>
          <p className={styles.subtitle}>{current.subtitle}</p>
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
