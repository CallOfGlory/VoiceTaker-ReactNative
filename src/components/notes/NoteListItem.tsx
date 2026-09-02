import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../models/Note';
import { Category } from '../../models/Category';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { formatNoteDate } from '../../utils/formatDate';
import { formatDurationMillis } from '../../utils/formatDuration';
import { radius, spacing, typography } from '../../theme/typography';

interface NoteListItemProps {
  note: Note;
  category?: Category;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function NoteListItem({ note, category, onPress, onToggleFavorite }: NoteListItemProps) {
  const { colors } = useTheme();
  const { language } = useI18n();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryMuted }]}>
        <Ionicons name="mic" size={18} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={[typography.bodyMedium, { color: colors.text }]}>
          {note.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {formatNoteDate(note.createdAt, language)} · {formatDurationMillis(note.durationMillis)}
        </Text>
        {category ? (
          <View style={styles.categoryRow}>
            <View style={[styles.dot, { backgroundColor: category.color }]} />
            <Text style={[typography.tiny, { color: colors.textSecondary }]}>{category.name}</Text>
          </View>
        ) : null}
      </View>
      <Pressable hitSlop={10} onPress={onToggleFavorite}>
        <Ionicons
          name={note.isFavorite ? 'star' : 'star-outline'}
          size={20}
          color={note.isFavorite ? colors.warning : colors.textSecondary}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
