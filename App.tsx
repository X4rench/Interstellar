import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import { AppProvider, useApp } from './src/context/AppContext';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ChatScreen from './src/screens/ChatScreen';
import CreateScreen from './src/screens/CreateScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LegalScreen from './src/screens/LegalScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';
import { initSentry, wrapWithSentry } from './src/utils/sentryInit';

// Sentry init максимально рано — до любого рендера, чтобы поймать
// ошибки в начале жизни приложения.
initSentry();

// Убираем браузерную обводку у всех инпутов на web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = 'input, textarea { outline: none !important; box-shadow: none !important; }';
  document.head.appendChild(style);
}

function Navigator() {
  const { screen } = useApp();
  switch (screen) {
    case 'splash':  return <SplashScreen />;
    case 'home':    return <HomeScreen />;
    case 'library': return <LibraryScreen />;
    case 'chat':    return <ChatScreen />;
    case 'create':  return <CreateScreen />;
    case 'profile': return <ProfileScreen />;
    case 'legal':   return <LegalScreen />;
    case 'paywall': return <PaywallScreen />;
    default:        return <HomeScreen />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#000000" />
        <AppProvider>
          <Navigator />
          <OfflineBanner />
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

// Sentry HOC — подписывается на unhandled errors и автоматически шлёт в Sentry.
// На no-init (нет DSN) работает как identity wrapper.
export default wrapWithSentry(App);
