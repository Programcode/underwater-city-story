/**
 * Offline audio generator.
 *
 * Pre-renders every narrator/character line and each mood sound-effect to
 * `public/audio/` using the ElevenLabs API, and writes `public/audio/manifest.json`
 * so the app can play local files (no runtime API calls, no CORS, no latency).
 *
 * Run with:  npm run audio
 *
 * Reads the key from .env.local / .env (ELEVENLABS_API_KEY or
 * VITE_ELEVENLABS_API_KEY). Already-generated clips are skipped, so re-runs are
 * cheap and only fetch what's new.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_VOICES, MOOD_SFX_PROMPTS } from '../src/data/audioPrompts';
import { getEndingDialogue, getSceneDialogue } from '../src/data/dialogue';
import { endings, storyScenes } from '../src/data/storyGraph';
import { clipKey } from '../src/lib/audioManifest';
import type { DialogueLine, SceneMood, Speaker } from '../src/types';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = join(ROOT, 'public', 'audio');
const VOICE_DIR = join(AUDIO_DIR, 'voice');
const SFX_DIR = join(AUDIO_DIR, 'sfx');

function parseEnvFile(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(file)) return out;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const match = raw.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[match[1]] = value;
  }
  return out;
}

const env: Record<string, string | undefined> = {
  ...parseEnvFile(join(ROOT, '.env')),
  ...parseEnvFile(join(ROOT, '.env.local')),
  ...process.env
};

const API_KEY = env.ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY;
const MODEL_ID = env.VITE_ELEVENLABS_MODEL || 'eleven_turbo_v2_5';
const OUTPUT_FORMAT = env.VITE_ELEVENLABS_OUTPUT || 'mp3_44100_128';

const VOICES: Record<Speaker, string> = {
  narrator: env.VITE_ELEVENLABS_VOICE_NARRATOR || DEFAULT_VOICES.narrator,
  mira: env.VITE_ELEVENLABS_VOICE_MIRA || DEFAULT_VOICES.mira,
  ocean: env.VITE_ELEVENLABS_VOICE_OCEAN || DEFAULT_VOICES.ocean,
  torin: env.VITE_ELEVENLABS_VOICE_TORIN || DEFAULT_VOICES.torin,
  veyr: env.VITE_ELEVENLABS_VOICE_VEYR || DEFAULT_VOICES.veyr
};

function hashName(...parts: string[]): string {
  return createHash('sha1').update(parts.join('::')).digest('hex').slice(0, 16);
}

async function tts(voiceId: string, text: string): Promise<Buffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${encodeURIComponent(OUTPUT_FORMAT)}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY as string,
        'content-type': 'application/json',
        accept: 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true }
      })
    }
  );
  if (!res.ok) {
    throw new Error(`TTS ${res.status} ${res.statusText}: ${await res.text().catch(() => '')}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function sfx(prompt: string, durationSeconds = 7): Promise<Buffer> {
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY as string,
      'content-type': 'application/json',
      accept: 'audio/mpeg'
    },
    body: JSON.stringify({ text: prompt, duration_seconds: durationSeconds, prompt_influence: 0.4 })
  });
  if (!res.ok) {
    throw new Error(`SFX ${res.status} ${res.statusText}: ${await res.text().catch(() => '')}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function collectLines(): DialogueLine[] {
  const seen = new Set<string>();
  const lines: DialogueLine[] = [];
  const add = (line: DialogueLine) => {
    const k = clipKey(line.speaker, line.text);
    if (seen.has(k)) return;
    seen.add(k);
    lines.push(line);
  };
  for (const scene of storyScenes) getSceneDialogue(scene).forEach(add);
  for (const ending of Object.values(endings)) getEndingDialogue(ending).forEach(add);
  return lines;
}

async function main(): Promise<void> {
  if (!API_KEY) {
    console.error(
      '✗ No ElevenLabs API key found. Add ELEVENLABS_API_KEY (or VITE_ELEVENLABS_API_KEY) to .env.local.'
    );
    process.exit(1);
  }

  mkdirSync(VOICE_DIR, { recursive: true });
  mkdirSync(SFX_DIR, { recursive: true });

  const lines = collectLines();
  console.log(`Generating ${lines.length} voice lines + ${Object.keys(MOOD_SFX_PROMPTS).length} mood SFX...`);

  const voices: Record<string, string> = {};
  let made = 0;
  let skipped = 0;
  let index = 0;

  for (const line of lines) {
    index += 1;
    const voiceId = VOICES[line.speaker];
    const file = `${hashName(voiceId, MODEL_ID, line.text)}.mp3`;
    const rel = `voice/${file}`;
    const abs = join(VOICE_DIR, file);

    if (existsSync(abs)) {
      voices[clipKey(line.speaker, line.text)] = rel;
      skipped += 1;
      continue;
    }
    try {
      const buffer = await tts(voiceId, line.text);
      writeFileSync(abs, buffer);
      voices[clipKey(line.speaker, line.text)] = rel;
      made += 1;
      console.log(`  [${index}/${lines.length}] ${line.speaker}: ${line.text.slice(0, 48)}…`);
    } catch (error) {
      console.error(`  ! Failed (${line.speaker}): ${(error as Error).message}`);
    }
  }

  const sfxMap: Partial<Record<SceneMood, string>> = {};
  for (const [mood, prompt] of Object.entries(MOOD_SFX_PROMPTS) as [SceneMood, string][]) {
    const file = `${mood}.mp3`;
    const abs = join(SFX_DIR, file);
    if (existsSync(abs)) {
      sfxMap[mood] = `sfx/${file}`;
      skipped += 1;
      continue;
    }
    try {
      const buffer = await sfx(prompt);
      writeFileSync(abs, buffer);
      sfxMap[mood] = `sfx/${file}`;
      made += 1;
      console.log(`  [sfx] ${mood}`);
    } catch (error) {
      console.error(`  ! Failed (sfx ${mood}): ${(error as Error).message}`);
    }
  }

  const manifest = {
    model: MODEL_ID,
    generatedAt: new Date().toISOString(),
    voices,
    sfx: sfxMap
  };
  writeFileSync(join(AUDIO_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\n✓ Done. ${made} generated, ${skipped} reused. Manifest → public/audio/manifest.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
