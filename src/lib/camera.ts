import type { Character } from '../types';

export type Focus = { x: number; y: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Builds a CSS transform that frames the map on a focal point at a given zoom,
 * panning the focal point toward centre while clamping the pan so the map edges
 * never reveal empty space.
 *
 * Derived for `transform-origin: 50% 50%`:
 *   transform = scale(z) translate((50 - fx)%, (50 - fy)%)
 * with the translation clamped to ±((z - 1) / (2z)) * 100 percent.
 */
export function computeCameraTransform(focus: Focus, zoom: number): string {
  const z = Math.max(1, zoom);
  const maxPan = ((z - 1) / (2 * z)) * 100;
  const tx = clamp(50 - focus.x, -maxPan, maxPan);
  const ty = clamp(50 - focus.y, -maxPan, maxPan);
  return `scale(${z}) translate(${tx}%, ${ty}%)`;
}

export type StagedActor = {
  character: Character;
  x: number;
  y: number;
};

/**
 * Arranges a scene's characters like actors on a stage: clustered around the
 * focal point, spread horizontally, standing just below the point of interest.
 */
export function arrangeActors(characters: Character[], focus: Focus): StagedActor[] {
  const count = characters.length;
  const spread = count > 2 ? 11 : 9;

  return characters.map((character, index) => {
    const offset = (index - (count - 1) / 2) * spread;
    return {
      character,
      x: clamp(focus.x + offset, 7, 93),
      y: clamp(focus.y + 9, 12, 90)
    };
  });
}
