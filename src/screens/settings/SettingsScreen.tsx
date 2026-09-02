import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { ColorTokens } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { useNotesStore } from '../../context/NotesContext';
import { Logo } from '../../components/common/Logo';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatBytes } from '../../utils/formatBytes';
import { Language, ThemePreference } from '../../models/AppSettings';
import { TranslationKey } from '../../i18n/uk';
import { radius, spacing, typography } from '../../theme/typography';

const THEME_OPTIONS: { value: ThemePreference; icon: keyof typeof Ionicons.glyphMap; labelKey: TranslationKey }[] = [
  { value: 'light', icon: 'sunny-outline', labelKey: 'settings.themeLight' },
  { value: 'dark', icon: 'moon-outline', labelKey: 'settings.themeDark' },
  { value: 'system', icon: 'phone-portrait-outline', labelKey: 'settings.themeSystem' },
];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
];

export function SettingsScreen() {
  const { colors, themePreference, setThemePreference } = useTheme();
  const { t, language, setLanguage } = useI18n();
  const { getStorageStats, clearAllData } = useNotesStore();
  const navigation = useNavigation<any>();

  const [clearVisible, setClearVisible] = useState(false);
  const stats = useMemo(() => getStorageStats(), [getStorageStats]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoRow}>
          <Logo size={56} background={colors.primary} />
          <Text style={[typography.title, { color: colors.text, marginTop: spacing.sm }]}>VoiceNotes</Text>
        </View>

        <SectionTitle label={t('settings.appearance')} color={colors.text} />
        <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>{t('settings.theme')}</Text>
        <View style={styles.optionsRow}>
          {THEME_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setThemePreference(option.value)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: themePreference === option.value ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={themePreference === option.value ? colors.onPrimary : colors.text}
              />
              <Text
                style={[
                  typography.caption,
                  { color: themePreference === option.value ? colors.onPrimary : colors.text, marginTop: 4 },
                ]}
              >
                {t(option.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[typography.captionMedium, { color: colors.textSecondary, marginTop: spacing.lg }]}>
          {t('settings.language')}
        </Text>
        <View style={styles.optionsRow}>
          {LANGUAGE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setLanguage(option.value)}
              style={[
                styles.optionCard,
                {
                  backgroundColor: language === option.value ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[typography.bodyMedium, { color: language === option.value ? colors.onPrimary : colors.text }]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle label={t('settings.dataSection')} color={colors.text} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Row label={t('settings.recordingsCount')} value={String(stats.notesCount)} colors={colors} />
          <Row label={t('settings.totalSize')} value={formatBytes(stats.totalBytes)} colors={colors} last />
        </View>

        <Pressable
          onPress={() => navigation.navigate('NotesTab', { screen: 'CategoryManager' })}
          style={[styles.linkRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="pricetags-outline" size={20} color={colors.text} />
          <Text style={[typography.bodyMedium, { color: colors.text, flex: 1, marginLeft: spacing.sm }]}>
            {t('settings.categories')}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={() => setClearVisible(true)}
          style={[
            styles.linkRow,
            { backgroundColor: colors.dangerMuted, borderColor: colors.border, marginTop: spacing.sm },
          ]}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={[typography.bodyMedium, { color: colors.danger, flex: 1, marginLeft: spacing.sm }]}>
            {t('settings.clearData')}
          </Text>
        </Pressable>

        <SectionTitle label={t('settings.about')} color={colors.text} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>{t('settings.aboutText')}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {t('settings.version')}: {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={clearVisible}
        title={t('settings.clearDataConfirmTitle')}
        message={t('settings.clearDataConfirmMessage')}
        destructive
        confirmLabel={t('common.delete')}
        onConfirm={async () => {
          await clearAllData();
          setClearVisible(false);
        }}
        onCancel={() => setClearVisible(false)}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <Text style={[typography.subtitle, { color, marginTop: spacing.xl, marginBottom: spacing.sm }]}>{label}</Text>
  );
}

function Row({ label, value, colors, last }: { label: string; value: string; colors: ColorTokens; last?: boolean }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[typography.body, { color: colors.text }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  logoRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
});
