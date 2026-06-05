import type { Character, CharacterId } from '../types';

export const characters: Record<CharacterId, Character> = {
  mira: {
    id: 'mira',
    name: 'Mira',
    role: 'The witness',
    xPercent: 48,
    yPercent: 54,
    spriteClass: 'mira'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    role: 'The friend',
    xPercent: 61,
    yPercent: 40,
    spriteClass: 'ocean'
  },
  torin: {
    id: 'torin',
    name: 'Torin',
    role: 'The diver',
    xPercent: 39,
    yPercent: 43,
    spriteClass: 'torin'
  },
  veyr: {
    id: 'veyr',
    name: 'Veyr',
    role: 'The president',
    xPercent: 52,
    yPercent: 23,
    spriteClass: 'veyr'
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
