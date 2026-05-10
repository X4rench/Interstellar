import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { theme } from '../theme';

/**
 * Telegram-style индикатор офлайна. При потере соединения сверху появляется
 * тонкий бар «Подключение...» с крутящимся кольцом — без агрессивного красного.
 * Скрывается автоматически при восстановлении сети.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const translateY = useRef(new Animated.Value(-40)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      const isOffline = state.isConnected === false || state.isInternetReachable === false;
      setOffline(isOffline);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: offline ? 0 : -40,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [offline, translateY]);

  // Крутим кольцо непрерывно пока баннер видим. При offline=false луп
  // продолжает работать в фоне, но компонент скрыт — overhead минимальный.
  // Чтобы избежать лишней работы при долгом онлайне, останавливаем луп.
  useEffect(() => {
    if (!offline) {
      rotate.stopAnimation();
      return;
    }
    rotate.setValue(0);
    const loop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [offline, rotate]);

  if (!offline) return null;

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[s.root, { transform: [{ translateY }] }]}
    >
      <Animated.View style={[s.spinner, { transform: [{ rotate: spin }] }]} />
      <Text style={s.text}>Подключение...</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingTop: 44, paddingBottom: 8, paddingHorizontal: 16,
    backgroundColor: 'rgba(20,20,20,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    zIndex: 1000,
  },
  spinner: {
    width: 14, height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    borderTopColor: theme.text,
  },
  text: { color: theme.text2, fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
});
