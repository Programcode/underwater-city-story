import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isNarrationConfigured, prefetch, synthesizeToUrl } from '../lib/elevenlabs';
import type { Speaker } from '../types';

const STORAGE_KEY = 'athel-voice-enabled';

export type SpeakHandlers = {
  /** Fired when audio begins; durationMs is NaN/0 if unknown. */
  onPlay?: (durationMs: number) => void;
  /** Fired when audio finishes. */
  onEnd?: () => void;
};

export type Narration = {
  /** Whether ElevenLabs is configured with an API key. */
  configured: boolean;
  /** Whether voice playback is currently on. */
  enabled: boolean;
  /** Toggle voice playback on/off (persisted). */
  toggle: () => void;
  /** Speak a line (no-op when disabled/unconfigured). */
  speak: (speaker: Speaker, text: string, handlers?: SpeakHandlers) => void;
  /** Optionally warm up the next line. */
  prefetchNext: (speaker: Speaker, text: string) => void;
  /** Stop any current playback. */
  stop: () => void;
};

function readStoredEnabled(configured: boolean): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return configured; // default: on when a key is present
  return stored === 'true';
}

export function useNarration(): Narration {
  const configured = isNarrationConfigured();
  const [enabled, setEnabled] = useState(() => readStoredEnabled(configured));

  const enabledRef = useRef(enabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tokenRef = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
    }
  }, []);

  const speak = useCallback(
    (speaker: Speaker, text: string, handlers?: SpeakHandlers) => {
      if (!configured || !enabledRef.current || !text) {
        handlers?.onPlay?.(Number.NaN);
        return;
      }
      const myToken = (tokenRef.current += 1);

      synthesizeToUrl(speaker, text)
        .then((url) => {
          if (myToken !== tokenRef.current || !enabledRef.current) return;
          let audio = audioRef.current;
          if (!audio) {
            audio = new Audio();
            audioRef.current = audio;
          }
          audio.onended = () => {
            if (myToken === tokenRef.current) handlers?.onEnd?.();
          };
          audio.src = url;
          audio.currentTime = 0;
          void audio
            .play()
            .then(() => {
              if (myToken === tokenRef.current) {
                handlers?.onPlay?.((audio?.duration ?? 0) * 1000);
              }
            })
            .catch(() => {
              if (myToken === tokenRef.current) handlers?.onPlay?.(Number.NaN);
            });
        })
        .catch((error) => {
          console.warn('Narration unavailable:', error);
          handlers?.onPlay?.(Number.NaN);
        });
    },
    [configured]
  );

  const prefetchNext = useCallback(
    (speaker: Speaker, text: string) => {
      if (!configured || !enabledRef.current) return;
      prefetch(speaker, text);
    },
    [configured]
  );

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
      if (!next) {
        tokenRef.current += 1;
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audio.removeAttribute('src');
        }
      }
      return next;
    });
  }, []);

  // Clean up the audio element on unmount.
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
      }
    };
  }, []);

  return useMemo(
    () => ({ configured, enabled, toggle, speak, prefetchNext, stop }),
    [configured, enabled, toggle, speak, prefetchNext, stop]
  );
}
