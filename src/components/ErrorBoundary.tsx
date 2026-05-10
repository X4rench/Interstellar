import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Корневой Error Boundary. Ловит любую ошибку рендера в дереве компонентов
 * и показывает recoverable-экран вместо полного crash'а с белым/чёрным фоном.
 *
 * Логирует ошибку в console (DEV) и в Sentry (если установлен — см. App.tsx).
 *
 * RN не предоставляет hook-альтернативу — обязательно классовый компонент.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
    // На проде Sentry автоматически ловит unhandled errors через React-обёртку,
    // но дополнительно отправляем явно — чтобы получить componentStack.
    try {
      // Динамический импорт, чтобы Sentry не был жёсткой зависимостью.
      // Если @sentry/react-native не установлен — silently игнорируем.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require('@sentry/react-native');
      if (Sentry?.captureException) {
        Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
      }
    } catch {}
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={s.root}>
        <ScrollView contentContainerStyle={s.center}>
          <Text style={s.title}>Что-то сломалось</Text>
          <Text style={s.sub}>
            Приложение столкнулось с непредвиденной ошибкой.
            Попробуйте перезапустить.
          </Text>
          {__DEV__ && (
            <View style={s.devBox}>
              <Text style={s.devTitle}>DEV info:</Text>
              <Text style={s.devMsg}>{this.state.error.message}</Text>
            </View>
          )}
          <TouchableOpacity style={s.btn} onPress={this.reset} activeOpacity={0.85}>
            <Text style={s.btnText}>Попробовать снова</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingVertical: 60, gap: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: theme.text, letterSpacing: -0.5, textAlign: 'center' },
  sub: { fontSize: 14, color: theme.text2, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  btn: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  devBox: {
    backgroundColor: theme.surface2, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, padding: 12, marginVertical: 12, alignSelf: 'stretch',
  },
  devTitle: { fontSize: 11, color: theme.text3, marginBottom: 4 },
  devMsg: { fontSize: 12, color: theme.text, fontFamily: 'monospace' as any },
});
