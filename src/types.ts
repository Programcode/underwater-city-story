export type EndingId = 'hopeful' | 'dark' | 'bittersweet';

export type TraitKey = 'evidence' | 'trust' | 'risk' | 'collective';

export type CharacterId = 'mira' | 'ocean' | 'torin' | 'veyr';

export type Character = {
  id: CharacterId;
  name: string;
  role: string;
  xPercent: number;
  yPercent: number;
  spriteClass: string;
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

export type StoryScene = {
  id: string;
  title: string;
  locationHotspotId?: string;
  paragraphs: string[];
  choices: StoryChoice[];
  collectibleIds?: string[];
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
