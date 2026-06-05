import type { SceneMood, Speaker } from '../types';

/**
 * Default ElevenLabs premade voices per speaker. Pure data so both the client
 * and the offline generation script can import it. Overridable via env in each.
 */
export const DEFAULT_VOICES: Record<Speaker, string> = {
  narrator: 'JBFqnCBsd6RMkjVDRZzb', // George — warm, deep storyteller
  mira: 'XrExE9yKIg1WjnnlVkGX', // Matilda — youthful, earnest
  ocean: 'EXAVITQu4vr4xnSDxMaL', // Sarah — young, bright (free-tier default)
  torin: 'pNInz6obpgDQGcFmaJgB', // Adam — rough, grounded
  veyr: 'Xb7hH8MSUJpSbSDYk0k2' // Alice — confident, composed (free-tier default)
};

/** Prompt used to generate a short ambient sound-effect sting per mood. */
export const MOOD_SFX_PROMPTS: Record<SceneMood, string> = {
  calm: 'gentle underwater room tone, distant muffled market murmur, soft bubbling water, calm',
  tense: 'low ominous underwater drone, faint sonar ping, quiet unease, suspense',
  descent: 'descending into deep machinery, metallic groans, distant engine rumble, dripping water',
  secret: 'quiet tense room tone, faint electrical hum, paper rustle, held breath, suspense',
  danger: 'rising alarming low pulse, distant muffled alarm underwater, dread',
  hope: 'warm hopeful swelling tone, soft shimmer, light breaking through water, relief'
};
