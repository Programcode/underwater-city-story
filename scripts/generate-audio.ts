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
 * VITE_ELEVENLABS_API_KEY). Already-generated clips are skipped unless
 * FORCE_AUDIO=1 is set.
 */
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_VOICES,
  EVENT_SFX_PROMPTS,
  MOOD_MUSIC_PROMPTS,
  MOOD_SFX_PROMPTS,
  type SfxEvent
} from '../src/data/audioPrompts';
import { getChoiceVariantDialogue, getEndingDialogue, getSceneDialogue } from '../src/data/dialogue';
import { endings, storyScenes } from '../src/data/storyGraph';
import { clipKey } from '../src/lib/audioManifest';
import type { DialogueLine, SceneMood, Speaker } from '../src/types';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = join(ROOT, 'public', 'audio');
const VOICE_DIR = join(AUDIO_DIR, 'voice');
const SFX_DIR = join(AUDIO_DIR, 'sfx');
const EVENT_SFX_DIR = join(SFX_DIR, 'events');
const MUSIC_DIR = join(AUDIO_DIR, 'music');

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
const TTS_BACKEND = env.TTS_BACKEND || 'elevenlabs';
const FORCE_AUDIO = env.FORCE_AUDIO === '1' || env.FORCE_AUDIO === 'true';
// When set, generate only character/narrator voices and skip SFX/music/events.
const SKIP_ASSETS = env.SKIP_ASSETS === '1' || env.SKIP_ASSETS === 'true';
// Offline pre-render uses Eleven v3 — the most expressive model — since latency
// is irrelevant for baked files and we want the richest delivery + audio tags.
const MODEL_ID = env.VITE_ELEVENLABS_MODEL || 'eleven_v3';
const OUTPUT_FORMAT = env.VITE_ELEVENLABS_OUTPUT || 'mp3_44100_128';

const VOICES: Record<Speaker, string> = {
  narrator: env.VITE_ELEVENLABS_VOICE_NARRATOR || DEFAULT_VOICES.narrator,
  mira: env.VITE_ELEVENLABS_VOICE_MIRA || DEFAULT_VOICES.mira,
  ocean: env.VITE_ELEVENLABS_VOICE_OCEAN || DEFAULT_VOICES.ocean,
  torin: env.VITE_ELEVENLABS_VOICE_TORIN || DEFAULT_VOICES.torin,
  veyr: env.VITE_ELEVENLABS_VOICE_VEYR || DEFAULT_VOICES.veyr
};

const MACOS_VOICES: Record<Speaker, string> = {
  narrator: env.MACOS_VOICE_NARRATOR || 'Daniel',
  mira: env.MACOS_VOICE_MIRA || 'Samantha',
  ocean: env.MACOS_VOICE_OCEAN || 'Moira',
  torin: env.MACOS_VOICE_TORIN || 'Fred',
  veyr: env.MACOS_VOICE_VEYR || 'Grandma (English (US))'
};

function hashName(...parts: string[]): string {
  return createHash('sha1').update(parts.join('::')).digest('hex').slice(0, 16);
}

/**
 * Voice settings tuned per model. Eleven v3 requires a *discrete* stability
 * (0.0 Creative / 0.5 Natural / 1.0 Robust); 0.5 keeps it expressive yet
 * reliable, and responsive to audio tags. v2 models use the continuous range.
 */
function voiceSettingsFor(modelId: string): Record<string, number | boolean> {
  if (modelId.includes('v3')) {
    return { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true };
  }
  return { stability: 0.4, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true };
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
        voice_settings: voiceSettingsFor(MODEL_ID)
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

function writeBinaryFile(path: string, buffer: Buffer): void {
  writeFileSync(path, buffer);
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`${command} exited ${code}: ${stderr.trim()}`));
      }
    });
  });
}

async function macosTts(voiceName: string, text: string, outputPath: string): Promise<void> {
  const aiffPath = `${outputPath}.aiff`;
  try {
    await runCommand('say', ['-v', voiceName, '-o', aiffPath, text]);
    await runCommand('afconvert', [aiffPath, '-f', 'm4af', '-d', 'aac', outputPath]);
  } finally {
    if (existsSync(aiffPath)) unlinkSync(aiffPath);
  }
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
  getChoiceVariantDialogue().forEach(add);
  for (const ending of Object.values(endings)) getEndingDialogue(ending).forEach(add);
  return lines;
}

async function main(): Promise<void> {
  if (TTS_BACKEND === 'elevenlabs' && !API_KEY) {
    console.error(
      '✗ No ElevenLabs API key found. Add ELEVENLABS_API_KEY or VITE_ELEVENLABS_API_KEY to .env.local.'
    );
    process.exit(1);
  }

  mkdirSync(VOICE_DIR, { recursive: true });
  mkdirSync(SFX_DIR, { recursive: true });
  mkdirSync(EVENT_SFX_DIR, { recursive: true });
  mkdirSync(MUSIC_DIR, { recursive: true });

  const lines = collectLines();
  console.log(
    `Generating ${lines.length} voice lines + ${Object.keys(MOOD_SFX_PROMPTS).length} mood SFX + ${Object.keys(MOOD_MUSIC_PROMPTS).length} music beds + ${Object.keys(EVENT_SFX_PROMPTS).length} event SFX...`
  );

  const voices: Record<string, string> = {};
  let made = 0;
  let skipped = 0;
  let index = 0;

  for (const line of lines) {
    index += 1;
    // Spoken text may carry v3 audio tags; the on-screen text never does.
    const spokenText = line.voice ?? line.text;
    const voiceId = TTS_BACKEND === 'macos' ? MACOS_VOICES[line.speaker] : VOICES[line.speaker];
    const modelId = TTS_BACKEND === 'macos' ? 'macos-say-aac' : MODEL_ID;
    const extension = TTS_BACKEND === 'macos' ? 'm4a' : 'mp3';
    const file = `${hashName(voiceId, modelId, spokenText)}.${extension}`;
    const rel = `voice/${file}`;
    const abs = join(VOICE_DIR, file);

    if (existsSync(abs) && !FORCE_AUDIO) {
      voices[clipKey(line.speaker, line.text)] = rel;
      skipped += 1;
      continue;
    }
    try {
      if (TTS_BACKEND === 'macos') {
        await macosTts(voiceId, spokenText, abs);
      } else {
        const buffer = await tts(voiceId, spokenText);
        writeBinaryFile(abs, buffer);
      }
      voices[clipKey(line.speaker, line.text)] = rel;
      made += 1;
      console.log(`  [${index}/${lines.length}] ${line.speaker}: ${line.text.slice(0, 48)}…`);
    } catch (error) {
      console.error(`  ! Failed (${line.speaker}): ${(error as Error).message}`);
    }
  }

  const sfxMap: Partial<Record<SceneMood, string>> = {};
  const musicMap: Partial<Record<SceneMood, string>> = {};
  const eventMap: Partial<Record<SfxEvent, string>> = {};
  if (SKIP_ASSETS) {
    console.log('↷ Skipping SFX/music/event assets (SKIP_ASSETS set) — voices only.');
  } else if (!API_KEY) {
    console.warn('! SFX/music generation requires an ElevenLabs API key; skipping generated audio assets.');
  } else {
    for (const [mood, prompt] of Object.entries(MOOD_SFX_PROMPTS) as [SceneMood, string][]) {
      const file = `${mood}.mp3`;
      const abs = join(SFX_DIR, file);
      if (existsSync(abs) && !FORCE_AUDIO) {
        sfxMap[mood] = `sfx/${file}`;
        skipped += 1;
        continue;
      }
      try {
        const buffer = await sfx(prompt);
        writeBinaryFile(abs, buffer);
        sfxMap[mood] = `sfx/${file}`;
        made += 1;
        console.log(`  [sfx] ${mood}`);
      } catch (error) {
        console.error(`  ! Failed (sfx ${mood}): ${(error as Error).message}`);
      }
    }

    for (const [mood, prompt] of Object.entries(MOOD_MUSIC_PROMPTS) as [SceneMood, string][]) {
      const file = `${mood}.mp3`;
      const abs = join(MUSIC_DIR, file);
      if (existsSync(abs) && !FORCE_AUDIO) {
        musicMap[mood] = `music/${file}`;
        skipped += 1;
        continue;
      }
      try {
        const buffer = await sfx(prompt, 12);
        writeBinaryFile(abs, buffer);
        musicMap[mood] = `music/${file}`;
        made += 1;
        console.log(`  [music] ${mood}`);
      } catch (error) {
        console.error(`  ! Failed (music ${mood}): ${(error as Error).message}`);
      }
    }

    for (const [event, prompt] of Object.entries(EVENT_SFX_PROMPTS) as [SfxEvent, string][]) {
      const file = `${event}.mp3`;
      const abs = join(EVENT_SFX_DIR, file);
      if (existsSync(abs) && !FORCE_AUDIO) {
        eventMap[event] = `sfx/events/${file}`;
        skipped += 1;
        continue;
      }
      try {
        const buffer = await sfx(prompt, 3);
        writeBinaryFile(abs, buffer);
        eventMap[event] = `sfx/events/${file}`;
        made += 1;
        console.log(`  [event] ${event}`);
      } catch (error) {
        console.error(`  ! Failed (event ${event}): ${(error as Error).message}`);
      }
    }
  }

  const manifest = {
    model: TTS_BACKEND === 'macos' ? 'macos-say-aac' : MODEL_ID,
    backend: TTS_BACKEND,
    generatedAt: new Date().toISOString(),
    voices,
    sfx: sfxMap,
    music: musicMap,
    events: eventMap
  };
  writeFileSync(join(AUDIO_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\n✓ Done. ${made} generated, ${skipped} reused. Manifest → public/audio/manifest.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
