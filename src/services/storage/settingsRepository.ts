import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DEFAULT_SETTINGS } from '../../models/AppSettings';
import { STORAGE_KEYS } from './keys';

async function get(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function save(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export const settingsRepository = { get, save };
