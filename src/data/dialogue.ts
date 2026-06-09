import type { DialogueLine, Ending, EndingId, SceneMood, StoryScene, StoryState } from '../types';

/**
 * Line-by-line cinematic dialogue. Each scene is delivered as a sequence of
 * beats spoken by the narrator or by a character. Where a scene has no authored
 * dialogue, the stage falls back to the scene's narration paragraphs.
 */
export const sceneDialogue: Record<string, DialogueLine[]> = {
  'torins-shop': [
    { speaker: 'narrator', text: 'Morning in the Market Levels. Same tin counter. Same fried-fish smell. Same Torin, elbows on the counter like he owns the hour.' },
    { speaker: 'torin', text: 'Tuna sandwich. Extra pickle, like always.' },
    { speaker: 'mira', text: "You're saving my life. Mrs. Rivers is going to murder me if I'm late again.", voice: "[laughs] You're saving my life. Mrs. Rivers is going to murder me if I'm late again." },
    { speaker: 'torin', text: "You hear about the new president? Veyr, apparently. Nobody knew her name yesterday." },
    { speaker: 'mira', text: 'New president?', voice: '[curious] New president?' },
    { speaker: 'narrator', text: 'Then the clock above the stalls catches her eye. Past the hour. Mira grabs the sandwich and runs.' }
  ],
  'school-morning': [
    { speaker: 'narrator', text: 'At Archimedes School, the old portrait is already gone. President Veyr stares down from paint that still looks wet.' },
    { speaker: 'mira', text: "That wasn't there yesterday.", voice: "[whispers] That wasn't there yesterday." },
    { speaker: 'ocean', text: 'Stand up. The anthem.' },
    { speaker: 'veyr', text: 'Citizens of Athel. Your safety has always been my only purpose.', voice: 'Citizens of Athel... Your safety has always been my only purpose.' },
    { speaker: 'narrator', text: "Chairs scrape back. Every student stands under Veyr's painted stare. Then the lights go out, and nobody breathes for a second." }
  ],
  'portrait-observation': [
    { speaker: 'narrator', text: 'In the dark, the painted eyes seem too glossy for canvas.' },
    { speaker: 'mira', text: 'There. A little black bead in the eye. It just caught the light.' },
    { speaker: 'narrator', text: 'It disappears when she shifts sideways. Paint does not do that. Portraits do not blink.' },
    { speaker: 'narrator', text: 'Mrs. Rivers calls her name before Mira can look again, and points her toward the lower levels.' }
  ],
  'ocean-whisper': [
    { speaker: 'ocean', text: 'Mira. That portrait went up before the announcement boards even changed.', voice: '[whispers] Mira. That portrait went up before the announcement boards even changed.' },
    { speaker: 'mira', text: 'Before? You\u2019re sure?' },
    { speaker: 'ocean', text: 'I walked past City Hall this morning. Blank. Then class, and there she is, already framed.' },
    { speaker: 'narrator', text: 'It should mean nothing. In the Tank, that is exactly when Mira starts paying attention.' }
  ],
  'descent-to-engine': [
    { speaker: 'narrator', text: 'The central staircase coils downward, away from the sunlit levels.' },
    { speaker: 'narrator', text: 'The air grows warm, then humid. The light thins to a rusted orange.' },
    { speaker: 'mira', text: 'I am definitely not supposed to be this far down.', voice: '[exhales] I am definitely not supposed to be this far down.' },
    { speaker: 'narrator', text: 'At the bottom: one glowing personnel sign, one shiny handle, and no one around to tell her she picked the wrong door.' }
  ],
  'maintenance-corridor': [
    { speaker: 'narrator', text: 'The scratched arrows are almost invisible unless Mira looks up at them from below.' },
    { speaker: 'mira', text: 'They point away from the repair desk. Toward... that.', voice: 'They point away from the repair desk. [whispers] Toward... that.' },
    { speaker: 'narrator', text: 'A narrow service corridor waits ahead. The air tastes metallic. The engine hum gets into her ribs.' }
  ],
  'radiation-report': [
    { speaker: 'narrator', text: 'The room is empty. On a desk sits a confidential folder: Final Radiation Report C-137.' },
    { speaker: 'mira', text: 'Surface radiation... zero. Zero? That can\u2019t be right.' },
    { speaker: 'narrator', text: 'Every reading says the same impossible thing. The surface is habitable. It has been for years.' },
    { speaker: 'narrator', text: 'Footsteps hit the corridor. Officials. Mira slips out toward the real repair station, carrying the numbers like a fever.' }
  ],
  'return-to-normal': [
    { speaker: 'narrator', text: 'Weeks pass. The report does not fade. It gets into everything ordinary.' },
    { speaker: 'mira', text: 'The poisoned-air lessons. They sound rehearsed now. Like a script.', voice: '[thoughtful] The poisoned-air lessons. They sound rehearsed now. Like a script.' },
    { speaker: 'narrator', text: 'Even the word "ocean" starts to feel staged. A normal word placed where no one is supposed to question it.' }
  ],
  'grayson-room': [
    { speaker: 'narrator', text: "Grayson doesn't understand radiation reports. He understands when his sister has gone too quiet." },
    { speaker: 'mira', text: 'Here. A boat. See? It floats even when everything else sinks.', voice: '[warmly] Here. A boat. See? It floats even when everything else sinks.' },
    { speaker: 'narrator', text: 'She folds it from scrap homework. Grayson laughs. Mira wonders why a child under the sea has never been taught what the sea actually is.' }
  ],
  'sara-disappears': [
    { speaker: 'narrator', text: 'The lights fail again. This time, Mrs. Rivers sends Sara down instead.' },
    { speaker: 'narrator', text: 'The power returns after twenty minutes. Sara does not.' },
    { speaker: 'ocean', text: 'She\u2019ll turn up. People don\u2019t just... vanish.' },
    { speaker: 'narrator', text: 'There is no notice at City Hall. No search party. Just an empty place where Sara should be.' }
  ],
  'city-hall-board': [
    { speaker: 'narrator', text: 'City Hall lists ration changes, curfew reminders, and a fresh lecture on surface safety.' },
    { speaker: 'veyr', text: 'Remember: the air above kills in seconds. The Tank is the mercy that remains.' },
    { speaker: 'mira', text: 'Nothing about Sara. Not one line.' },
    { speaker: 'narrator', text: 'The missing notice feels worse than a lie. At least a lie admits something happened.' }
  ],
  'ocean-walk': [
    { speaker: 'narrator', text: 'Ocean keeps her voice low until the market noise can cover it.' },
    { speaker: 'ocean', text: 'People do not vanish from engine errands, Mira.' },
    { speaker: 'narrator', text: 'Mira says nothing. Ocean hears the answer anyway.' },
    { speaker: 'ocean', text: 'Whatever this is, you are not carrying it alone. Promise me you\u2019ll be careful.' }
  ],
  'investigation-choice': [
    { speaker: 'narrator', text: 'During History of Humanity, Mira asks to use the bathroom and goes down instead.' },
    { speaker: 'narrator', text: 'Past the last civilian level, she stops at a door marked NO ENTRY. Voices murmur on the other side.' },
    { speaker: 'mira', text: 'One more step. Just one.' }
  ],
  'chalk-stair-marks': [
    { speaker: 'mira', text: 'If I have to run, I need to find this place again.' },
    { speaker: 'narrator', text: 'She draws three chalk marks under the railing, low enough that only someone climbing from below would see them.' },
    { speaker: 'narrator', text: 'It is a tiny thing. Still, the corridor feels less like a trap once she has marked a way back.' }
  ],
  'climax-door': [
    { speaker: 'narrator', text: 'Behind the marked door, two officials speak plainly about patched reports and surface readings.' },
    { speaker: 'veyr', text: 'There has been no radiation above for generations. The fear is the only thing keeping them down here.' },
    { speaker: 'mira', text: 'No... no radiation. They made all of it up.' },
    { speaker: 'narrator', text: 'She leans closer, ear to the steel. The door gives, and Mira falls into the room.' }
  ],
  'escape-to-torin': [
    { speaker: 'narrator', text: 'Torin hauls Mira behind a metal door as officials thunder past.' },
    { speaker: 'torin', text: "Quiet. Don't even breathe yet." },
    { speaker: 'mira', text: 'Torin, the reports. The surface is alive. They\u2019ve been lying to everyone.' },
    { speaker: 'torin', text: "I've seen it. Fish that shouldn't exist. Clear sky. Wounds the divers won't explain." },
    { speaker: 'torin', text: "But a rumour won't free anyone. The Tank needs proof it can't argue with." }
  ],
  'sara-warning': [
    { speaker: 'narrator', text: 'Sara comes back to class three days later, pale and bruised, with administrators posted by the door.' },
    { speaker: 'narrator', text: 'She slides a torn scrap of paper beneath the desk.' },
    { speaker: 'mira', text: '"They know you heard them."' },
    { speaker: 'ocean', text: 'Mira, what is that? What did you do?' },
    { speaker: 'narrator', text: 'Mira has proof now. She also knows Veyr is already looking for her.' }
  ],
  'caught-and-questioned': [
    { speaker: 'narrator', text: 'They drag her below the civilian levels, to a windowless room where the deep water presses against her ears.' },
    { speaker: 'veyr', text: 'I will not insult you by denying the reports. You read them. They are accurate.' },
    { speaker: 'mira', text: 'Then why? Why keep everyone down here?' },
    { speaker: 'veyr', text: 'Because the lie is what kept humanity from tearing itself apart again. Stay silent, and your family stays whole.' },
    { speaker: 'narrator', text: 'They return her to the Tank with a rescue story no one believes too loudly. After that, she sees cameras everywhere: portraits, clocks, walls.' }
  ],
  'broadcast-plan': [
    { speaker: 'narrator', text: 'In the abandoned communications room, Torin works the lock while Mira spreads out the reports, the recording, and the surface footage.' },
    { speaker: 'torin', text: 'These cables still run to every screen in the Tank. Old, but alive.' },
    { speaker: 'mira', text: 'Then for once, Veyr doesn\u2019t get to choose who hears the truth.' },
    { speaker: 'narrator', text: 'The broadcast system crackles awake under her hands.' }
  ],
  'blackout-escape': [
    { speaker: 'narrator', text: 'When the next blackout falls, the monitoring logs go dark with it.' },
    { speaker: 'torin', text: 'Keycard\u2019s good for one hatch. We move now or not at all.' },
    { speaker: 'narrator', text: 'Mira reaches the hull inspection point, but guards close in before everyone can pass.' },
    { speaker: 'ocean', text: 'Go! Don\u2019t you dare wait for me. Go!' }
  ],
  'leak-and-collapse': [
    { speaker: 'narrator', text: 'The papers spread faster than any explanation can follow.' },
    { speaker: 'narrator', text: 'Some citizens call the reports liberation. Others call them treason. The Tank starts splitting at the seams.' },
    { speaker: 'veyr', text: 'You have not freed them. You gave them a truth they were never ready to carry.' },
    { speaker: 'mira', text: 'Then we get as many to the surface as we can. Before it all comes apart.' }
  ]
};

/** Cinematic delivery for each ending. */
export const endingDialogue: Record<EndingId, DialogueLine[]> = {
  hopeful: [
    { speaker: 'narrator', text: 'Mira runs before the officials can identify her. Torin hides her, and she tells him everything: the reports, Sara, the confession behind the door.' },
    { speaker: 'torin', text: 'Then we do not panic. We prepare. We bring back something they cannot bury.' },
    { speaker: 'narrator', text: 'She gathers the radiation reports and records President Veyr admitting the truth was buried to keep people obedient.' },
    { speaker: 'narrator', text: 'Torin returns with surface footage: living fish, a clear sky, light no poisoned world could hold.' },
    { speaker: 'mira', text: 'People of Athel, the air above is not death. It never was. Look. Please, just look.' },
    { speaker: 'narrator', text: 'Then an elderly diver removes his helmet at the surface and breathes. After that, the cities cannot pretend they are prisons anymore.' }
  ],
  dark: [
    { speaker: 'narrator', text: 'The door opens too quickly. Mira is restrained, blindfolded, and dragged deeper than any civilian is meant to know exists.' },
    { speaker: 'veyr', text: 'Stay silent, and your family is safe. That is the only choice I am offering you.' },
    { speaker: 'narrator', text: 'She returns to ordinary life beneath cameras hidden in portraits and clocks, planning only during blackouts, when the logs go dark.' },
    { speaker: 'narrator', text: 'The escape fails before everyone can reach the hatch. Ocean is torn away into the dark.' },
    { speaker: 'narrator', text: 'Mira surfaces alone into cold, breathable air. Below her, the glass city still glows, full of people who may never learn the sky was there.' }
  ],
  bittersweet: [
    { speaker: 'narrator', text: 'Mira escapes the engine room and returns to class as if nothing happened. Three days later, Sara appears beside her with a warning.' },
    { speaker: 'narrator', text: 'The papers leak soon after. No one can prove who released them, and that uncertainty becomes the first crack in the Tank.' },
    { speaker: 'narrator', text: 'Some people believe at once. Others scream treason. Schools close. Shops shutter. The hospitals cannot keep up with the riots or the flooding.' },
    { speaker: 'veyr', text: 'The lie preserved order. You have given them only chaos.' },
    { speaker: 'narrator', text: 'By the time the engineers warn the lower levels to evacuate, too many have stopped listening.' },
    { speaker: 'narrator', text: 'Mira and Torin reach the surface with the people who chose freedom. Below, others stay behind. Above, the world is wide, strange, and finally visible.' }
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

const choiceDialogueVariants: Record<string, Array<{ choices: string[]; lines: DialogueLine[] }>> = {
  'school-morning': [
    {
      choices: ['ask-about-veyr'],
      lines: [
        {
          speaker: 'mira',
          text: "Torin said nobody knew Veyr's name yesterday. So why does this portrait look finished?"
        }
      ]
    },
    {
      choices: ['ask-for-notice'],
      lines: [{ speaker: 'narrator', text: "The old notice in Mira's pocket feels heavier than school paper should." }]
    },
    {
      choices: ['wrap-sandwich'],
      lines: [
        {
          speaker: 'narrator',
          text: 'The wrapped sandwich bumps against her bag, one normal thing carried into a room that no longer feels normal.'
        }
      ]
    }
  ],
  'descent-to-engine': [
    {
      choices: ['study-veyr-portrait'],
      lines: [{ speaker: 'mira', text: 'If the portrait was watching, then maybe the stairs are watching too.' }]
    },
    {
      choices: ['whisper-with-ocean'],
      lines: [{ speaker: 'narrator', text: "Ocean's warning follows Mira down each turn of the staircase." }]
    }
  ],
  'investigation-choice': [
    {
      choices: ['check-city-hall-board'],
      lines: [{ speaker: 'mira', text: 'City Hall erased Sara. The door below is where erased things go.' }]
    },
    {
      choices: ['walk-ocean-home', 'promise-ocean-careful'],
      lines: [
        {
          speaker: 'narrator',
          text: "Ocean knows enough to be afraid now, and that makes Mira's next step feel less lonely."
        }
      ]
    },
    {
      choices: ['consider-torin'],
      lines: [{ speaker: 'narrator', text: 'If anyone knows what the lower doors hide, it is Torin.' }]
    }
  ],
  'climax-door': [
    {
      choices: ['mark-stair-turns'],
      lines: [{ speaker: 'narrator', text: 'The chalk marks behind her make the corridor feel survivable, but not safe.' }]
    }
  ],
  'escape-to-torin': [
    {
      choices: ['gather-allies'],
      lines: [{ speaker: 'torin', text: 'Sara and Ocean too? Good. A truth with witnesses is harder to drown.' }]
    },
    {
      choices: ['run-to-torin'],
      lines: [{ speaker: 'torin', text: 'You came straight here. That was smart, Mira. Dangerous, but smart.' }]
    }
  ],
  'broadcast-plan': [
    {
      choices: ['turn-back-for-ocean'],
      lines: [{ speaker: 'ocean', text: 'Next time you try to save me, tell me first. Now show them everything.' }]
    },
    {
      choices: ['return-for-proof'],
      lines: [{ speaker: 'mira', text: 'Reports, recording, footage. No single lie can cover all three.' }]
    }
  ],
  'leak-and-collapse': [
    {
      choices: ['anonymous-papers'],
      lines: [{ speaker: 'narrator', text: 'Because no one knows who leaked the papers, everyone suspects everyone.' }]
    },
    {
      choices: ['leak-now'],
      lines: [{ speaker: 'torin', text: 'Fast was the point. Clean was never going to be possible.' }]
    }
  ],
  'blackout-escape': [
    {
      choices: ['protect-ocean', 'escape-alone'],
      lines: [{ speaker: 'narrator', text: 'Mira has made herself small enough to escape, and lonely enough to hate it.' }]
    },
    {
      choices: ['tell-ocean'],
      lines: [{ speaker: 'ocean', text: 'You should have told me sooner. But I am here now.' }]
    }
  ]
};

function getChoiceVariantLines(sceneId: string, state?: Pick<StoryState, 'selectedChoiceIds'>): DialogueLine[] {
  const selected = new Set(state?.selectedChoiceIds ?? []);
  return (choiceDialogueVariants[sceneId] ?? [])
    .filter((variant) => variant.choices.some((choiceId) => selected.has(choiceId)))
    .flatMap((variant) => variant.lines);
}

/** Returns every conditional dialogue line so offline audio generation can pre-render it. */
export function getChoiceVariantDialogue(): DialogueLine[] {
  return Object.values(choiceDialogueVariants).flatMap((variants) =>
    variants.flatMap((variant) => variant.lines)
  );
}

function withChoiceVariants(
  sceneId: string,
  dialogue: DialogueLine[],
  state?: Pick<StoryState, 'selectedChoiceIds'>
): DialogueLine[] {
  const variants = getChoiceVariantLines(sceneId, state);
  if (!variants.length) return dialogue;
  const insertAt = Math.min(2, dialogue.length);
  return [...dialogue.slice(0, insertAt), ...variants, ...dialogue.slice(insertAt)];
}

/** Returns the cinematic dialogue for a scene, falling back to its paragraphs. */
export function getSceneDialogue(scene: StoryScene, state?: Pick<StoryState, 'selectedChoiceIds'>): DialogueLine[] {
  if (scene.dialogue?.length) {
    return withChoiceVariants(scene.id, scene.dialogue, state);
  }

  const authored = sceneDialogue[scene.id];
  if (authored?.length) {
    return withChoiceVariants(scene.id, authored, state);
  }

  return withChoiceVariants(
    scene.id,
    scene.paragraphs.map((text) => ({ speaker: 'narrator', text })),
    state
  );
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
