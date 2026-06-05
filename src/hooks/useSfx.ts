import { useCallback, useMemo, useRef } from 'react';
import { isNarrationConfigured, synthesizeSfxToUrl } from '../lib/elevenlabs';
import type { SceneMood } from '../types';

const MOOD_PROMPTS: Record<SceneMood, string> = {
  calm: 'gentle underwater room tone, distant muffled market murmur, soft bubbling water, calm',
  tense: 'low ominous underwater drone, faint sonar ping, quiet unease, suspense',
  descent: 'descending into deep machinery, metallic groans, distant engine rumble, dripping water',
  secret: 'quiet tense room tone, faint electrical hum, paper rustle, held breath, suspense',
  danger: 'rising alarming low pulse, distant muffled alarm underwater, dread',
  hope: 'warm hopeful swelling tone, soft shimmer, light breaking through water, relief'
};

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
      if (!configured) return;
      if (lastMoodRef.current === mood) return;
      lastMoodRef.current = mood;
      const myToken = (tokenRef.current += 1);
      synthesizeSfxToUrl(MOOD_PROMPTS[mood] ?? MOOD_PROMPTS.calm, 7)
        .then((url) => {
          if (myToken !== tokenRef.current) return;
          let audio = audioRef.current;
          if (!audio) {
            audio = new Audio();
            audioRef.current = audio;
          }
          audio.volume = 0.32;
          audio.src = url;
          audio.currentTime = 0;
          void audio.play().catch(() => undefined);
        })
        .catch(() => undefined);
    },
    [configured]
  );

  return useMemo(() => ({ configured, playMood }), [configured, playMood]);
}
