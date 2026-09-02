import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme/typography';

export function MiniPlayerBar() {
  const { track, isPlaying, currentTime, duration, togglePlayPause, closePlayer } = usePlayer();
  const { colors } = useTheme();

  if (!track) return null;

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const trackIcon = track.kind === 'episode' ? 'radio' : track.kind === 'song' ? 'musical-notes' : 'mic';

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceVariant }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <Ionicons name={trackIcon} size={18} color={colors.primary} />
        <View style={styles.info}>
          <Text numberOfLines={1} style={[typography.captionMedium, { color: colors.text }]}>
            {track.title}
          </Text>
          {track.subtitle ? (
            <Text numberOfLines={1} style={[typography.tiny, { color: colors.textSecondary }]}>
              {track.subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable hitSlop={8} onPress={togglePlayPause} style={styles.iconButton}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={colors.text} />
        </Pressable>
        <Pressable hitSlop={8} onPress={closePlayer} style={styles.iconButton}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
  },
  progressTrack: { height: 2, width: '100%' },
  progressFill: { height: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  info: { flex: 1 },
  iconButton: { padding: spacing.xs },
});
