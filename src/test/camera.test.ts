import { describe, expect, it } from 'vitest';
import { pathFor, pathLength, travelDurationMs } from '../lib/camera';

describe('camera travel paths', () => {
  it('uses a direct path for same-level movement', () => {
    const path = pathFor({ x: 39, y: 43 }, { x: 60, y: 40 }, 'middle', 'middle');

    expect(path).toEqual([
      { x: 39, y: 43 },
      { x: 60, y: 40 }
    ]);
  });

  it('routes cross-level movement through the spiral staircase', () => {
    const path = pathFor({ x: 39, y: 43 }, { x: 61, y: 78 }, 'market', 'engine');

    expect(path).toEqual([
      { x: 39, y: 43 },
      { x: 50, y: 52 },
      { x: 61, y: 78 }
    ]);
  });

  it('keeps travel durations bounded for short and long paths', () => {
    expect(travelDurationMs([{ x: 50, y: 52 }, { x: 51, y: 53 }])).toBeGreaterThanOrEqual(1100);
    expect(
      travelDurationMs([
        { x: 10, y: 10 },
        { x: 50, y: 52 },
        { x: 90, y: 90 }
      ])
    ).toBeLessThanOrEqual(1850);
  });

  it('measures total waypoint distance', () => {
    expect(pathLength([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 6, y: 8 }])).toBe(10);
  });
});
