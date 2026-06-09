import type { Ending, EndingId, StoryScene, StoryState, TraitKey } from '../types';
import { mapHotspots } from './mapHotspots';
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
      'Torin mentions the Tank has a new president. Mira barely has time to ask before she sees the clock and bolts for school.'
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
        description: 'Let the rumor follow Mira upstairs.',
        nextSceneId: 'school-morning'
      },
      {
        id: 'ask-for-notice',
        label: 'Ask Torin for the old administration notice',
        description: 'Pocket a small clue about how quickly Veyr appeared.',
        nextSceneId: 'school-morning',
        collectibleIds: ['veyr-succession-notice']
      },
      {
        id: 'wrap-sandwich',
        label: 'Wrap the sandwich for later',
        description: 'Keep one ordinary thing close before the day turns strange.',
        nextSceneId: 'school-morning',
        collectibleIds: ['tuna-sandwich']
      }
    ]
  },
  {
    id: 'school-morning',
    title: 'The New Portrait',
    locationHotspotId: 'archimedes-school',
    paragraphs: [
      introCopy[1],
      'Every student stands for the anthem beneath Veyr\'s painted stare. Then the fluorescent lights die, and the classroom goes silent.'
    ],
    choices: [
      {
        id: 'accept-engine-errand',
        label: 'Go to the engine room',
        description: 'Mrs. Rivers sends Mira because she knows the lower levels.',
        nextSceneId: 'descent-to-engine'
      },
      {
        id: 'study-veyr-portrait',
        label: 'Study the new portrait',
        description: 'Notice one detail in Veyr\'s painted eyes before the blackout spreads.',
        nextSceneId: 'portrait-observation'
      },
      {
        id: 'whisper-with-ocean',
        label: 'Whisper with Ocean',
        description: 'Trade one worried observation before Mrs. Rivers notices Mira.',
        nextSceneId: 'ocean-whisper'
      }
    ]
  },
  {
    id: 'portrait-observation',
    title: 'The Painted Eyes',
    locationHotspotId: 'archimedes-school',
    collectibleIds: ['glossy-portrait-detail'],
    paragraphs: [
      'The painted eyes seem too glossy for canvas. A tiny black bead catches the fluorescent light and disappears when Mira shifts sideways.',
      'Before she can stare too long, Mrs. Rivers calls her name and points toward the lower levels.'
    ],
    choices: [
      {
        id: 'step-forward-after-portrait',
        label: 'Step forward for the engine errand',
        description: 'Leave the portrait behind, but not the feeling of being watched.',
        nextSceneId: 'descent-to-engine'
      }
    ]
  },
  {
    id: 'ocean-whisper',
    title: "Ocean's Warning",
    locationHotspotId: 'archimedes-school',
    collectibleIds: ['ocean-whisper'],
    paragraphs: [
      'Ocean leans close and whispers that the portrait was installed before the announcement boards changed.',
      'It should mean nothing. In the Tank, that is when Mira starts paying attention.'
    ],
    choices: [
      {
        id: 'answer-mrs-rivers',
        label: 'Answer Mrs. Rivers',
        description: 'Take the errand before Ocean can ask why Mira looks scared.',
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
      'The stairs coil through warmer air and thinner light. By the bottom, Mira can only see a glowing personnel sign and a reflective handle.'
    ],
    choices: [
      {
        id: 'enter-wrong-room',
        label: 'Enter the marked room',
        description: 'The door looks official enough to be the engine room.',
        nextSceneId: 'radiation-report'
      },
      {
        id: 'trace-maintenance-arrows',
        label: 'Trace the maintenance arrows',
        description: 'Follow the scratched symbols along the rail before choosing a door.',
        nextSceneId: 'maintenance-corridor',
        collectibleIds: ['maintenance-arrow-rubbing']
      }
    ]
  },
  {
    id: 'maintenance-corridor',
    title: 'The Marked Corridor',
    locationHotspotId: 'spiral-staircase',
    paragraphs: [
      'The arrows are almost invisible unless Mira looks from below. They point away from the public repair desk and toward a narrower service corridor.',
      'The air tastes metallic here, and the engine hum moves through the walls and into her chest.'
    ],
    choices: [
      {
        id: 'push-through-service-door',
        label: 'Push through the service door',
        description: 'Take the route the arrows were hiding.',
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
      'Officials arrive before she can make sense of it. Mira slips away to the correct repair station.'
    ],
    choices: [
      {
        id: 'hide-the-memory',
        label: 'Try to forget the report',
        description: 'Return to class with the secret buried in the back of Mira\'s mind.',
        nextSceneId: 'return-to-normal'
      },
      {
        id: 'pocket-loose-page',
        label: 'Pocket one loose report page',
        description: 'Take one page before the officials arrive.',
        nextSceneId: 'return-to-normal',
        collectibleIds: ['radiation-page']
      },
      {
        id: 'copy-the-numbers',
        label: 'Copy the radiation numbers as class formulas',
        description: 'Hide proof in a place that looks like schoolwork.',
        nextSceneId: 'return-to-normal',
        collectibleIds: ['coded-radiation-notes']
      }
    ]
  },
  {
    id: 'return-to-normal',
    title: 'A Secret That Will Not Stay Quiet',
    locationHotspotId: 'industrial-core',
    paragraphs: [
      'Weeks pass, but the report keeps changing ordinary life.',
      'The lessons about poisoned air sound rehearsed. The word ocean starts to feel staged, like something everyone agreed not to question.'
    ],
    choices: [
      {
        id: 'watch-for-patterns',
        label: 'Watch for another blackout',
        description: 'Mira waits for a pattern before accusing anyone.',
        nextSceneId: 'sara-disappears'
      },
      {
        id: 'make-grayson-paper-boat',
        label: 'Fold Grayson a paper boat',
        description: 'Turn the numbers over in Mira\'s head while pretending to play.',
        nextSceneId: 'grayson-room'
      }
    ]
  },
  {
    id: 'grayson-room',
    title: "Grayson's Paper Boat",
    collectibleIds: ['grayson-paper-boat'],
    paragraphs: [
      'Grayson does not understand radiation reports, but he understands when Mira is too quiet.',
      'She folds him a paper boat from scrap homework and wonders why a child in an underwater city has never been allowed to learn what an ocean really is.'
    ],
    choices: [
      {
        id: 'wait-for-school-pattern',
        label: 'Wait for school to reveal a pattern',
        description: 'Return to routine and watch what the adults do next.',
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
      },
      {
        id: 'check-city-hall-board',
        label: 'Check the City Hall board',
        description: 'Look for a public notice about Sara before trusting the silence.',
        nextSceneId: 'city-hall-board'
      },
      {
        id: 'walk-ocean-home',
        label: 'Walk Ocean home',
        description: 'Let Ocean say what everyone else is afraid to ask.',
        nextSceneId: 'ocean-walk'
      }
    ]
  },
  {
    id: 'city-hall-board',
    title: 'The Blank Board',
    locationHotspotId: 'upper-residences',
    collectibleIds: ['city-hall-silence'],
    paragraphs: [
      'City Hall lists ration changes, curfew reminders, and a lecture about surface safety.',
      'There is no notice about Sara. The blank space where her name should be feels more deliberate than careless.'
    ],
    choices: [
      {
        id: 'leave-city-hall',
        label: 'Leave before an administrator notices',
        description: 'Carry the silence back into the school corridors.',
        nextSceneId: 'investigation-choice'
      }
    ]
  },
  {
    id: 'ocean-walk',
    title: 'Ocean Asks the Real Question',
    locationHotspotId: 'market-levels',
    collectibleIds: ['ocean-whisper'],
    paragraphs: [
      'Ocean keeps her voice low until the market noise covers it.',
      '“People do not vanish from engine errands,” she says. Mira says nothing, and Ocean hears the answer anyway.'
    ],
    choices: [
      {
        id: 'promise-ocean-careful',
        label: 'Promise Ocean to be careful',
        description: 'Keep Ocean close without telling her everything yet.',
        nextSceneId: 'investigation-choice',
        effects: { trust: 1 }
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
      },
      {
        id: 'mark-stair-turns',
        label: 'Mark the stair turns with chalk',
        description: 'Make sure Mira can find this place again if she has to run.',
        nextSceneId: 'chalk-stair-marks',
        collectibleIds: ['chalk-stair-mark']
      }
    ]
  },
  {
    id: 'chalk-stair-marks',
    title: 'Three Chalk Marks',
    locationHotspotId: 'spiral-staircase',
    paragraphs: [
      'Mira draws three pale marks under the railing where only someone climbing from below would see them.',
      'It is not much, but the corridor feels less like a trap once she has marked a way back.'
    ],
    choices: [
      {
        id: 'follow-chalk-to-door',
        label: 'Follow the marks to the door',
        description: 'Use the route and listen.',
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
      'He admits he has seen life above: fish, plants, clear sky, and wounds that were not caused by maintenance.',
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
    collectibleIds: ['sara-warning-note'],
    paragraphs: [
      'Sara returns to class pale, silent, and watched by administrators.',
      'She slides a note under the desk: They know you heard them.',
      'Mira has proof, but now she also knows Veyr is looking for her.'
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
    collectibleIds: ['communications-manual'],
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
        effects: { evidence: 1, trust: 1, collective: 1 },
        collectibleIds: ['surface-footage']
      },
      {
        id: 'broadcast-before-ready',
        label: 'Broadcast before officials arrive',
        description: 'Get the truth out fast, even if people do not know what to do next.',
        nextSceneId: 'ending',
        effects: { evidence: 1, collective: 2, risk: 2 },
        collectibleIds: ['surface-footage']
      }
    ]
  },
  {
    id: 'blackout-escape',
    title: 'The Blackout Route',
    locationHotspotId: 'surface-dome',
    collectibleIds: ['stolen-keycard'],
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
      'Some citizens call the reports liberation. Others call them treason. The Tank starts splitting at the seams.'
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

export type ChoiceCatalogEntry = {
  label: string;
  description: string;
  fromSceneId: string;
  nextSceneId: string;
};

/** Lookup of every choice by id, used to reconstruct the player's path. */
export const choiceCatalog: Record<string, ChoiceCatalogEntry> = Object.fromEntries(
  storyScenes.flatMap((scene) =>
    scene.choices.map((choice) => [
      choice.id,
      {
        label: choice.label,
        description: choice.description,
        fromSceneId: scene.id,
        nextSceneId: choice.nextSceneId
      }
    ])
  )
) as Record<string, ChoiceCatalogEntry>;

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

export function getProjectedEnding(state: Pick<StoryState, 'endingId' | 'traits'>): EndingId {
  return state.endingId ?? resolveEnding(state.traits);
}

export function createInitialStoryState(): StoryState {
  return {
    currentSceneId: 'torins-shop',
    traits: { ...initialTraits },
    visitedSceneIds: ['torins-shop'],
    discoveredHotspotIds: ['market-levels'],
    collectedItemIds: ['tuna-sandwich'],
    selectedChoiceIds: [],
    endingId: null
  };
}

export function addCollectedItems(currentIds: string[], newIds: string[] = []): string[] {
  return [...new Set([...currentIds, ...newIds])];
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
  const choiceCollectedItemIds = addCollectedItems(state.collectedItemIds, choice.collectibleIds);

  if (choice.nextSceneId === 'ending') {
    return {
      ...state,
      traits,
      collectedItemIds: choiceCollectedItemIds,
      selectedChoiceIds,
      endingId: resolveEnding(traits)
    };
  }

  const nextScene = getScene(choice.nextSceneId);
  const discoveredHotspotIds = new Set(state.discoveredHotspotIds);
  let collectedItemIds = addCollectedItems(choiceCollectedItemIds, nextScene.collectibleIds);

  if (nextScene.locationHotspotId) {
    const wasDiscovered = discoveredHotspotIds.has(nextScene.locationHotspotId);
    discoveredHotspotIds.add(nextScene.locationHotspotId);

    if (!wasDiscovered) {
      const hotspot = mapHotspots.find((candidate) => candidate.id === nextScene.locationHotspotId);
      collectedItemIds = addCollectedItems(collectedItemIds, hotspot?.collectibleIds);
    }
  }

  return {
    ...state,
    currentSceneId: nextScene.id,
    traits,
    visitedSceneIds: [...state.visitedSceneIds, nextScene.id],
    discoveredHotspotIds: [...discoveredHotspotIds],
    collectedItemIds,
    selectedChoiceIds
  };
}
