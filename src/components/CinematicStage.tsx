import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getCharactersForScene } from '../data/characters';
import { getSceneDialogue, getSceneMood } from '../data/dialogue';
import { getHotspot } from '../data/mapHotspots';
import type { Narration } from '../hooks/useNarration';
import type { Focus } from '../lib/camera';
import type { StoryScene, StoryState } from '../types';
import { ChoiceLayer } from './ChoiceLayer';
import { DialogueOverlay } from './DialogueOverlay';
import { MapCamera } from './MapCamera';
import { StageControls } from './StageControls';
import { TypewriterText, type TypewriterHandle } from './TypewriterText';

type CinematicStageProps = {
  scene: StoryScene;
  storyState: StoryState;
  onChoose: (choiceId: string) => void;
  onOpenAtlas: () => void;
  onOpenMap: () => void;
  narration: Narration;
  reduced: boolean;
};

function actLabel(visitedCount: number): string {
  if (visitedCount <= 2) return 'Act I · Routine';
  if (visitedCount <= 5) return 'Act II · Suspicion';
  if (visitedCount <= 8) return 'Act III · The Door';
  return 'Act IV · Consequences';
}

const DEFAULT_FOCUS: Focus = { x: 49, y: 48 };

export function CinematicStage({
  scene,
  storyState,
  onChoose,
  onOpenAtlas,
  onOpenMap,
  narration,
  reduced
}: CinematicStageProps) {
  const dialogue = useMemo(() => getSceneDialogue(scene), [scene]);
  const characters = useMemo(() => getCharactersForScene(scene.id), [scene.id]);
  const mood = scene.mood ?? getSceneMood(scene.id);
  const zoom = scene.cameraZoom ?? 1.95;

  const focus = useMemo<Focus>(() => {
    if (!scene.locationHotspotId) return DEFAULT_FOCUS;
    const hotspot = getHotspot(scene.locationHotspotId);
    return { x: hotspot.xPercent, y: hotspot.yPercent };
  }, [scene.locationHotspotId]);

  // This component is remounted per scene (keyed by scene id in App), so line
  // state always starts fresh here.
  const [lineIndex, setLineIndex] = useState(0);
  const [lineDone, setLineDone] = useState(false);
  const [choicesShown, setChoicesShown] = useState(false);
  const typeRef = useRef<TypewriterHandle>(null);

  const currentLine = dialogue[Math.min(lineIndex, dialogue.length - 1)];
  const isLastLine = lineIndex >= dialogue.length - 1;

  // Voice the current line and warm up the next one.
  const speak = narration.speak;
  const prefetchNext = narration.prefetchNext;
  useEffect(() => {
    const line = dialogue[Math.min(lineIndex, dialogue.length - 1)];
    speak(line.speaker, line.text);
    const next = dialogue[lineIndex + 1];
    if (next) prefetchNext(next.speaker, next.text);
  }, [dialogue, lineIndex, speak, prefetchNext]);

  const advance = useCallback(() => {
    if (choicesShown) return;
    if (!lineDone) {
      typeRef.current?.skip();
      return;
    }
    if (lineIndex < dialogue.length - 1) {
      setLineIndex((index) => index + 1);
      setLineDone(false);
      return;
    }
    setChoicesShown(true);
  }, [choicesShown, lineDone, lineIndex, dialogue]);

  // Reveal the choices a beat after the final line finishes typing.
  useEffect(() => {
    if (choicesShown || !isLastLine || !lineDone) return;
    const timer = window.setTimeout(() => setChoicesShown(true), reduced ? 0 : 480);
    return () => window.clearTimeout(timer);
  }, [choicesShown, isLastLine, lineDone, reduced]);

  // Keyboard advance: space / enter / right arrow.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (choicesShown) return;
      if (event.key === ' ' || event.key === 'Enter' || event.key === 'ArrowRight') {
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === 'BUTTON' || target.closest('button'))) return;
        event.preventDefault();
        advance();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, choicesShown]);

  return (
    <section className="cinematic-stage" data-testid="cinematic-map-stage" data-mood={mood}>
      <MapCamera
        focus={focus}
        zoom={zoom}
        mood={mood}
        characters={characters}
        speaker={currentLine.speaker}
        reduced={reduced}
      />

      {!choicesShown ? (
        <button type="button" className="advance-zone" aria-label="Continue" tabIndex={-1} onClick={advance} />
      ) : null}

      <div className="letterbox letterbox--top" aria-hidden="true" />
      <div className="letterbox letterbox--bottom" aria-hidden="true" />

      <header className="scene-marker">
        <span className="scene-marker__act">{actLabel(storyState.visitedSceneIds.length)}</span>
        <span className="scene-marker__title">{scene.title}</span>
      </header>

      <StageControls onOpenMap={onOpenMap} onOpenAtlas={onOpenAtlas} narration={narration} />

      <div className="stage-foot">
        <DialogueOverlay speaker={currentLine.speaker} showContinue={!choicesShown} onAdvance={advance}>
          <TypewriterText
            key={`${scene.id}-${lineIndex}`}
            ref={typeRef}
            text={currentLine.text}
            instant={reduced}
            onDone={() => setLineDone(true)}
          />
        </DialogueOverlay>
        <ChoiceLayer
          choices={scene.choices}
          discoveredHotspotIds={storyState.discoveredHotspotIds}
          visible={choicesShown}
          onChoose={onChoose}
          reduced={reduced}
        />
      </div>
    </section>
  );
}
