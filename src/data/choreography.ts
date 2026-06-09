import type { SfxEvent } from './audioPrompts';
import type { CharacterId } from '../types';

export type ChoreographyAction =
  | 'idle'
  | 'enter'
  | 'walk'
  | 'gesture-point'
  | 'gesture-react'
  | 'gesture-nod'
  | 'exit';

export type ChoreographyBeat = {
  characterId: CharacterId;
  xPercent?: number;
  yPercent?: number;
  action?: ChoreographyAction;
  sfx?: SfxEvent;
  delayMs?: number;
};

export type SfxCue = {
  event: SfxEvent;
  delayMs?: number;
};

export type SceneChoreography = {
  travelFrom?: string;
  beats: ChoreographyBeat[];
  sfx?: SfxCue[];
};

export const choreography: Record<string, SceneChoreography> = {
  'torins-shop': {
    beats: [
      { characterId: 'mira', action: 'walk' },
      { characterId: 'torin', action: 'gesture-nod' }
    ],
    sfx: [{ event: 'footstep', delayMs: 900 }]
  },
  'school-morning': {
    beats: [
      { characterId: 'mira', action: 'gesture-react' },
      { characterId: 'ocean', action: 'gesture-nod' },
      { characterId: 'veyr', action: 'idle' }
    ],
    sfx: [
      { event: 'sonar-ping', delayMs: 600 },
      { event: 'alarm', delayMs: 2600 }
    ]
  },
  'portrait-observation': {
    beats: [
      { characterId: 'mira', action: 'gesture-point' },
      { characterId: 'veyr', action: 'gesture-react' }
    ],
    sfx: [{ event: 'sonar-ping', delayMs: 800 }]
  },
  'ocean-whisper': {
    beats: [
      { characterId: 'mira', action: 'gesture-react' },
      { characterId: 'ocean', action: 'gesture-nod' }
    ],
    sfx: [{ event: 'water-drip', delayMs: 1200 }]
  },
  'descent-to-engine': {
    travelFrom: 'archimedes-school',
    beats: [{ characterId: 'mira', action: 'walk' }],
    sfx: [
      { event: 'footstep', delayMs: 400 },
      { event: 'water-drip', delayMs: 1700 }
    ]
  },
  'maintenance-corridor': {
    beats: [{ characterId: 'mira', action: 'gesture-point', sfx: 'door-open', delayMs: 1300 }],
    sfx: [{ event: 'water-drip', delayMs: 600 }]
  },
  'radiation-report': {
    travelFrom: 'spiral-staircase',
    beats: [
      { characterId: 'mira', action: 'gesture-react', sfx: 'paper-rustle', delayMs: 900 },
      { characterId: 'veyr', action: 'enter' }
    ],
    sfx: [{ event: 'footstep', delayMs: 2700 }]
  },
  'return-to-normal': {
    beats: [{ characterId: 'mira', action: 'gesture-react' }],
    sfx: [{ event: 'sonar-ping', delayMs: 1100 }]
  },
  'grayson-room': {
    beats: [{ characterId: 'mira', action: 'gesture-nod', sfx: 'paper-rustle', delayMs: 700 }]
  },
  'sara-disappears': {
    beats: [
      { characterId: 'mira', action: 'gesture-react' },
      { characterId: 'ocean', action: 'gesture-react' }
    ],
    sfx: [
      { event: 'alarm', delayMs: 500 },
      { event: 'sonar-ping', delayMs: 2100 }
    ]
  },
  'city-hall-board': {
    beats: [
      { characterId: 'mira', action: 'gesture-point' },
      { characterId: 'veyr', action: 'idle' }
    ],
    sfx: [{ event: 'broadcast-static', delayMs: 1200 }]
  },
  'ocean-walk': {
    beats: [
      { characterId: 'mira', action: 'walk' },
      { characterId: 'ocean', action: 'walk' }
    ],
    sfx: [{ event: 'footstep', delayMs: 300 }]
  },
  'investigation-choice': {
    beats: [{ characterId: 'mira', action: 'walk' }],
    sfx: [
      { event: 'footstep', delayMs: 300 },
      { event: 'water-drip', delayMs: 1600 }
    ]
  },
  'chalk-stair-marks': {
    beats: [{ characterId: 'mira', action: 'gesture-point' }],
    sfx: [{ event: 'water-drip', delayMs: 900 }]
  },
  'climax-door': {
    travelFrom: 'spiral-staircase',
    beats: [
      { characterId: 'mira', action: 'gesture-react' },
      { characterId: 'veyr', action: 'gesture-point' }
    ],
    sfx: [
      { event: 'door-heavy', delayMs: 1400 },
      { event: 'alarm', delayMs: 2900 }
    ]
  },
  'escape-to-torin': {
    beats: [
      { characterId: 'mira', action: 'walk' },
      { characterId: 'torin', action: 'gesture-react' }
    ],
    sfx: [
      { event: 'footstep', delayMs: 200 },
      { event: 'door-heavy', delayMs: 1300 }
    ]
  },
  'sara-warning': {
    beats: [
      { characterId: 'mira', action: 'gesture-react' },
      { characterId: 'ocean', action: 'gesture-react' }
    ],
    sfx: [{ event: 'paper-rustle', delayMs: 900 }]
  },
  'caught-and-questioned': {
    beats: [
      { characterId: 'mira', action: 'gesture-react' },
      { characterId: 'veyr', action: 'gesture-point' }
    ],
    sfx: [
      { event: 'door-heavy', delayMs: 500 },
      { event: 'sonar-ping', delayMs: 1800 }
    ]
  },
  'broadcast-plan': {
    beats: [
      { characterId: 'mira', action: 'gesture-point' },
      { characterId: 'torin', action: 'gesture-nod' }
    ],
    sfx: [
      { event: 'door-open', delayMs: 300 },
      { event: 'paper-rustle', delayMs: 1200 },
      { event: 'broadcast-static', delayMs: 2500 }
    ]
  },
  'blackout-escape': {
    beats: [
      { characterId: 'mira', action: 'walk' },
      { characterId: 'ocean', action: 'gesture-react' },
      { characterId: 'torin', action: 'gesture-point' }
    ],
    sfx: [
      { event: 'alarm', delayMs: 300 },
      { event: 'footstep', delayMs: 800 },
      { event: 'door-heavy', delayMs: 2200 }
    ]
  },
  'leak-and-collapse': {
    beats: [
      { characterId: 'mira', action: 'gesture-point' },
      { characterId: 'veyr', action: 'gesture-react' }
    ],
    sfx: [
      { event: 'paper-rustle', delayMs: 400 },
      { event: 'broadcast-static', delayMs: 1400 },
      { event: 'alarm', delayMs: 2700 }
    ]
  }
};

export function getSceneChoreography(sceneId: string): SceneChoreography {
  return choreography[sceneId] ?? { beats: [] };
}
