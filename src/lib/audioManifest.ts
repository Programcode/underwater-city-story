import type { SfxEvent } from '../data/audioPrompts';
import type { SceneMood, Speaker } from '../types';

export type AudioManifest = {
  /** Map of `${speaker}|${text}` → file path under /audio. */
  voices: Record<string, string>;
  /** Map of mood → file path under /audio. */
  sfx: Partial<Record<SceneMood, string>>;
  /** Map of mood → loopable music bed path under /audio. */
  music: Partial<Record<SceneMood, string>>;
  /** Map of event name → file path under /audio. */
  events: Partial<Record<SfxEvent, string>>;
};

const EMPTY: AudioManifest = { voices: {}, sfx: {}, music: {}, events: {} };

/** Stable key for a spoken line, shared by the client and the generation script. */
export function clipKey(speaker: Speaker, text: string): string {
  return `${speaker}|${text}`;
}

let manifestPromise: Promise<AudioManifest> | null = null;

function toPartialManifest(data: unknown): Partial<AudioManifest> {
  return data && typeof data === 'object' ? (data as Partial<AudioManifest>) : {};
}

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
    .then((data) => {
      const manifest = toPartialManifest(data);
      return {
        voices: manifest.voices ?? {},
        sfx: manifest.sfx ?? {},
        music: manifest.music ?? {},
        events: manifest.events ?? {}
      };
    })
    .catch(() => EMPTY);
  return manifestPromise;
}
