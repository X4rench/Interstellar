import { useNavigate, useParams } from 'react-router-dom'

import { LEGAL_CONTENT } from '../utils/legalContent'
import type { LegalDocId } from '../utils/consent'
import { BackIcon } from '../icons'

import styles from './LegalPage.module.css'

const DOCS: { id: LegalDocId; label: string }[] = [
  { id: 'privacy_policy', label: 'Конфиденциальность' },
  { id: 'terms_of_service', label: 'Условия' },
  { id: 'personal_data', label: '152-ФЗ' },
  { id: 'subscription', label: 'Подписка' },
  { id: 'public_offer', label: 'Оферта' },
  { id: 'partner_offer', label: 'Партнёрам' },
  { id: 'partner_consent', label: 'Партнёр · ПДн' },
  { id: 'about', label: 'О приложении' },
]

export function LegalPage() {
  const nav = useNavigate()
  const { docId } = useParams<{ docId?: string }>()

  // Проверка что docId — валидный LegalDocId.
  const validDocId = docId && Object.prototype.hasOwnProperty.call(LEGAL_CONTENT, docId)
    ? (docId as LegalDocId)
    : null

  const doc = validDocId ? LEGAL_CONTENT[validDocId] : null

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => nav(-1)} aria-label="Назад">
          <BackIcon />
        </button>
        <h1 className={styles.title}>Юридические документы</h1>
      </header>

      {/* Doc picker — горизонтальные пилюли */}
      <div className={styles.docPicker}>
        {DOCS.map((d) => (
          <button
            key={d.id}
            className={`${styles.docPickerBtn} ${
              validDocId === d.id ? styles.docPickerBtnActive : ''
            }`}
            onClick={() => nav(`/legal/${d.id}`, { replace: true })}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {!doc ? (
          <p className={styles.empty}>Выберите документ выше</p>
        ) : (
          <>
            <h2 className={styles.docTitle}>{doc.title}</h2>
            <p className={styles.effectiveDate}>Действует с {doc.effectiveDate}</p>

            {doc.sections.map((section, i) => (
              <div key={i} className={styles.section}>
                <h3 className={styles.sectionHeading}>{section.heading}</h3>
                <p className={styles.sectionBody}>{section.body}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
