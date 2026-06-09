import { pathFor, travelDurationMs, type Focus } from './camera';
import { getSceneFocus, getScenePlaceLevel } from './stageFocus';
import type { StoryScene } from '../types';

export type TravelPlan = {
  fromScene: StoryScene;
  toScene: StoryScene;
  path: Focus[];
  durationMs: number;
  fromZoom: number;
  toZoom: number;
};

export function createTravelPlan(fromScene: StoryScene, toScene: StoryScene): TravelPlan {
  const fromFocus = getSceneFocus(fromScene);
  const toFocus = getSceneFocus(toScene);
  const path = pathFor(fromFocus, toFocus, getScenePlaceLevel(fromScene), getScenePlaceLevel(toScene));
  return {
    fromScene,
    toScene,
    path,
    durationMs: travelDurationMs(path),
    fromZoom: fromScene.cameraZoom ?? 1.95,
    toZoom: toScene.cameraZoom ?? 1.95
  };
}
