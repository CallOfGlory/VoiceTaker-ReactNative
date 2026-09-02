import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { itunesApi } from '../../services/api/itunesApi';
import { ITunesPodcast } from '../../models/podcast';
import { PodcastsStackParamList } from '../../navigation/types';
import { radius, spacing, typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<PodcastsStackParamList>;

export function PodcastSearchScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 400);
  const [results, setResults] = useState<ITunesPodcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    itunesApi
      .searchPodcasts(trimmed)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setSearched(true);
        }
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
  }, [debouncedQuery]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typography.largeTitle, { color: colors.text }]}>{t('tabs.podcasts')}</Text>
      </View>
      <View style={styles.searchRow}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={t('podcasts.searchPlaceholder')} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.collectionId)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('PodcastDetail', {
                  collectionId: item.collectionId,
                  collectionName: item.collectionName,
                  artistName: item.artistName,
                  artworkUrl600: item.artworkUrl600,
                  feedUrl: item.feedUrl,
                })
              }
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Image source={{ uri: item.artworkUrl600 }} style={styles.artwork} />
              <View style={styles.info}>
                <Text numberOfLines={2} style={[typography.bodyMedium, { color: colors.text }]}>
                  {item.collectionName}
                </Text>
                <Text numberOfLines={1} style={[typography.caption, { color: colors.textSecondary }]}>
                  {item.artistName}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            error ? (
              <EmptyState icon="cloud-offline-outline" title={t('podcasts.loadError')} />
            ) : searched ? (
              <EmptyState icon="mic-off-outline" title={t('podcasts.noResults')} />
            ) : (
              <EmptyState icon="headset-outline" title={t('podcasts.searchHint')} />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  searchRow: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  loader: { marginTop: spacing.xl },
  listContent: { padding: spacing.lg, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.md,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
  },
  info: { flex: 1 },
});
