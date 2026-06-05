import type { Character, CharacterId } from '../types';

export const characters: Record<CharacterId, Character> = {
  mira: {
    id: 'mira',
    name: 'Mira',
    role: 'The witness',
    xPercent: 48,
    yPercent: 54,
    spriteClass: 'mira',
    accent: '#d9b15a',
    epithet: 'The witness',
    bio: 'A bright Archimedes School student from the lower levels who notices the small wrong details others overlook. When a maintenance errand drops a buried radiation report into her hands, her ordinary life quietly ends — and a dangerous question begins.'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    role: 'The friend',
    xPercent: 61,
    yPercent: 40,
    spriteClass: 'ocean',
    accent: '#5fb6c4',
    epithet: 'The friend',
    bio: "Mira's closest friend and sharpest sounding board. Ocean reads people and timing better than anyone, and she is the first to say out loud that people do not simply vanish from engine errands. Loyal to a fault, which is exactly what makes her a target."
  },
  torin: {
    id: 'torin',
    name: 'Torin',
    role: 'The diver',
    xPercent: 39,
    yPercent: 43,
    spriteClass: 'torin',
    accent: '#c98a4b',
    epithet: 'The diver',
    bio: 'A market shopkeeper who moonlights as a hull diver, Torin has seen the outside of the Tank — living fish, clear water, light that a poisoned world should not have. Pragmatic and steady, he insists that freeing Athel will take proof, not panic.'
  },
  veyr: {
    id: 'veyr',
    name: 'Veyr',
    role: 'The president',
    xPercent: 52,
    yPercent: 23,
    spriteClass: 'veyr',
    accent: '#b1556a',
    epithet: 'The president',
    bio: "Athel's newly installed president, whose portrait appears in every classroom before the announcement boards even change. Veyr does not deny the reports — she defends the lie as the only thing that has kept humanity from destroying itself again."
  }
};

const sceneCharacterIds: Record<string, CharacterId[]> = {
  'torins-shop': ['mira', 'torin'],
  'school-morning': ['mira', 'ocean', 'veyr'],
  'portrait-observation': ['mira', 'veyr'],
  'ocean-whisper': ['mira', 'ocean'],
  'descent-to-engine': ['mira'],
  'maintenance-corridor': ['mira'],
  'radiation-report': ['mira', 'veyr'],
  'return-to-normal': ['mira'],
  'grayson-room': ['mira'],
  'sara-disappears': ['mira', 'ocean'],
  'city-hall-board': ['mira', 'veyr'],
  'ocean-walk': ['mira', 'ocean'],
  'investigation-choice': ['mira'],
  'chalk-stair-marks': ['mira'],
  'climax-door': ['mira', 'veyr'],
  'escape-to-torin': ['mira', 'torin'],
  'sara-warning': ['mira', 'ocean'],
  'caught-and-questioned': ['mira', 'veyr'],
  'broadcast-plan': ['mira', 'torin'],
  'blackout-escape': ['mira', 'ocean', 'torin'],
  'leak-and-collapse': ['mira', 'veyr']
};

export function getCharactersForScene(sceneId: string): Character[] {
  return (sceneCharacterIds[sceneId] ?? ['mira']).map((id) => characters[id]);
}

export function getCharacter(id: CharacterId): Character {
  return characters[id];
}
