import type { DialogueLine, Ending, EndingId, SceneMood, StoryScene } from '../types';

/**
 * Line-by-line cinematic dialogue. Each scene is delivered as a sequence of
 * beats spoken by the narrator or by a character. Where a scene has no authored
 * dialogue, the stage falls back to the scene's narration paragraphs.
 */
export const sceneDialogue: Record<string, DialogueLine[]> = {
  'torins-shop': [
    { speaker: 'narrator', text: 'Morning, in the Market Levels. The same tin counter, the same smell of fried fish, the same Torin leaning over it.' },
    { speaker: 'torin', text: 'Tuna sandwich. Extra pickle, like always.' },
    { speaker: 'mira', text: "You're a lifesaver. I'm so late, Mrs. Rivers will have my head." },
    { speaker: 'torin', text: "Heard the news? The Tank's got a new president. Veyr, they're calling her. Came out of nowhere." },
    { speaker: 'mira', text: 'New president?' },
    { speaker: 'narrator', text: 'But the clock above the stalls is already past the hour. Mira grabs the sandwich and bolts for the stairs.' }
  ],
  'school-morning': [
    { speaker: 'narrator', text: 'By the time she reaches Archimedes School, the old portrait is gone. President Veyr watches the classroom from paint that still looks wet.' },
    { speaker: 'mira', text: "That wasn't there yesterday." },
    { speaker: 'ocean', text: 'Stand up. The anthem.' },
    { speaker: 'veyr', text: 'Citizens of Athel. Your safety has always been my only purpose.' },
    { speaker: 'narrator', text: "Every student rises beneath Veyr's painted stare. Then the fluorescent lights die, and the room drops into a sudden hush." }
  ],
  'portrait-observation': [
    { speaker: 'narrator', text: 'In the dark, the painted eyes seem too glossy for canvas.' },
    { speaker: 'mira', text: 'There it is again. A little black bead, right in the eye. It catches the light.' },
    { speaker: 'narrator', text: 'It vanishes the moment she shifts sideways. A portrait should not blink.' },
    { speaker: 'narrator', text: 'Then Mrs. Rivers calls her name and points toward the lower levels.' }
  ],
  'ocean-whisper': [
    { speaker: 'ocean', text: 'Mira. That portrait went up before the announcement boards even changed.' },
    { speaker: 'mira', text: 'Before? You\u2019re sure?' },
    { speaker: 'ocean', text: 'I walked past City Hall this morning. Blank. Then class, and there she is, already framed.' },
    { speaker: 'narrator', text: 'The detail should be nothing. In the Tank, details are usually how the adults hide the important things.' }
  ],
  'descent-to-engine': [
    { speaker: 'narrator', text: 'The central staircase coils downward, away from the sunlit levels.' },
    { speaker: 'narrator', text: 'The air grows warm, then humid. The light thins to a rusted orange.' },
    { speaker: 'mira', text: 'I am definitely not supposed to be this far down.' },
    { speaker: 'narrator', text: 'At the bottom she finds only a glowing personnel sign and a reflective handle waiting in the gloom.' }
  ],
  'maintenance-corridor': [
    { speaker: 'narrator', text: 'The scratched arrows are almost invisible \u2014 unless Mira looks up at them from below.' },
    { speaker: 'mira', text: 'They point away from the repair desk. Toward... that.' },
    { speaker: 'narrator', text: 'A narrower service corridor. The air tastes of metal, and the engine vibration moves through the walls like a second pulse.' }
  ],
  'radiation-report': [
    { speaker: 'narrator', text: 'The room is empty. On a desk sits a confidential folder: Final Radiation Report C-137.' },
    { speaker: 'mira', text: 'Surface radiation... zero. Zero? That can\u2019t be right.' },
    { speaker: 'narrator', text: 'Every reading says the same impossible thing. The surface is habitable. It has been for years.' },
    { speaker: 'narrator', text: 'Footsteps in the corridor. Officials. Mira slips away toward the proper repair station, the numbers burning behind her eyes.' }
  ],
  'return-to-normal': [
    { speaker: 'narrator', text: 'Weeks pass. But the report keeps bending the shape of ordinary life.' },
    { speaker: 'mira', text: 'The poisoned-air lessons. They sound rehearsed now. Like a script.' },
    { speaker: 'narrator', text: 'The word "ocean" starts to feel like something hidden in plain sight \u2014 a door everyone has agreed not to open.' }
  ],
  'grayson-room': [
    { speaker: 'narrator', text: "Grayson doesn't understand radiation reports. He understands when his sister has gone too quiet." },
    { speaker: 'mira', text: 'Here. A boat. See? It floats even when everything else sinks.' },
    { speaker: 'narrator', text: 'She folds it from scrap homework and wonders why a child in an underwater city has never been allowed to learn what an ocean really is.' }
  ],
  'sara-disappears': [
    { speaker: 'narrator', text: 'The lights fail again. This time, Mrs. Rivers sends Sara down instead.' },
    { speaker: 'narrator', text: 'The power returns after twenty minutes. Sara does not.' },
    { speaker: 'ocean', text: 'She\u2019ll turn up. People don\u2019t just... vanish.' },
    { speaker: 'narrator', text: 'No notice at City Hall. No search. The silence where Sara should be feels planned.' }
  ],
  'city-hall-board': [
    { speaker: 'narrator', text: 'City Hall lists ration changes, curfew reminders, and a fresh lecture on surface safety.' },
    { speaker: 'veyr', text: 'Remember: the air above ends life in seconds. The Tank is the only mercy left to humanity.' },
    { speaker: 'mira', text: 'Nothing about Sara. Not one line.' },
    { speaker: 'narrator', text: 'The blank space where her name should be feels more deliberate than careless.' }
  ],
  'ocean-walk': [
    { speaker: 'narrator', text: 'Ocean keeps her voice low until the market noise can cover it.' },
    { speaker: 'ocean', text: 'People do not vanish from engine errands, Mira.' },
    { speaker: 'narrator', text: 'Mira says nothing. Ocean hears the answer anyway.' },
    { speaker: 'ocean', text: 'Whatever this is \u2014 you\u2019re not carrying it alone. Promise me you\u2019ll be careful.' }
  ],
  'investigation-choice': [
    { speaker: 'narrator', text: 'During History of Humanity, Mira asks to use the bathroom \u2014 and goes down instead.' },
    { speaker: 'narrator', text: 'Past the last civilian level, she stops at a door marked NO ENTRY. Voices murmur on the other side.' },
    { speaker: 'mira', text: 'One more step. Just one.' }
  ],
  'chalk-stair-marks': [
    { speaker: 'mira', text: 'If I have to run, I need to find this place again.' },
    { speaker: 'narrator', text: 'She draws three pale chalk marks under the railing, where only someone climbing from below would ever see them.' },
    { speaker: 'narrator', text: 'The tiny act makes the forbidden corridor feel less like a trap, and more like a route.' }
  ],
  'climax-door': [
    { speaker: 'narrator', text: 'Behind the marked door, two officials speak plainly about patched reports and surface readings.' },
    { speaker: 'veyr', text: 'There has been no radiation above for generations. The fear is the only thing keeping them down here.' },
    { speaker: 'mira', text: 'No... no radiation. None of it was ever real.' },
    { speaker: 'narrator', text: 'She leans closer, ear against the steel. The door gives way \u2014 and Mira falls into the room.' }
  ],
  'escape-to-torin': [
    { speaker: 'narrator', text: 'Torin hauls Mira behind a metal door as officials thunder past.' },
    { speaker: 'torin', text: "Quiet. Don't even breathe yet." },
    { speaker: 'mira', text: 'Torin, the reports \u2014 the surface, it\u2019s alive. They\u2019ve been lying to all of us.' },
    { speaker: 'torin', text: "I've seen it. Fish that shouldn't exist. Clear sky. Wounds the divers won't explain." },
    { speaker: 'torin', text: "But a rumour won't free anyone. The Tank needs proof it can't argue with." }
  ],
  'sara-warning': [
    { speaker: 'narrator', text: 'Sara returns to class three days later \u2014 pale, bruised, watched by administrators at the door.' },
    { speaker: 'narrator', text: 'She slides a torn scrap of paper beneath the desk.' },
    { speaker: 'mira', text: '"They know you heard them."' },
    { speaker: 'ocean', text: 'Mira, what is that? What did you do?' },
    { speaker: 'narrator', text: 'Mira has her proof now. She also knows Veyr is already hunting for her.' }
  ],
  'caught-and-questioned': [
    { speaker: 'narrator', text: 'They drag her below the civilian levels, to a windowless room where the deep water presses against her ears.' },
    { speaker: 'veyr', text: 'I will not insult you by denying the reports. You read them. They are accurate.' },
    { speaker: 'mira', text: 'Then why? Why keep everyone down here?' },
    { speaker: 'veyr', text: 'Because the lie is the only thing that has stopped humanity from destroying itself again. Stay silent, and your family stays whole.' },
    { speaker: 'narrator', text: 'She is returned to the Tank under a false rescue story. But now she sees the cameras \u2014 in portraits, in clocks, in walls.' }
  ],
  'broadcast-plan': [
    { speaker: 'narrator', text: 'In the abandoned communications room, Torin works the lock while Mira lays out the reports, the recording, the surface footage.' },
    { speaker: 'torin', text: 'These cables still run to every screen in the Tank. Old, but alive.' },
    { speaker: 'mira', text: 'Then for once, Veyr doesn\u2019t get to choose who hears the truth.' },
    { speaker: 'narrator', text: 'The broadcast system crackles awake under her hands.' }
  ],
  'blackout-escape': [
    { speaker: 'narrator', text: 'When the next blackout falls, the monitoring logs go dark with it.' },
    { speaker: 'torin', text: 'Keycard\u2019s good for one hatch. We move now or not at all.' },
    { speaker: 'narrator', text: 'Mira reaches the hull inspection point \u2014 but guards are already closing in before everyone can pass.' },
    { speaker: 'ocean', text: 'Go! Don\u2019t you dare wait for me \u2014 go!' }
  ],
  'leak-and-collapse': [
    { speaker: 'narrator', text: 'The papers spread faster than any explanation can follow.' },
    { speaker: 'narrator', text: 'Some citizens call the reports liberation. Others call them treason. The Tank begins to split from the inside out.' },
    { speaker: 'veyr', text: 'You have not freed them. You have drowned them in a truth they were never ready to hold.' },
    { speaker: 'mira', text: 'Then we get as many to the surface as we can. Before it all comes apart.' }
  ]
};

/** Cinematic delivery for each ending. */
export const endingDialogue: Record<EndingId, DialogueLine[]> = {
  hopeful: [
    { speaker: 'narrator', text: 'Mira runs before the officials can name her. Torin hides her, and she tells him everything \u2014 the reports, Sara, the confession behind the door.' },
    { speaker: 'torin', text: 'Then we don\u2019t panic. We prepare. We bring back something they cannot bury.' },
    { speaker: 'narrator', text: 'She gathers the radiation reports and records President Veyr admitting the truth was buried to keep humanity obedient.' },
    { speaker: 'narrator', text: 'Torin returns with surface footage: living fish, a clear sky, light no poisoned world could hold.' },
    { speaker: 'mira', text: 'People of Athel \u2014 the air above is not death. It never was. Look. Just look.' },
    { speaker: 'narrator', text: 'When an elderly diver removes his helmet at the surface and simply breathes, the story changes forever. The cities become places of survival, not prisons.' }
  ],
  dark: [
    { speaker: 'narrator', text: 'The door opens too quickly. Mira is restrained, blindfolded, and dragged deeper than any civilian is meant to know exists.' },
    { speaker: 'veyr', text: 'Stay silent, and your family is safe. That is the only choice I am offering you.' },
    { speaker: 'narrator', text: 'She returns to ordinary life beneath cameras hidden in portraits and clocks, planning only during blackouts, when the logs go dark.' },
    { speaker: 'narrator', text: 'The escape fails before everyone can reach the hatch. Ocean is torn away into the dark.' },
    { speaker: 'narrator', text: 'Mira surfaces alone into cold, breathable air. Below her, the glass city still glows \u2014 full of people who may never learn the sky was waiting.' }
  ],
  bittersweet: [
    { speaker: 'narrator', text: 'Mira escapes the engine room and returns to class as if nothing happened. Three days later, Sara appears beside her with a warning.' },
    { speaker: 'narrator', text: 'The papers leak soon after. No one can prove who released them, and that uncertainty becomes the first crack in the Tank.' },
    { speaker: 'narrator', text: 'Some believe at once. Others scream treason. Schools close, shops shutter, and the hospitals cannot keep pace with the riots and the flooding.' },
    { speaker: 'veyr', text: 'The lie preserved order. You have given them only chaos.' },
    { speaker: 'narrator', text: 'By the time the engineers warn the lower levels to evacuate, too many have stopped listening.' },
    { speaker: 'narrator', text: 'Mira and Torin reach the surface with those who chose freedom. Below, others remain. Above, the world is beautiful, uncertain, and no longer hidden.' }
  ]
};

/** Mood tint applied to the stage for each scene. */
export const sceneMood: Record<string, SceneMood> = {
  'torins-shop': 'calm',
  'school-morning': 'tense',
  'portrait-observation': 'secret',
  'ocean-whisper': 'tense',
  'descent-to-engine': 'descent',
  'maintenance-corridor': 'descent',
  'radiation-report': 'secret',
  'return-to-normal': 'tense',
  'grayson-room': 'calm',
  'sara-disappears': 'tense',
  'city-hall-board': 'tense',
  'ocean-walk': 'tense',
  'investigation-choice': 'secret',
  'chalk-stair-marks': 'descent',
  'climax-door': 'danger',
  'escape-to-torin': 'danger',
  'sara-warning': 'danger',
  'caught-and-questioned': 'danger',
  'broadcast-plan': 'hope',
  'blackout-escape': 'danger',
  'leak-and-collapse': 'danger'
};

const endingMood: Record<EndingId, SceneMood> = {
  hopeful: 'hope',
  dark: 'danger',
  bittersweet: 'tense'
};

/** Returns the cinematic dialogue for a scene, falling back to its paragraphs. */
export function getSceneDialogue(scene: StoryScene): DialogueLine[] {
  if (scene.dialogue?.length) {
    return scene.dialogue;
  }

  const authored = sceneDialogue[scene.id];
  if (authored?.length) {
    return authored;
  }

  return scene.paragraphs.map((text) => ({ speaker: 'narrator', text }));
}

/** Returns the cinematic dialogue for an ending, falling back to its paragraphs. */
export function getEndingDialogue(ending: Ending): DialogueLine[] {
  if (ending.dialogue?.length) {
    return ending.dialogue;
  }

  const authored = endingDialogue[ending.id];
  if (authored?.length) {
    return authored;
  }

  return ending.paragraphs.map((text) => ({ speaker: 'narrator', text }));
}

export function getSceneMood(sceneId: string): SceneMood {
  return sceneMood[sceneId] ?? 'calm';
}

export function getEndingMood(endingId: EndingId): SceneMood {
  return endingMood[endingId];
}
