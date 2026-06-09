import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';

import { characters } from '../data/characters';
import { endings, getProjectedEnding } from '../data/storyGraph';
import { getHotspot } from '../data/mapHotspots';
import { achievements } from '../lib/achievements';
import { readProgress } from '../lib/progress';
import type { CharacterId, EndingId, StoryState } from '../types';
import { Journal } from './Journal';

type AtlasProps = {
  open: boolean;
  storyState: StoryState;
  onClose: () => void;
  reduced: boolean;
};

const castOrder: CharacterId[] = ['mira', 'ocean', 'torin', 'veyr'];

const trajectoryCopy: Record<EndingId, string> = {
  hopeful: 'Mira is building enough proof, trust, and public support to reveal the truth with control.',
  bittersweet: 'The truth is moving faster than Mira can organise people around it.',
  dark: 'Mira is still too isolated, underprepared, or exposed to free the Tank safely.'
};

export function Atlas({ open, storyState, onClose, reduced }: AtlasProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const discoveredPlaces = storyState.discoveredHotspotIds.map((id) => getHotspot(id));
  const unlocked = new Set(readProgress().achievements);
  const projectedEndingId = getProjectedEnding(storyState);
  const projectedEnding = endings[projectedEndingId];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="atlas-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="The atlas of Athel"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.35 }}
          onClick={onClose}
        >
          <motion.div
            className="atlas"
            onClick={(event) => event.stopPropagation()}
            initial={reduced ? false : { opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: reduced ? 0 : 0.4, ease: 'easeOut' }}
          >
            <div className="atlas__head">
              <div>
                <p className="atlas__eyebrow">Field atlas · charted as you go</p>
                <h2 className="atlas__title">The Atlas of Athel</h2>
              </div>
              <button type="button" className="atlas__close" onClick={onClose} aria-label="Close the atlas">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="atlas__body">
              <Journal state={storyState} />

              <section className={`atlas__trajectory atlas__trajectory--${projectedEndingId}`} aria-label="Ending trajectory">
                <div>
                  <p className="atlas__trajectory-eyebrow">Current trajectory</p>
                  <h3>Ending trajectory</h3>
                </div>
                <div className="atlas__trajectory-body">
                  <p className="atlas__trajectory-title">{projectedEnding.title}</p>
                  <p>{trajectoryCopy[projectedEndingId]}</p>
                  {!storyState.endingId ? (
                    <p className="atlas__trajectory-note">This can still change with later choices.</p>
                  ) : null}
                </div>
              </section>

              <section className="atlas__places" aria-label="Charted places">
                <h3>Charted places</h3>
                {discoveredPlaces.length > 0 ? (
                  <div className="atlas__places-list">
                    {discoveredPlaces.map((place) => (
                      <article className="atlas__place" key={place.id}>
                        <h4>{place.title}</h4>
                        <p className="atlas__place-subtitle">{place.subtitle}</p>
                        {place.lore.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="atlas__empty">No places charted yet.</p>
                )}
              </section>

              <section className="atlas__cast" aria-label="Cast">
                <h3>The cast</h3>
                <div className="atlas__cast-list">
                  {castOrder.map((id) => {
                    const character = characters[id];
                    return (
                      <article className="cast-card" key={character.id}>
                        <span
                          className={`cast-card__portrait character-portrait character-portrait--${character.spriteClass}`}
                          style={{ ['--accent' as string]: character.accent }}
                          aria-hidden="true"
                        />
                        <div className="cast-card__text">
                          <h4>{character.name}</h4>
                          <p className="cast-card__epithet">{character.epithet}</p>
                          <p className="cast-card__bio">{character.bio}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="atlas__achievements" aria-label="Achievements">
                <h3>
                  Achievements <span className="atlas__count">{unlocked.size} / {achievements.length}</span>
                </h3>
                <div className="atlas__achievement-list">
                  {achievements.map((achievement) => {
                    const isUnlocked = unlocked.has(achievement.id);
                    return (
                      <article
                        className={`achievement-card ${isUnlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}`}
                        key={achievement.id}
                      >
                        <div className="achievement-card__icon" aria-hidden="true">
                          {isUnlocked ? '★' : <Lock size={14} />}
                        </div>
                        <div>
                          <h4>{achievement.title}</h4>
                          <p>{achievement.description}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
