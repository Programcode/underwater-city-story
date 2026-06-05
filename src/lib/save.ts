import type { StoryState } from '../types';

const SAVE_KEY = 'athel-save-v1';

/** Loads an in-progress run, or null when none exists / it is invalid. */
export function loadSave(): StoryState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoryState>;
    if (
      !parsed ||
      typeof parsed.currentSceneId !== 'string' ||
      !parsed.traits ||
      !Array.isArray(parsed.visitedSceneIds)
    ) {
      return null;
    }
    // Only resume runs that have not already finished.
    if (parsed.endingId) return null;
    return parsed as StoryState;
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return loadSave() !== null;
}

export function writeSave(state: StoryState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode / quota); ignore.
  }
}

export function clearSave(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
