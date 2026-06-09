import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RotateCcw } from 'lucide-react';

import { characters } from '../data/characters';
import { getEndingDialogue, getEndingMood } from '../data/dialogue';
import { getHotspot } from '../data/mapHotspots';
import { choiceCatalog, storySceneLabels } from '../data/storyGraph';
import type { Ambience } from '../hooks/useAmbience';
import type { Narration } from '../hooks/useNarration';
import { achievementsById, evaluateAchievements } from '../lib/achievements';
import { arrangeActors, type Focus } from '../lib/camera';
import { readProgress } from '../lib/progress';
import type { CharacterId, Ending, StoryState, TraitKey } from '../types';
import { Actor } from './Actor';
import { DialogueLineView, type DialogueLineHandle } from './DialogueLineView';
import { DialogueOverlay } from './DialogueOverlay';
import { StageControls } from './StageControls';

type EndingSceneProps = {
  ending: Ending;
  storyState: StoryState;
  onRestart: () => void;
  onOpenAtlas: () => void;
  onOpenMap: () => void;
  narration: Narration;
  ambience: Ambience;
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
  storyState,
  onRestart,
  onOpenAtlas,
  onOpenMap,
  narration,
  ambience,
  reduced
}: EndingSceneProps) {
  const traits = storyState.traits;
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
  const [voicing, setVoicing] = useState(false);
  const lineRef = useRef<DialogueLineHandle>(null);

  const currentLine = dialogue[Math.min(lineIndex, dialogue.length - 1)];
  const isLastLine = lineIndex >= dialogue.length - 1;

  const speak = narration.speak;
  const prefetchNext = narration.prefetchNext;
  const voiced = narration.enabled && (narration.configured || narration.localAvailable);
  useEffect(() => {
    if (finaleShown || !voiced) return;
    const next = dialogue[lineIndex + 1];
    if (next) prefetchNext(next.speaker, next.text);
  }, [dialogue, lineIndex, finaleShown, voiced, prefetchNext]);

  const advance = () => {
    if (finaleShown) return;
    if (!lineDone) {
      lineRef.current?.skip();
      return;
    }
    if (lineIndex < dialogue.length - 1) {
      setLineIndex((index) => index + 1);
      setLineDone(false);
      setVoicing(false);
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

  // The path of meaningful choices the player made this run.
  const pathSteps = storyState.selectedChoiceIds
    .map((id) => choiceCatalog[id])
    .filter(Boolean)
    .map((entry) => ({
      label: entry.label,
      to: entry.nextSceneId === 'ending' ? ending.title : storySceneLabels[entry.nextSceneId] ?? entry.nextSceneId
    }));

  // Achievements satisfied by this finished run.
  const earnedAchievements = evaluateAchievements({
    state: storyState,
    endingsSeen: readProgress().endingsSeen
  })
    .map((id) => achievementsById[id])
    .filter(Boolean);

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
                    voicing={voicing && currentLine.speaker === staged.character.id}
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

      <StageControls onOpenMap={onOpenMap} onOpenAtlas={onOpenAtlas} narration={narration} ambience={ambience} />

      {!finaleShown ? (
        <>
          <button type="button" className="advance-zone" aria-label="Continue" tabIndex={-1} onClick={advance} />
          <div className="stage-foot">
            <DialogueOverlay speaker={currentLine.speaker} showContinue onAdvance={advance}>
              <DialogueLineView
                key={`${ending.id}-${lineIndex}`}
                ref={lineRef}
                speaker={currentLine.speaker}
                text={currentLine.text}
                voiced={voiced}
                instant={reduced}
                speak={speak}
                onDone={() => setLineDone(true)}
                onVoicingChange={setVoicing}
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

          <section className="finale-card__path" aria-label="The path you walked">
            <h3>The path you walked</h3>
            <ol className="finale-path">
              {pathSteps.map((stepItem, index) => (
                <li key={`${stepItem.label}-${index}`}>
                  <span className="finale-path__choice">{stepItem.label}</span>
                  <span className="finale-path__to">{stepItem.to}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="finale-card__achievements" aria-label="Achievements earned">
            <h3>Achievements earned</h3>
            {earnedAchievements.length > 0 ? (
              <ul className="finale-achievements">
                {earnedAchievements.map((achievement) => (
                  <li key={achievement.id}>
                    <strong>{achievement.title}</strong>
                    <span>{achievement.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="finale-achievements__empty">No achievements this run — try another path.</p>
            )}
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
