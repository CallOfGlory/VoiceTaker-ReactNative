import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import { useNotesStore } from '../../context/NotesContext';
import { useRecorder } from '../../hooks/useRecorder';
import { WaveformBars } from '../../components/notes/WaveformBars';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PromptModal } from '../../components/common/PromptModal';
import { recordingsFileService } from '../../services/files/recordingsFileService';
import { formatDurationMillis } from '../../utils/formatDuration';
import { formatFullDate } from '../../utils/formatDate';
import { generateId } from '../../utils/id';
import { spacing, typography, radius } from '../../theme/typography';

export function RecordScreen() {
  const { colors } = useTheme();
  const { t, language } = useI18n();
  const { addNote } = useNotesStore();
  const navigation = useNavigation();
  const recorder = useRecorder();

  const [discardVisible, setDiscardVisible] = useState(false);
  const [savePromptVisible, setSavePromptVisible] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [pendingDuration, setPendingDuration] = useState(0);

  const handleStart = async () => {
    await recorder.start();
  };

  const handleStop = async () => {
    const uri = await recorder.stop();
    if (uri) {
      setPendingUri(uri);
      setPendingDuration(recorder.durationMillis);
      setSavePromptVisible(true);
    }
  };

  const handleDiscardConfirm = async () => {
    setDiscardVisible(false);
    const uri = recorder.phase === 'stopped' ? pendingUri : await recorder.stop();
    if (uri) {
      recordingsFileService.deleteRecordingFile(uri);
    }
    navigation.goBack();
  };

  const handleSaveConfirm = async (title: string) => {
    if (!pendingUri) return;
    const { uri, sizeBytes } = recordingsFileService.persistRecording(pendingUri);
    void sizeBytes;
    await addNote({
      id: generateId(),
      title,
      uri,
      createdAt: Date.now(),
      durationMillis: pendingDuration,
      categoryId: null,
      isFavorite: false,
    });
    setSavePromptVisible(false);
    navigation.goBack();
  };

  const defaultTitle = `${t('notes.title')} ${formatFullDate(Date.now(), language)}`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable
          hitSlop={8}
          onPress={() => (recorder.phase === 'idle' ? navigation.goBack() : setDiscardVisible(true))}
          style={[styles.headerButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>
        <Text style={[typography.subtitle, { color: colors.text }]}>{t('record.title')}</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.center}>
        {recorder.permissionDenied ? (
          <View style={styles.permissionBox}>
            <Ionicons name="mic-off-outline" size={40} color={colors.danger} />
            <Text style={[typography.subtitle, { color: colors.text, marginTop: spacing.md, textAlign: 'center' }]}>
              {t('record.permissionDeniedTitle')}
            </Text>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
              ]}
            >
              {t('record.permissionDeniedMessage')}
            </Text>
          </View>
        ) : (
          <>
            <Text style={[typography.largeTitle, { color: colors.text, fontVariant: ['tabular-nums'] }]}>
              {formatDurationMillis(recorder.durationMillis)}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {recorder.phase === 'recording'
                ? t('record.recording')
                : recorder.phase === 'paused'
                ? t('record.paused')
                : t('record.tapToStart')}
            </Text>

            <View style={styles.waveform}>
              <WaveformBars active={recorder.phase === 'recording'} />
            </View>
          </>
        )}
      </View>

      {!recorder.permissionDenied && (
        <View style={styles.controls}>
          {recorder.phase === 'idle' && (
            <Pressable onPress={handleStart} style={[styles.mainButton, { backgroundColor: colors.danger }]}>
              <Ionicons name="mic" size={32} color={colors.textInverse} />
            </Pressable>
          )}

          {(recorder.phase === 'recording' || recorder.phase === 'paused') && (
            <View style={styles.activeControls}>
              <Pressable
                onPress={() => setDiscardVisible(true)}
                style={[styles.secondaryButton, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </Pressable>

              <Pressable
                onPress={recorder.phase === 'recording' ? recorder.pause : recorder.resume}
                style={[styles.mainButton, { backgroundColor: colors.primary }]}
              >
                <Ionicons name={recorder.phase === 'recording' ? 'pause' : 'mic'} size={30} color={colors.onPrimary} />
              </Pressable>

              <Pressable
                onPress={handleStop}
                style={[styles.secondaryButton, { backgroundColor: colors.success }]}
              >
                <Ionicons name="checkmark" size={22} color={colors.onPrimary} />
              </Pressable>
            </View>
          )}
        </View>
      )}

      <ConfirmDialog
        visible={discardVisible}
        title={t('record.discardConfirmTitle')}
        message={t('record.discardConfirmMessage')}
        destructive
        confirmLabel={t('common.delete')}
        onConfirm={handleDiscardConfirm}
        onCancel={() => setDiscardVisible(false)}
      />

      <PromptModal
        visible={savePromptVisible}
        title={t('record.saveTitle')}
        placeholder={t('record.titlePlaceholder')}
        initialValue={defaultTitle}
        onConfirm={handleSaveConfirm}
        onCancel={() => {
          if (pendingUri) {
            recordingsFileService.deleteRecordingFile(pendingUri);
          }
          setPendingUri(null);
          setSavePromptVisible(false);
          navigation.goBack();
        }}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionBox: {
    alignItems: 'center',
  },
  waveform: {
    marginTop: spacing.xxl,
    width: '100%',
  },
  controls: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  mainButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
