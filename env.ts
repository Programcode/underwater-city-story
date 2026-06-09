import { defineEnv, string } from 'void/env';

// Scaffolded from your .env files. Inference is conservative — review each
// entry and tighten types as needed (e.g. oneOf([...]), url(), .optional(),
// .default(value), or a Standard Schema validator from valibot/zod/arktype).
export default defineEnv({
  ELEVENLABS_API_KEY: string().optional(),
  VITE_ELEVENLABS_API_KEY: string().optional(),
  VITE_ELEVENLABS_MODEL: string().default('eleven_multilingual_v2'),
  VITE_ELEVENLABS_OUTPUT: string().default('mp3_44100_128'),
  VITE_ELEVENLABS_VOICE_MIRA: string().optional(),
  VITE_ELEVENLABS_VOICE_NARRATOR: string().optional(),
  VITE_ELEVENLABS_VOICE_OCEAN: string().optional(),
  VITE_ELEVENLABS_VOICE_TORIN: string().optional(),
  VITE_ELEVENLABS_VOICE_VEYR: string().optional(),
});
