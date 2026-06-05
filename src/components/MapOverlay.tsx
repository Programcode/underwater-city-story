import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, MapPin, X } from 'lucide-react';

import { collectiblesById } from '../data/collectibles';
import { mapHotspots } from '../data/mapHotspots';
import { storySceneLabels } from '../data/storyGraph';
import type { MapHotspot, StoryState } from '../types';

const MAP_WIDTH = 5632;
const MAP_HEIGHT = 3072;

const levelLabels: Record<MapHotspot['level'], string> = {
  surface: 'Surface',
  top: 'Top Level',
  upper: 'Upper Residences',
  market: 'Market Levels',
  middle: 'Mid Levels',
  lower: 'Lower Levels',
  engine: 'Engine Depths'
};

type MapOverlayProps = {
  open: boolean;
  storyState: StoryState;
  onClose: () => void;
  reduced: boolean;
};

export function MapOverlay({ open, storyState, onClose, reduced }: MapOverlayProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset the selection each time the map is reopened (keyed remount in App).
  const active = activeId ? mapHotspots.find((spot) => spot.id === activeId) ?? null : null;
  const discovered = new Set(storyState.discoveredHotspotIds);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="worldmap-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="World map of Athel"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4 }}
        >
          <header className="worldmap__head">
            <div className="worldmap__title-group">
              <Compass size={22} aria-hidden="true" />
              <div>
                <p className="worldmap__eyebrow">Cross-section atlas</p>
                <h2 className="worldmap__title">The World of Athel</h2>
              </div>
            </div>
            <button type="button" className="worldmap__return" onClick={onClose}>
              <X size={18} aria-hidden="true" />
              <span>Return to the story</span>
            </button>
          </header>

          <div className="worldmap__body">
            <motion.div
              className="worldmap__frame"
              style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
              initial={reduced ? false : { scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: 'easeOut' }}
            >
              <img
                src="/assets/map.jpg"
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                alt="Full illustrated cross-section map of the underwater city of Athel"
                className="worldmap__image"
                draggable={false}
              />

              {mapHotspots.map((spot) => {
                const isActive = spot.id === activeId;
                const isDiscovered = discovered.has(spot.id);
                return (
                  <button
                    type="button"
                    key={spot.id}
                    className={`worldmap-pin worldmap-pin--${spot.animation} ${
                      isActive ? 'worldmap-pin--active' : ''
                    } ${isDiscovered ? 'worldmap-pin--found' : ''}`}
                    style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                    aria-pressed={isActive}
                    aria-label={`Show lore for ${spot.title}`}
                    onClick={() => setActiveId(spot.id)}
                  >
                    <span className="worldmap-pin__dot" aria-hidden="true" />
                    <span className="worldmap-pin__label">{spot.title}</span>
                  </button>
                );
              })}
            </motion.div>

            <aside className="worldmap__panel" aria-label="Place details">
              {active ? (
                <article className="worldmap-lore" key={active.id}>
                  <div className="worldmap-lore__tags">
                    <span className="worldmap-lore__level">{levelLabels[active.level]}</span>
                    {discovered.has(active.id) ? (
                      <span className="worldmap-lore__found">Visited in your story</span>
                    ) : (
                      <span className="worldmap-lore__unseen">Not yet visited</span>
                    )}
                  </div>
                  <h3>{active.title}</h3>
                  <p className="worldmap-lore__subtitle">{active.subtitle}</p>

                  <div className="worldmap-lore__body">
                    {active.lore.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>

                  <div className="worldmap-lore__section">
                    <h4>Where it appears</h4>
                    <div className="worldmap-lore__chips">
                      {active.storySceneIds.map((sceneId) => (
                        <span key={sceneId}>{storySceneLabels[sceneId] ?? sceneId}</span>
                      ))}
                    </div>
                  </div>

                  {active.collectibleIds?.length ? (
                    <div className="worldmap-lore__section">
                      <h4>Found here</h4>
                      <div className="worldmap-lore__chips">
                        {active.collectibleIds.map((id) => (
                          <span key={id}>{collectiblesById[id]?.title ?? id}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              ) : (
                <div className="worldmap-lore worldmap-lore--empty">
                  <MapPin size={26} aria-hidden="true" />
                  <h3>Chart the city</h3>
                  <p>
                    Tap any brass marker to read the lore of that place — from the sunlit Glass Dome
                    down to the Engine Depths. Glowing markers are places Mira has already reached.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
