import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../models/AppSettings';
import { settingsRepository } from '../services/storage/settingsRepository';

interface SettingsContextValue {
  settings: AppSettings;
  isLoaded: boolean;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    settingsRepository.get().then((loaded) => {
      setSettings(loaded);
      setIsLoaded(true);
    });
  }, []);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      settingsRepository.save(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, isLoaded, updateSettings }), [settings, isLoaded, updateSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
