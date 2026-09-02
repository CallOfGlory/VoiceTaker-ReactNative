import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { usePlayer } from '../../context/PlayerContext';
import { EmptyState } from '../../components/common/EmptyState';
import { favoriteLyricsRepository } from '../../services/storage/favoriteLyricsRepository';
import { songsFileService } from '../../services/files/songsFileService';
import { FavoriteLyric } from '../../models/lyrics';
import { LyricsStackParamList } from '../../navigation/types';
import { radius, spacing, typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<LyricsStackParamList>;

function buildSongTrackId(artist: string, title: string): string {
  return `song-${artist.trim().toLowerCase()}-${title.trim().toLowerCase()}`;
}

export function LyricsFavoritesScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const { track, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const [items, setItems] = useState<FavoriteLyric[]>([]);

  useFocusEffect(
    useCallback(() => {
      favoriteLyricsRepository.getAll().then(setItems);
    }, [])
  );

  const handleRemove = async (item: FavoriteLyric) => {
    if (item.audioUri) {
      songsFileService.deleteSongFile(item.audioUri);
    }
    await favoriteLyricsRepository.remove(item.id);
    setItems((current) => current.filter((i) => i.id !== item.id));
  };

  const handlePlay = (item: FavoriteLyric) => {
    if (!item.audioUri) return;
    const trackId = buildSongTrackId(item.artist, item.title);
    if (track?.id === trackId) {
      togglePlayPause();
    } else {
      playTrack({ id: trackId, title: item.title, subtitle: item.artist, uri: item.audioUri, kind: 'song' });
    }
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
        <Text style={[typography.subtitle, { color: colors.text }]}>{t('lyrics.favorites')}</Text>
        <View style={styles.headerButton} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={<EmptyState icon="star-outline" title={t('lyrics.emptyFavorites')} />}
        renderItem={({ item }) => {
          const isThisPlaying = track?.id === buildSongTrackId(item.artist, item.title) && isPlaying;
          return (
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                style={styles.info}
                onPress={() =>
                  navigation.navigate('LyricsDetail', {
                    artist: item.artist,
                    title: item.title,
                    lyrics: item.lyrics,
                    favoriteId: item.id,
                  })
                }
              >
                <Text numberOfLines={1} style={[typography.bodyMedium, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={[typography.caption, { color: colors.textSecondary }]}>
                  {item.artist}
                </Text>
              </Pressable>
              {item.audioUri ? (
                <Pressable hitSlop={8} onPress={() => handlePlay(item)} style={{ marginRight: spacing.sm }}>
                  <Ionicons name={isThisPlaying ? 'pause-circle' : 'play-circle'} size={26} color={colors.primary} />
                </Pressable>
              ) : null}
              <Pressable hitSlop={8} onPress={() => handleRemove(item)}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
          );
        }}
      />
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
  listContent: { padding: spacing.lg, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  info: { flex: 1 },
});
