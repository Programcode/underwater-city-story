import type { ReactNode } from 'react';

type AppShellProps = {
  map: ReactNode;
  story: ReactNode;
  journal: ReactNode;
};

export function AppShell({ map, story, journal }: AppShellProps) {
  return (
    <main className="app-shell" data-testid="cinematic-map-stage">
      <section className="map-region" aria-label="Interactive map of Athel">
        {map}
      </section>

      <aside className="story-region" aria-label="Story and lore controls">
        <div className="story-region__header">
          <p className="story-region__kicker">The Underwater City of Athel</p>
          <h1>Map & Story Guide</h1>
        </div>
        {story}
      </aside>

      <section className="journal-region" aria-label="Map atlas journal">
        {journal}
      </section>
    </main>
  );
}
