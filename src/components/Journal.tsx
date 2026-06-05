import { collectiblesById } from '../data/collectibles';
import { getHotspot } from '../data/mapHotspots';
import type { CollectibleKind, StoryState } from '../types';

type JournalProps = {
  state: StoryState;
};

const sectionLabels: Record<CollectibleKind, string> = {
  item: 'Items',
  artifact: 'Artifacts',
  info: 'Info',
  lore: 'Lore'
};

const sectionOrder: CollectibleKind[] = ['item', 'artifact', 'info', 'lore'];

export function Journal({ state }: JournalProps) {
  const collectedItemIds = state.collectedItemIds ?? [];
  const discoveredHotspotIds = state.discoveredHotspotIds ?? [];
  const collected = collectedItemIds
    .map((id) => collectiblesById[id])
    .filter(Boolean);

  return (
    <div className="journal-board">
      <div className="journal-board__heading">
        <div>
          <p className="journal-board__eyebrow">Collected during the story</p>
          <h2>Journal</h2>
        </div>
        <p className="journal-board__count">
          {collected.length} collected · {discoveredHotspotIds.length} places
        </p>
      </div>

      <div className="journal-board__grid">
        {sectionOrder.map((kind) => {
          const items = collected.filter((item) => item.kind === kind);

          return (
            <section className="journal-section" key={kind} aria-label={sectionLabels[kind]}>
              <h3>{sectionLabels[kind]}</h3>
              {items.length > 0 ? (
                <div className="journal-section__items">
                  {items.map((item) => (
                    <article className="journal-card" key={item.id}>
                      <p className="journal-card__source">{item.source}</p>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="journal-section__empty">No entries yet.</p>
              )}
            </section>
          );
        })}

        <section className="journal-section journal-section--places" aria-label="Discovered places">
          <h3>Places</h3>
          <div className="place-strip">
            {discoveredHotspotIds.map((hotspotId) => {
              const hotspot = getHotspot(hotspotId);

              return <span key={hotspot.id}>{hotspot.title}</span>;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
