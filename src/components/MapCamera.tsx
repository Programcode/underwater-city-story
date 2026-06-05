import { motion } from 'framer-motion';
import type { Character, SceneMood, Speaker } from '../types';
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
};

export function MapCamera({ focus, zoom, mood, characters, speaker, voicing = false, reduced }: MapCameraProps) {
  const transform = computeCameraTransform(focus, zoom);
  const actors = arrangeActors(characters, focus);
  const someoneSpeaking = speaker !== 'narrator';

  return (
    <div className="map-camera-frame" data-mood={mood}>
      <motion.div
        className="map-camera"
        initial={false}
        animate={{ transform }}
        transition={{ duration: reduced ? 0 : 1.4, ease: [0.22, 0.61, 0.21, 1] }}
      >
        <div className={`map-camera__drift ${reduced ? 'is-still' : ''}`}>
          <img
            src="/assets/map.jpg"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            alt="Illustrated old map of the underwater city of Athel"
            className="map-image"
            draggable={false}
          />

          <span className="scene-focus-glow" style={{ left: `${focus.x}%`, top: `${focus.y}%` }} aria-hidden="true" />

          {actors.map((staged) => (
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
            />
          ))}
        </div>
      </motion.div>

      <div className="map-mood" data-mood={mood} aria-hidden="true" />
      <div className="map-vignette" aria-hidden="true" />
      <div className="map-caustics" aria-hidden="true" />
      <div className="map-grain" aria-hidden="true" />
    </div>
  );
}
