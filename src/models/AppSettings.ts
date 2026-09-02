import { NoteSortOrder } from './Note';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Language = 'en' | 'uk';

export interface AppSettings {
  theme: ThemePreference;
  language: Language;
  defaultSortOrder: NoteSortOrder;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'uk',
  defaultSortOrder: 'dateDesc',
};
