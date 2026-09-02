export type LyricsResult =
  | { status: 'found'; lyrics: string }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

export interface FavoriteLyric {
  id: string;
  artist: string;
  title: string;
  lyrics: string;
  savedAt: number;
  /** Local file uri of a downloaded 30-second song preview, if one was found and saved. */
  audioUri?: string;
  artworkUrl?: string;
}
