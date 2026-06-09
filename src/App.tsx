import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Atlas } from './components/Atlas';
import { CinematicStage } from './components/CinematicStage';
import { EndingScene } from './components/EndingScene';
import { MapOverlay } from './components/MapOverlay';
import { TitleScreen } from './components/TitleScreen';
import { TravelStage } from './components/TravelStage';
import { getEndingMood, getSceneMood } from './data/dialogue';
import { applyChoice, createInitialStoryState, endings, getScene } from './data/storyGraph';
import { useAmbience } from './hooks/useAmbience';
import { useNarration } from './hooks/useNarration';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useSfx } from './hooks/useSfx';
import { evaluateAchievements } from './lib/achievements';
import { recordAchievements, recordEnding } from './lib/progress';
import { clearSave, hasSave, loadSave, writeSave } from './lib/save';
import { getScenePlaceLevel } from './lib/stageFocus';
import { createTravelPlan, type TravelPlan } from './lib/travel';
import type { StoryState } from './types';

type Phase = 'title' | 'playing' | 'ending';
type TransitionStep = 'idle' | 'out' | 'in';

type PendingTarget = {
  phase: Phase;
  storyState: StoryState;
};

type ActiveTravel = {
  plan: TravelPlan;
  target: PendingTarget;
};

export default function App() {
  const reduced = useReducedMotion();
  const narration = useNarration();
  const ambience = useAmbience();
  const sfx = useSfx();
  const [phase, setPhase] = useState<Phase>('title');
  const [storyState, setStoryState] = useState<StoryState>(createInitialStoryState);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [step, setStep] = useState<TransitionStep>('idle');
  const [pending, setPending] = useState<PendingTarget | null>(null);
  const [travel, setTravel] = useState<ActiveTravel | null>(null);
  const [canContinue, setCanContinue] = useState(hasSave);

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

  const beginRun = useCallback(
    (state: StoryState) => {
      ambience.begin();
      narration.unlock();
      startTransition({ phase: 'playing', storyState: state });
    },
    [ambience, narration, startTransition]
  );

  const handleBegin = useCallback(() => {
    clearSave();
    setCanContinue(false);
    beginRun(createInitialStoryState());
  }, [beginRun]);

  const handleContinue = useCallback(() => {
    const saved = loadSave();
    beginRun(saved ?? createInitialStoryState());
  }, [beginRun]);

  const handleChoose = useCallback(
    (choiceId: string) => {
      const next = applyChoice(storyState, choiceId);
      if (next.endingId) {
        clearSave();
        setCanContinue(false);
        const progress = recordEnding(next.endingId);
        recordAchievements(evaluateAchievements({ state: next, endingsSeen: progress.endingsSeen }));
        startTransition({ phase: 'ending', storyState: next });
      } else {
        const target = { phase: 'playing' as const, storyState: next };
        if (!reduced && phase === 'playing') {
          setTravel({
            plan: createTravelPlan(getScene(storyState.currentSceneId), getScene(next.currentSceneId)),
            target
          });
        } else {
          startTransition(target);
        }
      }
    },
    [phase, reduced, storyState, startTransition]
  );

  const handleRestart = useCallback(() => {
    setAtlasOpen(false);
    setMapOpen(false);
    clearSave();
    beginRun(createInitialStoryState());
  }, [beginRun]);

  // Autosave an in-progress run so the title screen can offer "Continue".
  useEffect(() => {
    if (phase === 'playing') writeSave(storyState);
  }, [phase, storyState]);

  // Tie the procedural soundscape (and optional SFX stingers) to the mood.
  useEffect(() => {
    let mood: ReturnType<typeof getSceneMood> = 'calm';
    if (phase === 'playing') {
      const scene = getScene(storyState.currentSceneId);
      mood = getSceneMood(scene.id);
      ambience.setPlace(getScenePlaceLevel(scene));
    } else if (phase === 'ending' && storyState.endingId) {
      mood = getEndingMood(storyState.endingId);
      ambience.setPlace('surface');
    }
    ambience.setMood(mood);
    if (phase !== 'title' && ambience.enabled) {
      sfx.playMood(mood);
    }
  }, [phase, storyState.currentSceneId, storyState.endingId, ambience, sfx]);

  useEffect(() => {
    if (!travel) return;
    const mood = getSceneMood(travel.plan.toScene.id);
    ambience.setMood(mood);
    ambience.setPlace(getScenePlaceLevel(travel.plan.toScene));
    if (ambience.enabled) {
      sfx.playMood(mood);
      sfx.play('footstep', { loop: true, volume: 0.22 });
    }

    const timer = window.setTimeout(() => {
      sfx.stop('footstep');
      setPhase(travel.target.phase);
      setStoryState(travel.target.storyState);
      setTravel(null);
    }, travel.plan.durationMs + 80);

    return () => {
      window.clearTimeout(timer);
      sfx.stop('footstep');
    };
  }, [ambience, sfx, travel]);

  const transitioning = step !== 'idle';

  return (
    <div className="app-root">
      {phase === 'title' ? (
        <TitleScreen
          onBegin={handleBegin}
          onContinue={handleContinue}
          canContinue={canContinue}
          reduced={reduced}
        />
      ) : null}

      {phase === 'playing' ? (
        <CinematicStage
          key={storyState.currentSceneId}
          scene={getScene(storyState.currentSceneId)}
          storyState={storyState}
          onChoose={handleChoose}
          onOpenAtlas={openAtlas}
          onOpenMap={openMap}
          narration={narration}
          ambience={ambience}
          sfx={sfx}
          reduced={reduced}
        />
      ) : null}

      {travel ? <TravelStage plan={travel.plan} reduced={reduced} /> : null}

      {phase === 'ending' && storyState.endingId ? (
        <EndingScene
          ending={endings[storyState.endingId]}
          storyState={storyState}
          onRestart={handleRestart}
          onOpenAtlas={openAtlas}
          onOpenMap={openMap}
          narration={narration}
          ambience={ambience}
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
