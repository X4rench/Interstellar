import { cardBg } from '../theme';
import type { Character } from '../data/characters';

type CardKey = keyof typeof cardBg;

/**
 * Палитра цветных градиентов только для кастомных персонажей.
 * Встроенные персонажи продолжают использовать унифицированный чёрный
 * градиент из theme.cardBg для премиум-стиля.
 *
 * Из-за того что theme.cardBg сейчас имеет одинаковую пару `['#111111','#1e1e1e']`
 * у всех 188 ключей, селектор цвета в CreateScreen раньше показывал
 * везде одинаковый чёрный (отсюда баг «чёрного круга»).
 *
 * Каждый CUSTOM_GRADIENTS имеет:
 *  - id        — стабильный идентификатор (для аналитики, мб БД)
 *  - colors    — пара цветов [from, to] для LinearGradient
 *  - label     — человекочитаемое название
 */
export interface CustomGradient {
  id: string;
  colors: readonly [string, string];
  label: string;
}

export const CUSTOM_GRADIENTS: readonly CustomGradient[] = [
  { id: 'shadow',   colors: ['#111111', '#1e1e1e'], label: 'Чёрный'      }, // дефолт — классический чёрный
  { id: 'royal',    colors: ['#1A0F2E', '#3D1A6B'], label: 'Королевский' }, // тёмно-фиолетовый
  { id: 'sunset',   colors: ['#2A0E1A', '#7B1A3D'], label: 'Закат'       }, // винный
  { id: 'gold',     colors: ['#2A1F0A', '#7B5A1A'], label: 'Золото'      }, // тёмно-золотой
  { id: 'ocean',    colors: ['#0A1F3A', '#1A4D7B'], label: 'Океан'       }, // синий
  { id: 'forest',   colors: ['#0E2A1A', '#1A5B3D'], label: 'Лес'         }, // изумруд
  { id: 'volcano',  colors: ['#2A0E0E', '#7B1A1A'], label: 'Лава'        }, // красно-чёрный
  { id: 'sakura',   colors: ['#2A1A1F', '#7B3D5A'], label: 'Сакура'      }, // розово-сливовый
  { id: 'midnight', colors: ['#0A0F1A', '#1A2A4D'], label: 'Полночь'     }, // ночной синий
  { id: 'mint',     colors: ['#0A2A2A', '#1A6B5B'], label: 'Мята'        }, // бирюзовый
  { id: 'amber',    colors: ['#2A1A0A', '#7B4D1A'], label: 'Янтарь'      }, // янтарный
  { id: 'silver',   colors: ['#1F1F1F', '#3D3D3D'], label: 'Сталь'       }, // светло-серый
] as const;

/**
 * Возвращает пару цветов градиента для отрисовки карточки персонажа.
 *
 * Приоритет:
 * 1. customGradient (если задан — используется напрямую). Это для кастомных
 *    персонажей которые сохранили выбранный цвет.
 * 2. cardBg[gradientKey] — встроенный фолбэк (унифицированный чёрный).
 * 3. cardBg.freud — последний резервный вариант на случай ошибки в данных.
 *
 * Используется во всех местах где LinearGradient рендерит карточку или аватар:
 * HomeScreen, LibraryScreen, ChatScreen, статсы, и т.д.
 */
export function getCharacterGradient(
  c: Character,
): readonly [string, string] {
  if (c.customGradient) return c.customGradient;
  return cardBg[c.gradientKey as CardKey] ?? cardBg.freud;
}
