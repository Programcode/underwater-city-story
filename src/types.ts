export type EndingId = 'hopeful' | 'dark' | 'bittersweet';

export type TraitKey = 'evidence' | 'trust' | 'risk' | 'collective';

export type CharacterId = 'mira' | 'ocean' | 'torin' | 'veyr';

/** Who is delivering a line of dialogue: the narrator, or one of the characters. */
export type Speaker = 'narrator' | CharacterId;

/** A single beat of cinematic dialogue. */
export type DialogueLine = {
  speaker: Speaker;
  text: string;
};

export type Character = {
  id: CharacterId;
  name: string;
  role: string;
  /** Default resting position on the map, as a percentage of the map. */
  xPercent: number;
  yPercent: number;
  spriteClass: string;
  /** Accent colour used for the character's nameplate and speech framing. */
  accent: string;
  /** Short epithet shown under the name in the cast list. */
  epithet: string;
  /** A few sentences of character background for the atlas cast page. */
  bio: string;
};

export type CollectibleKind = 'item' | 'artifact' | 'info' | 'lore';

export type Collectible = {
  id: string;
  title: string;
  kind: CollectibleKind;
  description: string;
  source: string;
};

export type StoryChoice = {
  id: string;
  label: string;
  description: string;
  nextSceneId: string;
  effects?: Partial<Record<TraitKey, number>>;
  collectibleIds?: string[];
  requiresDiscoveredHotspot?: string;
};

/** Visual mood used to tint the cinematic stage for a scene. */
export type SceneMood = 'calm' | 'tense' | 'descent' | 'secret' | 'danger' | 'hope';

export type StoryScene = {
  id: string;
  title: string;
  locationHotspotId?: string;
  paragraphs: string[];
  choices: StoryChoice[];
  collectibleIds?: string[];
  isClimax?: boolean;
  /** Cinematic line-by-line dialogue. Falls back to paragraphs when absent. */
  dialogue?: DialogueLine[];
  /** Mood tint for the stage lighting. */
  mood?: SceneMood;
  /** Camera zoom multiplier when framing this scene. */
  cameraZoom?: number;
};

export type Ending = {
  id: EndingId;
  title: string;
  tone: string;
  summary: string;
  paragraphs: string[];
  /** Cinematic line-by-line delivery. Falls back to paragraphs when absent. */
  dialogue?: DialogueLine[];
  /** Where on the map the ending is framed. */
  locationHotspotId?: string;
  mood?: SceneMood;
};

export type StoryState = {
  currentSceneId: string;
  traits: Record<TraitKey, number>;
  visitedSceneIds: string[];
  discoveredHotspotIds: string[];
  collectedItemIds: string[];
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
  collectibleIds?: string[];
  animation:
    | 'sun-glint'
    | 'water-ripple'
    | 'steam-pulse'
    | 'portrait-watch'
    | 'blackout'
    | 'broadcast';
};
