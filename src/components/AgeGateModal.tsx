import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../theme';
import { recordConsent } from '../utils/consent';

interface AgeGateModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Простая модалка возрастного согласия 18+.
 * Согласно 152-ФЗ + закону о защите детей от информации, для NSFW-контента
 * требуется bona-fide подтверждение возраста. Чекбокс «Мне исполнилось 18
 * лет» — юридически достаточный минимум.
 *
 * Используется в трёх местах:
 *  - CreateScreen при включении тоггла «Режим 18+»
 *  - MoodPickerModal при выборе mood "nsfw18"
 *  - ChatScreen при первом открытии NSFW персонажа
 *
 * При подтверждении — записывает recordConsent('age_18') с текущей версией.
 * При отказе — onCancel(), вызывающий должен откатить действие.
 */
export default function AgeGateModal({ visible, onConfirm, onCancel }: AgeGateModalProps) {
  const [checked, setChecked] = useState(false);

  const handleConfirm = async () => {
    if (!checked) return;
    await recordConsent('age_18');
    setChecked(false);
    onConfirm();
  };

  const handleCancel = () => {
    setChecked(false);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={handleCancel}>
        <TouchableOpacity style={s.card} activeOpacity={1} onPress={() => {}}>
          <Text style={s.title}>Возрастное ограничение</Text>
          <Text style={s.subtitle}>
            Контент 18+ доступен только совершеннолетним пользователям.
            Для продолжения подтвердите возраст.
          </Text>

          <TouchableOpacity
            style={s.checkRow}
            activeOpacity={0.8}
            onPress={() => setChecked(v => !v)}
          >
            <View style={[s.checkbox, checked && s.checkboxOn]}>
              {checked && (
                <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                  <Path d="M3 7l3 3 5-7" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              )}
            </View>
            <Text style={s.checkLabel}>Мне исполнилось 18 лет</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.primaryBtn, !checked && s.primaryBtnDisabled]}
            activeOpacity={0.85}
            disabled={!checked}
            onPress={handleConfirm}
          >
            <Text style={s.primaryBtnText}>Подтвердить</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
            <Text style={s.cancelText}>Отмена</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: theme.surface2,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, gap: 16,
  },
  title: {
    fontSize: 18, fontWeight: '700',
    color: theme.text, letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13, lineHeight: 19,
    color: theme.text2,
  },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: theme.borderLight,
    backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: '#fff', borderColor: '#fff' },
  checkLabel: { fontSize: 14, color: theme.text, fontWeight: '500', flex: 1 },
  primaryBtn: {
    backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  cancelText: { fontSize: 13, color: theme.text3, textAlign: 'center', paddingVertical: 4 },
});
