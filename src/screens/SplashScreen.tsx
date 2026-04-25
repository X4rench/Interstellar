import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { LogoImage, GitHubIcon } from '../icons';
import { useApp } from '../context/AppContext';

export default function SplashScreen() {
  const { login } = useApp();
  const [step, setStep] = useState<'main' | 'enter'>('main');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => setStep('enter');
  const handleSocialSoon = () => Alert.alert('Скоро', 'Вход через соцсети появится в следующей версии.');

  const handleLogin = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('Введите ваше имя'); return; }
    if (trimmed.length < 2) { setError('Имя слишком короткое'); return; }
    login(trimmed);
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

              <View style={s.dividerRow}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>или войти через</Text>
                <View style={s.dividerLine} />
              </View>

              <View style={s.socialRow}>
                <TouchableOpacity style={s.socialBtn} onPress={handleSocialSoon} activeOpacity={0.8}>
                  <GitHubIcon size={16} />
                  <Text style={s.socialText}>GitHub</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.socialBtn} onPress={handleSocialSoon} activeOpacity={0.8}>
                  <Text style={s.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.socialBtn} onPress={handleSocialSoon} activeOpacity={0.8}>
                  <Text style={[s.socialText, { fontSize: 12 }]}>VK ID</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.terms}>
                Нажимая «Начать», вы соглашаетесь с{' '}
                <Text style={s.termsLink}>Условиями</Text>
              </Text>
            </View>
          ) : (
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
                onSubmitEditing={handleLogin}
                underlineColorAndroid="transparent"
              />
              {!!error && <Text style={s.errorText}>{error}</Text>}
              <TouchableOpacity style={s.btnPrimary} onPress={handleLogin} activeOpacity={0.85}>
                <Text style={s.btnPrimaryText}>Войти</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep('main'); setError(''); }} activeOpacity={0.7}>
                <Text style={s.backText}>← Назад</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
});
