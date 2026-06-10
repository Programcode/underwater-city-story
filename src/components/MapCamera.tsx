import { motion } from 'framer-motion';
import type { ChoreographyAction } from '../data/choreography';
import type { Character, CharacterId, SceneMood, Speaker } from '../types';
import { arrangeActors, computeCameraTransform, type Focus } from '../lib/camera';
import { Actor } from './Actor';

const MAP_WIDTH = 5632;
const MAP_HEIGHT = 3072;

type MapCameraProps = {
  focus: Focus;
  zoom: number;
  mood: SceneMood;
  characters: Character[];
  speaker: Speaker;
  voicing?: boolean;
  reduced: boolean;
  actorActions?: Partial<Record<CharacterId, ChoreographyAction>>;
  travel?: {
    path: Focus[];
    fromCharacters: Character[];
    fromZoom: number;
    durationMs: number;
  };
};

function clampPercent(value: number): number {
  return Math.min(96, Math.max(4, value));
}

function timesFor(path: Focus[]): number[] | undefined {
  return path.length > 1 ? path.map((_, index) => index / (path.length - 1)) : undefined;
}

function zoomForTravelPoint(index: number, total: number, fromZoom: number, toZoom: number): number {
  if (index === 0) return fromZoom;
  if (index === total - 1) return toZoom;
  return Math.max(1.28, Math.min(fromZoom, toZoom) - 0.38);
}

export function MapCamera({
  focus,
  zoom,
  mood,
  characters,
  speaker,
  voicing = false,
  reduced,
  actorActions = {},
  travel
}: MapCameraProps) {
  const cameraPath = travel?.path.length ? travel.path : [focus];
  const transform = travel
    ? cameraPath.map((point, index) =>
        computeCameraTransform(point, zoomForTravelPoint(index, cameraPath.length, travel.fromZoom, zoom))
      )
    : computeCameraTransform(focus, zoom);
  const actors = arrangeActors(characters, focus);
  const fromActors = travel ? arrangeActors(travel.fromCharacters, cameraPath[0] ?? focus) : [];
  const fallbackFromActors = travel ? arrangeActors(characters, cameraPath[0] ?? focus) : [];
  const someoneSpeaking = speaker !== 'narrator';

  return (
    <div className="map-camera-frame" data-mood={mood}>
      <motion.div
        className="map-camera"
        initial={false}
        animate={{ transform }}
        transition={{
          duration: reduced ? 0 : travel ? travel.durationMs / 1000 : 1.4,
          ease: [0.22, 0.61, 0.21, 1],
          times: travel ? timesFor(cameraPath) : undefined
        }}
      >
        <div className={`map-camera__drift ${reduced ? 'is-still' : ''}`}>
          <img
            src="/assets/map.webp"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            alt="Illustrated old map of the underwater city of Athel"
            className="map-image"
            draggable={false}
          />

          <span className="scene-focus-glow" style={{ left: `${focus.x}%`, top: `${focus.y}%` }} aria-hidden="true" />

          {travel ? (
            <svg className="travel-route" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
              <polyline points={cameraPath.map((point) => `${point.x},${point.y}`).join(' ')} />
            </svg>
          ) : null}

          {actors.map((staged, index) => {
            const start =
              fromActors.find((candidate) => candidate.character.id === staged.character.id) ??
              fallbackFromActors[index] ??
              staged;
            const offsetX = staged.x - focus.x;
            const offsetY = staged.y - focus.y;
            const actorPath = travel
              ? cameraPath.map((point, pointIndex) => {
                  if (pointIndex === 0) return { x: start.x, y: start.y };
                  if (pointIndex === cameraPath.length - 1) return { x: staged.x, y: staged.y };
                  return {
                    x: clampPercent(point.x + offsetX),
                    y: clampPercent(point.y + offsetY)
                  };
                })
              : undefined;

            return (
              <Actor
                key={staged.character.id}
                character={staged.character}
                x={staged.x}
                y={staged.y}
                zoom={zoom}
                speaking={speaker === staged.character.id}
                voicing={voicing && speaker === staged.character.id}
                someoneSpeaking={someoneSpeaking}
                reduced={reduced}
                action={travel ? 'walk' : actorActions[staged.character.id] ?? 'idle'}
                path={actorPath}
                travelDurationMs={travel?.durationMs}
              />
            );
          })}
        </div>
      </motion.div>

      <div className="map-mood" data-mood={mood} aria-hidden="true" />
      <div className="map-vignette" aria-hidden="true" />
      <div className="map-caustics" aria-hidden="true" />
      <div className="map-grain" aria-hidden="true" />
    </div>
  );
}
