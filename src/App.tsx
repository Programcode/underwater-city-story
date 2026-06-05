import { useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { LorePanel } from './components/LorePanel';
import { MapExplorer } from './components/MapExplorer';
import { getHotspot } from './data/mapHotspots';

export default function App() {
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const activeHotspot = useMemo(
    () => (activeHotspotId ? getHotspot(activeHotspotId) : null),
    [activeHotspotId]
  );

  return (
    <AppShell
      map={
        <MapExplorer
          activeHotspotId={activeHotspotId}
          onSelectHotspot={(hotspot) => setActiveHotspotId(hotspot.id)}
        />
      }
      story={
        <div className="panel-stack">
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
