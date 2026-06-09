import type { Character, MapHotspot } from '../types';

export type Focus = { x: number; y: number };
export type PlaceLevel = MapHotspot['level'];

const SPIRAL_STAIR_FOCUS: Focus = { x: 50, y: 52 };
const LEVEL_DEPTH: Record<PlaceLevel, number> = {
  surface: 0,
  top: 1,
  upper: 2,
  market: 3,
  middle: 4,
  lower: 5,
  engine: 6
};

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
  const verticalOffset = focus.y > 62 ? -13 : focus.y < 28 ? 10 : -2;

  return characters.map((character, index) => {
    const offset = (index - (count - 1) / 2) * spread;
    return {
      character,
      x: clamp(focus.x + offset, 7, 93),
      y: clamp(focus.y + verticalOffset, 12, 86)
    };
  });
}

function isNear(a: Focus, b: Focus, tolerance = 2.5): boolean {
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}

function distance(a: Focus, b: Focus): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Routes cross-level travel through the central stair so scene transitions read
 * like movement inside Athel rather than a straight pan across unrelated rooms.
 */
export function pathFor(
  from: Focus,
  to: Focus,
  fromLevel?: PlaceLevel,
  toLevel?: PlaceLevel
): Focus[] {
  if (isNear(from, to)) return [from, to];

  const fromDepth = fromLevel ? LEVEL_DEPTH[fromLevel] : undefined;
  const toDepth = toLevel ? LEVEL_DEPTH[toLevel] : undefined;
  const crossesLevels =
    fromDepth !== undefined &&
    toDepth !== undefined &&
    Math.abs(fromDepth - toDepth) >= 2 &&
    !isNear(from, SPIRAL_STAIR_FOCUS) &&
    !isNear(to, SPIRAL_STAIR_FOCUS);

  return crossesLevels ? [from, SPIRAL_STAIR_FOCUS, to] : [from, to];
}

export function pathLength(path: Focus[]): number {
  return path.slice(1).reduce((sum, point, index) => sum + distance(path[index], point), 0);
}

export function travelDurationMs(path: Focus[]): number {
  const length = pathLength(path);
  return clamp(760 + length * 32, 1100, 1850);
}
