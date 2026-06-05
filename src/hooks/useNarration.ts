import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clipKey, loadAudioManifest } from '../lib/audioManifest';
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
  configured: boolean;
  enabled: boolean;
  toggle: () => void;
  speak: (speaker: Speaker, text: string, handlers?: SpeakHandlers) => void;
  prefetchNext: (speaker: Speaker, text: string) => void;
  stop: () => void;
  /** Unlock audio playback from within a user gesture (Safari autoplay). */
  unlock: () => void;
};

function readStoredEnabled(configured: boolean): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return configured; // default: on when a key is present
  return stored === 'true';
}

/** Builds a tiny silent WAV blob URL used to "bless" the audio element. */
function silentWavUrl(): string {
  const sampleRate = 8000;
  const samples = Math.floor(sampleRate * 0.05);
  const bytes = 44 + samples * 2;
  const buffer = new ArrayBuffer(bytes);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, bytes - 8, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

export function useNarration(): Narration {
  const configured = isNarrationConfigured();
  const [enabled, setEnabled] = useState(() => readStoredEnabled(configured));

  const enabledRef = useRef(enabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tokenRef = useRef(0);
  const unlockedRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const ensureAudio = useCallback((): HTMLAudioElement | null => {
    if (typeof Audio === 'undefined') return null;
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  }, []);

  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    const audio = ensureAudio();
    if (!audio) return;
    unlockedRef.current = true;
    try {
      audio.muted = true;
      audio.src = silentWavUrl();
      const played = audio.play();
      if (played) {
        played
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
          })
          .catch(() => {
            audio.muted = false;
          });
      }
    } catch {
      /* ignore */
    }
  }, [ensureAudio]);

  const stop = useCallback(() => {
    tokenRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
    }
  }, []);

  const playUrl = useCallback(
    (url: string, myToken: number, handlers?: SpeakHandlers) => {
      const audio = ensureAudio();
      if (!audio) {
        handlers?.onPlay?.(Number.NaN);
        return;
      }
      audio.onended = () => {
        if (myToken === tokenRef.current) handlers?.onEnd?.();
      };
      audio.muted = false;
      audio.src = url;
      audio.currentTime = 0;
      void audio
        .play()
        .then(() => {
          if (myToken === tokenRef.current) handlers?.onPlay?.((audio.duration || 0) * 1000);
        })
        .catch(() => {
          if (myToken === tokenRef.current) handlers?.onPlay?.(Number.NaN);
        });
    },
    [ensureAudio]
  );

  const speak = useCallback(
    (speaker: Speaker, text: string, handlers?: SpeakHandlers) => {
      if (!enabledRef.current || !text) {
        handlers?.onPlay?.(Number.NaN);
        return;
      }
      const myToken = (tokenRef.current += 1);

      void (async () => {
        try {
          const manifest = await loadAudioManifest();
          const local = manifest.voices[clipKey(speaker, text)];
          let url: string | null = local ? `/audio/${local}` : null;
          if (!url && configured) {
            url = await synthesizeToUrl(speaker, text).catch(() => null);
          }
          if (!url || myToken !== tokenRef.current || !enabledRef.current) {
            handlers?.onPlay?.(Number.NaN);
            return;
          }
          playUrl(url, myToken, handlers);
        } catch {
          handlers?.onPlay?.(Number.NaN);
        }
      })();
    },
    [configured, playUrl]
  );

  const prefetchNext = useCallback(
    (speaker: Speaker, text: string) => {
      if (!enabledRef.current || !configured) return;
      // Local clips need no warming; only the live proxy benefits from prefetch.
      void loadAudioManifest().then((manifest) => {
        if (!manifest.voices[clipKey(speaker, text)]) prefetch(speaker, text);
      });
    },
    [configured]
  );

  const toggle = useCallback(() => {
    unlock();
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
  }, [unlock]);

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
    () => ({ configured, enabled, toggle, speak, prefetchNext, stop, unlock }),
    [configured, enabled, toggle, speak, prefetchNext, stop, unlock]
  );
}
