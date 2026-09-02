import { ITunesPodcast, ITunesSearchResponse } from '../../models/podcast';
import { ITunesSong } from '../../models/song';

const BASE_URL = 'https://itunes.apple.com/search';

async function searchPodcasts(term: string): Promise<ITunesPodcast[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const url = `${BASE_URL}?term=${encodeURIComponent(trimmed)}&media=podcast&limit=25`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`iTunes search failed with status ${response.status}`);
  }
  const data = (await response.json()) as ITunesSearchResponse;
  return data.results ?? [];
}

async function searchSong(artist: string, title: string): Promise<ITunesSong | null> {
  const term = `${artist} ${title}`.trim();
  if (!term) return null;

  const url = `${BASE_URL}?term=${encodeURIComponent(term)}&media=music&entity=musicTrack&limit=1`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as { results: ITunesSong[] };
  const match = data.results?.[0];
  if (!match?.previewUrl) return null;
  return match;
}

/** General song search — accepts a title only, an artist only, or both combined. */
async function searchSongs(term: string, limit = 20): Promise<ITunesSong[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const url = `${BASE_URL}?term=${encodeURIComponent(trimmed)}&media=music&entity=musicTrack&limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`iTunes search failed with status ${response.status}`);
  }
  const data = (await response.json()) as { results: ITunesSong[] };
  return (data.results ?? []).filter((song) => !!song.previewUrl);
}

export const itunesApi = { searchPodcasts, searchSong, searchSongs };
