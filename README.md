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

## Voices (ElevenLabs, optional)

The narrator and each character can be voiced with ElevenLabs text-to-speech.

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_ELEVENLABS_API_KEY` to your ElevenLabs key.
3. (Optional) Override `VITE_ELEVENLABS_VOICE_*` with voice ids from your
   ElevenLabs library.
4. Restart `npm run dev`. Toggle voices with the **Voices** button in the
   top-right control cluster (also persists your preference).

Without a key the game runs normally and the Voices toggle is inert.

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
- **Atlas** — your foldout journal of collected items and charted places.
