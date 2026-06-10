import { describe, expect, it } from 'vitest';
import { collectibles } from '../data/collectibles';
import { mapHotspots } from '../data/mapHotspots';
import { getSceneDialogue } from '../data/dialogue';
import {
  applyChoice,
  createInitialStoryState,
  endingRouteFlow,
  endings,
  getProjectedEnding,
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

  it('has expanded side choices before the climax', () => {
    const totalChoices = storyScenes.reduce((sum, scene) => sum + scene.choices.length, 0);
    const scenesWithMultipleChoices = storyScenes.filter((scene) => scene.choices.length > 1);

    expect(totalChoices).toBeGreaterThanOrEqual(32);
    expect(scenesWithMultipleChoices.length).toBeGreaterThanOrEqual(9);
  });

  it('can fetch scenes by id', () => {
    expect(getScene('torins-shop').title).toContain('Torin');
  });

  it('varies converged scene dialogue based on earlier choices', () => {
    const state = applyChoice(createInitialStoryState(), 'ask-about-veyr');
    const dialogue = getSceneDialogue(getScene('school-morning'), state);

    expect(dialogue.map((line) => line.text)).toContain(
      "Torin said nobody knew Veyr's name yesterday. So why does this portrait look finished?"
    );
  });

  it('keeps a new run undecided instead of falling back to dark', () => {
    expect(getProjectedEnding(createInitialStoryState())).toBe('undecided');
  });

  it('projects the current ending from in-progress traits', () => {
    const state = {
      ...createInitialStoryState(),
      traits: { evidence: 2, trust: 0, risk: 4, collective: 2 }
    };

    expect(getProjectedEnding(state)).toBe('bittersweet');
  });

  it('only references existing scene and hotspot ids', () => {
    const sceneIds = new Set(storyScenes.map((scene) => scene.id));
    const hotspotIds = new Set(mapHotspots.map((hotspot) => hotspot.id));
    const collectibleIds = new Set(collectibles.map((item) => item.id));

    for (const scene of storyScenes) {
      if (scene.locationHotspotId) {
        expect(hotspotIds.has(scene.locationHotspotId)).toBe(true);
      }

      scene.collectibleIds?.forEach((collectibleId) =>
        expect(collectibleIds.has(collectibleId)).toBe(true)
      );

      for (const choice of scene.choices) {
        expect(sceneIds.has(choice.nextSceneId) || choice.nextSceneId === 'ending').toBe(true);

        if (choice.requiresDiscoveredHotspot) {
          expect(hotspotIds.has(choice.requiresDiscoveredHotspot)).toBe(true);
        }

        choice.collectibleIds?.forEach((collectibleId) =>
          expect(collectibleIds.has(collectibleId)).toBe(true)
        );
      }
    }

    for (const hotspot of mapHotspots) {
      hotspot.collectibleIds?.forEach((collectibleId) =>
        expect(collectibleIds.has(collectibleId)).toBe(true)
      );
    }
  });

  it('collects artifacts and info from optional choices and scenes without duplicates', () => {
    const state = createInitialStoryState();
    const afterNotice = applyChoice(state, 'ask-for-notice');

    expect(afterNotice.currentSceneId).toBe('school-morning');
    expect(afterNotice.collectedItemIds).toContain('tuna-sandwich');
    expect(afterNotice.collectedItemIds).toContain('veyr-succession-notice');

    const afterPortrait = applyChoice(afterNotice, 'study-veyr-portrait');
    expect(afterPortrait.currentSceneId).toBe('portrait-observation');
    expect(afterPortrait.collectedItemIds).toContain('glossy-portrait-detail');

    const afterDuplicate = applyChoice(
      {
        ...state,
        currentSceneId: 'torins-shop',
        collectedItemIds: ['tuna-sandwich', 'veyr-succession-notice']
      },
      'ask-for-notice'
    );
    expect(afterDuplicate.collectedItemIds.filter((id) => id === 'veyr-succession-notice')).toHaveLength(1);
  });

  it.each(endingRouteFlow.map(({ endingId, choiceIds }) => ({ expected: endingId, choices: choiceIds })))(
    'can reach the $expected ending through real choices',
    ({ choices, expected }) => {
      const finalState = choices.reduce(
        (state, choiceId) => applyChoice(state, choiceId),
        createInitialStoryState()
      );

      expect(finalState.endingId).toBe(expected);
    }
  );
});
