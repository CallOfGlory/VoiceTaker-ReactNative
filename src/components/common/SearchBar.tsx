import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing, typography } from '../../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmitEditing?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder, onSubmitEditing }: SearchBarProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
      <Ionicons name="search" size={18} color={colors.textSecondary} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        autoCorrect={false}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
});
