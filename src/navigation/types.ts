import { NavigatorScreenParams } from '@react-navigation/native';

export type NotesStackParamList = {
  NotesList: undefined;
  Record: undefined;
  NotePlayer: { noteId: string };
  CategoryManager: undefined;
};

export type PodcastsStackParamList = {
  PodcastSearch: undefined;
  PodcastDetail: {
    collectionId: number;
    collectionName: string;
    artistName: string;
    artworkUrl600: string;
    feedUrl: string;
  };
};

export type LyricsStackParamList = {
  LyricsSearch: undefined;
  LyricsFavorites: undefined;
  LyricsDetail: {
    artist: string;
    title: string;
    lyrics?: string;
    favoriteId?: string;
    previewUrl?: string;
    artworkUrl100?: string;
  };
};

export type RootTabParamList = {
  NotesTab: NavigatorScreenParams<NotesStackParamList>;
  PodcastsTab: NavigatorScreenParams<PodcastsStackParamList>;
  LyricsTab: NavigatorScreenParams<LyricsStackParamList>;
  SettingsTab: undefined;
};
