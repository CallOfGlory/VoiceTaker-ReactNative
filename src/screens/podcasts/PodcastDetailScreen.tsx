import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { usePlayer } from '../../context/PlayerContext';
import { EmptyState } from '../../components/common/EmptyState';
import { PlayerControls } from '../../components/player/PlayerControls';
import { podcastRssService } from '../../services/api/podcastRssService';
import { PodcastEpisode } from '../../models/podcast';
import { formatDurationSeconds } from '../../utils/formatDuration';
import { PodcastsStackParamList } from '../../navigation/types';
import { radius, spacing, typography } from '../../theme/typography';

type Route = RouteProp<PodcastsStackParamList, 'PodcastDetail'>;

export function PodcastDetailScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { collectionName, artistName, artworkUrl600, feedUrl } = route.params;
  const {
    track,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    playbackRate,
    playTrack,
    togglePlayPause,
    seekTo,
    setRate,
  } = usePlayer();

  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    podcastRssService
      .fetchEpisodes(feedUrl)
      .then((data) => {
        if (!cancelled) setEpisodes(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [feedUrl]);

  const activeEpisode = episodes.find((e) => e.id === track?.id);

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
      </View>

      <View style={styles.showRow}>
        <Image source={{ uri: artworkUrl600 }} style={styles.artwork} />
        <View style={styles.showInfo}>
          <Text numberOfLines={2} style={[typography.subtitle, { color: colors.text }]}>
            {collectionName}
          </Text>
          <Text numberOfLines={1} style={[typography.caption, { color: colors.textSecondary }]}>
            {t('podcasts.by')} {artistName}
          </Text>
        </View>
      </View>

      {activeEpisode ? (
        <View style={[styles.nowPlaying, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text numberOfLines={1} style={[typography.captionMedium, { color: colors.text }]}>
            {activeEpisode.title}
          </Text>
          <PlayerControls
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            currentTime={currentTime}
            duration={duration || activeEpisode.durationSeconds || 0}
            playbackRate={playbackRate}
            onTogglePlay={togglePlayPause}
            onSeek={seekTo}
            onChangeRate={setRate}
          />
        </View>
      ) : null}

      <Text
        style={[
          typography.captionMedium,
          { color: colors.textSecondary, marginHorizontal: spacing.lg, marginTop: spacing.md },
        ]}
      >
        {t('podcasts.episodes')}
      </Text>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList
          data={episodes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => {
            const isThisActive = track?.id === item.id;
            return (
              <Pressable
                onPress={() =>
                  playTrack({
                    id: item.id,
                    title: item.title,
                    subtitle: collectionName,
                    uri: item.audioUrl,
                    kind: 'episode',
                  })
                }
                style={[styles.episodeRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Ionicons
                  name={isThisActive && isPlaying ? 'pause-circle' : 'play-circle'}
                  size={30}
                  color={colors.primary}
                />
                <View style={styles.episodeInfo}>
                  <Text numberOfLines={2} style={[typography.bodyMedium, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  {item.durationSeconds ? (
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {formatDurationSeconds(item.durationSeconds)}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon={error ? 'cloud-offline-outline' : 'list-outline'}
              title={error ? t('podcasts.loadError') : t('podcasts.noEpisodes')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  showRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  artwork: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },
  showInfo: { flex: 1 },
  nowPlaying: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  loader: { marginTop: spacing.xl },
  listContent: { padding: spacing.lg, flexGrow: 1 },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.md,
  },
  episodeInfo: { flex: 1 },
});
