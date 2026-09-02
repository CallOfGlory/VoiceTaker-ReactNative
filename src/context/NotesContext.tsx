import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Note } from '../models/Note';
import { Category } from '../models/Category';
import { notesRepository } from '../services/storage/notesRepository';
import { categoriesRepository } from '../services/storage/categoriesRepository';
import { favoriteLyricsRepository } from '../services/storage/favoriteLyricsRepository';
import { recordingsFileService } from '../services/files/recordingsFileService';
import { songsFileService } from '../services/files/songsFileService';
import { generateId } from '../utils/id';

interface StorageStats {
  notesCount: number;
  totalBytes: number;
}

interface NotesContextValue {
  notes: Note[];
  categories: Category[];
  isLoaded: boolean;
  addNote: (note: Note) => Promise<void>;
  updateNote: (id: string, patch: Partial<Omit<Note, 'id'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addCategory: (name: string, color: string) => Promise<Category>;
  updateCategory: (id: string, patch: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getStorageStats: () => StorageStats;
  clearAllData: () => Promise<void>;
}

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [loadedNotes, loadedCategories] = await Promise.all([
        notesRepository.getAll(),
        categoriesRepository.getAll(),
      ]);
      setNotes(loadedNotes);
      setCategories(loadedCategories);
      setIsLoaded(true);
    })();
  }, []);

  const addNote = useCallback(async (note: Note) => {
    await notesRepository.add(note);
    setNotes((current) => [...current, note]);
  }, []);

  const updateNote = useCallback(async (id: string, patch: Partial<Omit<Note, 'id'>>) => {
    await notesRepository.update(id, patch);
    setNotes((current) => current.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }, []);

  const deleteNote = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (note) {
        recordingsFileService.deleteRecordingFile(note.uri);
      }
      await notesRepository.remove(id);
      setNotes((current) => current.filter((n) => n.id !== id));
    },
    [notes]
  );

  const addCategory = useCallback(async (name: string, color: string) => {
    const category: Category = { id: generateId(), name, color, createdAt: Date.now() };
    await categoriesRepository.add(category);
    setCategories((current) => [...current, category]);
    return category;
  }, []);

  const updateCategory = useCallback(async (id: string, patch: Partial<Omit<Category, 'id'>>) => {
    await categoriesRepository.update(id, patch);
    setCategories((current) => current.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await categoriesRepository.remove(id);
    await notesRepository.clearCategoryReference(id);
    setCategories((current) => current.filter((c) => c.id !== id));
    setNotes((current) => current.map((n) => (n.categoryId === id ? { ...n, categoryId: null } : n)));
  }, []);

  const getStorageStats = useCallback((): StorageStats => {
    const recordings = recordingsFileService.getStorageUsage();
    const songs = songsFileService.getStorageUsage();
    return { notesCount: notes.length, totalBytes: recordings.totalBytes + songs.totalBytes };
  }, [notes.length]);

  const clearAllData = useCallback(async () => {
    recordingsFileService.clearAllRecordings();
    songsFileService.clearAllSongs();
    await Promise.all([
      notesRepository.clearAll(),
      categoriesRepository.clearAll(),
      favoriteLyricsRepository.clearAll(),
    ]);
    setNotes([]);
    setCategories([]);
  }, []);

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      categories,
      isLoaded,
      addNote,
      updateNote,
      deleteNote,
      addCategory,
      updateCategory,
      deleteCategory,
      getStorageStats,
      clearAllData,
    }),
    [
      notes,
      categories,
      isLoaded,
      addNote,
      updateNote,
      deleteNote,
      addCategory,
      updateCategory,
      deleteCategory,
      getStorageStats,
      clearAllData,
    ]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotesStore(): NotesContextValue {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesStore must be used within a NotesProvider');
  }
  return context;
}
