import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { EmptyState } from '../../components/common/EmptyState';
import { itunesApi } from '../../services/api/itunesApi';
import { lyricsApi } from '../../services/api/lyricsApi';
import { ITunesSong } from '../../models/song';
import { LyricsStackParamList } from '../../navigation/types';
import { radius, spacing, typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<LyricsStackParamList>;

export function LyricsSearchScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();

  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const [results, setResults] = useState<ITunesSong[]>([]);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const canSearch = artist.trim().length > 0 || title.trim().length > 0;

  const handleSearch = async () => {
    if (!canSearch || loading) return;
    const term = [artist, title]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' ');
    setLoading(true);
    setError(false);
    try {
      const songs = await itunesApi.searchSongs(term);
      setResults(songs);
    } catch {
      setError(true);
      setResults([]);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const handleSelect = async (song: ITunesSong) => {
    if (resolvingId !== null) return;
    setResolvingId(song.trackId);
    const res = await lyricsApi.fetchLyrics(song.artistName, song.trackName);
    setResolvingId(null);
    navigation.navigate('LyricsDetail', {
      artist: song.artistName,
      title: song.trackName,
      lyrics: res.status === 'found' ? res.lyrics : undefined,
      previewUrl: song.previewUrl,
      artworkUrl100: song.artworkUrl100,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typography.largeTitle, { color: colors.text }]}>{t('tabs.lyrics')}</Text>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.navigate('LyricsFavorites')}
          style={[styles.headerButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="star-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceVariant },
          ]}
          value={artist}
          onChangeText={setArtist}
          placeholder={t('lyrics.artistPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceVariant },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder={t('lyrics.titlePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Pressable
          disabled={!canSearch || loading}
          onPress={handleSearch}
          style={[styles.searchButton, { backgroundColor: colors.primary, opacity: canSearch ? 1 : 0.5 }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={[typography.button, { color: colors.onPrimary }]}>{t('lyrics.search')}</Text>
          )}
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.trackId)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              disabled={resolvingId !== null}
              style={[styles.resultRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {item.artworkUrl100 ? (
                <Image source={{ uri: item.artworkUrl100 }} style={styles.artwork} />
              ) : (
                <View style={[styles.artwork, styles.artworkPlaceholder, { backgroundColor: colors.primaryMuted }]}>
                  <Ionicons name="musical-notes" size={18} color={colors.primary} />
                </View>
              )}
              <View style={styles.resultInfo}>
                <Text numberOfLines={1} style={[typography.bodyMedium, { color: colors.text }]}>
                  {item.trackName}
                </Text>
                <Text numberOfLines={1} style={[typography.caption, { color: colors.textSecondary }]}>
                  {item.artistName}
                </Text>
              </View>
              {resolvingId === item.trackId ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            error ? (
              <EmptyState icon="cloud-offline-outline" title={t('podcasts.loadError')} />
            ) : searched ? (
              <EmptyState icon="sad-outline" title={t('lyrics.notFound')} />
            ) : (
              <EmptyState icon="musical-notes-outline" title={t('lyrics.hint')} />
            )
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
  form: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    ...typography.body,
  },
  searchButton: {
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  loader: {
    marginTop: spacing.xl,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.md,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  artworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
});
