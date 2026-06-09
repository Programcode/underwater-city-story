import { getHotspot } from '../data/mapHotspots';
import type { Focus, PlaceLevel } from './camera';
import type { StoryScene } from '../types';

export const DEFAULT_SCENE_FOCUS: Focus = { x: 49, y: 48 };
export const DEFAULT_PLACE_LEVEL: PlaceLevel = 'middle';

export function getSceneFocus(scene: Pick<StoryScene, 'locationHotspotId'>): Focus {
  if (!scene.locationHotspotId) return DEFAULT_SCENE_FOCUS;
  const hotspot = getHotspot(scene.locationHotspotId);
  return { x: hotspot.xPercent, y: hotspot.yPercent };
}

export function getScenePlaceLevel(scene: Pick<StoryScene, 'locationHotspotId'>): PlaceLevel {
  if (!scene.locationHotspotId) return DEFAULT_PLACE_LEVEL;
  return getHotspot(scene.locationHotspotId).level;
}
