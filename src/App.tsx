import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';

import { Atlas } from './components/Atlas';
import { CinematicStage } from './components/CinematicStage';
import { EndingScene } from './components/EndingScene';
import { MapOverlay } from './components/MapOverlay';
import { TitleScreen } from './components/TitleScreen';
import { applyChoice, createInitialStoryState, endings, getScene } from './data/storyGraph';
import { useNarration } from './hooks/useNarration';
import { useReducedMotion } from './hooks/useReducedMotion';
import type { StoryState } from './types';

type Phase = 'title' | 'playing' | 'ending';
type TransitionStep = 'idle' | 'out' | 'in';

type PendingTarget = {
  phase: Phase;
  storyState: StoryState;
};

export default function App() {
  const reduced = useReducedMotion();
  const narration = useNarration();
  const [phase, setPhase] = useState<Phase>('title');
  const [storyState, setStoryState] = useState<StoryState>(createInitialStoryState);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [step, setStep] = useState<TransitionStep>('idle');
  const [pending, setPending] = useState<PendingTarget | null>(null);

  const startTransition = useCallback((target: PendingTarget) => {
    setPending(target);
    setStep('out');
  }, []);

  const openAtlas = useCallback(() => {
    narration.stop();
    setAtlasOpen(true);
  }, [narration]);

  const openMap = useCallback(() => {
    narration.stop();
    setMapOpen(true);
  }, [narration]);

  const handleBlackoutComplete = useCallback(() => {
    if (step === 'out') {
      // Screen is fully black: swap the scene, then fade back in.
      if (pending) {
        setPhase(pending.phase);
        setStoryState(pending.storyState);
        setPending(null);
      }
      setStep('in');
    } else if (step === 'in') {
      setStep('idle');
    }
  }, [step, pending]);

  const handleBegin = useCallback(() => {
    startTransition({ phase: 'playing', storyState: createInitialStoryState() });
  }, [startTransition]);

  const handleChoose = useCallback(
    (choiceId: string) => {
      const next = applyChoice(storyState, choiceId);
      startTransition({ phase: next.endingId ? 'ending' : 'playing', storyState: next });
    },
    [storyState, startTransition]
  );

  const handleRestart = useCallback(() => {
    setAtlasOpen(false);
    setMapOpen(false);
    startTransition({ phase: 'playing', storyState: createInitialStoryState() });
  }, [startTransition]);

  const transitioning = step !== 'idle';

  return (
    <div className="app-root">
      {phase === 'title' ? <TitleScreen onBegin={handleBegin} reduced={reduced} /> : null}

      {phase === 'playing' ? (
        <CinematicStage
          key={storyState.currentSceneId}
          scene={getScene(storyState.currentSceneId)}
          storyState={storyState}
          onChoose={handleChoose}
          onOpenAtlas={openAtlas}
          onOpenMap={openMap}
          narration={narration}
          reduced={reduced}
        />
      ) : null}

      {phase === 'ending' && storyState.endingId ? (
        <EndingScene
          ending={endings[storyState.endingId]}
          traits={storyState.traits}
          onRestart={handleRestart}
          onOpenAtlas={openAtlas}
          onOpenMap={openMap}
          narration={narration}
          reduced={reduced}
        />
      ) : null}

      <Atlas
        open={atlasOpen}
        storyState={storyState}
        onClose={() => setAtlasOpen(false)}
        reduced={reduced}
      />

      <MapOverlay
        key={mapOpen ? 'map-open' : 'map-closed'}
        open={mapOpen}
        storyState={storyState}
        onClose={() => setMapOpen(false)}
        reduced={reduced}
      />

      <motion.div
        className="blackout"
        aria-hidden={!transitioning}
        style={{ pointerEvents: transitioning ? 'auto' : 'none' }}
        initial={false}
        animate={{ opacity: step === 'out' ? 1 : 0 }}
        transition={{ duration: reduced ? 0.001 : step === 'out' ? 0.5 : 0.7, ease: 'easeInOut' }}
        onAnimationComplete={handleBlackoutComplete}
      />
    </div>
  );
}
