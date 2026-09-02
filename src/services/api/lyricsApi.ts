import { LyricsResult } from '../../models/lyrics';

const BASE_URL = 'https://api.lyrics.ovh/v1';

async function fetchLyrics(artist: string, title: string): Promise<LyricsResult> {
  const a = artist.trim();
  const t = title.trim();
  if (!a || !t) return { status: 'not_found' };

  try {
    const url = `${BASE_URL}/${encodeURIComponent(a)}/${encodeURIComponent(t)}`;
    const response = await fetch(url);
    if (response.status === 404) {
      return { status: 'not_found' };
    }
    if (!response.ok) {
      return { status: 'error', message: `HTTP ${response.status}` };
    }
    const data = (await response.json()) as { lyrics?: string; error?: string };
    if (!data.lyrics) {
      return { status: 'not_found' };
    }
    return { status: 'found', lyrics: data.lyrics.trim() };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export const lyricsApi = { fetchLyrics };
