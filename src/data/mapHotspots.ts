import type { MapHotspot } from '../types';

export const mapHotspots: MapHotspot[] = [
  {
    id: 'surface-dome',
    title: 'The Glass Dome',
    subtitle: 'Sunlight, water, and the forbidden surface above.',
    xPercent: 50,
    yPercent: 13,
    level: 'surface',
    storySceneIds: ['broadcast-plan', 'blackout-escape', 'leak-and-collapse'],
    lore: [
      'The top of Athel receives the most sunlight, which makes it feel almost unreal to lower-level residents.',
      'The government teaches that the air above is toxic, but the clear water and living sea creatures hint at a different truth.'
    ],
    animation: 'sun-glint'
  },
  {
    id: 'top-level',
    title: 'Top Level',
    subtitle: "Private gardens and the president's protected world.",
    xPercent: 52,
    yPercent: 23,
    level: 'top',
    storySceneIds: ['caught-and-questioned', 'broadcast-plan'],
    lore: [
      'Only the wealthiest and most important citizens live here.',
      'The final ascent platforms are hidden near this level, where ordinary citizens are not meant to go.'
    ],
    animation: 'portrait-watch'
  },
  {
    id: 'upper-residences',
    title: 'Upper Residences',
    subtitle: 'Officials, privilege, and polished obedience.',
    xPercent: 34,
    yPercent: 34,
    level: 'upper',
    storySceneIds: ['school-morning', 'caught-and-questioned'],
    lore: [
      'Higher-class citizens and officials live in cleaner, brighter quarters.',
      "The president's portraits appear in classrooms and public rooms, turning loyalty into a daily ritual."
    ],
    animation: 'portrait-watch'
  },
  {
    id: 'archimedes-school',
    title: 'Archimedes School',
    subtitle: 'Where Mira learns the official history.',
    xPercent: 60,
    yPercent: 40,
    level: 'middle',
    storySceneIds: ['school-morning', 'sara-disappears'],
    lore: [
      'Mira and Ocean attend Archimedes because their marks let them study above their home level.',
      'The school teaches that the surface is lethal and that exile means death in seconds.'
    ],
    animation: 'blackout'
  },
  {
    id: 'market-levels',
    title: 'Market Levels',
    subtitle: "Shops, rumor, and Torin's tuna sandwich.",
    xPercent: 39,
    yPercent: 43,
    level: 'market',
    storySceneIds: ['torins-shop', 'escape-to-torin'],
    lore: [
      'Torin runs a shop here when he is not working as a diver.',
      'For Mira, the market is normal life: breakfast, school rush, and the last place things felt simple.'
    ],
    animation: 'water-ripple'
  },
  {
    id: 'spiral-staircase',
    title: 'Central Spiral Staircase',
    subtitle: 'The long descent from sunlight to engines.',
    xPercent: 50,
    yPercent: 52,
    level: 'middle',
    storySceneIds: ['descent-to-engine', 'climax-door'],
    lore: [
      'Most residents use the central staircase to move between levels.',
      'The lower Mira walks, the darker and more humid the Tank becomes.'
    ],
    animation: 'blackout'
  },
  {
    id: 'industrial-core',
    title: 'Industrial Core',
    subtitle: 'Factories, heat, damp walls, and the engine rumble.',
    xPercent: 38,
    yPercent: 63,
    level: 'lower',
    storySceneIds: ['descent-to-engine', 'return-to-normal'],
    lore: [
      'Lower-level workers live close to the machines that keep Athel alive.',
      'This area is loud during the day and almost lightless at night.'
    ],
    animation: 'steam-pulse'
  },
  {
    id: 'engine-room',
    title: 'Engine Room',
    subtitle: 'The wrong room, the confidential report, the first proof.',
    xPercent: 61,
    yPercent: 78,
    level: 'engine',
    storySceneIds: ['radiation-report', 'climax-door'],
    lore: [
      'Mira discovers reports showing radiation readings at zero.',
      'The engine room becomes the place where ordinary maintenance turns into rebellion.'
    ],
    animation: 'steam-pulse'
  },
  {
    id: 'communications-room',
    title: 'Abandoned Communications Room',
    subtitle: 'The hidden system that can broadcast the truth.',
    xPercent: 70,
    yPercent: 48,
    level: 'middle',
    storySceneIds: ['broadcast-plan', 'escape-to-torin'],
    lore: [
      'Torin believes the abandoned communications room can send proof through the Tank.',
      'In the hopeful path, this room turns evidence into public knowledge.'
    ],
    animation: 'broadcast'
  }
];

export function getHotspot(id: string): MapHotspot {
  const hotspot = mapHotspots.find((candidate) => candidate.id === id);

  if (!hotspot) {
    throw new Error(`Unknown map hotspot: ${id}`);
  }

  return hotspot;
}
