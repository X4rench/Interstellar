import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';
import { LogoImage } from '../icons';
import { useApp } from '../context/AppContext';
import { recordConsent } from '../utils/consent';
import type { LegalDocId } from '../utils/consent';

type Step = 'main' | 'enter' | 'consent';

interface ConsentChecks {
  privacy: boolean;
  terms:   boolean;
  pdn:     boolean;
}

export default function SplashScreen() {
  const { login, navigate, setLegalDocId } = useApp();
  const [step, setStep] = useState<Step>('main');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [consents, setConsents] = useState<ConsentChecks>({ privacy: false, terms: false, pdn: false });

  const handleStart = () => setStep('enter');

  // После ввода имени — переход к экрану согласий перед login (Задача 4).
  const handleNameSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Введите ваше имя'); return; }
    if (trimmed.length < 2) { setError('Имя слишком короткое'); return; }
    setError('');
    setStep('consent');
  };

  const allConsentsChecked = consents.privacy && consents.terms && consents.pdn;

  const handleConsentConfirm = async () => {
    if (!allConsentsChecked) return;
    await Promise.all([
      recordConsent('privacy_policy'),
      recordConsent('terms_of_service'),
      recordConsent('personal_data'),
    ]);
    login(name.trim());
  };

  const openLegal = (docId: LegalDocId) => {
    setLegalDocId(docId);
    navigate('legal');
  };

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.inner}>
          <View style={s.logoWrap}>
            <LogoImage size={46} />
            <Text style={s.logoText}>
              интер<Text style={s.logoAccent}>стеллар</Text>
            </Text>
          </View>

          <Text style={s.tagline}>
            Твой личный мир живых персонажей — всегда в роли, всегда помнит тебя
          </Text>

          {step === 'main' ? (
            <View style={s.btnGroup}>
              <TouchableOpacity style={s.btnPrimary} onPress={handleStart} activeOpacity={0.85}>
                <Text style={s.btnPrimaryText}>Начать — это бесплатно</Text>
              </TouchableOpacity>

              {/* Social auth (GitHub / Google / VK ID) скрыто до реальной OAuth-интеграции.
                  См. MANUAL_TODO.md → "Social Auth". */}

              <Text style={s.terms}>
                Нажимая «Начать», вы соглашаетесь с{' '}
                <Text style={s.termsLink}>Условиями</Text>
              </Text>
            </View>
          ) : step === 'enter' ? (
            <View style={s.btnGroup}>
              <Text style={s.enterLabel}>Как вас зовут?</Text>
              <TextInput
                style={[s.input, error ? s.inputError : null]}
                placeholder="Ваше имя"
                placeholderTextColor={theme.text3}
                value={name}
                onChangeText={t => { setName(t); setError(''); }}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleNameSubmit}
                maxLength={40}
                underlineColorAndroid="transparent"
              />
              {!!error && <Text style={s.errorText}>{error}</Text>}
              <TouchableOpacity style={s.btnPrimary} onPress={handleNameSubmit} activeOpacity={0.85}>
                <Text style={s.btnPrimaryText}>Продолжить</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep('main'); setError(''); }} activeOpacity={0.7}>
                <Text style={s.backText}>← Назад</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Шаг согласий перед login (Задача 4 — 152-ФЗ)
            <View style={[s.btnGroup, { width: 320 }]}>
              <Text style={s.enterLabel}>Подтвердите согласие</Text>
              <Text style={s.consentSubtitle}>
                Перед началом использования приложения, пожалуйста, ознакомьтесь и подтвердите.
              </Text>

              <ConsentRow
                checked={consents.privacy}
                onToggle={() => setConsents(c => ({ ...c, privacy: !c.privacy }))}
                onLink={() => openLegal('privacy_policy')}
                label="Я ознакомлен(а) с"
                linkText="Политикой конфиденциальности"
              />
              <ConsentRow
                checked={consents.terms}
                onToggle={() => setConsents(c => ({ ...c, terms: !c.terms }))}
                onLink={() => openLegal('terms_of_service')}
                label="Я принимаю"
                linkText="Условия использования"
              />
              <ConsentRow
                checked={consents.pdn}
                onToggle={() => setConsents(c => ({ ...c, pdn: !c.pdn }))}
                onLink={() => openLegal('personal_data')}
                label="Я даю"
                linkText="Согласие на обработку ПДн (152-ФЗ)"
              />

              <TouchableOpacity
                style={[s.btnPrimary, !allConsentsChecked && s.btnDisabled]}
                onPress={handleConsentConfirm}
                activeOpacity={0.85}
                disabled={!allConsentsChecked}
              >
                <Text style={s.btnPrimaryText}>Подтвердить и войти</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('enter')} activeOpacity={0.7}>
                <Text style={s.backText}>← Назад</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ConsentRow({
  checked, onToggle, onLink, label, linkText,
}: {
  checked: boolean;
  onToggle: () => void;
  onLink: () => void;
  label: string;
  linkText: string;
}) {
  return (
    <TouchableOpacity style={s.consentRow} onPress={onToggle} activeOpacity={0.85}>
      <View style={[s.checkbox, checked && s.checkboxOn]}>
        {checked && (
          <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <Path d="M2 6l3 3 5-7" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.consentLabel}>
          {label}{' '}
          <Text style={s.consentLink} onPress={onLink}>{linkText}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  kav: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 32, gap: 20 },
  logoText: { fontSize: 28, fontWeight: '700', letterSpacing: -1.1, color: theme.text },
  logoAccent: { color: theme.accentLight },
  tagline: {
    fontSize: 14, color: theme.text3, textAlign: 'center',
    lineHeight: 21, letterSpacing: 0.1, maxWidth: 260, marginBottom: 48,
  },
  btnGroup: { width: 280, gap: 12 },
  btnPrimary: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  btnPrimaryText: { color: '#000000', fontSize: 15, fontWeight: '600', letterSpacing: -0.3 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.border },
  dividerText: { fontSize: 12, color: theme.text3 },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1, backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  socialText: { color: theme.text, fontSize: 13, fontWeight: '500' },
  terms: { fontSize: 11, color: theme.text3, textAlign: 'center', marginTop: 8 },
  termsLink: { color: theme.accentLight },
  enterLabel: { fontSize: 16, color: theme.text, fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: theme.text, fontSize: 15,
  },
  inputError: { borderColor: '#FF4444' },
  errorText: { fontSize: 12, color: '#FF4444', marginTop: -4 },
  backText: { color: theme.text3, fontSize: 14, textAlign: 'center', marginTop: 4 },
  // Consent step (Задача 4)
  consentSubtitle: {
    fontSize: 12, color: theme.text3, lineHeight: 18, marginBottom: 8,
  },
  consentRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: theme.borderLight,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: '#fff', borderColor: '#fff' },
  consentLabel: {
    fontSize: 13, color: theme.text2, lineHeight: 19,
  },
  consentLink: {
    color: theme.text, fontWeight: '600',
    textDecorationLine: 'underline',
  },
  btnDisabled: { opacity: 0.4 },
});
