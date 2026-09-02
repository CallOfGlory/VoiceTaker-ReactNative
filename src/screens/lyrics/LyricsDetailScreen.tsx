import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { usePlayer } from '../../context/PlayerContext';
import { favoriteLyricsRepository } from '../../services/storage/favoriteLyricsRepository';
import { songsFileService } from '../../services/files/songsFileService';
import { itunesApi } from '../../services/api/itunesApi';
import { ITunesSong } from '../../models/song';
import { generateId } from '../../utils/id';
import { LyricsStackParamList } from '../../navigation/types';
import { radius, spacing, typography } from '../../theme/typography';

type Route = RouteProp<LyricsStackParamList, 'LyricsDetail'>;

function buildSongTrackId(artist: string, title: string): string {
  return `song-${artist.trim().toLowerCase()}-${title.trim().toLowerCase()}`;
}

export function LyricsDetailScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { artist, title, lyrics = '', favoriteId, previewUrl, artworkUrl100 } = route.params;
  const { track, isPlaying, isBuffering, playTrack, togglePlayPause } = usePlayer();

  const [savedId, setSavedId] = useState<string | undefined>(favoriteId);
  const [audioUri, setAudioUri] = useState<string | undefined>(undefined);
  const [songInfo, setSongInfo] = useState<ITunesSong | null>(
    previewUrl ? { trackId: 0, trackName: title, artistName: artist, artworkUrl100: artworkUrl100 ?? '', previewUrl } : null
  );
  const [songLoading, setSongLoading] = useState(!previewUrl);
  const [savingAudio, setSavingAudio] = useState(false);

  useEffect(() => {
    // Already have a resolved preview from the search-results list — no need to look it up again.
    if (previewUrl) return;
    let cancelled = false;
    itunesApi
      .searchSong(artist, title)
      .then((result) => {
        if (!cancelled) setSongInfo(result);
      })
      .finally(() => {
        if (!cancelled) setSongLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [artist, title, previewUrl]);

  useEffect(() => {
    if (!favoriteId) return;
    let cancelled = false;
    favoriteLyricsRepository.getAll().then((items) => {
      if (cancelled) return;
      const existing = items.find((item) => item.id === favoriteId);
      if (existing?.audioUri) setAudioUri(existing.audioUri);
    });
    return () => {
      cancelled = true;
    };
  }, [favoriteId]);

  const previewTrackId = buildSongTrackId(artist, title);
  const isActiveSongTrack = track?.id === previewTrackId;
  const playableUri = audioUri ?? songInfo?.previewUrl;

  const handlePreviewPress = () => {
    if (!playableUri) return;
    if (isActiveSongTrack) {
      togglePlayPause();
    } else {
      playTrack({
        id: previewTrackId,
        title: songInfo?.trackName ?? title,
        subtitle: songInfo?.artistName ?? artist,
        uri: playableUri,
        kind: 'song',
      });
    }
  };

  const toggleFavorite = async () => {
    if (savedId) {
      if (audioUri) {
        songsFileService.deleteSongFile(audioUri);
      }
      await favoriteLyricsRepository.remove(savedId);
      setSavedId(undefined);
      setAudioUri(undefined);
      return;
    }

    const id = generateId();
    let savedAudioUri: string | undefined;
    let artworkUrl: string | undefined;

    if (songInfo) {
      setSavingAudio(true);
      try {
        const { uri } = await songsFileService.downloadPreview(songInfo.previewUrl);
        savedAudioUri = uri;
        artworkUrl = songInfo.artworkUrl100;
      } catch {
        // Saving the audio preview is best-effort — the lyrics are still saved below.
      } finally {
        setSavingAudio(false);
      }
    }

    await favoriteLyricsRepository.add({
      id,
      artist,
      title,
      lyrics,
      savedAt: Date.now(),
      audioUri: savedAudioUri,
      artworkUrl,
    });
    setSavedId(id);
    setAudioUri(savedAudioUri);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={toggleFavorite}
          disabled={savingAudio}
          style={[styles.headerButton, { backgroundColor: colors.surfaceVariant }]}
        >
          {savingAudio ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons
              name={savedId ? 'star' : 'star-outline'}
              size={20}
              color={savedId ? colors.warning : colors.text}
            />
          )}
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.title, { color: colors.text }]}>{title}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>{artist}</Text>

        {savingAudio ? (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {t('lyrics.savingAudio')}
          </Text>
        ) : null}

        {songLoading ? (
          <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />
        ) : playableUri ? (
          <Pressable
            onPress={handlePreviewPress}
            style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {songInfo?.artworkUrl100 ? (
              <Image source={{ uri: songInfo.artworkUrl100 }} style={styles.artwork} />
            ) : (
              <View style={[styles.artwork, styles.artworkPlaceholder, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="musical-notes" size={22} color={colors.primary} />
              </View>
            )}
            <View style={styles.previewInfo}>
              <Text numberOfLines={1} style={[typography.bodyMedium, { color: colors.text }]}>
                {songInfo?.trackName ?? title}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{t('lyrics.songPreview')}</Text>
            </View>
            <Ionicons
              name={isBuffering && isActiveSongTrack ? 'hourglass-outline' : isActiveSongTrack && isPlaying ? 'pause-circle' : 'play-circle'}
              size={34}
              color={colors.primary}
            />
          </Pressable>
        ) : (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.md }]}>
            {t('lyrics.songNotFound')}
          </Text>
        )}

        <Text style={[typography.body, { color: colors.text, marginTop: spacing.lg, lineHeight: 24 }]}>
          {lyrics.trim() ? lyrics : t('lyrics.notFound')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  artworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
});
