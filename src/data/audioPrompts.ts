import type { SceneMood, Speaker } from '../types';

/** Default ElevenLabs voices per speaker. Overridable via env in each role. */
export const DEFAULT_VOICES: Record<Speaker, string> = {
  narrator: 'Fahco4VZzobUeiPqni1S', // narrator
  mira: 'XdflFrQO8wbGpWMNZHFr', // Mira
  ocean: '54Cze5LrTSyLgbO6Fhlc', // Ocean
  torin: 'nzFihrBIvB34imQBuxub', // Torin
  veyr: 'USEQXnsXRJlw2k9LUzG4' // Veyr
};

/** Prompt used to generate a short ambient sound-effect sting per mood. */
export const MOOD_SFX_PROMPTS: Record<SceneMood, string> = {
  calm: 'cinematic underwater city ambience, muffled market murmur, gentle bubbles, soft room tone, no speech',
  tense: 'subtle suspense sting underwater, distant sonar ping, low ominous pulse, no melody, no speech',
  descent: 'deep machinery ambience, metallic groans, elevator-like descent, water drips, engine rumble, no speech',
  secret: 'quiet secret room ambience, electrical hum, paper rustle, held breath tension, no speech',
  danger: 'short underwater alarm sting, rising low pulse, muffled warning tone, urgent but not harsh, no speech',
  hope: 'hopeful underwater shimmer sting, warm swell, soft bubbles, light through water, no speech'
};

/** Loopable musical bed per mood. Generated as local files and crossfaded by mood. */
export const MOOD_MUSIC_PROMPTS: Record<SceneMood, string> = {
  calm: 'loopable cinematic underscore for an underwater market, warm marimba, soft pads, gentle harp, 12 seconds, no drums, no vocals',
  tense: 'loopable suspense underscore under the ocean, low strings, distant sonar, restrained pulse, 12 seconds, no vocals',
  descent: 'loopable deep descent score, sub bass drone, metallic percussion, slow downward motion, 12 seconds, no vocals',
  secret: 'loopable secret investigation music, quiet piano notes, glassy pads, nervous low texture, 12 seconds, no vocals',
  danger: 'loopable danger underscore, urgent low strings, muted percussion, underwater alarm color, 12 seconds, no vocals',
  hope: 'loopable hopeful ending music, bright pads, gentle strings, rising wonder, underwater shimmer, 12 seconds, no vocals'
};

export type SfxEvent =
  | 'footstep'
  | 'door-open'
  | 'door-heavy'
  | 'paper-rustle'
  | 'alarm'
  | 'broadcast-static'
  | 'water-drip'
  | 'sonar-ping';

/** Event SFX assets generated for current and near-term choreography hooks. */
export const EVENT_SFX_PROMPTS: Record<SfxEvent, string> = {
  footstep: 'single soft boot step on wet metal stairs inside an underwater city, no voice',
  'door-open': 'small watertight metal door opening with rubber seal hiss, no voice',
  'door-heavy': 'large heavy steel hatch door opening in deep underwater facility, low creak, no voice',
  'paper-rustle': 'confidential paper folder being opened and one page pulled out, close mic, no voice',
  alarm: 'muffled underwater facility alarm pulse, short warning tone, no voice',
  'broadcast-static': 'old public address broadcast system crackle and static burst, no voice',
  'water-drip': 'single water drip in metal corridor with short echo, no voice',
  'sonar-ping': 'soft distant sonar ping underwater, short clean echo, no voice'
};
