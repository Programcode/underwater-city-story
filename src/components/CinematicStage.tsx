import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getCharactersForScene } from '../data/characters';
import { getSceneChoreography, type ChoreographyAction } from '../data/choreography';
import { getSceneDialogue, getSceneMood } from '../data/dialogue';
import type { Narration } from '../hooks/useNarration';
import type { Ambience } from '../hooks/useAmbience';
import type { Sfx } from '../hooks/useSfx';
import { getSceneFocus } from '../lib/stageFocus';
import type { CharacterId, StoryScene, StoryState } from '../types';
import { ChoiceLayer } from './ChoiceLayer';
import { DialogueLineView, type DialogueLineHandle } from './DialogueLineView';
import { DialogueOverlay } from './DialogueOverlay';
import { MapCamera } from './MapCamera';
import { StageControls } from './StageControls';

type CinematicStageProps = {
  scene: StoryScene;
  storyState: StoryState;
  onChoose: (choiceId: string) => void;
  onOpenAtlas: () => void;
  onOpenMap: () => void;
  narration: Narration;
  ambience: Ambience;
  sfx: Sfx;
  reduced: boolean;
};

function actLabel(visitedCount: number): string {
  if (visitedCount <= 2) return 'Act I · Routine';
  if (visitedCount <= 5) return 'Act II · Suspicion';
  if (visitedCount <= 8) return 'Act III · The Door';
  return 'Act IV · Consequences';
}

export function CinematicStage({
  scene,
  storyState,
  onChoose,
  onOpenAtlas,
  onOpenMap,
  narration,
  ambience,
  sfx,
  reduced
}: CinematicStageProps) {
  const dialogue = useMemo(() => getSceneDialogue(scene, storyState), [scene, storyState]);
  const characters = useMemo(() => getCharactersForScene(scene.id), [scene.id]);
  const sceneChoreography = useMemo(() => getSceneChoreography(scene.id), [scene.id]);
  const actorActions = useMemo<Partial<Record<CharacterId, ChoreographyAction>>>(() => {
    const actions: Partial<Record<CharacterId, ChoreographyAction>> = {};
    sceneChoreography.beats.forEach((beat) => {
      actions[beat.characterId] = beat.action ?? 'idle';
    });
    return actions;
  }, [sceneChoreography]);
  const mood = scene.mood ?? getSceneMood(scene.id);
  const zoom = scene.cameraZoom ?? 1.95;

  const focus = useMemo(() => getSceneFocus(scene), [scene]);

  // This component is remounted per scene (keyed by scene id in App), so line
  // state always starts fresh here.
  const [lineIndex, setLineIndex] = useState(0);
  const [lineDone, setLineDone] = useState(false);
  const [choicesShown, setChoicesShown] = useState(false);
  const [voicing, setVoicing] = useState(false);
  const lineRef = useRef<DialogueLineHandle>(null);

  const currentLine = dialogue[Math.min(lineIndex, dialogue.length - 1)];
  const isLastLine = lineIndex >= dialogue.length - 1;

  // Warm up the next line's audio (the current line is voiced by the line view).
  const speak = narration.speak;
  const prefetchNext = narration.prefetchNext;
  const voiced = narration.enabled && (narration.configured || narration.localAvailable);
  useEffect(() => {
    if (!voiced) return;
    const next = dialogue[lineIndex + 1];
    if (next) prefetchNext(next.speaker, next.text);
  }, [dialogue, lineIndex, voiced, prefetchNext]);

  useEffect(() => {
    if (!ambience.enabled) return;
    const cues = [
      ...(sceneChoreography.sfx ?? []),
      ...sceneChoreography.beats
        .filter((beat) => beat.sfx)
        .map((beat) => ({ event: beat.sfx!, delayMs: beat.delayMs }))
    ];
    const timers = cues.map((cue) =>
      window.setTimeout(() => sfx.play(cue.event), reduced ? 0 : cue.delayMs ?? 0)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [ambience.enabled, reduced, sceneChoreography, sfx]);

  const handleLineDone = useCallback(() => setLineDone(true), []);

  const advance = useCallback(() => {
    narration.unlock();
    if (choicesShown) return;
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
    setChoicesShown(true);
  }, [choicesShown, lineDone, lineIndex, dialogue, narration]);

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
        voicing={voicing}
        reduced={reduced}
        actorActions={actorActions}
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

      <StageControls onOpenMap={onOpenMap} onOpenAtlas={onOpenAtlas} narration={narration} ambience={ambience} />

      <div className="stage-foot">
        <DialogueOverlay speaker={currentLine.speaker} showContinue={!choicesShown} onAdvance={advance}>
          <DialogueLineView
            key={`${scene.id}-${lineIndex}`}
            ref={lineRef}
            speaker={currentLine.speaker}
            text={currentLine.text}
            voiced={voiced}
            instant={reduced}
            speak={speak}
            onDone={handleLineDone}
            onVoicingChange={setVoicing}
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
