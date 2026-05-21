import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApp } from '../context/AppContext'
import { CUSTOM_GRADIENTS } from '../utils/gradients'
import { buildPersonaTemplate, FIELD_LIMITS } from '../utils/personaTemplate'
import { saveAvatar, resizeImageToBlob, getAvatarUrl } from '../utils/avatarStorage'
import { isConsentValid } from '../utils/consent'
import type { Character, Gender } from '../data/characters'
import { CATEGORIES } from '../data/characters'

// Категории для кастомных персонажей (исключаем 'Все' который только фильтр).
const USER_CATEGORIES = CATEGORIES.slice(1)

import {
  BackIcon,
  BrainIcon,
  MoonIcon,
  FlowerIcon,
  LightningIcon,
  ShieldIcon,
  JokerCardIcon,
  MaskIcon,
  LotusIcon,
  FlameIcon,
  CrownIcon,
  RoseIcon,
  StarIcon,
} from '../icons'
import { CharacterIcon } from '../components/CharacterIcon'
import { AgeGateModal } from '../components/AgeGateModal'
import { appAlert } from '../components/AppDialogs'

import styles from './CreatePage.module.css'

/**
 * Доступные иконки для кастомных персонажей. Расширенный список — в Icons,
 * но для UX-чистоты picker'а оставим небольшой curated-набор.
 */
const ICON_CHOICES: { id: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { id: 'brain', Icon: BrainIcon },
  { id: 'crown', Icon: CrownIcon },
  { id: 'flame', Icon: FlameIcon },
  { id: 'rose', Icon: RoseIcon },
  { id: 'jokercard', Icon: JokerCardIcon },
  { id: 'mask', Icon: MaskIcon },
  { id: 'lightning', Icon: LightningIcon },
  { id: 'lotus', Icon: LotusIcon },
  { id: 'star5', Icon: StarIcon },
  { id: 'flower', Icon: FlowerIcon },
  { id: 'moon', Icon: MoonIcon },
  { id: 'shield', Icon: ShieldIcon },
]

export function CreatePage() {
  const nav = useNavigate()
  const {
    addCharacter,
    customCharsCount,
  } = useApp()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [persona, setPersona] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [category, setCategory] = useState<string>(USER_CATEGORIES[0] || 'Кумиры')
  const [nsfw, setNsfw] = useState(false)
  const [gradientIdx, setGradientIdx] = useState(0)
  const [iconIdx, setIconIdx] = useState(0)

  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [ageGateVisible, setAgeGateVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // touched — показываем "обязательное поле" только после того как юзер
  // хоть раз кликнул в поле и ушёл из него (onBlur).
  const [touchedName, setTouchedName] = useState(false)
  const [touchedDescription, setTouchedDescription] = useState(false)

  // При размонтировании — отзываем object-URL чтобы не утекал.
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
    }
  }, [avatarPreviewUrl])

  const handlePickFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const blob = await resizeImageToBlob(file, 256, 0.8)
      // Освобождаем предыдущий preview-URL.
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
      const url = URL.createObjectURL(blob)
      setAvatarBlob(blob)
      setAvatarPreviewUrl(url)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[create] resize failed', err)
      await appAlert({ title: 'Ошибка', message: 'Не удалось обработать картинку. Попробуй другую.' })
    } finally {
      // Сбрасываем input чтобы можно было выбрать тот же файл повторно.
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleNsfwToggle = async () => {
    if (nsfw) {
      setNsfw(false)
      return
    }
    // Проверяем age_18 consent — если нет, показываем gate.
    const ok = await isConsentValid('age_18')
    if (!ok) {
      setAgeGateVisible(true)
      return
    }
    setNsfw(true)
  }

  // Валидация — определяем активна ли кнопка submit.
  // firstMessage — опциональное поле (buildPersonaTemplate обрабатывает пустое значение).
  const canSubmit =
    name.trim().length >= 2 &&
    name.length <= FIELD_LIMITS.name &&
    description.trim().length >= 5 &&
    description.length <= FIELD_LIMITS.description &&
    persona.length <= FIELD_LIMITS.personaRaw &&
    firstMessage.length <= FIELD_LIMITS.firstMessage &&
    !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    // Custom characters теперь без лимита для всех (хранятся в localStorage,
    // ничего не стоят нам). Раньше был paywall-gate, теперь снят.

    setSubmitting(true)
    try {
      const id = `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
      const grad = CUSTOM_GRADIENTS[gradientIdx]
      const iconType = ICON_CHOICES[iconIdx].id

      // Сохраняем аватар (если есть) ДО addCharacter, чтобы blob уже был в IDB
      // когда CharacterIcon в первый раз попробует его прочитать.
      let avatarUri: string | undefined
      if (avatarBlob) {
        await saveAvatar(id, avatarBlob)
        const url = await getAvatarUrl(id)
        avatarUri = url ?? undefined
      }

      const fullPersona = buildPersonaTemplate({
        name: name.trim(),
        description: description.trim(),
        gender,
        personaRaw: persona.trim(),
        firstMessage: firstMessage.trim(),
        tagLabels: [],
        nsfw,
      })

      const character: Character = {
        id,
        name: name.trim(),
        description: description.trim(),
        category,
        iconType,
        gradientKey: 'shadow',
        customGradient: grad.colors,
        tags: [],
        messages: 0,
        rating: 5,
        firstMessage: firstMessage.trim(),
        persona: fullPersona,
        rawPersona: persona.trim(),
        userCreated: true,
        gender,
        isNSFW: nsfw,
        avatarUri,
      }

      addCharacter(character)
      nav(`/chat/${id}`)
    } finally {
      setSubmitting(false)
    }
  }

  const grad = CUSTOM_GRADIENTS[gradientIdx]
  const SelectedIcon = ICON_CHOICES[iconIdx].Icon

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => nav(-1)} aria-label="Назад">
          <BackIcon />
        </button>
        <h1 className={styles.title}>
          Создать персонажа · {customCharsCount} ∞
        </h1>
      </header>

      <div className={styles.body}>
        {/* Avatar preview + uploader */}
        <div className={styles.avatarBlock}>
          <div
            className={styles.avatarPreview}
            style={{ background: `linear-gradient(135deg, ${grad.colors[0]}, ${grad.colors[1]})` }}
          >
            {avatarPreviewUrl ? (
              <img
                src={avatarPreviewUrl}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <SelectedIcon size={36} color="#fff" />
            )}
          </div>
          <div>
            <button className={styles.avatarBtn} onClick={handlePickFile}>
              {avatarPreviewUrl ? 'Сменить фото' : 'Загрузить фото'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.avatarFileInput}
              onChange={handleFileChange}
            />
            {avatarPreviewUrl && (
              <button
                className={styles.avatarBtn}
                style={{ marginLeft: 8, color: '#FF4444' }}
                onClick={() => {
                  if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
                  setAvatarBlob(null)
                  setAvatarPreviewUrl(null)
                }}
              >
                Убрать
              </button>
            )}
          </div>
        </div>

        {/* Цвет карточки — сразу после превью чтобы юзер видел изменение */}
        <div className={styles.field}>
          <label className={styles.label}>Цвет карточки</label>
          <div className={styles.gradientGrid}>
            {CUSTOM_GRADIENTS.map((g, i) => (
              <button
                key={g.id}
                className={`${styles.gradientCell} ${i === gradientIdx ? styles.gradientCellActive : ''}`}
                style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}
                onClick={() => setGradientIdx(i)}
                aria-label={g.label}
                title={g.label}
              />
            ))}
          </div>
        </div>

        {/* Иконка — тоже сверху, рядом с превью */}
        <div className={styles.field}>
          <label className={styles.label}>Иконка</label>
          <div className={styles.iconGrid}>
            {ICON_CHOICES.map((c, i) => (
              <button
                key={c.id}
                className={`${styles.iconCell} ${i === iconIdx ? styles.iconCellActive : ''}`}
                onClick={() => setIconIdx(i)}
                aria-label={c.id}
              >
                <CharacterIcon iconType={c.id} size={24} color="#fff" />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className={styles.field}>
          <label className={styles.label}>
            Имя персонажа <span style={{ color: '#ff5555' }}>*</span>
          </label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouchedName(true)}
            placeholder="Например: Анна Каренина"
            maxLength={FIELD_LIMITS.name}
          />
          {touchedName && name.trim().length < 2 && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ff5555' }}>
              Обязательное поле (минимум 2 символа)
            </p>
          )}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label className={styles.label}>
            Краткое описание <span style={{ color: '#ff5555' }}>*</span>
          </label>
          <input
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setTouchedDescription(true)}
            placeholder="Например: Героиня романа Толстого"
            maxLength={FIELD_LIMITS.description}
          />
          {touchedDescription && description.trim().length < 5 && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ff5555' }}>
              Обязательное поле (минимум 5 символов)
            </p>
          )}
        </div>

        {/* Persona */}
        <div className={styles.field}>
          <label className={styles.label}>Характер и поведение</label>
          <textarea
            className={styles.textarea}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="Опишите как персонаж говорит, что любит, чего избегает..."
            maxLength={FIELD_LIMITS.personaRaw}
          />
          <p className={styles.charCount}>
            {persona.length}/{FIELD_LIMITS.personaRaw}
          </p>
        </div>

        {/* First message — необязательное поле */}
        <div className={styles.field}>
          <label className={styles.label}>
            Первое сообщение собеседнику{' '}
            <span style={{ color: '#666', fontWeight: 400, fontSize: 11 }}>(необязательно)</span>
          </label>
          <textarea
            className={styles.textarea}
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            placeholder="С чего начнёт разговор... (если не заполнить — юзер пишет первым)"
            maxLength={FIELD_LIMITS.firstMessage}
          />
        </div>

        {/* Gender */}
        <div className={styles.field}>
          <label className={styles.label}>Пол</label>
          <div className={styles.radioRow}>
            <button
              className={`${styles.radioBtn} ${gender === 'male' ? styles.radioBtnActive : ''}`}
              onClick={() => setGender('male')}
            >
              Мужской
            </button>
            <button
              className={`${styles.radioBtn} ${gender === 'female' ? styles.radioBtnActive : ''}`}
              onClick={() => setGender('female')}
            >
              Женский
            </button>
          </div>
        </div>

        {/* Category */}
        <div className={styles.field}>
          <label className={styles.label}>Категория</label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {USER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.radioBtn} ${category === cat ? styles.radioBtnActive : ''}`}
                style={{ flex: 'unset', padding: '8px 14px', fontSize: 13 }}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* NSFW toggle */}
        <div className={styles.field}>
          <button className={styles.toggleRow} onClick={handleNsfwToggle}>
            <span className={styles.toggleText}>
              <span className={styles.toggleLabel}>Режим 18+</span>
              <span className={styles.toggleHint}>
                Откровенный контент. Доступно только Pro.
              </span>
            </span>
            <span className={`${styles.toggle} ${nsfw ? styles.toggleOn : ''}`}>
              <span className={`${styles.toggleKnob} ${nsfw ? styles.toggleOnKnob : ''}`} />
            </span>
          </button>
        </div>

      </div>

      <div className={styles.footer}>
        <button className={styles.submitBtn} disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? 'Создаём…' : 'Создать и начать чат'}
        </button>
      </div>

      <AgeGateModal
        visible={ageGateVisible}
        onConfirm={() => {
          setAgeGateVisible(false)
          setNsfw(true)
        }}
        onCancel={() => setAgeGateVisible(false)}
      />
    </div>
  )
}
