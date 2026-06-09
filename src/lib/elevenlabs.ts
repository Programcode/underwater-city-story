import type { Speaker } from '../types';
import { DEFAULT_VOICES } from '../data/audioPrompts';

/**
 * Thin ElevenLabs text-to-speech client used to voice the narrator and cast.
 *
 * Configuration comes from Vite env vars (see `.env.example`):
 *   VITE_ELEVENLABS_MODEL          – optional model id
 *   VITE_ELEVENLABS_VOICE_<ROLE>   – optional per-speaker voice id override
 *
 * The API key stays server-side in `ELEVENLABS_API_KEY`; the client only sees
 * the `__ELEVEN_VOICES__` capability flag injected by Vite.
 */

const env = import.meta.env as Record<string, string | undefined>;

const API_BASE = '/api/eleven/v1/text-to-speech';
const MODEL_ID = env.VITE_ELEVENLABS_MODEL ?? 'eleven_v3';
const OUTPUT_FORMAT = env.VITE_ELEVENLABS_OUTPUT ?? 'mp3_44100_128';

/** True when an ElevenLabs key is configured (flag injected by vite.config). */
function configured(): boolean {
  return typeof __ELEVEN_VOICES__ !== 'undefined' && __ELEVEN_VOICES__ === true;
}

export const voiceForSpeaker: Record<Speaker, string> = {
  narrator: env.VITE_ELEVENLABS_VOICE_NARRATOR || DEFAULT_VOICES.narrator,
  mira: env.VITE_ELEVENLABS_VOICE_MIRA || DEFAULT_VOICES.mira,
  ocean: env.VITE_ELEVENLABS_VOICE_OCEAN || DEFAULT_VOICES.ocean,
  torin: env.VITE_ELEVENLABS_VOICE_TORIN || DEFAULT_VOICES.torin,
  veyr: env.VITE_ELEVENLABS_VOICE_VEYR || DEFAULT_VOICES.veyr
};

export function isNarrationConfigured(): boolean {
  return configured();
}

// Cache synthesized audio so repeated lines (and replays) cost nothing.
const urlCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

function cacheKey(voiceId: string, text: string): string {
  return `${voiceId}::${text}`;
}

/**
 * Synthesizes a line and returns an object URL for the audio. Results are cached
 * by voice + text. Throws when the API is unconfigured or the request fails.
 */
export async function synthesizeToUrl(speaker: Speaker, text: string): Promise<string> {
  if (!configured()) {
    throw new Error('ElevenLabs API key is not configured.');
  }

  const voiceId = voiceForSpeaker[speaker];
  const key = cacheKey(voiceId, text);

  const cached = urlCache.get(key);
  if (cached) {
    return cached;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const request = (async () => {
    const response = await fetch(
      `${API_BASE}/${voiceId}?output_format=${encodeURIComponent(OUTPUT_FORMAT)}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          // v3 needs a discrete stability (0.5 = Natural: expressive + reliable).
          voice_settings: MODEL_ID.includes('v3')
            ? { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true }
            : { stability: 0.4, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs request failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    urlCache.set(key, url);
    return url;
  })();

  inFlight.set(key, request);
  try {
    return await request;
  } finally {
    inFlight.delete(key);
  }
}

/** Best-effort prefetch so the next line is ready to play instantly. */
export function prefetch(speaker: Speaker, text: string): void {
  if (!configured() || !text) return;
  void synthesizeToUrl(speaker, text).catch(() => undefined);
}

// ── Sound effects (ElevenLabs Sound Generation) ─────────────────────────────
const SFX_API = '/api/eleven/v1/sound-generation';
const sfxCache = new Map<string, string>();
const sfxInFlight = new Map<string, Promise<string>>();

/**
 * Generates a short sound-effect clip from a text prompt (cached by prompt +
 * duration). Used for subtle per-mood ambience stingers.
 */
export async function synthesizeSfxToUrl(prompt: string, durationSeconds = 6): Promise<string> {
  if (!configured()) {
    throw new Error('ElevenLabs API key is not configured.');
  }
  const key = `${durationSeconds}::${prompt}`;
  const cached = sfxCache.get(key);
  if (cached) return cached;
  const pending = sfxInFlight.get(key);
  if (pending) return pending;

  const request = (async () => {
    const response = await fetch(SFX_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'audio/mpeg'
      },
      body: JSON.stringify({ text: prompt, duration_seconds: durationSeconds, prompt_influence: 0.4 })
    });
    if (!response.ok) {
      throw new Error(`ElevenLabs sound-generation failed: ${response.status}`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    sfxCache.set(key, url);
    return url;
  })();

  sfxInFlight.set(key, request);
  try {
    return await request;
  } finally {
    sfxInFlight.delete(key);
  }
}
