import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteLyric } from '../../models/lyrics';
import { STORAGE_KEYS } from './keys';

async function getAll(): Promise<FavoriteLyric[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.favoriteLyrics);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FavoriteLyric[];
  } catch {
    return [];
  }
}

async function saveAll(items: FavoriteLyric[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.favoriteLyrics, JSON.stringify(items));
}

async function add(item: FavoriteLyric): Promise<void> {
  const items = await getAll();
  items.unshift(item);
  await saveAll(items);
}

async function remove(id: string): Promise<void> {
  const items = await getAll();
  await saveAll(items.filter((i) => i.id !== id));
}

async function clearAll(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.favoriteLyrics);
}

export const favoriteLyricsRepository = { getAll, saveAll, add, remove, clearAll };
