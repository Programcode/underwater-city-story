import { describe, expect, it } from 'vitest';
import { EVENT_SFX_PROMPTS } from '../data/audioPrompts';
import { getCharactersForScene } from '../data/characters';
import { choreography } from '../data/choreography';
import { mapHotspots } from '../data/mapHotspots';
import { storyScenes } from '../data/storyGraph';

describe('scene choreography', () => {
  it('covers every story scene and only references real scenes', () => {
    const sceneIds = new Set(storyScenes.map((scene) => scene.id));

    expect(Object.keys(choreography).sort()).toEqual([...sceneIds].sort());
  });

  it('only stages characters that are present in each scene', () => {
    for (const scene of storyScenes) {
      const present = new Set(getCharactersForScene(scene.id).map((character) => character.id));
      const sceneChoreography = choreography[scene.id];

      for (const beat of sceneChoreography.beats) {
        expect(present.has(beat.characterId), `${scene.id} stages ${beat.characterId}`).toBe(true);
      }
    }
  });

  it('keeps optional beat coordinates inside the map', () => {
    for (const [sceneId, sceneChoreography] of Object.entries(choreography)) {
      for (const beat of sceneChoreography.beats) {
        if (beat.xPercent !== undefined) {
          expect(beat.xPercent, `${sceneId}:${beat.characterId} x`).toBeGreaterThanOrEqual(0);
          expect(beat.xPercent, `${sceneId}:${beat.characterId} x`).toBeLessThanOrEqual(100);
        }
        if (beat.yPercent !== undefined) {
          expect(beat.yPercent, `${sceneId}:${beat.characterId} y`).toBeGreaterThanOrEqual(0);
          expect(beat.yPercent, `${sceneId}:${beat.characterId} y`).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('only references known SFX events and travel hotspots', () => {
    const eventIds = new Set(Object.keys(EVENT_SFX_PROMPTS));
    const hotspotIds = new Set(mapHotspots.map((hotspot) => hotspot.id));

    for (const [sceneId, sceneChoreography] of Object.entries(choreography)) {
      if (sceneChoreography.travelFrom) {
        expect(hotspotIds.has(sceneChoreography.travelFrom), `${sceneId} travelFrom`).toBe(true);
      }

      for (const cue of sceneChoreography.sfx ?? []) {
        expect(eventIds.has(cue.event), `${sceneId} cue ${cue.event}`).toBe(true);
      }

      for (const beat of sceneChoreography.beats) {
        if (beat.sfx) {
          expect(eventIds.has(beat.sfx), `${sceneId} beat ${beat.sfx}`).toBe(true);
        }
      }
    }
  });
});
