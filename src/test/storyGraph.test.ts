import { describe, expect, it } from 'vitest';
import { mapHotspots } from '../data/mapHotspots';
import {
  applyChoice,
  createInitialStoryState,
  endings,
  getScene,
  resolveEnding,
  storyScenes
} from '../data/storyGraph';

describe('resolveEnding', () => {
  it('returns hopeful when Mira has proof, trust, collective support, and low recklessness', () => {
    expect(resolveEnding({ evidence: 3, trust: 2, collective: 2, risk: 1 })).toBe('hopeful');
  });

  it('returns bittersweet when truth spreads without enough preparation', () => {
    expect(resolveEnding({ evidence: 2, trust: 0, collective: 2, risk: 4 })).toBe('bittersweet');
  });

  it('returns dark when Mira lacks enough public proof or allies', () => {
    expect(resolveEnding({ evidence: 1, trust: 0, collective: 0, risk: 3 })).toBe('dark');
  });
});

describe('story graph', () => {
  it('has all ending copy wired', () => {
    expect(Object.keys(endings).sort()).toEqual(['bittersweet', 'dark', 'hopeful']);
    expect(endings.hopeful.paragraphs.length).toBeGreaterThan(2);
    expect(endings.dark.paragraphs.length).toBeGreaterThan(2);
    expect(endings.bittersweet.paragraphs.length).toBeGreaterThan(2);
  });

  it('links every choice to an existing scene or terminal ending resolver', () => {
    const sceneIds = new Set(storyScenes.map((scene) => scene.id));

    for (const scene of storyScenes) {
      for (const choice of scene.choices) {
        expect(sceneIds.has(choice.nextSceneId) || choice.nextSceneId === 'ending').toBe(true);
      }
    }
  });

  it('can fetch scenes by id', () => {
    expect(getScene('torins-shop').title).toContain('Torin');
  });

  it('only references existing scene and hotspot ids', () => {
    const sceneIds = new Set(storyScenes.map((scene) => scene.id));
    const hotspotIds = new Set(mapHotspots.map((hotspot) => hotspot.id));

    for (const scene of storyScenes) {
      if (scene.locationHotspotId) {
        expect(hotspotIds.has(scene.locationHotspotId)).toBe(true);
      }

      for (const choice of scene.choices) {
        expect(sceneIds.has(choice.nextSceneId) || choice.nextSceneId === 'ending').toBe(true);

        if (choice.requiresDiscoveredHotspot) {
          expect(hotspotIds.has(choice.requiresDiscoveredHotspot)).toBe(true);
        }
      }
    }
  });

  it.each([
    {
      expected: 'hopeful',
      choices: [
        'rush-to-school',
        'accept-engine-errand',
        'enter-wrong-room',
        'hide-the-memory',
        'watch-for-patterns',
        'consider-torin',
        'listen-at-door',
        'run-to-torin',
        'return-for-proof',
        'broadcast-everything'
      ]
    },
    {
      expected: 'bittersweet',
      choices: [
        'rush-to-school',
        'accept-engine-errand',
        'enter-wrong-room',
        'hide-the-memory',
        'watch-for-patterns',
        'investigate-alone',
        'listen-at-door',
        'stay-and-record',
        'anonymous-papers',
        'lead-the-resistance'
      ]
    },
    {
      expected: 'dark',
      choices: [
        'rush-to-school',
        'accept-engine-errand',
        'enter-wrong-room',
        'hide-the-memory',
        'watch-for-patterns',
        'investigate-alone',
        'listen-at-door',
        'freeze-in-the-room',
        'escape-alone',
        'go-alone'
      ]
    }
  ] as const)('can reach the $expected ending through real choices', ({ choices, expected }) => {
    const finalState = choices.reduce(
      (state, choiceId) => applyChoice(state, choiceId),
      createInitialStoryState()
    );

    expect(finalState.endingId).toBe(expected);
  });
});
