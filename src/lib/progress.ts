import type { EndingId } from '../types';

const PROGRESS_KEY = 'athel-progress-v1';

export type Progress = {
  endingsSeen: EndingId[];
  achievements: string[];
};

const EMPTY: Progress = { endingsSeen: [], achievements: [] };

export function readProgress(): Progress {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      endingsSeen: Array.isArray(parsed.endingsSeen) ? (parsed.endingsSeen as EndingId[]) : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : []
    };
  } catch {
    return { ...EMPTY };
  }
}

function writeProgress(progress: Progress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

/** Records an ending as seen and returns the updated progress. */
export function recordEnding(endingId: EndingId): Progress {
  const current = readProgress();
  const endingsSeen = current.endingsSeen.includes(endingId)
    ? current.endingsSeen
    : [...current.endingsSeen, endingId];
  const next = { ...current, endingsSeen };
  writeProgress(next);
  return next;
}

/** Merges newly unlocked achievement ids into progress and returns it. */
export function recordAchievements(ids: string[]): Progress {
  const current = readProgress();
  const merged = Array.from(new Set([...current.achievements, ...ids]));
  const next = { ...current, achievements: merged };
  writeProgress(next);
  return next;
}
