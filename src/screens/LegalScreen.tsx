import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { BackIcon } from '../icons';
import { useApp } from '../context/AppContext';
import { LEGAL_CONTENT } from '../utils/legalContent';
import type { LegalDocId } from '../utils/consent';

const FALLBACK_DOC: LegalDocId = 'privacy_policy';

/**
 * Экран правовых документов. Показывает один из 5 документов, выбранный
 * через AppContext.legalDocId. Если id не задан — открывает privacy_policy
 * по умолчанию (фолбэк для прямого navigate('legal') без сетера).
 *
 * Стилистика: ScrollView на тёмном фоне, как остальное приложение.
 * Заголовок документа крупным шрифтом, разделы с heading + body.
 */
export default function LegalScreen() {
  const { navigate, legalDocId, isAuthenticated } = useApp();

  const docId = legalDocId ?? FALLBACK_DOC;
  const doc = useMemo(() => LEGAL_CONTENT[docId], [docId]);

  // Back-кнопка: если пользователь авторизован — возврат в profile.
  // Иначе — возврат в splash (он сам разберётся с шагом consent).
  const handleBack = () => navigate(isAuthenticated ? 'profile' : 'splash');

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{doc.title}</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}
        contentContainerStyle={s.bodyContent}>
        <Text style={s.docTitle}>{doc.title}</Text>
        <Text style={s.effectiveDate}>Дата вступления в силу: {doc.effectiveDate}</Text>

        {doc.sections.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={s.sectionHeading}>{section.heading}</Text>
            <Text style={s.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 40, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: theme.border, gap: 12,
  },
  backBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1, fontSize: 16, fontWeight: '600',
    letterSpacing: -0.3, color: theme.text,
  },
  body: { flex: 1 },
  bodyContent: { padding: 20 },

  docTitle: {
    fontSize: 24, fontWeight: '800', color: theme.text,
    letterSpacing: -0.6, marginBottom: 4,
  },
  effectiveDate: {
    fontSize: 12, color: theme.text3,
    marginBottom: 24,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 16, fontWeight: '700',
    color: theme.text, letterSpacing: -0.2,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14, lineHeight: 21,
    color: theme.text2,
  },
});
