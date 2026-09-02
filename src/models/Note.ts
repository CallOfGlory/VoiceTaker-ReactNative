export interface Note {
  id: string;
  title: string;
  uri: string;
  createdAt: number;
  durationMillis: number;
  categoryId: string | null;
  isFavorite: boolean;
}

export type NoteSortOrder = 'dateDesc' | 'dateAsc' | 'nameAsc' | 'durationDesc';
