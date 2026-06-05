import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RotateCcw } from 'lucide-react';

import { characters } from '../data/characters';
import { getEndingDialogue, getEndingMood } from '../data/dialogue';
import { getHotspot } from '../data/mapHotspots';
import type { Narration } from '../hooks/useNarration';
import { arrangeActors, type Focus } from '../lib/camera';
import type { CharacterId, Ending, TraitKey } from '../types';
import { Actor } from './Actor';
import { DialogueOverlay } from './DialogueOverlay';
import { StageControls } from './StageControls';
import { TypewriterText, type TypewriterHandle } from './TypewriterText';

type EndingSceneProps = {
  ending: Ending;
  traits: Record<TraitKey, number>;
  onRestart: () => void;
  onOpenAtlas: () => void;
  onOpenMap: () => void;
  narration: Narration;
  reduced: boolean;
};

const traitLabels: Record<TraitKey, string> = {
  evidence: 'Evidence gathered',
  trust: 'Allies trusted',
  risk: 'Reckless pressure',
  collective: 'Public support'
};

function endingReason(traits: Record<TraitKey, number>): string {
  if (traits.evidence >= 3 && traits.trust >= 2 && traits.collective >= 2 && traits.risk <= 2) {
    return 'Mira had enough proof, enough allies, and enough control to reveal the truth without losing the Tank to panic.';
  }
  if (traits.evidence >= 2 && traits.collective >= 2) {
    return 'The truth spread widely, but it moved faster than Mira could organise people around it.';
  }
  return 'Mira was forced into an isolated escape before she could build public proof or a trusted network.';
}

const MAP_WIDTH = 5632;
const MAP_HEIGHT = 3072;

export function EndingScene({
  ending,
  traits,
  onRestart,
  onOpenAtlas,
  onOpenMap,
  narration,
  reduced
}: EndingSceneProps) {
  const dialogue = useMemo(() => getEndingDialogue(ending), [ending]);
  const mood = ending.mood ?? getEndingMood(ending.id);
  const zoom = 1.55;

  const focus = useMemo<Focus>(() => {
    const hotspotId = ending.locationHotspotId ?? 'surface-dome';
    const hotspot = getHotspot(hotspotId);
    return { x: hotspot.xPercent, y: hotspot.yPercent };
  }, [ending.locationHotspotId]);

  const cast = useMemo(() => {
    const speakers = dialogue
      .map((line) => line.speaker)
      .filter((speaker): speaker is CharacterId => speaker !== 'narrator');
    const unique = Array.from(new Set<CharacterId>(['mira', ...speakers]));
    return unique.map((id) => characters[id]);
  }, [dialogue]);

  const actors = arrangeActors(cast, focus);

  const [lineIndex, setLineIndex] = useState(0);
  const [lineDone, setLineDone] = useState(false);
  const [finaleShown, setFinaleShown] = useState(false);
  const typeRef = useRef<TypewriterHandle>(null);

  const currentLine = dialogue[Math.min(lineIndex, dialogue.length - 1)];
  const isLastLine = lineIndex >= dialogue.length - 1;

  const speak = narration.speak;
  const prefetchNext = narration.prefetchNext;
  useEffect(() => {
    if (finaleShown) return;
    const line = dialogue[Math.min(lineIndex, dialogue.length - 1)];
    speak(line.speaker, line.text);
    const next = dialogue[lineIndex + 1];
    if (next) prefetchNext(next.speaker, next.text);
  }, [dialogue, lineIndex, finaleShown, speak, prefetchNext]);

  const advance = () => {
    if (finaleShown) return;
    if (!lineDone) {
      typeRef.current?.skip();
      return;
    }
    if (lineIndex < dialogue.length - 1) {
      setLineIndex((index) => index + 1);
      setLineDone(false);
      return;
    }
    setFinaleShown(true);
  };

  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });

  useEffect(() => {
    if (finaleShown || !isLastLine || !lineDone) return;
    const timer = window.setTimeout(() => setFinaleShown(true), reduced ? 0 : 700);
    return () => window.clearTimeout(timer);
  }, [finaleShown, isLastLine, lineDone, reduced]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === ' ' || event.key === 'Enter' || event.key === 'ArrowRight') {
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === 'BUTTON' || target.closest('button'))) return;
        event.preventDefault();
        advanceRef.current();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const someoneSpeaking = currentLine.speaker !== 'narrator';

  return (
    <section className={`ending-stage ending-stage--${ending.id}`} data-testid="ending-stage" data-mood={mood}>
      <div className="map-camera-frame" data-mood={mood}>
        <div className="map-camera" style={{ transform: `scale(${zoom})` }}>
          <div className={`map-camera__drift ${reduced ? 'is-still' : ''}`}>
            <img
              src="/assets/map.jpg"
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              alt="Illustrated old map of the underwater city of Athel"
              className="map-image"
              draggable={false}
            />
            {!finaleShown
              ? actors.map((staged) => (
                  <Actor
                    key={staged.character.id}
                    character={staged.character}
                    x={staged.x}
                    y={staged.y}
                    zoom={zoom}
                    speaking={currentLine.speaker === staged.character.id}
                    someoneSpeaking={someoneSpeaking}
                    reduced={reduced}
                  />
                ))
              : null}
          </div>
        </div>
        <div className="map-mood" data-mood={mood} aria-hidden="true" />
        <div className="map-vignette" aria-hidden="true" />
        <div className="map-grain" aria-hidden="true" />
      </div>

      <div className="letterbox letterbox--top" aria-hidden="true" />
      <div className="letterbox letterbox--bottom" aria-hidden="true" />

      <StageControls onOpenMap={onOpenMap} onOpenAtlas={onOpenAtlas} narration={narration} />

      {!finaleShown ? (
        <>
          <button type="button" className="advance-zone" aria-label="Continue" tabIndex={-1} onClick={advance} />
          <div className="stage-foot">
            <DialogueOverlay speaker={currentLine.speaker} showContinue onAdvance={advance}>
              <TypewriterText
                key={`${ending.id}-${lineIndex}`}
                ref={typeRef}
                text={currentLine.text}
                instant={reduced}
                onDone={() => setLineDone(true)}
              />
            </DialogueOverlay>
          </div>
        </>
      ) : (
        <motion.article
          className={`finale-card finale-card--${ending.id}`}
          initial={reduced ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.9, ease: 'easeOut' }}
          aria-label="Ending"
        >
          <p className="finale-card__tone">{ending.tone}</p>
          <h2 className="finale-card__title">{ending.title}</h2>
          <p className="finale-card__summary">{ending.summary}</p>

          <section className="finale-card__why" aria-label="Why this ending happened">
            <h3>Why the city turned this way</h3>
            <p>{endingReason(traits)}</p>
            <dl>
              {(Object.entries(traits) as Array<[TraitKey, number]>).map(([trait, value]) => (
                <div key={trait}>
                  <dt>{traitLabels[trait]}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="finale-card__actions">
            <button type="button" className="finale-button finale-button--primary" onClick={onRestart}>
              <RotateCcw size={18} aria-hidden="true" />
              <span>Restart story</span>
            </button>
            <button type="button" className="finale-button" onClick={onOpenAtlas}>
              <BookOpen size={18} aria-hidden="true" />
              <span>Open the atlas</span>
            </button>
          </div>
        </motion.article>
      )}
    </section>
  );
}
