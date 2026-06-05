import { collectibles } from '../data/collectibles';
import { mapHotspots } from '../data/mapHotspots';
import type { EndingId, StoryState } from '../types';

export type Achievement = {
  id: string;
  title: string;
  description: string;
};

export type AchievementContext = {
  state: StoryState;
  /** All endings the player has ever reached (including the current run). */
  endingsSeen: EndingId[];
};

const TOTAL_PLACES = mapHotspots.length;
const TOTAL_COLLECTIBLES = collectibles.length;

type Rule = Achievement & { test: (ctx: AchievementContext) => boolean };

const RULES: Rule[] = [
  {
    id: 'first-ending',
    title: 'A Story Told',
    description: 'Reach any ending for the first time.',
    test: ({ endingsSeen }) => endingsSeen.length >= 1
  },
  {
    id: 'ending-hopeful',
    title: 'Into Open Sky',
    description: 'Reach the Hopeful ending.',
    test: ({ endingsSeen }) => endingsSeen.includes('hopeful')
  },
  {
    id: 'ending-bittersweet',
    title: 'Cracks in the Glass',
    description: 'Reach the Bittersweet ending.',
    test: ({ endingsSeen }) => endingsSeen.includes('bittersweet')
  },
  {
    id: 'ending-dark',
    title: 'Alone in the Deep',
    description: 'Reach the Dark ending.',
    test: ({ endingsSeen }) => endingsSeen.includes('dark')
  },
  {
    id: 'all-endings',
    title: 'Every Current',
    description: 'Witness all three endings.',
    test: ({ endingsSeen }) =>
      (['hopeful', 'bittersweet', 'dark'] as EndingId[]).every((id) => endingsSeen.includes(id))
  },
  {
    id: 'cartographer',
    title: 'Cartographer',
    description: 'Chart every place in Athel within a single run.',
    test: ({ state }) => state.discoveredHotspotIds.length >= TOTAL_PLACES
  },
  {
    id: 'collector',
    title: 'Keeper of Evidence',
    description: `Collect ${Math.ceil(TOTAL_COLLECTIBLES * 0.66)} or more atlas entries in one run.`,
    test: ({ state }) => state.collectedItemIds.length >= Math.ceil(TOTAL_COLLECTIBLES * 0.66)
  },
  {
    id: 'truthbearer',
    title: 'Undeniable Proof',
    description: 'Finish a run having gathered strong evidence (evidence ≥ 3).',
    test: ({ state }) => Boolean(state.endingId) && state.traits.evidence >= 3
  }
];

export const achievements: Achievement[] = RULES.map(({ id, title, description }) => ({
  id,
  title,
  description
}));

export const achievementsById: Record<string, Achievement> = Object.fromEntries(
  achievements.map((achievement) => [achievement.id, achievement])
);

/** Returns the ids of achievements satisfied by the given context. */
export function evaluateAchievements(ctx: AchievementContext): string[] {
  return RULES.filter((rule) => rule.test(ctx)).map((rule) => rule.id);
}
