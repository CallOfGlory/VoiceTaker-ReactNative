import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorTokens, darkColors, lightColors } from '../theme/colors';
import { ThemePreference } from '../models/AppSettings';
import { useSettings } from './SettingsContext';

interface ThemeContextValue {
  colors: ColorTokens;
  scheme: 'light' | 'dark';
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const systemScheme = useColorScheme();

  const scheme: 'light' | 'dark' =
    settings.theme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : settings.theme;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: scheme === 'dark' ? darkColors : lightColors,
      scheme,
      themePreference: settings.theme,
      setThemePreference: (preference) => updateSettings({ theme: preference }),
    }),
    [scheme, settings.theme, updateSettings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
