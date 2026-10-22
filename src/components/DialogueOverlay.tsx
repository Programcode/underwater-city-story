import type { ReactNode } from 'react';
import { characters } from '../data/characters';
import type { Speaker } from '../types';

type DialogueOverlayProps = {
  speaker: Speaker;
  /** The typed line content (e.g. a TypewriterText). */
  children: ReactNode;
  /** When true the overlay is an advance control; otherwise it is static context. */
  showContinue: boolean;
  onAdvance: () => void;
};

export function DialogueOverlay({ speaker, children, showContinue, onAdvance }: DialogueOverlayProps) {
  const isNarrator = speaker === 'narrator';
  const character = isNarrator ? null : characters[speaker];
  const name = isNarrator ? 'Narrator' : character?.name ?? 'Narrator';

  const inner = (
    <>
      <span className="dialogue__speaker">
        {character ? (
          <span
            className={`dialogue__portrait character-portrait character-portrait--${character.spriteClass}`}
            aria-hidden="true"
          />
        ) : (
          <span className="dialogue__sigil" aria-hidden="true" />
        )}
        <span
          className="dialogue__name"
          style={character ? { color: character.accent } : undefined}
        >
          {name}
        </span>
      </span>

      <p className="dialogue__text">{children}</p>
    </>
  );

  return (
    <div className="dialogue" data-speaker={speaker} aria-label={`${name} dialogue`}>
      {showContinue ? (
        <button type="button" className="dialogue__box" aria-label="Continue" onClick={onAdvance}>
          {inner}
          <span className="dialogue__continue" aria-hidden="true">
            <span className="dialogue__continue-chevron" />
          </span>
        </button>
      ) : (
        <div className="dialogue__box dialogue__box--static">{inner}</div>
      )}
    </div>
  );
}
