import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { getHotspot } from '../data/mapHotspots';
import type { StoryState } from '../types';
import { Journal } from './Journal';

type AtlasProps = {
  open: boolean;
  storyState: StoryState;
  onClose: () => void;
  reduced: boolean;
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
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
