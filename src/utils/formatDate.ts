import { format, isToday, isYesterday } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import { Language } from '../models/AppSettings';

const locales = { en: enUS, uk } as const;

export function formatNoteDate(timestamp: number, language: Language): string {
  const date = new Date(timestamp);
  const locale = locales[language];

  if (isToday(date)) {
    return format(date, 'HH:mm', { locale });
  }
  if (isYesterday(date)) {
    const yesterdayLabel = language === 'uk' ? 'Вчора' : 'Yesterday';
    return `${yesterdayLabel}, ${format(date, 'HH:mm', { locale })}`;
  }
  return format(date, 'd MMM yyyy, HH:mm', { locale });
}

export function formatFullDate(timestamp: number, language: Language): string {
  return format(new Date(timestamp), 'd MMMM yyyy, HH:mm', { locale: locales[language] });
}
