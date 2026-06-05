import { useEffect, useRef } from 'react';

import { getCharactersForScene } from '../data/characters';
import { endings, getScene } from '../data/storyGraph';
import type { StoryState } from '../types';
import { ChoiceButton } from './ChoiceButton';
import { EndingPanel } from './EndingPanel';

type StoryGameProps = {
  state: StoryState;
  onChoose: (choiceId: string) => void;
  onRestart: () => void;
};

export function StoryGame({ state, onChoose, onRestart }: StoryGameProps) {
  const storyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const scrollParent = storyRef.current?.closest('.story-region');

    if (scrollParent instanceof HTMLElement) {
      scrollParent.scrollTo({ top: 0 });
    }
  }, [state.currentSceneId, state.endingId]);

  if (state.endingId) {
    return <EndingPanel ending={endings[state.endingId]} traits={state.traits} onRestart={onRestart} />;
  }

  const scene = getScene(state.currentSceneId);
  const sceneCharacters = getCharactersForScene(scene.id);

  return (
    <article className="story-game" aria-label="Narrator dialogue" ref={storyRef}>
      <div className="story-game__meta">
        <span>Narrator</span>
        <span>Act {actForVisitedCount(state.visitedSceneIds.length)}</span>
        {scene.isClimax ? <span>The Climax</span> : null}
      </div>

      <div className="character-cameos" aria-label="Character cameos">
        {sceneCharacters.map((character) => (
          <div className="character-cameo" key={character.id}>
            <span
              className={`character-portrait character-portrait--${character.spriteClass}`}
              aria-hidden="true"
            />
            <span>
              <strong>{character.name}</strong>
              <small>{character.role}</small>
            </span>
          </div>
        ))}
      </div>

      <h2>{scene.title}</h2>

      <div className="story-game__copy">
        {scene.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="story-game__choices" aria-label="Story choices">
        {scene.choices.map((choice) => {
          const disabled =
            Boolean(choice.requiresDiscoveredHotspot) &&
            !state.discoveredHotspotIds.includes(choice.requiresDiscoveredHotspot as string);

          return (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              disabled={disabled}
              onChoose={onChoose}
            />
          );
        })}
      </div>
    </article>
  );
}

function actForVisitedCount(count: number) {
  if (count <= 2) {
    return 'I: Routine';
  }

  if (count <= 5) {
    return 'II: Suspicion';
  }

  if (count <= 8) {
    return 'III: The Door';
  }

  return 'IV: Consequences';
}
