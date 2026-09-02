import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { radius, spacing, typography } from '../../theme/typography';

interface PromptModalProps {
  visible: boolean;
  title: string;
  placeholder: string;
  initialValue?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({
  visible,
  title,
  placeholder,
  initialValue = '',
  confirmLabel,
  onConfirm,
  onCancel,
}: PromptModalProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const trimmed = value.trim();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.subtitle, { color: colors.text }]}>{title}</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceVariant },
            ]}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.button, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              disabled={!trimmed}
              onPress={() => onConfirm(trimmed)}
              style={[styles.button, { backgroundColor: colors.primary, opacity: trimmed ? 1 : 0.5 }]}
            >
              <Text style={[typography.bodyMedium, { color: colors.onPrimary }]}>
                {confirmLabel ?? t('common.save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { width: '100%', maxWidth: 360, borderRadius: radius.lg, padding: spacing.lg },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.lg },
  button: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md },
});
