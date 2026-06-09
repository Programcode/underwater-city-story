# Plan 2 — The living map (animated characters, travel, ambience & SFX)

**Date:** 2026-06-07
**Goal:** Make the map feel alive. Characters idle, talk, gesture, and **walk
between places** when the story moves; the camera travels with them; each place
has its own **ambience bed**; and **event sound effects** (footsteps, doors,
alarms) fire on actions. Also documents the **subscription-free voice/SFX swap**.

---

## 1. Current state

- `MapCamera` (`src/components/MapCamera.tsx`) places `Actor` portraits at static
  percentage coords from `arrangeActors(characters, focus)` in `src/lib/camera.ts`.
  The camera does a single animated **cut** to the scene's focus (framer-motion
  `animate={{ transform }}`).
- `Actor` (`src/components/Actor.tsx`) has `speaking` / `voicing` / `dimmed`
  states → CSS pulse. No walk/idle/gesture; portrait is a static sprite
  (`.character-portrait--<id>` from `public/assets/characters.png`).
- Voicing state already exists per line (`voicing` boolean, `speaker`).
- Ambience is **procedural per-mood only** (`AmbienceEngine`, `src/lib/ambience.ts`),
  not per place. SFX (`useSfx`) plays one mood "sting"; the six files in
  `public/audio/sfx/` are identical 112,893-byte placeholders.

---

## 2. Four layers of "alive" (build in this order)

1. **Idle + talk life** (cheapest, no new art) — procedural CSS motion.
2. **Per-place ambience beds + event SFX** — audio.
3. **Walk between places** — actors tween along a path on scene change.
4. **Camera travel** — camera follows the walk instead of cutting.

Each layer is independently shippable and gated by `prefers-reduced-motion`.

---

## 3. Layer 1 — Idle & talk animation (no new assets)

Add procedural CSS keyframes to the existing portrait, driven by state already
available in `Actor`:

- **Idle:** gentle 3–4s vertical bob + slight rotate, randomized per character
  via an `--idle-delay` set from the character id, so they don't bob in sync.
- **Talk:** while `voicing` is true, a faster "speaking" oscillation (subtle
  scale/teeter on `.actor__portrait`) to read as talking; stop on line end.
- **Gesture:** add an optional `gesture` prop (`'point' | 'react' | 'nod'`) →
  one-shot keyframe. Drive from choreography (§5).
- **Reduced motion:** all keyframes disabled (`reduced` already threaded in).

Files: `src/styles/global.css` (keyframes + `.actor--idle/--talk/--gesture-*`),
`src/components/Actor.tsx` (apply classes from props). No data model change.

Optional upgrade (ties to Plan 1's image agent): replace the single portrait
with a **2–4 frame sprite sheet** per character (idle / walk / talk) under
`public/assets/sprites/<id>.webp`, swapped via `background-position` steps. Keep
procedural CSS as the zero-art fallback.

---

## 4. Layer 2 — Per-place ambience + event SFX

### 4a. Per-place ambience beds

Today ambience is keyed by `SceneMood`. Add a **place dimension** layered on top
of the mood drone, so the Market sounds different from the Engine Room even at
the same mood.

Two viable approaches:

- **(A) Procedural (no files):** extend `AmbienceEngine` with a `setPlace(level)`
  that adjusts an extra layer per `MapHotspot['level']`
  (`surface|top|upper|market|middle|lower|engine`) — e.g. engine = louder
  low-rumble + metallic resonance; market = mid murmur band; surface = bright
  filtered water + occasional shimmer. Cheapest, fully offline, on-brand with the
  existing engine.
- **(B) Looped samples (best texture):** add `public/audio/ambience/<level>.mp3`
  loops (CC0 sources, see §7), crossfaded on place change by a new
  `useAmbienceBed` hook. Heavier but richer.

Recommended: ship **(A)** first (no asset dependency), then optionally swap in
**(B)** behind the same `setPlace` API.

Data: add an `ambience?: { bed: string; intensity?: number }` hint to
`MapHotspot` (optional), defaulting to the `level`-based profile. Drive from
`CinematicStage` which already resolves the scene's hotspot.

### 4b. Event sound effects

Replace the single mood-sting model with **named, positional events**.

Create `src/data/sfxEvents.ts`:

```ts
export type SfxEvent =
  | 'footstep' | 'door-open' | 'door-heavy' | 'paper-rustle'
  | 'alarm' | 'broadcast-static' | 'water-drip' | 'sonar-ping';

/** event → file under /audio/sfx/events (filled when assets exist). */
export const sfxEventFiles: Partial<Record<SfxEvent, string>> = {};
```

- Extend `useSfx` (`src/hooks/useSfx.ts`) with `play(event: SfxEvent, opts?)`
  alongside the existing `playMood`. Cache `Audio` per event; respect a volume
  and an enabled flag (reuse the ambience toggle or add an SFX toggle).
- Triggers:
  - `footstep` loop while a character walks (Layer 3) — start/stop with the tween.
  - `door-heavy` on `climax-door`; `broadcast-static` on `broadcast-plan`;
    `alarm` on `danger` mood / `blackout-escape`; `paper-rustle` on
    `radiation-report`. Map these in `choreography.ts` (§5) as beat events.
- Files: `public/audio/sfx/events/<event>.mp3`. Until present, `play()` no-ops
  (same graceful-fallback contract as voices).

**Note:** the current `public/audio/sfx/*.mp3` mood files are identical
placeholders — they must be regenerated/replaced (see §7).

---

## 5. Layer 3 — Walking between places

### Choreography data

Create `src/data/choreography.ts` — per scene, where each present character
stands and what they do. Defaults derive from `arrangeActors` + hotspot focus;
only overrides are stored.

```ts
export type Beat = {
  characterId: string;
  /** Target position; defaults to arrangeActors slot. */
  xPercent?: number; yPercent?: number;
  action?: 'idle' | 'enter' | 'walk' | 'gesture-point' | 'gesture-react' | 'exit';
  /** Optional SFX fired when this beat starts. */
  sfx?: import('./sfxEvents').SfxEvent;
};

export type SceneChoreography = {
  /** Optional travel: characters walk from prevHotspot → this scene's hotspot. */
  travelFrom?: string; // hotspot id
  beats: Beat[];
};

export const choreography: Record<string, SceneChoreography> = {};
```

### Movement on scene change

- Today `CinematicStage` is remounted per scene (fresh state). To **show** a walk
  between scenes, the transition must persist briefly across the change.
- Mechanism: when a choice is taken in `App`, before swapping the scene, compute
  the **previous** hotspot focus and the **next** hotspot focus. Render a short
  "travel" phase where the present characters tween (framer-motion `animate`
  left/top, duration scaled by distance) from old → new arranged slots, with the
  `walk` class active and a looping `footstep` SFX. When the tween ends, mount
  the next scene's dialogue.
- Pathing: straight-line by default; for vertical moves through levels, route via
  the `spiral-staircase` hotspot (50,52) as a waypoint so characters appear to
  use the staircase. Keep a tiny `pathFor(fromLevel,toLevel)` helper in
  `src/lib/camera.ts` returning waypoints.
- `arrangeActors` stays the resting layout; the tween just animates between two
  `arrangeActors` results (old focus → new focus).

### Reduced motion

`reduced` → skip the travel phase entirely; cut to the new scene (today's
behaviour). The story must remain fully playable with travel disabled.

---

## 6. Layer 4 — Camera travel

- `MapCamera` currently animates `transform` to a single `focus`. Add a
  `travel` mode: instead of one cut, interpolate `focus` from old → new (and zoom
  out slightly mid-travel for an establishing feel, then back in) so the camera
  *follows the walk* from §5.
- Implement by animating a `focus` motion value (framer-motion `useMotionValue` +
  `animate`) and recomputing `computeCameraTransform(focus, zoom)` each frame, or
  by tweening the transform string through a midpoint. Keep the existing single-cut
  path as the `reduced`/default fallback.
- Sync: camera travel duration == walk tween duration so actors stay framed.

---

## 7. Subscription-free voices & SFX (the audio question)

The app already plays **local files** (`public/audio/voice/*` via
`manifest.json`) and only calls ElevenLabs as a fallback. So nothing in the app
changes — only the **offline generator** `scripts/generate-audio.ts`.

### Voices — swap the backend in `generate-audio.ts`

Keep `clipKey`, the manifest shape, and `public/audio/voice/` identical. Replace
the `tts(voiceId, text)` function's ElevenLabs `fetch` with a free engine:

- **Kokoro-82M (recommended)** — Apache-2.0, high quality, local. Generate via a
  small Python step (`kokoro` / `kokoro-onnx`) invoked from the script, or call a
  local Kokoro server. Map each `Speaker` to a Kokoro voice name instead of an
  ElevenLabs id (replace `DEFAULT_VOICES` ids with engine voice names, or add a
  parallel map).
- **Piper** — MIT/MPL, very fast, fully offline; lower ceiling than Kokoro.
- **edge-tts** — free, no key, excellent Microsoft neural voices; requires being
  online at generation time and uses an undocumented endpoint (ToS gray area) —
  flag before relying on it.
- **Coqui XTTS-v2** — can clone a distinct voice per character, but weights are
  **non-commercial** licensed — flag for public release.

Add a `TTS_BACKEND` env switch in the script so the engine is swappable without
touching app code. Per-speaker voice map moves from ElevenLabs ids → engine voice
names. Re-run `npm run audio`; the manifest + files regenerate; the app is
unchanged.

### SFX & ambience beds — free sources

- The six mood files are placeholders and must be replaced. ElevenLabs
  sound-generation is also subscription-gated; use **CC0 / royalty-free** sources
  instead: Freesound (filter CC0), the BBC Sound Effects library (RemArc terms),
  or generate procedurally via the existing `AmbienceEngine` approach.
- Drop event clips into `public/audio/sfx/events/` and ambience loops (if using
  approach B) into `public/audio/ambience/`. Record provenance/license in a
  `public/audio/CREDITS.md`.

---

## 8. Implementation steps (ordered, each shippable)

1. **Layer 1:** idle/talk/gesture CSS + `Actor` props. Run build + tests.
2. **Audio swap:** repoint `generate-audio.ts` at Kokoro/Piper; regenerate
   voices; replace placeholder mood SFX with CC0 clips.
3. **Layer 2a:** `AmbienceEngine.setPlace(level)` + wire from `CinematicStage`.
4. **Layer 2b:** `sfxEvents.ts` + extend `useSfx.play(event)`; trigger on moods/
   key scenes.
5. **Layer 3:** `choreography.ts` + travel phase in `App`/`CinematicStage`;
   footstep loop; staircase waypoint pathing.
6. **Layer 4:** camera travel mode in `MapCamera`.
7. Tests (§9). `npm run build`, `npm test`, Playwright e2e.

---

## 9. Tests

- `src/test/choreography.test.ts`: every key is a real scene id; every `Beat`
  `characterId` appears in that scene's `getCharactersForScene`; coords in 0–100.
- `src/test/sfxEvents.test.ts`: referenced event names exist in `SfxEvent`.
- Ambience unit: `setPlace` is a no-op when unsupported / before `ensure`.
- E2E: with reduced-motion **on**, a choice still advances instantly (no travel
  hang); with it **off**, the `.actor--walk` class appears during a transition.
- Guard: game completes start→ending with all audio files absent (fallbacks).

---

## 10. Risks / notes

- **Cross-scene persistence:** the travel phase is the main architectural change
  — `CinematicStage` is remounted per scene today, so the walk must live in `App`
  (or a wrapper) that survives the scene swap. Keep it short (≤ ~1.5s) and always
  skippable.
- **Performance:** animate transforms/opacity only; cap concurrent footstep
  audio; preload only the next place's ambience bed.
- **Accessibility:** every motion layer honors `reduced`; SFX/voice/ambience each
  have independent toggles persisted in `localStorage` (pattern already used by
  `useAmbience`/`useNarration`).
- **Synergy with Plan 1:** animated sprites and scene illustrations share the
  image agent and the `--inv` counter-scale convention; a scene can use Plan 1
  static art *or* Plan 2 animated actors, chosen per scene.
