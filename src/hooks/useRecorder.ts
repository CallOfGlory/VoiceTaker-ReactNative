import { useCallback, useEffect, useState } from 'react';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';

export type RecorderPhase = 'idle' | 'recording' | 'paused' | 'stopped';

export function useRecorder() {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, directory: 'document' });
  const recorderState = useAudioRecorderState(recorder, 200);
  const [phase, setPhase] = useState<RecorderPhase>('idle');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    return () => {
      setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    };
  }, []);

  const start = useCallback(async (): Promise<boolean> => {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      setPermissionDenied(true);
      return false;
    }
    setPermissionDenied(false);
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setPhase('recording');
    return true;
  }, [recorder]);

  const pause = useCallback(() => {
    recorder.pause();
    setPhase('paused');
  }, [recorder]);

  const resume = useCallback(() => {
    recorder.record();
    setPhase('recording');
  }, [recorder]);

  const stop = useCallback(async (): Promise<string | null> => {
    await recorder.stop();
    setPhase('stopped');
    return recorder.uri;
  }, [recorder]);

  const reset = useCallback(() => setPhase('idle'), []);

  return {
    phase,
    isRecording: recorderState.isRecording,
    durationMillis: recorderState.durationMillis ?? 0,
    permissionDenied,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
