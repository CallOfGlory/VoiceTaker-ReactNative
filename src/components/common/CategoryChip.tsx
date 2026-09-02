import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing, typography } from '../../theme/typography';

interface CategoryChipProps {
  label: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
}

export function CategoryChip({ label, color, selected, onPress }: CategoryChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surfaceVariant,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <Text style={[typography.captionMedium, { color: selected ? colors.onPrimary : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
