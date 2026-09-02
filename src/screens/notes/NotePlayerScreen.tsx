import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { useNotesStore } from '../../context/NotesContext';
import { usePlayer } from '../../context/PlayerContext';
import { PlayerControls } from '../../components/player/PlayerControls';
import { CategoryChip } from '../../components/common/CategoryChip';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PromptModal } from '../../components/common/PromptModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatFullDate } from '../../utils/formatDate';
import { formatDurationMillis } from '../../utils/formatDuration';
import { NotesStackParamList } from '../../navigation/types';
import { radius, spacing, typography } from '../../theme/typography';

type Route = RouteProp<NotesStackParamList, 'NotePlayer'>;
type Nav = NativeStackNavigationProp<NotesStackParamList>;

export function NotePlayerScreen() {
  const { colors } = useTheme();
  const { t, language } = useI18n();
  const { notes, categories, updateNote, deleteNote } = useNotesStore();
  const {
    track,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    playbackRate,
    error,
    playTrack,
    togglePlayPause,
    seekTo,
    setRate,
    closePlayer,
  } = usePlayer();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const note = notes.find((n) => n.id === route.params.noteId);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);

  if (!note) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <EmptyState icon="alert-circle-outline" title={t('player.notFound')} />
      </SafeAreaView>
    );
  }

  const isActiveTrack = track?.id === note.id;
  const displayCurrentTime = isActiveTrack ? currentTime : 0;
  const displayDuration = isActiveTrack && duration > 0 ? duration : note.durationMillis / 1000;
  const displayIsPlaying = isActiveTrack && isPlaying;

  const handlePlayPress = () => {
    if (isActiveTrack) {
      togglePlayPause();
    } else {
      playTrack({ id: note.id, title: note.title, uri: note.uri, kind: 'note' });
    }
  };

  const handleShare = async () => {
    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(note.uri);
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
        <Pressable
          hitSlop={8}
          onPress={() => updateNote(note.id, { isFavorite: !note.isFavorite })}
          style={[styles.headerButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons
            name={note.isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={note.isFavorite ? colors.warning : colors.text}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.artwork, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons name="mic" size={48} color={colors.primary} />
        </View>

        <Pressable onPress={() => setRenameVisible(true)} style={styles.titleRow}>
          <Text style={[typography.title, { color: colors.text, textAlign: 'center' }]} numberOfLines={2}>
            {note.title}
          </Text>
          <Ionicons name="pencil" size={16} color={colors.textSecondary} />
        </Pressable>
        <Text
          style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}
        >
          {formatFullDate(note.createdAt, language)} · {formatDurationMillis(note.durationMillis)}
        </Text>

        <View style={styles.playerBlock}>
          <PlayerControls
            isPlaying={displayIsPlaying}
            isBuffering={isActiveTrack && isBuffering}
            currentTime={displayCurrentTime}
            duration={displayDuration}
            playbackRate={playbackRate}
            onTogglePlay={handlePlayPress}
            onSeek={(seconds) => {
              if (!isActiveTrack) {
                playTrack({ id: note.id, title: note.title, uri: note.uri, kind: 'note' });
              }
              seekTo(seconds);
            }}
            onChangeRate={setRate}
          />
          {isActiveTrack && error ? (
            <Text style={[typography.caption, { color: colors.danger, textAlign: 'center', marginTop: spacing.sm }]}>
              {t('player.playbackError')}
            </Text>
          ) : null}
        </View>

        <Text
          style={[
            typography.captionMedium,
            { color: colors.textSecondary, alignSelf: 'flex-start', marginTop: spacing.lg },
          ]}
        >
          {t('notes.category')}
        </Text>
        <View style={styles.categoriesRow}>
          <CategoryChip
            label={t('notes.noCategory')}
            selected={!note.categoryId}
            onPress={() => updateNote(note.id, { categoryId: null })}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              color={c.color}
              selected={note.categoryId === c.id}
              onPress={() => updateNote(note.id, { categoryId: c.id })}
            />
          ))}
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={handleShare} style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="share-outline" size={18} color={colors.text} />
            <Text style={[typography.captionMedium, { color: colors.text }]}>{t('player.share')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setRenameVisible(true)}
            style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.text} />
            <Text style={[typography.captionMedium, { color: colors.text }]}>{t('common.rename')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setDeleteVisible(true)}
            style={[styles.actionButton, { backgroundColor: colors.dangerMuted }]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[typography.captionMedium, { color: colors.danger }]}>{t('common.delete')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={deleteVisible}
        title={t('notes.deleteConfirmTitle')}
        message={t('notes.deleteConfirmMessage')}
        destructive
        confirmLabel={t('common.delete')}
        onConfirm={async () => {
          setDeleteVisible(false);
          if (isActiveTrack) {
            closePlayer();
          }
          await deleteNote(note.id);
          navigation.goBack();
        }}
        onCancel={() => setDeleteVisible(false)}
      />

      <PromptModal
        visible={renameVisible}
        title={t('notes.renameTitle')}
        placeholder={t('notes.renamePlaceholder')}
        initialValue={note.title}
        onConfirm={(value) => {
          updateNote(note.id, { title: value });
          setRenameVisible(false);
        }}
        onCancel={() => setRenameVisible(false)}
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
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  artwork: {
    width: 140,
    height: 140,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  playerBlock: {
    width: '100%',
    marginTop: spacing.xl,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
});
