import { mapHotspots } from '../data/mapHotspots';
import { getCharactersForScene } from '../data/characters';
import type { MapHotspot } from '../types';

type MapExplorerProps = {
  activeHotspotId: string | null;
  activeSceneId: string;
  onSelectHotspot: (hotspot: MapHotspot) => void;
};

const mapWidth = 5632;
const mapHeight = 3072;

export function MapExplorer({ activeHotspotId, activeSceneId, onSelectHotspot }: MapExplorerProps) {
  const activeHotspot = mapHotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? null;
  const sceneCharacters = getCharactersForScene(activeSceneId);
  const transform = activeHotspot ? 'scale(1.045)' : 'scale(1)';
  const transformOrigin = activeHotspot
    ? `${activeHotspot.xPercent}% ${activeHotspot.yPercent}%`
    : 'center';

  return (
    <div className="map-explorer">
      <div className="map-frame" style={{ aspectRatio: `${mapWidth} / ${mapHeight}` }}>
        <div className="map-canvas" style={{ transform, transformOrigin }}>
          <img
            src="/assets/map.jpg"
            width={mapWidth}
            height={mapHeight}
            alt="Illustrated old map of the underwater city of Athel"
            className="map-image"
          />

          {mapHotspots.map((hotspot) => {
            const isActive = hotspot.id === activeHotspotId;

            return (
              <button
                type="button"
                key={hotspot.id}
                className={`map-hotspot map-hotspot--${hotspot.animation} ${
                  isActive ? 'map-hotspot--active' : ''
                }`}
                style={{
                  left: `${hotspot.xPercent}%`,
                  top: `${hotspot.yPercent}%`
                }}
                aria-pressed={isActive}
                aria-label={`Open lore for ${hotspot.title}`}
                onClick={() => onSelectHotspot(hotspot)}
              >
                <span className="map-hotspot__pin" aria-hidden="true" />
                <span className="map-hotspot__label">{hotspot.title}</span>
              </button>
            );
          })}

          {sceneCharacters.map((character) => (
            <div
              key={character.id}
              className="map-character"
              style={{
                left: `${character.xPercent}%`,
                top: `${character.yPercent}%`
              }}
              aria-label={`${character.name}, ${character.role}`}
            >
              <span
                className={`character-portrait character-portrait--${character.spriteClass}`}
                aria-hidden="true"
              />
              <span className="map-character__label">{character.name}</span>
            </div>
          ))}
        </div>

        <div className="map-overlay" aria-hidden="true" />
        <p className="map-prompt">Choose a brass pin to move the map.</p>
      </div>
    </div>
  );
}
