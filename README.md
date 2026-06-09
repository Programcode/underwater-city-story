# The Underwater City of Athel

An interactive, cinematic "choose your own story" set in the underwater city of
Athel. The hand-drawn cross-section map is the stage: the camera pans and zooms
between locations, characters speak on the map, narration is typed out, scenes
fade through black, and your choices funnel Mira toward one of three endings.

## Run

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm test         # unit tests (vitest)
npm run e2e      # end-to-end tests (Playwright)
npm run lint
```

## Voices & sound (ElevenLabs, optional)

The narrator and each character can be voiced with ElevenLabs text-to-speech,
and an optional sound-effect "sting" plays when the scene mood changes.

1. Copy `.env.example` to `.env.local`.
2. Set `ELEVENLABS_API_KEY` to your ElevenLabs key.
3. (Optional) Override the model with `VITE_ELEVENLABS_MODEL` (default
   `eleven_turbo_v2_5` — low latency, English; use `eleven_multilingual_v2`
   for higher quality at the cost of speed) or the per-character voices with
   `VITE_ELEVENLABS_VOICE_*`.
4. Restart `npm run dev`. Use the top-right control cluster:
   - **Ambience** — procedural underwater soundscape that retunes per mood
     (works with no key); also triggers the ElevenLabs mood stingers when a key
     is present.
   - **Voices** — ElevenLabs narration; the on-screen text paces itself to the
     spoken line and the speaking portrait pulses.

Without a key the game runs normally (procedural ambience only) and the Voices
toggle is inert.

Requests are routed through a same-origin Vite proxy (`/eleven`) that injects
the key server-side — this avoids browser CORS errors and keeps the key out of
the client bundle. The proxy is active under `npm run dev` and `npm run preview`.

### Pre-generate audio (recommended)

For instant, reliable playback (no runtime API calls, no CORS, no latency),
pre-render every line and mood SFX to `public/audio/` once:

```bash
npm run audio
```

This reads your key, writes `public/audio/voice/*.mp3`, `public/audio/sfx/*.mp3`,
and `public/audio/manifest.json`, then the app plays those local files (falling
back to the live proxy for anything not pre-generated). Re-running only fetches
what's new. `public/audio/` is git-ignored.

> On the **free ElevenLabs plan**, only default voices work via the API (library
> voices return `402`). The defaults shipped here are free-tier voices. Override
> any of them with `VITE_ELEVENLABS_VOICE_*` if you have a paid plan.

> **Security note:** `VITE_` variables are bundled into the client, so the key
> is visible to anyone who loads the app. That is acceptable for a local/demo
> build. For a public deployment, proxy the ElevenLabs requests through a small
> backend that keeps the key server-side.

## How the branching works

- Each scene offers choices. Some are optional detours (collect items, build
  trust) that rejoin the main path; the **climax** opens genuinely different
  branches (run to Torin / record more / get caught).
- Every choice can adjust four hidden traits — **evidence, trust, risk,
  collective** — and can add items to the **Atlas**.
- The ending is resolved from your accumulated traits:
  - **Hopeful** — strong proof, allies, and public support with low recklessness.
  - **Bittersweet** — the truth spreads, but faster than it can be organised.
  - **Dark** — an isolated escape without enough proof or allies.

## Overlays

- **Map** — the full cross-section world map; click any brass marker to read its
  lore, related scenes, and collectibles. "Return to the story" closes it.
- **Atlas** — your foldout journal of collected items and charted places, plus
  character bios (Cast) and Achievements (persisted across runs).

## Saving & progress

- The current run autosaves; the title screen offers **Continue** to resume it.
- Reaching an ending records it and unlocks achievements (kept across runs), and
  the finale shows **the path you walked** and your trait scores.
