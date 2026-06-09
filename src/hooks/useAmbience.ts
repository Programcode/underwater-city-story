import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AmbienceEngine } from '../lib/ambience';
import type { MapHotspot, SceneMood } from '../types';

const STORAGE_KEY = 'athel-ambience-enabled';
type PlaceLevel = MapHotspot['level'];

export type Ambience = {
  enabled: boolean;
  toggle: () => void;
  /** Resume the audio context from a user gesture, then fade in if enabled. */
  begin: () => void;
  /** Re-tune the soundscape to a scene mood. */
  setMood: (mood: SceneMood) => void;
  /** Re-tune the extra room-tone layer to the current map level. */
  setPlace: (place: PlaceLevel) => void;
};

function readStored(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

export function useAmbience(): Ambience {
  const [enabled, setEnabled] = useState(readStored);
  const engineRef = useRef<AmbienceEngine | null>(null);
  const moodRef = useRef<SceneMood>('calm');
  const placeRef = useRef<PlaceLevel>('middle');

  // Lazily create the engine outside of render (on first user-gesture use).
  const getEngine = useCallback((): AmbienceEngine | null => {
    if (typeof window === 'undefined') return null;
    if (!engineRef.current) {
      engineRef.current = new AmbienceEngine();
    }
    return engineRef.current;
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const begin = useCallback(() => {
    const engine = getEngine();
    if (!engine) return;
    engine.resume();
    engine.setMood(moodRef.current);
    engine.setPlace(placeRef.current);
    if (enabled) engine.fadeIn();
  }, [enabled, getEngine]);

  const setMood = useCallback(
    (mood: SceneMood) => {
      moodRef.current = mood;
      engineRef.current?.setMood(mood);
    },
    []
  );

  const setPlace = useCallback((place: PlaceLevel) => {
    placeRef.current = place;
    engineRef.current?.setPlace(place);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
      const engine = getEngine();
      if (engine) {
        if (next) {
          engine.resume();
          engine.setMood(moodRef.current);
          engine.setPlace(placeRef.current);
          engine.fadeIn();
        } else {
          engine.fadeOut();
        }
      }
      return next;
    });
  }, [getEngine]);

  return useMemo(
    () => ({ enabled, toggle, begin, setMood, setPlace }),
    [enabled, toggle, begin, setMood, setPlace]
  );
}
