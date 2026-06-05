import { useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { LorePanel } from './components/LorePanel';
import { MapExplorer } from './components/MapExplorer';
import { StoryGame } from './components/StoryGame';
import { getHotspot } from './data/mapHotspots';
import { applyChoice, createInitialStoryState, getScene } from './data/storyGraph';

export default function App() {
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [storyState, setStoryState] = useState(createInitialStoryState);
  const activeHotspot = useMemo(
    () => (activeHotspotId ? getHotspot(activeHotspotId) : null),
    [activeHotspotId]
  );

  function handleSelectHotspot(hotspotId: string) {
    setActiveHotspotId(hotspotId);
    setStoryState((current) => {
      if (current.discoveredHotspotIds.includes(hotspotId)) {
        return current;
      }

      return {
        ...current,
        discoveredHotspotIds: [...current.discoveredHotspotIds, hotspotId]
      };
    });
  }

  function handleChoice(choiceId: string) {
    const next = applyChoice(storyState, choiceId);

    setStoryState(next);

    if (next.endingId) {
      setActiveHotspotId('surface-dome');
      return;
    }

    const scene = getScene(next.currentSceneId);
    if (scene.locationHotspotId) {
      setActiveHotspotId(scene.locationHotspotId);
    }
  }

  function handleRestart() {
    setStoryState(createInitialStoryState());
    setActiveHotspotId(null);
  }

  return (
    <AppShell
      map={
        <MapExplorer
          activeHotspotId={activeHotspotId}
          onSelectHotspot={(hotspot) => handleSelectHotspot(hotspot.id)}
        />
      }
      story={
        <div className="panel-stack">
          <StoryGame state={storyState} onChoose={handleChoice} onRestart={handleRestart} />
          <LorePanel hotspot={activeHotspot} />
        </div>
      }
      journal={
        <div className="placeholder-panel placeholder-panel--journal">
          <h2>Journal</h2>
          <p>Discovered clues and places will collect here.</p>
        </div>
      }
    />
  );
}
