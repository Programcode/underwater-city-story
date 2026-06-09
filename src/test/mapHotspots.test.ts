import { describe, expect, it } from 'vitest';
import { mapHotspots } from '../data/mapHotspots';
import { storyScenes } from '../data/storyGraph';

describe('mapHotspots', () => {
  it('uses unique ids', () => {
    const ids = mapHotspots.map((hotspot) => hotspot.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every hotspot inside the map bounds', () => {
    for (const hotspot of mapHotspots) {
      expect(hotspot.xPercent).toBeGreaterThanOrEqual(0);
      expect(hotspot.xPercent).toBeLessThanOrEqual(100);
      expect(hotspot.yPercent).toBeGreaterThanOrEqual(0);
      expect(hotspot.yPercent).toBeLessThanOrEqual(100);
    }
  });

  it('has lore and story links for every hotspot', () => {
    const sceneIds = new Set(storyScenes.map((scene) => scene.id));

    for (const hotspot of mapHotspots) {
      expect(hotspot.lore.length).toBeGreaterThan(0);
      expect(hotspot.storySceneIds.length).toBeGreaterThan(0);
      hotspot.storySceneIds.forEach((sceneId) => expect(sceneIds.has(sceneId)).toBe(true));
    }
  });

  it('lists every scene on the hotspot it actually uses', () => {
    const hotspotsById = new Map(mapHotspots.map((hotspot) => [hotspot.id, hotspot]));

    for (const scene of storyScenes) {
      if (!scene.locationHotspotId) continue;
      const hotspot = hotspotsById.get(scene.locationHotspotId);
      expect(hotspot?.storySceneIds, scene.id).toContain(scene.id);
    }
  });
});
