import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { radius, spacing, typography } from '../../theme/typography';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  destructive?: boolean;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  destructive,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.subtitle, { color: colors.text }]}>{title}</Text>
          {message ? (
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>{message}</Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.button, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[styles.button, { backgroundColor: destructive ? colors.danger : colors.primary }]}
            >
              <Text style={[typography.bodyMedium, { color: colors.onPrimary }]}>
                {confirmLabel ?? t('common.confirm')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
});
