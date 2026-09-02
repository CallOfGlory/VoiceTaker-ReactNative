import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../../models/Note';
import { STORAGE_KEYS } from './keys';

async function getAll(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.notes);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

async function saveAll(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
}

async function add(note: Note): Promise<void> {
  const notes = await getAll();
  notes.push(note);
  await saveAll(notes);
}

async function update(id: string, patch: Partial<Omit<Note, 'id'>>): Promise<void> {
  const notes = await getAll();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return;
  notes[index] = { ...notes[index], ...patch };
  await saveAll(notes);
}

async function remove(id: string): Promise<void> {
  const notes = await getAll();
  await saveAll(notes.filter((n) => n.id !== id));
}

async function clearCategoryReference(categoryId: string): Promise<void> {
  const notes = await getAll();
  const updated = notes.map((n) => (n.categoryId === categoryId ? { ...n, categoryId: null } : n));
  await saveAll(updated);
}

async function clearAll(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.notes);
}

export const notesRepository = { getAll, saveAll, add, update, remove, clearCategoryReference, clearAll };
