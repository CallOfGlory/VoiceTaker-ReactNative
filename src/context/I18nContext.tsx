import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { en } from '../i18n/en';
import { uk, TranslationKey } from '../i18n/uk';
import { Language } from '../models/AppSettings';
import { useSettings } from './SettingsContext';

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, uk };

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const language = settings.language;

  const t = useCallback((key: TranslationKey) => dictionaries[language][key] ?? key, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: (lang) => updateSettings({ language: lang }),
      t,
    }),
    [language, t, updateSettings]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
