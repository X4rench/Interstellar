import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { theme } from '../theme';
import { MOODS } from '../utils/moods';
import { isConsentValid } from '../utils/consent';
import AgeGateModal from './AgeGateModal';

interface MoodPickerModalProps {
  visible: boolean;
  currentMood: string | null;
  /** Включён ли NSFW для этого персонажа — иначе mood "nsfw18" disabled */
  characterIsNsfw: boolean;
  onSelect: (moodId: string | null) => void;
  onClose: () => void;
}

/**
 * Модалка выбора настроения общения с персонажем.
 * Появляется при нажатии кнопки mood в ChatScreen header.
 * Включает специальную опцию «Без стиля» (null) для возврата к чистой persona.
 *
 * Mood "nsfw18":
 *  - Если character.isNSFW = false → опция disabled.
 *  - Если character.isNSFW = true и нет age_18 consent → AgeGateModal.
 *  - Если есть consent → выбирается напрямую.
 */
export default function MoodPickerModal({
  visible, currentMood, characterIsNsfw, onSelect, onClose,
}: MoodPickerModalProps) {
  const [ageGateVisible, setAgeGateVisible] = useState(false);

  const handlePick = async (moodId: string | null) => {
    if (moodId === 'nsfw18') {
      if (!characterIsNsfw) return; // disabled
      const ok = await isConsentValid('age_18');
      if (!ok) {
        setAgeGateVisible(true);
        return;
      }
    }
    onSelect(moodId);
    onClose();
  };

  const onAgeConfirmed = () => {
    setAgeGateVisible(false);
    onSelect('nsfw18');
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity style={s.card} activeOpacity={1} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={s.title}>Стиль общения</Text>
            <Text style={s.subtitle}>
              Влияет на тон ответов персонажа. Меняется в любое время.
            </Text>

            <ScrollView style={{ marginTop: 8 }} showsVerticalScrollIndicator={false}>
              {/* Опция «Без стиля» — возврат к чистой persona */}
              <TouchableOpacity
                style={[s.row, currentMood === null && s.rowOn]}
                activeOpacity={0.85}
                onPress={() => handlePick(null)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.rowLabel, currentMood === null && s.rowLabelOn]}>Без стиля</Text>
                  <Text style={s.rowHint}>Базовая persona персонажа</Text>
                </View>
                {currentMood === null && (
                  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                    <Path d="M3 9l4 4 7-9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </TouchableOpacity>

              {MOODS.map(m => {
                const isOn = currentMood === m.id;
                const disabled = m.requires18 && !characterIsNsfw;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[s.row, isOn && s.rowOn, disabled && s.rowDisabled]}
                    activeOpacity={disabled ? 1 : 0.85}
                    disabled={disabled}
                    onPress={() => handlePick(m.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[s.rowLabel, isOn && s.rowLabelOn, disabled && s.rowLabelDisabled]}>
                        {m.label}
                      </Text>
                      <Text style={[s.rowHint, disabled && s.rowLabelDisabled]}>
                        {disabled ? 'Только для 18+ персонажей' : (m.hint ?? '')}
                      </Text>
                    </View>
                    {isOn && (
                      <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                        <Path d="M3 9l4 4 7-9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ paddingTop: 12 }}>
              <Text style={s.cancelText}>Закрыть</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <AgeGateModal
        visible={ageGateVisible}
        onConfirm={onAgeConfirmed}
        onCancel={() => setAgeGateVisible(false)}
      />
    </>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: theme.surface2,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderBottomWidth: 0, borderColor: theme.border,
    paddingBottom: 34, paddingTop: 12, paddingHorizontal: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: theme.surface3, alignSelf: 'center', marginBottom: 16,
  },
  title: {
    fontSize: 18, fontWeight: '700',
    color: theme.text, letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12, color: theme.text3, marginTop: 4,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 14, marginTop: 6,
  },
  rowOn: { backgroundColor: '#fff' },
  rowDisabled: { opacity: 0.4 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 2 },
  rowLabelOn: { color: '#000' },
  rowLabelDisabled: { color: theme.text3 },
  rowHint: { fontSize: 12, color: theme.text3 },
  cancelText: { fontSize: 14, color: theme.text2, textAlign: 'center', paddingVertical: 8 },
});
