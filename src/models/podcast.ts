export interface ITunesPodcast {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600: string;
  feedUrl: string;
  genres: string[];
  trackCount: number;
}

export interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesPodcast[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  pubDate: string;
  description: string;
  audioUrl: string;
  durationSeconds: number | null;
}
