import { useCallback, useMemo, useRef } from 'react';
import { MOOD_SFX_PROMPTS } from '../data/audioPrompts';
import { loadAudioManifest } from '../lib/audioManifest';
import { isNarrationConfigured, synthesizeSfxToUrl } from '../lib/elevenlabs';
import type { SceneMood } from '../types';

export type Sfx = {
  configured: boolean;
  /** Play a short stinger for a mood (no-op on repeats / when unconfigured). */
  playMood: (mood: SceneMood) => void;
};

/**
 * Plays a short ElevenLabs sound-effect "sting" when the scene mood changes,
 * layered under the procedural ambience. Cached per mood and gated by the key.
 */
export function useSfx(): Sfx {
  const configured = isNarrationConfigured();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastMoodRef = useRef<SceneMood | null>(null);
  const tokenRef = useRef(0);

  const playMood = useCallback(
    (mood: SceneMood) => {
      if (lastMoodRef.current === mood) return;
      lastMoodRef.current = mood;
      const myToken = (tokenRef.current += 1);

      void (async () => {
        try {
          const manifest = await loadAudioManifest();
          const local = manifest.sfx[mood];
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
    [configured]
  );

  return useMemo(() => ({ configured, playMood }), [configured, playMood]);
}
