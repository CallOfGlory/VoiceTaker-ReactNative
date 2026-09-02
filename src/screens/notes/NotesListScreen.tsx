import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { useNotesStore } from '../../context/NotesContext';
import { SearchBar } from '../../components/common/SearchBar';
import { CategoryChip } from '../../components/common/CategoryChip';
import { EmptyState } from '../../components/common/EmptyState';
import { NoteListItem } from '../../components/notes/NoteListItem';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { NotesStackParamList } from '../../navigation/types';
import { NoteSortOrder } from '../../models/Note';
import { spacing, typography, radius } from '../../theme/typography';
import { TranslationKey } from '../../i18n/uk';

const SORT_OPTIONS: { value: NoteSortOrder; labelKey: TranslationKey }[] = [
  { value: 'dateDesc', labelKey: 'notes.sortDateDesc' },
  { value: 'dateAsc', labelKey: 'notes.sortDateAsc' },
  { value: 'nameAsc', labelKey: 'notes.sortNameAsc' },
  { value: 'durationDesc', labelKey: 'notes.sortDurationDesc' },
];

type Nav = NativeStackNavigationProp<NotesStackParamList>;

export function NotesListScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { settings, updateSettings } = useSettings();
  const { notes, categories, updateNote } = useNotesStore();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 250);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const sortOrder = settings.defaultSortOrder;

  const filteredNotes = useMemo(() => {
    let result = notes;
    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((n) => n.title.toLowerCase().includes(q));
    }
    if (selectedCategoryId) {
      result = result.filter((n) => n.categoryId === selectedCategoryId);
    }
    if (favoritesOnly) {
      result = result.filter((n) => n.isFavorite);
    }
    return [...result].sort((a, b) => {
      switch (sortOrder) {
        case 'dateAsc':
          return a.createdAt - b.createdAt;
        case 'nameAsc':
          return a.title.localeCompare(b.title);
        case 'durationDesc':
          return b.durationMillis - a.durationMillis;
        case 'dateDesc':
        default:
          return b.createdAt - a.createdAt;
      }
    });
  }, [notes, debouncedQuery, selectedCategoryId, favoritesOnly, sortOrder]);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typography.largeTitle, { color: colors.text }]}>{t('notes.title')}</Text>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.navigate('CategoryManager')}
          style={[styles.headerButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="pricetags-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('notes.searchPlaceholder')} />
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => setSortMenuVisible(true)}
          style={[styles.headerButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="swap-vertical" size={20} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
        data={[{ id: null, name: t('notes.allCategories'), color: undefined }, ...categories]}
        keyExtractor={(item) => item.id ?? 'all'}
        renderItem={({ item }) => (
          <CategoryChip
            label={item.name}
            color={item.color}
            selected={selectedCategoryId === item.id}
            onPress={() => setSelectedCategoryId(item.id)}
          />
        )}
        ListFooterComponent={
          <CategoryChip
            label={t('notes.favoritesOnly')}
            selected={favoritesOnly}
            onPress={() => setFavoritesOnly((v) => !v)}
          />
        }
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
      />

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <NoteListItem
            note={item}
            category={item.categoryId ? categoryById.get(item.categoryId) : undefined}
            onPress={() => navigation.navigate('NotePlayer', { noteId: item.id })}
            onToggleFavorite={() => updateNote(item.id, { isFavorite: !item.isFavorite })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="mic-outline"
            title={query || selectedCategoryId || favoritesOnly ? t('notes.emptySearch') : t('notes.emptyTitle')}
            message={query || selectedCategoryId || favoritesOnly ? undefined : t('notes.emptyMessage')}
          />
        }
      />

      <Pressable
        onPress={() => navigation.navigate('Record')}
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
      >
        <Ionicons name="mic" size={26} color={colors.onPrimary} />
      </Pressable>

      <Modal visible={sortMenuVisible} transparent animationType="fade" onRequestClose={() => setSortMenuVisible(false)}>
        <Pressable style={[styles.menuOverlay, { backgroundColor: colors.overlay }]} onPress={() => setSortMenuVisible(false)}>
          <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={styles.menuItem}
                onPress={() => {
                  updateSettings({ defaultSortOrder: option.value });
                  setSortMenuVisible(false);
                }}
              >
                <Text style={[typography.body, { color: sortOrder === option.value ? colors.primary : colors.text }]}>
                  {t(option.labelKey)}
                </Text>
                {sortOrder === option.value ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  chipsRow: {
    marginTop: spacing.md,
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuOverlay: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 140,
    paddingRight: spacing.lg,
  },
  menuCard: {
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
});
