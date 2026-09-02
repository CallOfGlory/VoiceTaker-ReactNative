import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { formatDurationSeconds } from '../../utils/formatDuration';
import { radius, spacing, typography } from '../../theme/typography';

const RATES = [0.75, 1, 1.25, 1.5, 2];

interface PlayerControlsProps {
  isPlaying: boolean;
  isBuffering?: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onChangeRate: (rate: number) => void;
}

export function PlayerControls({
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  playbackRate,
  onTogglePlay,
  onSeek,
  onChangeRate,
}: PlayerControlsProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={Math.max(duration, 0.1)}
        value={Math.min(currentTime, Math.max(duration, 0.1))}
        minimumTrackTintColor={colors.sliderMin}
        maximumTrackTintColor={colors.sliderMax}
        thumbTintColor={colors.primary}
        onSlidingComplete={onSeek}
      />
      <View style={styles.timeRow}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {formatDurationSeconds(currentTime)}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{formatDurationSeconds(duration)}</Text>
      </View>

      <View style={styles.playRow}>
        <Pressable onPress={onTogglePlay} style={[styles.playButton, { backgroundColor: colors.primary }]}>
          <Ionicons
            name={isBuffering ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
            size={28}
            color={colors.onPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.ratesRow}>
        <Text style={[typography.caption, { color: colors.textSecondary, marginRight: spacing.sm }]}>
          {t('player.playbackSpeed')}
        </Text>
        {RATES.map((rate) => (
          <Pressable
            key={rate}
            onPress={() => onChangeRate(rate)}
            style={[
              styles.rateChip,
              { backgroundColor: playbackRate === rate ? colors.primary : colors.surfaceVariant },
            ]}
          >
            <Text style={[typography.tiny, { color: playbackRate === rate ? colors.onPrimary : colors.text }]}>
              {rate}x
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  slider: { width: '100%', height: 36 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -spacing.xs },
  playRow: { alignItems: 'center', marginVertical: spacing.lg },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  rateChip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
});
