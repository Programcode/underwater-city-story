# Plan 1 — Per-scene illustration overlays on the map

**Date:** 2026-06-07
**Goal:** Let a developing agent that can also generate images place a hand-drawn
illustration *on top of the map* for each scene, showing what is happening in
that beat (e.g. "Mira reads the radiation report in the engine room"). The
illustration is anchored to the scene's place on the map, fades in with the
camera move, and degrades gracefully to today's actor-only view when art is
missing.

This plan is written so an image-capable agent can execute it end-to-end:
data model, file conventions, rendering component, the **art style guide and
per-scene prompt spec**, fallbacks, and tests.

---

## 1. Current state (what we build on)

- The cinematic view is `src/components/CinematicStage.tsx`, which renders
  `MapCamera` (`src/components/MapCamera.tsx`).
- `MapCamera` shows `/assets/map.jpg` (5632×3072) inside a `.map-camera__drift`
  wrapper, then positions `Actor` portraits at percentage coordinates and
  applies mood/vignette/caustics/grain overlay layers.
- Each scene (`StoryScene` in `src/types.ts`) optionally has a
  `locationHotspotId`; `CinematicStage` resolves it to a `Focus = {x,y}`
  percentage via `getHotspot(...)` and the camera zooms/pans there.
- Scene mood (`SceneMood`) already drives tints. Scenes are keyed by `scene.id`,
  and `CinematicStage` is remounted per scene (so per-scene art state is clean).

**Implication:** an illustration is just another layer inside
`.map-camera__drift`, positioned at the same focal percentage as the actors, so
it pans and zooms *with* the map automatically. No camera math changes needed.

---

## 2. Data model

Keep story logic untouched. Add a **separate art registry** the image agent
owns, so regenerating art never risks editing `storyGraph.ts`.

Create `src/data/sceneArt.ts`:

```ts
import type { SceneMood } from '../types';

/** How the illustration is framed relative to the scene's focal point. */
export type ArtFraming =
  | 'vignette'   // transparent-bg character moment, sits on the place (default)
  | 'panel'      // framed rectangular illustration "pinned" over the place
  | 'fullbleed'; // large establishing art that covers most of the viewport

export type SceneArt = {
  /** Matches StoryScene.id (or EndingId for endings). */
  sceneId: string;
  /** File under /assets/scenes (webp preferred). Omit while art is pending. */
  src?: string;
  /** Optional 2× asset for high-DPI screens. */
  src2x?: string;
  /** Anchor on the map in percent. Defaults to the scene's hotspot focus. */
  xPercent?: number;
  yPercent?: number;
  /** Rendered width as a % of the map width before camera zoom (default 26). */
  widthPercent?: number;
  framing: ArtFraming;
  /** Required for accessibility — describes the depicted action. */
  alt: string;
  /** The exact prompt used to generate the image (provenance + regeneration). */
  prompt?: string;
  /** Mood the art was drawn for, so we can detect drift if a scene's mood changes. */
  mood?: SceneMood;
};

/** sceneId → art. Missing entries fall back to the actor-only view. */
export const sceneArt: Record<string, SceneArt> = {
  // populated by the image agent, one entry per scene id
};

export function getSceneArt(sceneId: string): SceneArt | undefined {
  const art = sceneArt[sceneId];
  return art?.src ? art : undefined; // only "ready" art (has src) is returned
}
```

Do **not** add fields to `StoryScene`. The registry is matched by id, which
decouples art production from narrative edits.

---

## 3. Asset conventions

- Location: `public/assets/scenes/<sceneId>.webp` (and optional
  `<sceneId>@2x.webp`). Endings: `public/assets/scenes/ending-<endingId>.webp`.
- Format: **WebP or AVIF**, not PNG/JPG. The map alone is 12 MB; scene art must
  stay light. Target ≤ 180 KB per `vignette`, ≤ 320 KB per `panel`/`fullbleed`.
- `vignette` framing → **transparent background** (the map shows through).
- `panel`/`fullbleed` → may be opaque but should carry a soft painted edge / no
  hard rectangle that fights the illustrated map.
- Canonical render size: design vignettes at ~1024×1024, panels at ~1280×900.
- Every generated file must have a matching `sceneArt` entry including `alt` and
  `prompt` (provenance so any agent can regenerate identically).

---

## 4. Rendering

New component `src/components/SceneArt.tsx`, rendered **inside**
`.map-camera__drift` in `MapCamera`, layered *above the map image and below the
actors* for `panel`/`fullbleed`, or *above actors* for an action `vignette`
(decide per scene; default below actors so characters stay readable).

```tsx
import { AnimatePresence, motion } from 'framer-motion';
import type { SceneArt as Art } from '../data/sceneArt';

type Props = { art: Art | undefined; focus: { x: number; y: number }; zoom: number; reduced: boolean };

export function SceneArt({ art, focus, zoom, reduced }: Props) {
  return (
    <AnimatePresence mode="wait">
      {art ? (
        <motion.img
          key={art.sceneId}
          src={`/assets/scenes/${art.src}`}
          srcSet={art.src2x ? `/assets/scenes/${art.src} 1x, /assets/scenes/${art.src2x} 2x` : undefined}
          alt={art.alt}
          className={`scene-art scene-art--${art.framing}`}
          style={{
            left: `${art.xPercent ?? focus.x}%`,
            top: `${art.yPercent ?? focus.y}%`,
            // counter-scale so the art keeps a controlled size at any zoom
            ['--inv' as string]: 1 / zoom,
            ['--w' as string]: `${art.widthPercent ?? 26}%`,
          }}
          decoding="async"
          loading="eager"
          draggable={false}
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 0.61, 0.21, 1] }}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
    </AnimatePresence>
  );
}
```

Wire-up in `MapCamera.tsx`:
- Accept a `sceneId` (or the resolved `SceneArt`) prop from `CinematicStage`.
- Render `<SceneArt art={getSceneArt(sceneId)} focus={focus} zoom={zoom} reduced={reduced} />`
  immediately after the `<img className="map-image" />` (panel/fullbleed) — and,
  for `vignette`, after the actor map so it overlays the characters.
- CSS in `src/styles/global.css`: `.scene-art` is `position:absolute; transform: translate(-50%,-50%) scale(var(--inv)); width: var(--w);` matching the existing `.actor` counter-scale pattern (`--inv`). Add a subtle drop shadow for vignettes.

Pass `scene.id` from `CinematicStage` into `MapCamera` (it already computes
`focus` and `zoom`).

---

## 5. Preloading (no jank on scene change)

Mirror the existing `prefetchNext` voice pattern. In `CinematicStage`, when the
final dialogue line is reached or a choice is hovered, preload the art for each
`choice.nextSceneId`:

```ts
function preloadSceneArt(sceneId: string) {
  const art = getSceneArt(sceneId);
  if (!art) return;
  const img = new Image();
  img.src = `/assets/scenes/${art.src}`;
}
```

This keeps the fade-in instant when the next scene mounts.

---

## 6. Fallback behaviour (must-have)

- No `sceneArt` entry, or entry without `src` → `getSceneArt` returns
  `undefined` → `SceneArt` renders nothing → today's actor-only view is shown.
  **The feature is purely additive; the game must be fully playable with zero
  art present.**
- Broken image URL → `onError` hides the element (set `display:none`) so a
  missing file never shows a broken-image icon over the map.
- `prefers-reduced-motion` (already surfaced as `reduced`) → no scale, just a
  fast opacity cut.

---

## 7. Art style guide (for the image agent)

The map (`public/assets/map.jpg`) is an **illustrated, aged cross-section** of
the underwater city of Athel. All scene art must look like it was drawn by the
same hand and could be pasted onto that map without clashing.

**Visual identity**
- Medium: hand-painted / inked illustration with visible texture; *not* photoreal, *not* flat vector, *not* 3D render.
- Palette: muted, slightly desaturated; aged-paper warmth up top (Surface/Top
  levels) shifting to cold teal-greens and rust in the depths (Engine). Match
  the mood tints already used: `calm`, `tense`, `descent`, `secret`, `danger`,
  `hope`.
- Lighting: soft caustic underwater light; god-rays near the Glass Dome; dim,
  steam-lit glow in the Industrial Core / Engine Room.
- Linework: confident, storybook-illustration weight; soft painted edges (no
  hard photographic cutouts), so `vignette` art melts onto the map.
- Mood-to-tone mapping: `calm`→still/warm; `tense`→tight framing, cooler;
  `descent`→downward motion, shadow; `secret`→single light source, hush;
  `danger`→high contrast, red accents; `hope`→light breaking through water.

**Characters** (keep consistent with `src/data/characters.ts` accents)
- Mira — bright lower-level student, accent gold `#d9b15a`.
- Ocean — Mira's friend, teal `#5fb6c4`.
- Torin — market shopkeeper / hull diver, copper `#c98a4b`.
- Veyr — the president, magenta-rose `#b1556a`.
Reuse the same hair/silhouette/wardrobe across all scenes so the same person is
recognisable beat to beat.

**Framing rules**
- `vignette`: 1–3 characters mid-action, transparent background, no scenery box.
- `panel`: a small framed "window" of the location's interior, pinned over the
  place on the map.
- `fullbleed`: reserved for climax / endings only.

**Prohibited:** modern logos, text/UI in the image, photoreal faces, anachronistic
tech, gore. Keep it PG and painterly.

---

## 8. Per-scene prompt spec (deliverable from the image agent)

For **every** scene id below, produce one illustration + a `sceneArt` entry with
`alt` and `prompt`. Derive the depicted action from the scene's `paragraphs` /
`dialogue` in `src/data/storyGraph.ts` and the place from `locationHotspotId`.
Scene ids and their places (from `mapHotspots.ts` / `characters.ts`):

| sceneId | place | who | suggested beat |
|---|---|---|---|
| `school-morning` | Archimedes School | Mira, Ocean, Veyr (portrait) | classroom, president's portrait on the wall |
| `torins-shop` | Market Levels | Mira, Torin | market stall, tuna sandwich, hushed talk |
| `descent-to-engine` | Spiral Staircase | Mira | lone descent into darker, humid levels |
| `radiation-report` | Engine Room | Mira (+Veyr later) | Mira reading the report, readings at zero |
| `sara-disappears` | Archimedes School | Mira, Ocean | empty seat, unease |
| `city-hall-board` | Upper Residences | Mira, Veyr | announcement board, official lie |
| `climax-door` | Spiral Staircase / Engine | Mira, Veyr | the door, the confrontation (panel/fullbleed) |
| `escape-to-torin` | Comms Room / Market | Mira, Torin | fleeing to Torin |
| `broadcast-plan` | Comms Room | Mira, Torin | the broadcast rig, planning the truth |
| `blackout-escape` | Glass Dome | Mira, Ocean, Torin | blackout, the dome, the ascent |
| `caught-and-questioned` | Top Level | Mira, Veyr | interrogation |
| `leak-and-collapse` | Glass Dome | Mira, Veyr | the dark beat (fullbleed) |
| ...remaining scene ids in `storyScenes` | per `locationHotspotId` | per `getCharactersForScene` | — |
| endings `hopeful` / `dark` / `bittersweet` | per ending `locationHotspotId` | — | fullbleed finale art |

(The agent should enumerate the authoritative list programmatically from
`storyScenes` + `endings` rather than trusting this table, then fill any gaps.)

A reusable prompt template:

> "Hand-painted storybook illustration, muted aged palette, soft caustic
> underwater light, in the style of an illustrated antique cross-section map.
> {action}. Characters: {character descriptions with accent colours}. Setting:
> {place}. Mood: {mood}. Transparent background, soft painted edges, no text,
> no UI, PG, painterly, not photoreal."

Store the filled-in prompt in `sceneArt[sceneId].prompt`.

---

## 9. Implementation steps (ordered)

1. Add `src/data/sceneArt.ts` (registry + `getSceneArt`).
2. Add `src/components/SceneArt.tsx`.
3. Add `.scene-art*` styles to `src/styles/global.css` (mirror `.actor` counter-scale).
4. Thread `sceneId` from `CinematicStage` → `MapCamera`; render `SceneArt`.
5. Add `preloadSceneArt` and call it for `choice.nextSceneId` on hover / last line.
6. Image agent: generate art per §8 into `public/assets/scenes/`, fill registry.
7. Add tests (§10). Run `npm run build`, `npm test`, and the Playwright e2e.

Steps 1–5 ship immediately and are testable with **placeholder art** (one
sample webp) before the full art set exists.

---

## 10. Tests

- `src/test/sceneArt.test.ts`:
  - every key in `sceneArt` is a real scene/ending id (cross-check `storyScenes`,
    `endings`);
  - every entry with a `src` has a non-empty `alt`;
  - `xPercent`/`yPercent`, when present, are within 0–100.
- Component test: `SceneArt` renders nothing for an unknown id, renders an `<img>`
  with the right `alt` for a known one, and hides on `error`.
- E2E (`tests/e2e/`): on a scene known to have art, assert the `.scene-art` image
  is visible and within the camera frame; assert the game is still playable when
  the registry is empty (fallback path).

---

## 11. Risks / notes

- **Weight:** enforce the per-file size budget; consider AVIF. Lazy/preload only
  the next scene's art, never the whole set.
- **Readability:** if a `vignette` over actors hurts dialogue legibility, default
  art to *below* the actor layer and reserve above-actor only for establishing beats.
- **Consistency drift:** store `prompt` + `mood` per entry so regeneration stays
  on-model; add the mood-mismatch check to the test if scenes are re-tuned.
- This plan is **independent of Plan 2** (living map). Static art works with
  static actors; if Plan 2 lands, `vignette` art can be swapped for / layered
  with animated sprites scene by scene.
