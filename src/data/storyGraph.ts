import type { Ending, EndingId, StoryScene, StoryState, TraitKey } from '../types';
import {
  bittersweetEndingCopy,
  climaxCopy,
  darkEndingCopy,
  hopefulEndingCopy,
  introCopy
} from './sourceCopy';

export const initialTraits: Record<TraitKey, number> = {
  evidence: 0,
  trust: 0,
  risk: 0,
  collective: 0
};

export const endings: Record<EndingId, Ending> = {
  hopeful: {
    id: 'hopeful',
    title: 'Hopeful Ending',
    tone: 'Truth with preparation',
    summary: 'Mira and Torin expose undeniable proof, and the Tank begins a careful ascent into freedom.',
    paragraphs: hopefulEndingCopy
  },
  dark: {
    id: 'dark',
    title: 'Dark Ending',
    tone: 'Escape without liberation',
    summary: 'Mira reaches the surface alone while the Tank remains trapped beneath Veyr\'s lie.',
    paragraphs: darkEndingCopy
  },
  bittersweet: {
    id: 'bittersweet',
    title: 'Bittersweet Ending',
    tone: 'Truth without control',
    summary: 'The lie collapses, but the Tank fractures before freedom can become safety.',
    paragraphs: bittersweetEndingCopy
  }
};

export const storyScenes: StoryScene[] = [
  {
    id: 'torins-shop',
    title: "Torin's Shop",
    locationHotspotId: 'market-levels',
    paragraphs: [
      introCopy[0],
      'Torin mentions that the Tank has a new president. Mira barely has time to react before she notices the clock and bolts toward school.'
    ],
    choices: [
      {
        id: 'rush-to-school',
        label: 'Grab the sandwich and run',
        description: 'Stay in the routine Mira knows.',
        nextSceneId: 'school-morning'
      },
      {
        id: 'ask-about-veyr',
        label: 'Ask Torin about Veyr',
        description: 'Let the rumor linger as Mira heads upstairs.',
        nextSceneId: 'school-morning'
      }
    ]
  },
  {
    id: 'school-morning',
    title: 'The New Portrait',
    locationHotspotId: 'archimedes-school',
    paragraphs: [
      introCopy[1],
      'Every student stands for the anthem beneath Veyr\'s painted stare. Then the fluorescent lights die, leaving the classroom in a sudden hush.'
    ],
    choices: [
      {
        id: 'accept-engine-errand',
        label: 'Go to the engine room',
        description: 'Mrs. Rivers sends Mira because she knows the lower levels.',
        nextSceneId: 'descent-to-engine'
      }
    ]
  },
  {
    id: 'descent-to-engine',
    title: 'Down the Spiral',
    locationHotspotId: 'spiral-staircase',
    paragraphs: [
      introCopy[2],
      'The stairs coil through warmer air and thinning light. By the bottom, Mira can only see a glowing personnel sign and a reflective handle.'
    ],
    choices: [
      {
        id: 'enter-wrong-room',
        label: 'Enter the marked room',
        description: 'The door looks official enough to be the engine room.',
        nextSceneId: 'radiation-report'
      }
    ]
  },
  {
    id: 'radiation-report',
    title: 'Final Radiation Report C-137',
    locationHotspotId: 'engine-room',
    paragraphs: [
      'The room is empty. On a desk, Mira finds a confidential folder titled Final Radiation Report C-137.',
      'Every reading says the same impossible thing: radiation levels are zero. The surface is habitable.',
      'Officials arrive before she can understand what she has seen, and Mira slips away to the correct repair station.'
    ],
    choices: [
      {
        id: 'hide-the-memory',
        label: 'Try to forget the report',
        description: 'Return to class with the secret buried in the back of Mira\'s mind.',
        nextSceneId: 'return-to-normal'
      }
    ]
  },
  {
    id: 'return-to-normal',
    title: 'A Secret That Will Not Stay Quiet',
    locationHotspotId: 'industrial-core',
    paragraphs: [
      'Weeks pass, but the report keeps changing the shape of ordinary life.',
      'The lessons about poisoned air sound rehearsed. The word ocean starts to feel like something hidden in plain sight.'
    ],
    choices: [
      {
        id: 'watch-for-patterns',
        label: 'Watch for another blackout',
        description: 'Mira waits for a pattern instead of making a reckless accusation.',
        nextSceneId: 'sara-disappears'
      }
    ]
  },
  {
    id: 'sara-disappears',
    title: "Sara's Empty Desk",
    locationHotspotId: 'archimedes-school',
    paragraphs: [
      'The lights fail again, and this time Mrs. Rivers sends Sara.',
      'The power returns after twenty minutes. Sara does not.',
      'No announcement appears at City Hall. No search notice follows. The silence feels planned.'
    ],
    choices: [
      {
        id: 'investigate-alone',
        label: 'Investigate alone',
        description: 'Keep Ocean safe by carrying the secret yourself.',
        nextSceneId: 'investigation-choice'
      },
      {
        id: 'consider-torin',
        label: 'Think of Torin',
        description: 'The diver may understand what the reports mean.',
        nextSceneId: 'investigation-choice'
      }
    ]
  },
  {
    id: 'investigation-choice',
    title: 'The Door Below',
    locationHotspotId: 'spiral-staircase',
    paragraphs: [
      'During History of Humanity, Mira asks to use the bathroom and heads down instead.',
      'She passes the last civilian area and stops at a door marked NO ENTRY. Voices speak on the other side.'
    ],
    choices: [
      {
        id: 'listen-at-door',
        label: 'Listen at the door',
        description: 'Risk one more step toward the truth.',
        nextSceneId: 'climax-door'
      }
    ]
  },
  {
    id: 'climax-door',
    title: 'No Radiation',
    locationHotspotId: 'engine-room',
    paragraphs: climaxCopy,
    choices: [
      {
        id: 'run-to-torin',
        label: 'Run to Torin',
        description: 'Trust the diver and turn the truth into a plan.',
        nextSceneId: 'escape-to-torin',
        effects: { trust: 1, collective: 1, risk: 1 }
      },
      {
        id: 'stay-and-record',
        label: 'Hide and record more',
        description: 'Gather proof, even if waiting could expose Mira.',
        nextSceneId: 'sara-warning',
        effects: { evidence: 1, risk: 1 }
      },
      {
        id: 'freeze-in-the-room',
        label: 'Freeze as the door opens',
        description: 'The officials see Mira before she can run.',
        nextSceneId: 'caught-and-questioned',
        effects: { risk: 2 }
      }
    ],
    isClimax: true
  },
  {
    id: 'escape-to-torin',
    title: 'Torin Believes Her',
    locationHotspotId: 'market-levels',
    paragraphs: [
      'Torin hides Mira while officials thunder past the door.',
      'He admits he has seen signs of life above: fish, plants, clear sky, and wounds that were not caused by maintenance.',
      'Mira understands that a rumor will not be enough. The Tank needs proof.'
    ],
    choices: [
      {
        id: 'return-for-proof',
        label: 'Return for reports and a recording',
        description: 'Build a case strong enough to survive panic.',
        nextSceneId: 'broadcast-plan',
        effects: { evidence: 2, trust: 1, risk: 1 }
      },
      {
        id: 'leak-now',
        label: 'Leak the report now',
        description: 'Move before Veyr can erase the evidence.',
        nextSceneId: 'leak-and-collapse',
        effects: { evidence: 1, collective: 2, risk: 2 }
      },
      {
        id: 'protect-ocean',
        label: 'Keep Ocean out of it',
        description: 'Protect one friend by narrowing the escape.',
        nextSceneId: 'blackout-escape',
        effects: { trust: -1, collective: -1, risk: 2 }
      }
    ]
  },
  {
    id: 'sara-warning',
    title: "Sara's Warning",
    locationHotspotId: 'archimedes-school',
    paragraphs: [
      'Sara returns to class pale, silent, and watched by administrators.',
      'She slides a note under the desk: They know you heard them.',
      'Mira has proof, but now she also knows Veyr is already hunting for her.'
    ],
    choices: [
      {
        id: 'gather-allies',
        label: 'Bring Sara and Ocean to Torin',
        description: 'Make the truth harder to isolate.',
        nextSceneId: 'escape-to-torin',
        effects: { trust: 1, collective: 1, risk: 1 }
      },
      {
        id: 'anonymous-papers',
        label: 'Leak the papers anonymously',
        description: 'Let the whole Tank see the lie before anyone can stop it.',
        nextSceneId: 'leak-and-collapse',
        effects: { evidence: 1, collective: 2, risk: 2 }
      }
    ]
  },
  {
    id: 'caught-and-questioned',
    title: 'Below the Civilian Levels',
    locationHotspotId: 'top-level',
    paragraphs: [
      'Mira is dragged to a windowless room and left with the pressure of deep water in her ears.',
      'President Veyr does not deny the reports. She says the lie prevents humanity from destroying itself.',
      'Mira is returned to the Tank under a false rescue story, but now she sees cameras everywhere.'
    ],
    choices: [
      {
        id: 'tell-ocean',
        label: 'Tell Ocean in a stairwell',
        description: 'Risk trusting one person before the next blackout.',
        nextSceneId: 'blackout-escape',
        effects: { trust: 1, collective: 1, risk: 1 }
      },
      {
        id: 'escape-alone',
        label: 'Plan alone',
        description: 'Move without giving Veyr another target.',
        nextSceneId: 'blackout-escape',
        effects: { trust: -1, collective: -1, risk: 2 }
      }
    ]
  },
  {
    id: 'broadcast-plan',
    title: 'The Abandoned Communications Room',
    locationHotspotId: 'communications-room',
    paragraphs: [
      'Torin picks the lock while Mira gathers the reports, a recording, and surface footage.',
      'The old broadcast system crackles awake. For the first time, Veyr cannot control who hears the truth.'
    ],
    choices: [
      {
        id: 'broadcast-everything',
        label: 'Broadcast every piece of proof',
        description: 'Show reports, Veyr\'s admission, and Torin\'s surface footage together.',
        nextSceneId: 'ending',
        effects: { evidence: 1, trust: 1, collective: 1 }
      },
      {
        id: 'broadcast-before-ready',
        label: 'Broadcast before officials arrive',
        description: 'Get the truth out fast, even if people do not know what to do next.',
        nextSceneId: 'ending',
        effects: { evidence: 1, collective: 2, risk: 2 }
      }
    ]
  },
  {
    id: 'blackout-escape',
    title: 'The Blackout Route',
    locationHotspotId: 'surface-dome',
    paragraphs: [
      'During the next blackout, monitoring logs go dark.',
      'Mira reaches the hull inspection point with a stolen keycard, but guards close in before everyone can pass.'
    ],
    choices: [
      {
        id: 'go-alone',
        label: 'Use the hatch alone',
        description: 'Take the only opening left.',
        nextSceneId: 'ending',
        effects: { risk: 2, collective: -1 }
      },
      {
        id: 'turn-back-for-ocean',
        label: 'Turn back for Ocean',
        description: 'Delay escape long enough to keep one ally in the plan.',
        nextSceneId: 'broadcast-plan',
        effects: { evidence: 1, trust: 1, collective: 1, risk: 1 }
      }
    ]
  },
  {
    id: 'leak-and-collapse',
    title: 'The Leak',
    locationHotspotId: 'surface-dome',
    paragraphs: [
      'The papers spread faster than explanations can follow.',
      'Some citizens call the reports liberation. Others call them treason. The Tank begins to split from the inside out.'
    ],
    choices: [
      {
        id: 'lead-the-resistance',
        label: 'Lead people toward the surface',
        description: 'Push forward through confusion and fear.',
        nextSceneId: 'ending',
        effects: { evidence: 1, collective: 1, risk: 1 }
      },
      {
        id: 'organize-evacuation',
        label: 'Organize the evacuation first',
        description: 'Try to slow the panic before the lower levels flood.',
        nextSceneId: 'ending',
        effects: { trust: 1, collective: 1, risk: -1 }
      }
    ]
  }
];

export const storySceneLabels = Object.fromEntries(
  storyScenes.map((scene) => [scene.id, scene.title])
) as Record<string, string>;

export function getScene(id: string): StoryScene {
  const scene = storyScenes.find((candidate) => candidate.id === id);

  if (!scene) {
    throw new Error(`Unknown story scene: ${id}`);
  }

  return scene;
}

export function resolveEnding(traits: Record<TraitKey, number>): EndingId {
  if (traits.evidence >= 3 && traits.trust >= 2 && traits.collective >= 2 && traits.risk <= 2) {
    return 'hopeful';
  }

  if (traits.evidence >= 2 && traits.collective >= 2) {
    return 'bittersweet';
  }

  return 'dark';
}

export function createInitialStoryState(): StoryState {
  return {
    currentSceneId: 'torins-shop',
    traits: { ...initialTraits },
    visitedSceneIds: ['torins-shop'],
    discoveredHotspotIds: ['market-levels'],
    selectedChoiceIds: [],
    endingId: null
  };
}

export function applyTraitEffects(
  traits: Record<TraitKey, number>,
  effects: Partial<Record<TraitKey, number>> = {}
): Record<TraitKey, number> {
  return {
    evidence: Math.max(0, traits.evidence + (effects.evidence ?? 0)),
    trust: Math.max(0, traits.trust + (effects.trust ?? 0)),
    risk: Math.max(0, traits.risk + (effects.risk ?? 0)),
    collective: Math.max(0, traits.collective + (effects.collective ?? 0))
  };
}

export function applyChoice(state: StoryState, choiceId: string): StoryState {
  if (state.endingId) {
    return state;
  }

  const scene = getScene(state.currentSceneId);
  const choice = scene.choices.find((candidate) => candidate.id === choiceId);

  if (!choice) {
    throw new Error(`Unknown choice "${choiceId}" for scene "${scene.id}"`);
  }

  if (
    choice.requiresDiscoveredHotspot &&
    !state.discoveredHotspotIds.includes(choice.requiresDiscoveredHotspot)
  ) {
    throw new Error(`Choice "${choiceId}" requires hotspot "${choice.requiresDiscoveredHotspot}"`);
  }

  const traits = applyTraitEffects(state.traits, choice.effects);
  const selectedChoiceIds = [...state.selectedChoiceIds, choice.id];

  if (choice.nextSceneId === 'ending') {
    return {
      ...state,
      traits,
      selectedChoiceIds,
      endingId: resolveEnding(traits)
    };
  }

  const nextScene = getScene(choice.nextSceneId);
  const discoveredHotspotIds = new Set(state.discoveredHotspotIds);

  if (nextScene.locationHotspotId) {
    discoveredHotspotIds.add(nextScene.locationHotspotId);
  }

  return {
    ...state,
    currentSceneId: nextScene.id,
    traits,
    visitedSceneIds: [...state.visitedSceneIds, nextScene.id],
    discoveredHotspotIds: [...discoveredHotspotIds],
    selectedChoiceIds
  };
}
