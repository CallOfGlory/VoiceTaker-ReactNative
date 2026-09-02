import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export interface PlayerTrack {
  id: string;
  title: string;
  subtitle?: string;
  uri: string;
  kind: 'note' | 'episode' | 'song';
}

interface PlayerContextValue {
  track: PlayerTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  error: string | null;
  playTrack: (track: PlayerTrack) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  setRate: (rate: number) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(null, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  // player.replace() does not wait for the new source to finish loading, so calling
  // play()/seekTo() right after it is a race: the UI flips to "playing" but the native
  // player has nothing loaded yet and produces no sound. Queue those calls instead and
  // flush them once useAudioPlayerStatus reports isLoaded === true.
  const pendingPlayRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!status.isLoaded) return;
    if (pendingSeekRef.current !== null) {
      player.seekTo(pendingSeekRef.current);
      pendingSeekRef.current = null;
    }
    if (pendingPlayRef.current) {
      pendingPlayRef.current = false;
      player.setPlaybackRate(playbackRate);
      player.play();
    }
    // `status` is a fresh object on every poll tick, so this effect re-checks the pending
    // flags roughly every 200ms regardless of exactly which field changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, player, playbackRate]);

  const playTrack = useCallback(
    (newTrack: PlayerTrack) => {
      if (track?.uri !== newTrack.uri) {
        pendingPlayRef.current = true;
        setTrack(newTrack);
        player.replace({ uri: newTrack.uri });
      } else {
        player.play();
      }
    },
    [player, track]
  );

  const togglePlayPause = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, status.playing]);

  const seekTo = useCallback(
    (seconds: number) => {
      if (status.isLoaded) {
        player.seekTo(seconds);
      } else {
        pendingSeekRef.current = seconds;
      }
    },
    [player, status.isLoaded]
  );

  const setRate = useCallback(
    (rate: number) => {
      setPlaybackRate(rate);
      player.setPlaybackRate(rate);
    },
    [player]
  );

  const closePlayer = useCallback(() => {
    player.pause();
    setTrack(null);
    pendingPlayRef.current = false;
    pendingSeekRef.current = null;
  }, [player]);

  useEffect(() => {
    if (status.didJustFinish) {
      player.pause();
      player.seekTo(0);
    }
  }, [status.didJustFinish, player]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      track,
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      currentTime: status.currentTime ?? 0,
      duration: status.duration ?? 0,
      playbackRate,
      error: status.error ?? null,
      playTrack,
      togglePlayPause,
      seekTo,
      setRate,
      closePlayer,
    }),
    [
      track,
      status.playing,
      status.isBuffering,
      status.currentTime,
      status.duration,
      playbackRate,
      status.error,
      playTrack,
      togglePlayPause,
      seekTo,
      setRate,
      closePlayer,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
