import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { I18nProvider, useI18n } from './src/context/I18nContext';
import { NotesProvider, useNotesStore } from './src/context/NotesContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppSplashScreen } from './src/components/common/AppSplashScreen';

function LoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoaded: settingsLoaded } = useSettings();
  const { isLoaded: notesLoaded } = useNotesStore();
  const { colors } = useTheme();
  const { t } = useI18n();

  if (!settingsLoaded || !notesLoaded) {
    return <AppSplashScreen colors={colors} tagline={t('app.tagline')} />;
  }
  return <>{children}</>;
}

function Navigation() {
  const { colors, scheme } = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <I18nProvider>
              <NotesProvider>
                <PlayerProvider>
                  <LoadingGate>
                    <Navigation />
                  </LoadingGate>
                </PlayerProvider>
              </NotesProvider>
            </I18nProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
