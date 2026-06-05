# Underwater City Interactive Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished interactive web app for the underwater city story, combining an old-map-style clickable map with a branching choice game that reaches one of three endings.

**Architecture:** This is a new frontend-only React + Vite app. The story, lore, endings, and map hotspots should be modeled as typed data, with focused UI components for the map explorer, lore drawer, story engine, and ending reveal. The app should use the provided `Map.jpg` as the main visual artifact and the RTF source files as canonical story material.

**Tech Stack:** React, TypeScript, Vite, CSS modules or plain scoped CSS, Vitest, Testing Library, Playwright, `framer-motion` for deliberate animation, `lucide-react` for simple UI icons.

---

## Source Material Summary

Current folder: `/Users/adam/Documents/EnglishProject`

Existing source files:
- `/Users/adam/Documents/EnglishProject/Map.jpg`: 5632 x 3072 old illustrated map titled "The Underwater City of Athel - Map & Guide -".
- `/Users/adam/Documents/EnglishProject/Story until climax.rtf`: shared story path from Mira's morning routine through the discovery of radiation reports, Sara's disappearance, and Mira being caught at the door.
- `/Users/adam/Documents/EnglishProject/Hopeful Ending.rtf`: Mira escapes, works with Torin, collects proof, broadcasts the evidence, citizens reach the surface, and society rebuilds freely.
- `/Users/adam/Documents/EnglishProject/Dark Ending.rtf`: Mira is captured, threatened by Veyr, tries to escape with Ocean, gets out alone, and billions remain trapped.
- `/Users/adam/Documents/EnglishProject/Bittersweet Ending.rtf`: Mira escapes the room, Sara returns with a warning, papers leak, society collapses into chaos, some survivors leave while others stay.
- `/Users/adam/Documents/EnglishProject/Info.rtf`: premise, ending summaries, and character descriptions.
- `/Users/adam/Documents/EnglishProject/Tank Info.rtf`: level-by-level worldbuilding.

Content consistency decisions for implementation:
- Use `President Veyr`, not `Chancellor Veyr`, because most drafts use President.
- Use `Sara`, not `Sarah`, because the main story and bittersweet ending use Sara.
- Use `Torin`, not `Kael`, because the actual ending drafts use Torin.
- Use `Tank` in UI copy when referring to the society, and `Silo` only in story excerpts that already use it.
- Keep the three endings intact in meaning, but lightly edit sentence-level grammar during data extraction so on-screen text reads polished.

## Product Shape

The first screen should be the usable experience, not a marketing landing page.

Primary layout:
- Left/center: full, zoomable map canvas using `Map.jpg`.
- Right: an aged-paper story panel with tabs for `Story`, `Map Lore`, and `Journal`.
- Bottom or side rail: story progress and current inventory/traits.
- Map hotspots pulse subtly and reveal lore cards, short animations, and story clues.
- The story game advances through scene cards and choices.

Required interaction:
- Click map locations to pan/zoom, animate a parchment marker, and reveal lore.
- Choices advance through a shared story until the climax.
- After the climax, choices influence hidden counters and route to one of:
  - Hopeful ending
  - Dark ending
  - Bittersweet ending
- Ending screen shows why that ending happened, which choices mattered, and offers restart.

## File Structure

Create these files:
- `/Users/adam/Documents/EnglishProject/package.json`: scripts and dependencies.
- `/Users/adam/Documents/EnglishProject/index.html`: Vite HTML entry.
- `/Users/adam/Documents/EnglishProject/tsconfig.json`: TypeScript config.
- `/Users/adam/Documents/EnglishProject/tsconfig.node.json`: Vite config typing.
- `/Users/adam/Documents/EnglishProject/vite.config.ts`: React/Vitest config.
- `/Users/adam/Documents/EnglishProject/playwright.config.ts`: browser e2e config.
- `/Users/adam/Documents/EnglishProject/public/assets/map.jpg`: copied from `Map.jpg`.
- `/Users/adam/Documents/EnglishProject/src/main.tsx`: React mount.
- `/Users/adam/Documents/EnglishProject/src/App.tsx`: top-level composition.
- `/Users/adam/Documents/EnglishProject/src/types.ts`: shared story/map types.
- `/Users/adam/Documents/EnglishProject/src/data/mapHotspots.ts`: hotspot coordinates and lore.
- `/Users/adam/Documents/EnglishProject/src/data/storyGraph.ts`: scenes, choices, scores, and ending routing.
- `/Users/adam/Documents/EnglishProject/src/data/sourceCopy.ts`: polished story and ending copy adapted from RTF files.
- `/Users/adam/Documents/EnglishProject/src/components/AppShell.tsx`: responsive app frame.
- `/Users/adam/Documents/EnglishProject/src/components/MapExplorer.tsx`: map viewport, zoom/pan, hotspots.
- `/Users/adam/Documents/EnglishProject/src/components/LorePanel.tsx`: active hotspot detail panel.
- `/Users/adam/Documents/EnglishProject/src/components/StoryGame.tsx`: story scene renderer and state machine.
- `/Users/adam/Documents/EnglishProject/src/components/ChoiceButton.tsx`: accessible choice control.
- `/Users/adam/Documents/EnglishProject/src/components/EndingPanel.tsx`: final ending reveal and restart.
- `/Users/adam/Documents/EnglishProject/src/components/Journal.tsx`: discovered clues and route history.
- `/Users/adam/Documents/EnglishProject/src/styles/tokens.css`: palette, typography, spacing, motion variables.
- `/Users/adam/Documents/EnglishProject/src/styles/global.css`: base layout, parchment/map styling, responsive rules.
- `/Users/adam/Documents/EnglishProject/src/test/storyGraph.test.ts`: story route unit tests.
- `/Users/adam/Documents/EnglishProject/src/test/mapHotspots.test.ts`: hotspot data validation.
- `/Users/adam/Documents/EnglishProject/tests/e2e/story.spec.ts`: Playwright user-flow tests.
- `/Users/adam/Documents/EnglishProject/tests/e2e/map.spec.ts`: Playwright map interaction tests.

No backend is needed.

## Data Model

Use this type shape in `/Users/adam/Documents/EnglishProject/src/types.ts`:

```ts
export type EndingId = 'hopeful' | 'dark' | 'bittersweet';

export type TraitKey = 'evidence' | 'trust' | 'risk' | 'collective';

export type StoryChoice = {
  id: string;
  label: string;
  description: string;
  nextSceneId: string;
  effects?: Partial<Record<TraitKey, number>>;
  requiresDiscoveredHotspot?: string;
};

export type StoryScene = {
  id: string;
  title: string;
  locationHotspotId?: string;
  paragraphs: string[];
  choices: StoryChoice[];
  isClimax?: boolean;
};

export type Ending = {
  id: EndingId;
  title: string;
  tone: string;
  summary: string;
  paragraphs: string[];
};

export type StoryState = {
  currentSceneId: string;
  traits: Record<TraitKey, number>;
  visitedSceneIds: string[];
  discoveredHotspotIds: string[];
  selectedChoiceIds: string[];
  endingId: EndingId | null;
};

export type MapHotspot = {
  id: string;
  title: string;
  subtitle: string;
  xPercent: number;
  yPercent: number;
  level: 'top' | 'upper' | 'market' | 'middle' | 'lower' | 'engine' | 'surface';
  storySceneIds: string[];
  lore: string[];
  animation: 'sun-glint' | 'water-ripple' | 'steam-pulse' | 'portrait-watch' | 'blackout' | 'broadcast';
};
```

Ending route rule in `/Users/adam/Documents/EnglishProject/src/data/storyGraph.ts`:

```ts
export function resolveEnding(traits: Record<TraitKey, number>): EndingId {
  if (traits.evidence >= 3 && traits.trust >= 2 && traits.collective >= 2 && traits.risk <= 2) {
    return 'hopeful';
  }

  if (traits.evidence >= 2 && traits.collective >= 2) {
    return 'bittersweet';
  }

  return 'dark';
}
```

This keeps the early story mostly shared, then makes late choices matter:
- Hopeful: enough evidence, enough trust in Torin/Ocean, collective exposure, lower recklessness.
- Bittersweet: truth gets out, but with insufficient control/preparation, producing social collapse.
- Dark: low evidence or isolated/risky choices lead to capture and solitary escape.

## Map Hotspots

Define these initial hotspots against the 5632 x 3072 map using percentage coordinates:

```ts
export const mapHotspots: MapHotspot[] = [
  {
    id: 'surface-dome',
    title: 'The Glass Dome',
    subtitle: 'Sunlight, water, and the forbidden surface above.',
    xPercent: 50,
    yPercent: 13,
    level: 'surface',
    storySceneIds: ['rumors-of-veyr', 'surface-truth'],
    lore: [
      'The top of Athel receives the most sunlight, which makes it feel almost unreal to lower-level residents.',
      'The government teaches that the air above is toxic, but the clear water and living sea creatures hint at a different truth.'
    ],
    animation: 'sun-glint'
  },
  {
    id: 'top-level',
    title: 'Top Level',
    subtitle: 'Private gardens and the president\'s protected world.',
    xPercent: 52,
    yPercent: 23,
    level: 'top',
    storySceneIds: ['veyr-portrait', 'platform-ascent'],
    lore: [
      'Only the wealthiest and most important citizens live here.',
      'The final ascent platforms are hidden near this level, where ordinary citizens are not meant to go.'
    ],
    animation: 'portrait-watch'
  },
  {
    id: 'upper-residences',
    title: 'Upper Residences',
    subtitle: 'Officials, privilege, and polished obedience.',
    xPercent: 34,
    yPercent: 34,
    level: 'upper',
    storySceneIds: ['school-morning'],
    lore: [
      'Higher-class citizens and officials live in cleaner, brighter quarters.',
      'The president\'s portraits appear in classrooms and public rooms, turning loyalty into a daily ritual.'
    ],
    animation: 'portrait-watch'
  },
  {
    id: 'archimedes-school',
    title: 'Archimedes School',
    subtitle: 'Where Mira learns the official history.',
    xPercent: 60,
    yPercent: 40,
    level: 'middle',
    storySceneIds: ['school-morning', 'sara-disappears'],
    lore: [
      'Mira and Ocean attend Archimedes because their marks let them study above their home level.',
      'The school teaches that the surface is lethal and that exile means death in seconds.'
    ],
    animation: 'blackout'
  },
  {
    id: 'market-levels',
    title: 'Market Levels',
    subtitle: 'Shops, rumor, and Torin\'s tuna sandwich.',
    xPercent: 39,
    yPercent: 43,
    level: 'market',
    storySceneIds: ['torins-shop'],
    lore: [
      'Torin runs a shop here when he is not working as a diver.',
      'For Mira, the market is normal life: breakfast, school rush, and the last place things felt simple.'
    ],
    animation: 'water-ripple'
  },
  {
    id: 'spiral-staircase',
    title: 'Central Spiral Staircase',
    subtitle: 'The long descent from sunlight to engines.',
    xPercent: 50,
    yPercent: 52,
    level: 'middle',
    storySceneIds: ['descent-to-engine', 'climax-door'],
    lore: [
      'Most residents use the central staircase to move between levels.',
      'The lower Mira walks, the darker and more humid the Tank becomes.'
    ],
    animation: 'blackout'
  },
  {
    id: 'industrial-core',
    title: 'Industrial Core',
    subtitle: 'Factories, heat, damp walls, and the engine rumble.',
    xPercent: 38,
    yPercent: 63,
    level: 'lower',
    storySceneIds: ['descent-to-engine'],
    lore: [
      'Lower-level workers live close to the machines that keep Athel alive.',
      'This area is loud during the day and almost lightless at night.'
    ],
    animation: 'steam-pulse'
  },
  {
    id: 'engine-room',
    title: 'Engine Room',
    subtitle: 'The wrong room, the confidential report, the first proof.',
    xPercent: 61,
    yPercent: 78,
    level: 'engine',
    storySceneIds: ['radiation-report', 'climax-door'],
    lore: [
      'Mira discovers reports showing radiation readings at zero.',
      'The engine room becomes the place where ordinary maintenance turns into rebellion.'
    ],
    animation: 'steam-pulse'
  },
  {
    id: 'communications-room',
    title: 'Abandoned Communications Room',
    subtitle: 'The hidden system that can broadcast the truth.',
    xPercent: 70,
    yPercent: 48,
    level: 'middle',
    storySceneIds: ['broadcast-plan', 'hopeful-ending'],
    lore: [
      'Torin believes the abandoned communications room can send proof through the Tank.',
      'In the hopeful path, this room turns evidence into public knowledge.'
    ],
    animation: 'broadcast'
  }
];
```

## Story Graph

Scene order before climax:
1. `torins-shop`: Mira talks to Torin, hears of Veyr, rushes to school.
2. `school-morning`: Archimedes School, President Veyr portrait, anthem, blackout.
3. `descent-to-engine`: Mira descends the spiral staircase.
4. `radiation-report`: Mira enters the wrong room and finds zero-radiation reports.
5. `return-to-normal`: Mira tries to ignore what she saw.
6. `sara-disappears`: Sara is sent during a blackout and never returns.
7. `investigation-choice`: Mira decides who to trust and how to investigate.
8. `climax-door`: Mira listens to officials admit there has been no radiation.

Post-climax routes:
- `caught-and-questioned`: high-risk path toward dark ending.
- `escape-to-torin`: trust/evidence path toward hopeful ending.
- `sara-warning`: leak/chaos path toward bittersweet ending.
- `broadcast-plan`: hopeful branch.
- `blackout-escape`: dark branch.
- `leak-and-collapse`: bittersweet branch.
- `ending`: calculated by `resolveEnding`.

Example late choices:
- "Run to Torin and tell him everything" => `trust +1`, `collective +1`, next `escape-to-torin`.
- "Hide and record the president" => `evidence +2`, `risk +1`, next `broadcast-plan`.
- "Leak the reports anonymously" => `evidence +1`, `collective +2`, `risk +2`, next `leak-and-collapse`.
- "Protect Ocean by keeping her out of it" => `trust -1`, `collective -1`, next `blackout-escape`.
- "Use the blackout to escape alone" => `risk +2`, next `blackout-escape`.

## Visual Direction

Before implementation, generate or sketch one design concept for approval:
- Full-screen old cartographic interface.
- Sepia parchment background outside the map.
- The provided `Map.jpg` remains the centerpiece.
- UI chrome should look like aged labels, brass pins, ink annotations, torn paper panels, and subtle water-caustic movement.
- Avoid a modern marketing hero.
- Avoid decorative blobs, neon gradients, and generic game UI.
- Use readable serif headings and restrained sans-serif UI labels.

Suggested CSS tokens:

```css
:root {
  --ink: #2f2117;
  --ink-muted: #6e5945;
  --paper: #ead8b8;
  --paper-deep: #d0a56d;
  --paper-light: #f7ead0;
  --brass: #a97932;
  --blue-glass: #2e8796;
  --danger: #8c3328;
  --hope: #3d7d67;
  --shadow: rgba(47, 33, 23, 0.28);
  --radius-sm: 6px;
  --radius-md: 8px;
  --font-display: "Cinzel", Georgia, serif;
  --font-body: "Libre Baskerville", Georgia, serif;
  --font-ui: Inter, system-ui, sans-serif;
}
```

Motion rules:
- Hotspots idle with low-intensity pulse.
- Clicking a hotspot pans/zooms the map and opens lore.
- Blackout scenes briefly dim the map and flicker the UI.
- Engine room and industrial core use steam pulse overlays.
- Broadcast scene shows circular signal lines from the communications hotspot.
- Ending reveal uses parchment unroll or ink-spread animation.
- Respect `prefers-reduced-motion`.

## Task 0: Branch And Design Approval Gate

**Files:**
- No code files modified.

- [ ] **Step 1: Confirm execution branch**

Ask:

```text
This is a larger feature. Before implementation, should I create a branch like `codex/underwater-story-app`, and do you want subagent-driven execution task-by-task?
```

Expected: user confirms branch/execution mode.

- [ ] **Step 2: Create branch if approved**

Run:

```bash
git switch -c codex/underwater-story-app
```

Expected: branch created locally.

- [ ] **Step 3: Create visual concept**

Use Image Gen or a design mockup pass with this brief:

```text
Create a full-screen interactive web app concept for an old illustrated underwater city map story. The center is a large antique cutaway map of an underwater dome city. The right side has an aged parchment story panel with choose-your-own-story choices, clue journal, and ending progress. Hotspots are brass pins with ink labels. Style: old nautical map, sepia parchment, brass, ink, subtle blue glass water. No modern marketing hero, no neon gradients, no decorative blobs. The UI must be implementable as React controls, with readable text and clear button states.
```

Expected: one approved primary screen concept before coding.

- [ ] **Step 4: Commit only the plan/design artifact if a file is created**

Run:

```bash
git status --short
git add docs/superpowers/plans/2026-06-05-underwater-city-interactive-story.md
git commit -m "docs: plan underwater city interactive story app"
```

Expected: plan commit created. Do not push.

## Task 1: Scaffold React + Vite App

**Files:**
- Create: `/Users/adam/Documents/EnglishProject/package.json`
- Create: `/Users/adam/Documents/EnglishProject/index.html`
- Create: `/Users/adam/Documents/EnglishProject/tsconfig.json`
- Create: `/Users/adam/Documents/EnglishProject/tsconfig.node.json`
- Create: `/Users/adam/Documents/EnglishProject/vite.config.ts`
- Create: `/Users/adam/Documents/EnglishProject/playwright.config.ts`
- Create: `/Users/adam/Documents/EnglishProject/src/main.tsx`
- Create: `/Users/adam/Documents/EnglishProject/src/App.tsx`

- [ ] **Step 1: Create package metadata**

Use this `package.json`:

```json
{
  "name": "underwater-city-story",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "lint": "eslint ."
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "framer-motion": "latest",
    "lucide-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@eslint/js": "latest",
    "@playwright/test": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "eslint": "latest",
    "eslint-plugin-react-hooks": "latest",
    "eslint-plugin-react-refresh": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules` and `package-lock.json` created.

- [ ] **Step 3: Add Vite and TypeScript config**

Use standard React + Vite TypeScript config with Vitest `environment: 'jsdom'`.

- [ ] **Step 4: Add initial React mount**

`src/main.tsx` should import `global.css`, render `<App />`, and mount to `#root`.

- [ ] **Step 5: Verify scaffold**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts playwright.config.ts src/main.tsx src/App.tsx
git commit -m "feat: scaffold underwater story app"
```

Expected: local commit created. Do not push.

## Task 2: Add Typed Story And Map Data

**Files:**
- Create: `/Users/adam/Documents/EnglishProject/src/types.ts`
- Create: `/Users/adam/Documents/EnglishProject/src/data/mapHotspots.ts`
- Create: `/Users/adam/Documents/EnglishProject/src/data/sourceCopy.ts`
- Create: `/Users/adam/Documents/EnglishProject/src/data/storyGraph.ts`
- Create: `/Users/adam/Documents/EnglishProject/src/test/storyGraph.test.ts`
- Create: `/Users/adam/Documents/EnglishProject/src/test/mapHotspots.test.ts`

- [ ] **Step 1: Write story route tests**

Test these cases:

```ts
import { describe, expect, it } from 'vitest';
import { resolveEnding } from '../data/storyGraph';

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
```

- [ ] **Step 2: Write map hotspot tests**

Validate that every hotspot has:
- unique `id`
- `xPercent` between 0 and 100
- `yPercent` between 0 and 100
- at least one lore paragraph
- at least one linked story scene

- [ ] **Step 3: Run tests and confirm failure**

Run:

```bash
npm test
```

Expected: tests fail because modules are not implemented yet.

- [ ] **Step 4: Implement types and data**

Add the types and hotspot list from this plan. Add `sourceCopy.ts` with polished excerpts from each RTF file:
- `introCopy`
- `climaxCopy`
- `hopefulEndingCopy`
- `darkEndingCopy`
- `bittersweetEndingCopy`

Keep each on-screen paragraph short, ideally 1-3 sentences.

- [ ] **Step 5: Implement story graph**

Use deterministic scene ids, choices, and `resolveEnding`. Do not keep branching logic inside React components.

- [ ] **Step 6: Run tests**

Run:

```bash
npm test
```

Expected: story and hotspot unit tests pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/types.ts src/data src/test
git commit -m "feat: model story graph and map lore"
```

Expected: local commit created. Do not push.

## Task 3: Build The App Shell And Visual System

**Files:**
- Create: `/Users/adam/Documents/EnglishProject/src/styles/tokens.css`
- Create: `/Users/adam/Documents/EnglishProject/src/styles/global.css`
- Create: `/Users/adam/Documents/EnglishProject/src/components/AppShell.tsx`
- Modify: `/Users/adam/Documents/EnglishProject/src/App.tsx`
- Modify: `/Users/adam/Documents/EnglishProject/src/main.tsx`

- [ ] **Step 1: Add CSS tokens**

Use the token set from the Visual Direction section. Add responsive variables:

```css
:root {
  color-scheme: light;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

@media (max-width: 900px) {
  :root {
    --app-panel-width: 100%;
  }
}
```

- [ ] **Step 2: Add global layout**

The layout must:
- fill the viewport
- put map and story panel side-by-side on desktop
- stack story below map on mobile
- avoid text overflow in buttons and panels
- provide visible focus outlines

- [ ] **Step 3: Create AppShell**

`AppShell` should accept `map`, `story`, and `journal` slots so map and story work stay separate.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: build passes.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/styles src/components/AppShell.tsx src/App.tsx src/main.tsx
git commit -m "feat: add antique map app shell"
```

Expected: local commit created. Do not push.

## Task 4: Implement Interactive Map Explorer

**Files:**
- Create: `/Users/adam/Documents/EnglishProject/public/assets/map.jpg`
- Create: `/Users/adam/Documents/EnglishProject/src/components/MapExplorer.tsx`
- Create: `/Users/adam/Documents/EnglishProject/src/components/LorePanel.tsx`
- Modify: `/Users/adam/Documents/EnglishProject/src/App.tsx`
- Create: `/Users/adam/Documents/EnglishProject/tests/e2e/map.spec.ts`

- [ ] **Step 1: Copy map asset**

Run:

```bash
mkdir -p public/assets
cp Map.jpg public/assets/map.jpg
```

Expected: app-safe asset path exists at `/assets/map.jpg`.

- [ ] **Step 2: Write e2e map test**

Test:
- page loads
- map image is visible
- clicking `Engine Room` opens lore
- clicking `Glass Dome` changes selected lore

- [ ] **Step 3: Implement MapExplorer**

Behavior:
- render the image with stable aspect ratio `5632 / 3072`
- overlay buttons at hotspot percentage coordinates
- selected hotspot gets active state
- click sets active hotspot and calls `onDiscoverHotspot(id)`
- use CSS transform for zoom/pan toward selected hotspot
- expose accessible labels like `Open lore for Engine Room`

- [ ] **Step 4: Implement LorePanel**

Behavior:
- show active hotspot title, subtitle, level, lore paragraphs
- show linked story scene labels if relevant
- empty state: "Select a brass pin on the map."

- [ ] **Step 5: Add map animations**

CSS classes keyed by `animation`:
- `sun-glint`: shimmer across dome
- `water-ripple`: subtle blue ring
- `steam-pulse`: low opacity steam movement
- `portrait-watch`: darker vignette pulse
- `blackout`: quick dim/flicker
- `broadcast`: expanding signal rings

- [ ] **Step 6: Verify manually in browser**

Run:

```bash
npm run dev
```

Open local URL in the Browser plugin and click at least five hotspots.

Expected:
- no map distortion
- hotspots align with map regions
- lore panel updates instantly
- keyboard tab can reach hotspot buttons

- [ ] **Step 7: Run automated checks**

Run:

```bash
npm test
npm run e2e
npm run build
```

Expected: all pass.

- [ ] **Step 8: Commit**

Run:

```bash
git add public/assets/map.jpg src/components/MapExplorer.tsx src/components/LorePanel.tsx src/App.tsx tests/e2e/map.spec.ts
git commit -m "feat: add interactive lore map"
```

Expected: local commit created. Do not push.

## Task 5: Implement Choose-Your-Own-Story Game

**Files:**
- Create: `/Users/adam/Documents/EnglishProject/src/components/StoryGame.tsx`
- Create: `/Users/adam/Documents/EnglishProject/src/components/ChoiceButton.tsx`
- Create: `/Users/adam/Documents/EnglishProject/src/components/EndingPanel.tsx`
- Modify: `/Users/adam/Documents/EnglishProject/src/App.tsx`
- Create: `/Users/adam/Documents/EnglishProject/tests/e2e/story.spec.ts`

- [ ] **Step 1: Write e2e story tests**

Test three paths:
- choices that raise evidence/trust/collective route to hopeful
- choices that leak truth with high risk route to bittersweet
- choices that isolate Mira route to dark

- [ ] **Step 2: Implement StoryGame state**

Use local React state:
- `currentSceneId`
- `traits`
- `visitedSceneIds`
- `selectedChoiceIds`
- `endingId`

When a choice is clicked:
- apply trait effects
- append selected choice id
- move to next scene
- if next scene is terminal, call `resolveEnding`

- [ ] **Step 3: Implement ChoiceButton**

Button content:
- label
- one-sentence consequence hint
- optional disabled state if a required hotspot has not been discovered

Accessibility:
- native `button`
- visible focus state
- no clipped text on mobile

- [ ] **Step 4: Implement EndingPanel**

Show:
- ending title
- tone
- adapted ending paragraphs
- "Why this happened" list based on final traits
- restart button

- [ ] **Step 5: Connect story and map**

When the story enters a scene with `locationHotspotId`, set the active map hotspot. When the user discovers a map hotspot, add it to `discoveredHotspotIds` for journal and optional choice unlocks.

- [ ] **Step 6: Run checks**

Run:

```bash
npm test
npm run e2e
npm run build
```

Expected: all pass, and all three endings are reachable.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/StoryGame.tsx src/components/ChoiceButton.tsx src/components/EndingPanel.tsx src/App.tsx tests/e2e/story.spec.ts
git commit -m "feat: add branching story game"
```

Expected: local commit created. Do not push.

## Task 6: Add Journal, Progress, And Lore Integration

**Files:**
- Create: `/Users/adam/Documents/EnglishProject/src/components/Journal.tsx`
- Modify: `/Users/adam/Documents/EnglishProject/src/App.tsx`
- Modify: `/Users/adam/Documents/EnglishProject/src/components/AppShell.tsx`
- Modify: `/Users/adam/Documents/EnglishProject/src/styles/global.css`

- [ ] **Step 1: Implement Journal**

Journal sections:
- `Discovered Places`
- `Evidence`
- `People`
- `Route Taken`

Evidence labels:
- "Zero-radiation report"
- "Sara's disappearance"
- "Officials' confession"
- "Surface footage"
- "Veyr's admission"

- [ ] **Step 2: Add progress ribbon**

Show current act:
- Act I: Routine
- Act II: Suspicion
- Act III: The Door
- Act IV: Consequences
- Ending

- [ ] **Step 3: Add tab behavior**

Tabs:
- `Story`
- `Map Lore`
- `Journal`

On mobile, tabs should prevent a very tall permanent side panel.

- [ ] **Step 4: Run checks**

Run:

```bash
npm test
npm run build
```

Expected: pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/components/Journal.tsx src/components/AppShell.tsx src/App.tsx src/styles/global.css
git commit -m "feat: connect journal and story progress"
```

Expected: local commit created. Do not push.

## Task 7: Polish Visuals, Responsiveness, And Accessibility

**Files:**
- Modify: `/Users/adam/Documents/EnglishProject/src/styles/tokens.css`
- Modify: `/Users/adam/Documents/EnglishProject/src/styles/global.css`
- Modify: `/Users/adam/Documents/EnglishProject/src/components/*.tsx`

- [ ] **Step 1: Desktop visual pass**

Check:
- map is dominant and not cropped awkwardly
- story panel looks like parchment, not a generic card
- controls use brass/ink styling
- no text overlaps
- endings feel visually distinct but still in the same system

- [ ] **Step 2: Mobile visual pass**

Use Browser or Playwright viewport around 390 x 844.

Check:
- map remains inspectable
- panel tabs are reachable
- choice buttons wrap cleanly
- ending text is readable
- no horizontal overflow

- [ ] **Step 3: Accessibility pass**

Check:
- all hotspot buttons have accessible names
- all choice buttons are keyboard reachable
- focus state is visible
- reduced motion disables dramatic animations
- color contrast is readable on parchment backgrounds

- [ ] **Step 4: Add final animation tuning**

Keep animations subtle:
- no continuous heavy movement
- no motion that makes story text hard to read
- no map markers shifting layout

- [ ] **Step 5: Run checks**

Run:

```bash
npm test
npm run e2e
npm run build
```

Expected: pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add src
git commit -m "polish: refine old map story experience"
```

Expected: local commit created. Do not push.

## Task 8: Final Verification And Self-Review

**Files:**
- No expected code changes unless verification finds issues.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run e2e
npm run build
git diff --check
```

Expected:
- unit tests pass
- e2e tests pass
- production build passes
- no whitespace errors

- [ ] **Step 2: Browser QA**

Use Browser plugin against the local dev server.

Required QA paths:
- click every map hotspot
- play to Hopeful ending
- restart
- play to Dark ending
- restart
- play to Bittersweet ending
- verify mobile viewport

- [ ] **Step 3: Diff review**

Run:

```bash
git status --short
git diff --stat HEAD
git diff HEAD -- src package.json index.html vite.config.ts playwright.config.ts
```

Review for:
- accidental source RTF edits
- accidental `Map.jpg` mutation
- unused dependencies
- story inconsistencies
- unreachable scenes
- hardcoded layout values that break mobile

- [ ] **Step 4: Fix any issues found**

If issues are found, fix them in the relevant task area and rerun:

```bash
npm test
npm run e2e
npm run build
```

Expected: all pass after fixes.

- [ ] **Step 5: Final commit if fixes were made**

Run:

```bash
git add .
git commit -m "fix: address final story app verification issues"
```

Expected: only if there are verification fixes. Do not push.

## Acceptance Criteria

The implementation is complete when:
- The app starts with `npm run dev`.
- The map appears using the real `/Users/adam/Documents/EnglishProject/Map.jpg` content.
- At least nine map hotspots are clickable and reveal lore.
- Hotspots animate in ways tied to story locations.
- Story choices progress through the shared story to the climax.
- All three endings are reachable.
- Ending route depends on accumulated choices, not a single final button.
- The UI looks like an old nautical/parchment map interface.
- Desktop and mobile layouts are both usable.
- Keyboard navigation works for hotspots, tabs, choices, and restart.
- Tests cover route logic and hotspot data.
- Playwright covers map clicks and all three ending paths.
- `npm test`, `npm run e2e`, `npm run build`, and `git diff --check` pass.
- No push is performed unless the user explicitly asks.

## Open Questions Before Implementation

1. Should the final app use only the provided map image and CSS, or should we generate one additional UI concept/background texture with Image Gen?
2. Should the story text be lightly edited for grammar and consistency, or displayed exactly as written in the RTF files?
3. Should this be committed as one final feature commit after verification, or as the multiple task commits listed above?
4. Should the app title use the map title `The Underwater City of Athel`, or another title from the English project?

## Recommended Execution Mode

Use subagent-driven execution after branch creation:
- Agent 1: scaffold and data model.
- Agent 2: map explorer and hotspot interactions.
- Agent 3: story engine and endings.
- Agent 4: visual polish, accessibility, and QA.

Main session responsibilities:
- approve data consistency decisions
- prevent overlapping edits
- run integrated verification
- perform final browser QA
- commit only verified coherent changes

