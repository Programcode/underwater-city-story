import type { MapHotspot } from '../types';
import { storySceneLabels } from '../data/storyGraph';

type LorePanelProps = {
  hotspot: MapHotspot | null;
};

export function LorePanel({ hotspot }: LorePanelProps) {
  if (!hotspot) {
    return (
      <section className="lore-panel lore-panel--empty" aria-label="Map lore">
        <p>Select a brass pin on the map.</p>
      </section>
    );
  }

  return (
    <section className="lore-panel" aria-label="Map lore">
      <p className="lore-panel__level">{hotspot.level}</p>
      <h2>{hotspot.title}</h2>
      <p className="lore-panel__subtitle">{hotspot.subtitle}</p>

      <div className="lore-panel__body">
        {hotspot.lore.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="lore-panel__links" aria-label="Linked story scenes">
        {hotspot.storySceneIds.map((sceneId) => (
          <span key={sceneId}>{storySceneLabels[sceneId] ?? sceneId}</span>
        ))}
      </div>
    </section>
  );
}
