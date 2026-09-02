import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '../../models/Category';
import { STORAGE_KEYS } from './keys';

async function getAll(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.categories);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Category[];
  } catch {
    return [];
  }
}

async function saveAll(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
}

async function add(category: Category): Promise<void> {
  const categories = await getAll();
  categories.push(category);
  await saveAll(categories);
}

async function update(id: string, patch: Partial<Omit<Category, 'id'>>): Promise<void> {
  const categories = await getAll();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return;
  categories[index] = { ...categories[index], ...patch };
  await saveAll(categories);
}

async function remove(id: string): Promise<void> {
  const categories = await getAll();
  await saveAll(categories.filter((c) => c.id !== id));
}

async function clearAll(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.categories);
}

export const categoriesRepository = { getAll, saveAll, add, update, remove, clearAll };
