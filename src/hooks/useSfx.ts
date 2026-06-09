import { useCallback, useMemo, useRef } from 'react';
import { EVENT_SFX_PROMPTS, MOOD_SFX_PROMPTS, type SfxEvent } from '../data/audioPrompts';
import { loadAudioManifest } from '../lib/audioManifest';
import { isNarrationConfigured, synthesizeSfxToUrl } from '../lib/elevenlabs';
import type { SceneMood } from '../types';

export type Sfx = {
  configured: boolean;
  /** Play a short stinger for a mood (no-op on repeats / when unconfigured). */
  playMood: (mood: SceneMood) => void;
  /** Play a named event SFX when an interaction or story beat needs it. */
  play: (event: SfxEvent, opts?: { loop?: boolean; volume?: number }) => void;
  /** Stop a named looping event SFX. */
  stop: (event: SfxEvent) => void;
};

/**
 * Plays a short ElevenLabs sound-effect "sting" when the scene mood changes,
 * layered under the procedural ambience. Cached per mood and gated by the key.
 */
export function useSfx(): Sfx {
  const configured = isNarrationConfigured();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const eventRefs = useRef<Partial<Record<SfxEvent, HTMLAudioElement>>>({});
  const eventTokensRef = useRef<Partial<Record<SfxEvent, number>>>({});
  const lastMoodRef = useRef<SceneMood | null>(null);
  const tokenRef = useRef(0);

  const playMusic = useCallback((mood: SceneMood, url: string | null) => {
    if (!url) return;
    let audio = musicRef.current;
    if (!audio) {
      audio = new Audio();
      audio.loop = true;
      audio.volume = 0.14;
      musicRef.current = audio;
    }
    if (audio.src.endsWith(url)) return;
    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    audio.dataset.mood = mood;
    void audio.play().catch(() => undefined);
  }, []);

  const playMood = useCallback(
    (mood: SceneMood) => {
      if (lastMoodRef.current === mood) return;
      lastMoodRef.current = mood;
      const myToken = (tokenRef.current += 1);

      void (async () => {
        try {
          const manifest = await loadAudioManifest();
          const local = manifest.sfx[mood];
          playMusic(mood, manifest.music[mood] ? `/audio/${manifest.music[mood]}` : null);
          let url: string | null = local ? `/audio/${local}` : null;
          if (!url && configured) {
            url = await synthesizeSfxToUrl(MOOD_SFX_PROMPTS[mood] ?? MOOD_SFX_PROMPTS.calm, 7).catch(
              () => null
            );
          }
          if (!url || myToken !== tokenRef.current) return;
          let audio = audioRef.current;
          if (!audio) {
            audio = new Audio();
            audioRef.current = audio;
          }
          audio.volume = 0.3;
          audio.src = url;
          audio.currentTime = 0;
          void audio.play().catch(() => undefined);
        } catch {
          /* ignore */
        }
      })();
    },
    [configured, playMusic]
  );

  const play = useCallback(
    (event: SfxEvent, opts: { loop?: boolean; volume?: number } = {}) => {
      const myToken = (eventTokensRef.current[event] ?? 0) + 1;
      eventTokensRef.current[event] = myToken;
      void (async () => {
        try {
          const manifest = await loadAudioManifest();
          const local = manifest.events[event];
          let url: string | null = local ? `/audio/${local}` : null;
          if (!url && configured) {
            url = await synthesizeSfxToUrl(EVENT_SFX_PROMPTS[event], 3).catch(() => null);
          }
          if (!url) return;
          if (myToken !== eventTokensRef.current[event]) return;
          let audio = eventRefs.current[event];
          if (!audio) {
            audio = new Audio();
            eventRefs.current[event] = audio;
          }
          if (opts.loop && !audio.paused && audio.loop && audio.src.endsWith(url)) return;
          audio.loop = Boolean(opts.loop);
          audio.volume = opts.volume ?? (opts.loop ? 0.24 : 0.45);
          audio.src = url;
          audio.currentTime = 0;
          void audio.play().catch(() => undefined);
        } catch {
          /* ignore */
        }
      })();
    },
    [configured]
  );

  const stop = useCallback((event: SfxEvent) => {
    eventTokensRef.current[event] = (eventTokensRef.current[event] ?? 0) + 1;
    const audio = eventRefs.current[event];
    if (!audio) return;
    audio.pause();
    audio.loop = false;
    audio.currentTime = 0;
  }, []);

  return useMemo(() => ({ configured, playMood, play, stop }), [configured, playMood, play, stop]);
}
