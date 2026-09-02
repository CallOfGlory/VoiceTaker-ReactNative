# VoiceNotes

A mobile app built with **React Native (Expo, TypeScript)** for recording voice notes, playing them back, and searching podcasts and song lyrics through open APIs. There is no backend — all data is stored locally on the device.

## Project overview

The app has four main sections (bottom tab navigation):

1. **Notes** — a dictaphone: record voice from the microphone, browse the list of recordings, search/filter, and play them back.
2. **Podcasts** — search podcasts via the iTunes Search API, view a show's episodes (parsed from its RSS feed) and play them.
3. **Lyrics** — search for a song by title and/or artist (either field alone is enough), pick the right match from a results list, view its lyrics via lyrics.ovh, listen to a 30-second preview, and save it to favorites (lyrics text + offline audio).
4. **Settings** — appearance theme, interface language, storage stats, category management, clearing data.

A single global audio player (`PlayerContext`) runs across the whole app, with a mini-player shown above the bottom navigation whenever a note, podcast episode, or song preview is playing — you can switch tabs without interrupting playback.

## Implemented requirements

- Voice recording from the microphone with a live recording-duration timer (`src/screens/notes/RecordScreen.tsx`, `src/hooks/useRecorder.ts`).
- Saving audio files to device storage (`src/services/files/recordingsFileService.ts`).
- List of all recordings: title, date, duration (`NotesListScreen`).
- Search by title plus category filtering, a favorites-only filter, and sorting.
- Renaming and deleting recordings (note screen, `NotePlayerScreen`).
- Note player: play/pause, seeking via a slider, and playback speed control.
- Metadata and file paths persisted in `AsyncStorage`.

## Extra features

- **Categories** with color labels — create, edit, delete (`CategoryManagerScreen`).
- **Favorite notes** — a star toggle right in the list.
- **Sorting** the notes list (by date, name, duration).
- **Playback speed** (0.75x–2x) for both notes and podcast episodes.
- **Persistent mini-player** that stays visible while switching tabs.
- **Podcast search** (iTunes Search API) with episode browsing via RSS feed parsing.
- **Partial-query song search** (title only or artist only) with a pickable results list (iTunes Search API), lyrics lookup (lyrics.ovh), preview playback, and offline favorites.
- **Dark / light / system** appearance theme.
- **Interface localization**: Ukrainian and English.
- **Share a recording** via the system share sheet (`expo-sharing`).
- **Storage stats** and a full data-clearing option in Settings.
- Animated "waveform" visualization while recording (Reanimated).
- Custom SVG app logo (no external image assets required).

## Where and how data is stored

There's no backend — everything lives locally on the user's device, in two places:

### 1. Audio files — device file system

Voice recordings are saved as `.m4a` files inside the app's document directory:

```
<documentDirectory>/voicenotes/note-<timestamp>-<id>.m4a
<documentDirectory>/songs/song-<timestamp>-<id>.m4a
```

`voicenotes/` holds dictaphone recordings; `songs/` holds downloaded 30-second song previews that the user has saved to favorites. Both are managed by dedicated services (`src/services/files/recordingsFileService.ts` and `songsFileService.ts`) built on the new class-based `expo-file-system` API (`File`, `Directory`, `Paths`). Deleting a note or a favorited song also deletes its file.

### 2. Metadata — AsyncStorage

`@react-native-async-storage/async-storage` stores JSON arrays under these keys (`src/services/storage/keys.ts`):

| Key | Content |
|---|---|
| `@voicenotes/notes` | Array of notes: `{ id, title, uri, createdAt, durationMillis, categoryId, isFavorite }` — `uri` points to a file in `voicenotes/` |
| `@voicenotes/categories` | Array of categories: `{ id, name, color, createdAt }` |
| `@voicenotes/settings` | App settings: `{ theme, language, defaultSortOrder }` |
| `@voicenotes/favoriteLyrics` | Favorite lyrics: `{ id, artist, title, lyrics, savedAt, audioUri?, artworkUrl? }` — `audioUri` points to a file in `songs/` when a preview was saved offline |

Each key holds a single JSON blob — the data volume is small, so there's no need for one AsyncStorage entry per item. Typed repositories for each key live in `src/services/storage/`.

Podcasts and lyrics search results are **not cached** — they're fetched live from the open APIs on every search; only content the user explicitly favorites is persisted locally.

## Open APIs used

- **iTunes Search API** (`https://itunes.apple.com/search`) — podcast search and song search, no auth key required.
- **Podcast RSS feed** (the `feedUrl` from the iTunes response) — episode lists are parsed on-device.
- **lyrics.ovh** (`https://api.lyrics.ovh/v1/{artist}/{title}`) — song lyrics lookup, no auth key required.

## Tech stack

- **Expo SDK 57** (React Native 0.86, TypeScript, New Architecture).
- **expo-audio** — audio recording and playback.
- **expo-file-system** — managing recording and song-preview files on disk.
- **@react-native-async-storage/async-storage** — local metadata storage.
- **@react-navigation** (bottom-tabs + native-stack) — navigation.
- **react-native-reanimated** — animations (recording waveform).
- **@react-native-community/slider** — seek slider in the player.
- **react-native-svg** — custom logo.
- **fast-xml-parser** — parsing podcast RSS feeds.
- **date-fns** — localized date formatting.

## Project structure

```
App.tsx                     — entry point: context providers + navigation
src/
  navigation/                — route types, tab and stack navigators
  screens/                   — screens grouped by section (notes, podcasts, lyrics, settings)
  components/                — reusable UI components (common, notes, player)
  context/                   — global state: settings, theme, language, notes/categories, player
  services/
    storage/                 — typed AsyncStorage repositories
    files/                   — audio file management on disk
    api/                     — iTunes Search, RSS parser, and lyrics.ovh clients
  hooks/                     — useRecorder, useDebouncedValue
  models/                    — TypeScript data types
  theme/                     — color tokens (light/dark theme), typography
  i18n/                      — uk/en translation dictionaries
  utils/                     — date, duration, and file-size formatting, id generation
```

## Running the project

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (Android/iOS). No native rebuild is needed — every module used is included in Expo Go.

## Known Expo Go limitations

- Recording and playback fully work in Expo Go while the app is in the foreground.
- **Background recording** (continuing to record while the app is backgrounded) is not guaranteed in Expo Go — Expo Go is a prebuilt container and doesn't support custom native configuration. That would require a custom build via EAS Build (dev client).
- The custom microphone-permission prompt text (configured in `app.json` via the `expo-audio` plugin) only applies in a custom native build; Expo Go shows the standard system permission prompt instead.
- The app icon (`assets/icon.png`, etc.) and the native boot splash are still Expo's default placeholders. The app itself already uses a custom SVG logo (`src/components/common/Logo.tsx`); to replace the app icon in a future native build, export this SVG to PNG and swap the files in `assets/`.
