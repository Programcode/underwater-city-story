import type { Collectible } from '../types';

export const collectibles: Collectible[] = [
  {
    id: 'tuna-sandwich',
    title: 'Tuna Sandwich',
    kind: 'item',
    source: "Torin's Shop",
    description: 'Mira starts with the ordinary breakfast that anchors the last normal morning.'
  },
  {
    id: 'veyr-succession-notice',
    title: 'Veyr Succession Notice',
    kind: 'info',
    source: 'Market Levels',
    description: 'A folded notice naming President Veyr as the Tank\'s new leader.'
  },
  {
    id: 'glossy-portrait-detail',
    title: 'Glossy Portrait Detail',
    kind: 'info',
    source: 'Archimedes School',
    description: 'A tiny glassy point in the portrait eye makes Mira wonder who is watching.'
  },
  {
    id: 'ocean-whisper',
    title: "Ocean's Whisper",
    kind: 'lore',
    source: 'Archimedes School',
    description: 'Ocean notices that the new portrait arrived before any public announcement.'
  },
  {
    id: 'maintenance-arrow-rubbing',
    title: 'Maintenance Arrow Rubbing',
    kind: 'artifact',
    source: 'Central Spiral Staircase',
    description: 'A smudged arrow pattern showing a route students are never taught.'
  },
  {
    id: 'radiation-page',
    title: 'Loose Radiation Page',
    kind: 'artifact',
    source: 'Engine Room',
    description: 'One page from Report C-137, marked with five years of zero readings.'
  },
  {
    id: 'coded-radiation-notes',
    title: 'Coded Radiation Notes',
    kind: 'info',
    source: 'Engine Room',
    description: 'Mira writes the numbers as class formulas so a search would not reveal them.'
  },
  {
    id: 'grayson-paper-boat',
    title: "Grayson's Paper Boat",
    kind: 'item',
    source: "Mira's Home",
    description: 'A folded scrap from Mira\'s brother, small enough to hide in her uniform cuff.'
  },
  {
    id: 'city-hall-silence',
    title: 'Blank Announcement Board',
    kind: 'info',
    source: 'City Hall',
    description: 'No missing-person notice appears for Sara, which feels more deliberate than careless.'
  },
  {
    id: 'chalk-stair-mark',
    title: 'Chalk Stair Marks',
    kind: 'artifact',
    source: 'Central Spiral Staircase',
    description: 'Three pale marks on the stair rail help Mira find the same forbidden turn again.'
  },
  {
    id: 'sara-warning-note',
    title: "Sara's Warning Note",
    kind: 'artifact',
    source: 'Archimedes School',
    description: 'A small paper warning Mira that the officials know she heard them.'
  },
  {
    id: 'surface-footage',
    title: 'Surface Footage',
    kind: 'info',
    source: 'The Glass Dome',
    description: 'Torin\'s camera shows living fish, a clear sky, and a world that is not poisoned.'
  },
  {
    id: 'stolen-keycard',
    title: 'Stolen Keycard',
    kind: 'item',
    source: 'Hull Inspection Point',
    description: 'A diver keycard that can open one hatch if the blackout lasts long enough.'
  },
  {
    id: 'engine-room-lore',
    title: 'Engine Room Lore',
    kind: 'lore',
    source: 'Engine Room',
    description: 'The engines are loud enough to hide footsteps, whispers, and fear.'
  },
  {
    id: 'glass-dome-lore',
    title: 'Glass Dome Lore',
    kind: 'lore',
    source: 'The Glass Dome',
    description: 'The city\'s brightest level is also the closest to the truth.'
  },
  {
    id: 'communications-manual',
    title: 'Communications Manual',
    kind: 'artifact',
    source: 'Abandoned Communications Room',
    description: 'A brittle booklet showing which cables can still reach every screen in the Tank.'
  }
];

export const collectiblesById = Object.fromEntries(
  collectibles.map((item) => [item.id, item])
) as Record<string, Collectible>;

export function getCollectible(id: string): Collectible {
  const collectible = collectiblesById[id];

  if (!collectible) {
    throw new Error(`Unknown collectible: ${id}`);
  }

  return collectible;
}
