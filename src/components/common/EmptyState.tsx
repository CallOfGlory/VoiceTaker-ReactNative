import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme/typography';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textSecondary} />
      <Text style={[typography.subtitle, { color: colors.text, marginTop: spacing.md }]}>{title}</Text>
      {message ? (
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
});
