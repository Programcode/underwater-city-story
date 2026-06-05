import type { SceneMood, Speaker } from '../types';

export type AudioManifest = {
  /** Map of `${speaker}|${text}` → file path under /audio. */
  voices: Record<string, string>;
  /** Map of mood → file path under /audio. */
  sfx: Partial<Record<SceneMood, string>>;
};

const EMPTY: AudioManifest = { voices: {}, sfx: {} };

/** Stable key for a spoken line, shared by the client and the generation script. */
export function clipKey(speaker: Speaker, text: string): string {
  return `${speaker}|${text}`;
}

let manifestPromise: Promise<AudioManifest> | null = null;

/**
 * Loads the pre-generated audio manifest (written by `npm run audio`) once.
 * Returns an empty manifest when it is absent, so the app falls back to the
 * live proxy or stays silent.
 */
export function loadAudioManifest(): Promise<AudioManifest> {
  if (manifestPromise) return manifestPromise;
  if (typeof fetch === 'undefined') return Promise.resolve(EMPTY);
  manifestPromise = fetch('/audio/manifest.json', { cache: 'no-cache' })
    .then((res) => (res.ok ? res.json() : EMPTY))
    .then((data: Partial<AudioManifest>) => ({
      voices: data.voices ?? {},
      sfx: data.sfx ?? {}
    }))
    .catch(() => EMPTY);
  return manifestPromise;
}
