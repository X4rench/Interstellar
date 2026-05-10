import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Идентификаторы правовых документов в приложении.
 * Хранятся в AsyncStorage с указанием версии и даты согласия.
 * При обновлении версии документа пользователь должен подтвердить заново.
 */
export type LegalDocId =
  | 'privacy_policy'
  | 'terms_of_service'
  | 'personal_data'
  | 'subscription'
  | 'about';

export type ConsentDocId =
  | 'privacy_policy'
  | 'terms_of_service'
  | 'personal_data'
  | 'age_18';

/**
 * Текущие версии документов. При изменении содержимого документа
 * (LEGAL_CONTENT) — поднять соответствующую версию здесь, тогда
 * пользователь увидит запрос повторного согласия.
 */
export const LEGAL_VERSIONS: Record<ConsentDocId, string> = {
  privacy_policy:   '2026.04',
  terms_of_service: '2026.04',
  personal_data:    '2026.04',
  age_18:           '2026.04',
};

interface SingleConsent {
  version: string;
  acceptedAt: string; // ISO timestamp
}

export type ConsentRecord = Partial<Record<ConsentDocId, SingleConsent>>;

const STORAGE_KEY = 'legal_consents';

export async function getConsents(): Promise<ConsentRecord> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return {};
    return JSON.parse(json) as ConsentRecord;
  } catch {
    return {};
  }
}

export async function recordConsent(doc: ConsentDocId): Promise<void> {
  const current = await getConsents();
  const updated: ConsentRecord = {
    ...current,
    [doc]: {
      version: LEGAL_VERSIONS[doc],
      acceptedAt: new Date().toISOString(),
    },
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors silently
  }
}

/**
 * Проверяет валидность согласия: должно существовать И версия совпадать
 * с актуальной. Если версия документа поднялась — согласие считается
 * устаревшим и потребует повторного подтверждения.
 */
export async function isConsentValid(doc: ConsentDocId): Promise<boolean> {
  const consents = await getConsents();
  const c = consents[doc];
  if (!c) return false;
  return c.version === LEGAL_VERSIONS[doc];
}

/**
 * Проверка трёх обязательных согласий первого запуска (без age_18).
 * Возрастное согласие проверяется отдельно при попытке войти в NSFW.
 */
export async function areMandatoryConsentsValid(): Promise<boolean> {
  const [privacy, terms, pdn] = await Promise.all([
    isConsentValid('privacy_policy'),
    isConsentValid('terms_of_service'),
    isConsentValid('personal_data'),
  ]);
  return privacy && terms && pdn;
}
