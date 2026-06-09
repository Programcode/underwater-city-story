import { getCharactersForScene } from '../data/characters';
import { getSceneMood } from '../data/dialogue';
import { getSceneFocus } from '../lib/stageFocus';
import type { TravelPlan } from '../lib/travel';
import { MapCamera } from './MapCamera';

type TravelStageProps = {
  plan: TravelPlan;
  reduced: boolean;
};

export function TravelStage({ plan, reduced }: TravelStageProps) {
  const characters = getCharactersForScene(plan.toScene.id);
  const fromCharacters = getCharactersForScene(plan.fromScene.id);
  const mood = plan.toScene.mood ?? getSceneMood(plan.toScene.id);

  return (
    <section className="travel-stage" data-testid="living-map-travel" aria-hidden="true">
      <MapCamera
        focus={getSceneFocus(plan.toScene)}
        zoom={plan.toZoom}
        mood={mood}
        characters={characters}
        speaker="narrator"
        reduced={reduced}
        travel={{
          path: plan.path,
          fromCharacters,
          fromZoom: plan.fromZoom,
          durationMs: plan.durationMs
        }}
      />
      <div className="travel-stage__wash" aria-hidden="true" />
    </section>
  );
}
