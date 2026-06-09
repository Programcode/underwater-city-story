import { motion } from 'framer-motion';
import type { ChoreographyAction } from '../data/choreography';
import type { Focus } from '../lib/camera';
import type { Character } from '../types';

type ActorProps = {
  character: Character;
  x: number;
  y: number;
  /** Camera zoom, used to counter-scale the actor so its size stays constant. */
  zoom: number;
  speaking: boolean;
  /** Whether the line is actively being voiced (drives a stronger pulse). */
  voicing?: boolean;
  /** Whether anyone is speaking; non-speakers dim while another actor talks. */
  someoneSpeaking: boolean;
  reduced: boolean;
  action?: ChoreographyAction;
  path?: Focus[];
  travelDurationMs?: number;
};

export function Actor({
  character,
  x,
  y,
  zoom,
  speaking,
  voicing = false,
  someoneSpeaking,
  reduced,
  action = 'idle',
  path,
  travelDurationMs
}: ActorProps) {
  const dimmed = someoneSpeaking && !speaking;
  const isWalking = action === 'walk' || Boolean(path?.length);
  const actionClass = `actor--${action}`;
  const leftTarget = path?.length ? path.map((point) => `${point.x}%`) : `${x}%`;
  const topTarget = path?.length ? path.map((point) => `${point.y}%`) : `${y}%`;
  const pathTimes = path && path.length > 1 ? path.map((_, index) => index / (path.length - 1)) : undefined;

  return (
    <motion.div
      className={`actor actor--${character.spriteClass} ${actionClass} ${isWalking ? 'actor--walk' : ''} ${
        speaking ? 'actor--speaking' : ''
      } ${
        voicing ? 'actor--voicing' : ''
      } ${dimmed ? 'actor--dim' : ''}`}
      style={{
        left: path?.[0] ? `${path[0].x}%` : `${x}%`,
        top: path?.[0] ? `${path[0].y}%` : `${y}%`,
        // Negate the camera zoom so the portrait keeps a controlled size while
        // its feet stay locked to the map coordinate.
        ['--inv' as string]: 1 / zoom,
        ['--accent' as string]: character.accent,
        ['--idle-delay' as string]: `${(character.id.charCodeAt(0) % 5) * -0.42}s`
      }}
      initial={reduced ? false : path?.length ? { opacity: 0.92, y: 0 } : { opacity: 0, y: 14 }}
      animate={{ left: leftTarget, top: topTarget, opacity: dimmed ? 0.55 : 1, y: 0 }}
      transition={{
        left: { duration: reduced ? 0 : (travelDurationMs ?? 0) / 1000, ease: [0.22, 0.61, 0.21, 1], times: pathTimes },
        top: { duration: reduced ? 0 : (travelDurationMs ?? 0) / 1000, ease: [0.22, 0.61, 0.21, 1], times: pathTimes },
        opacity: { duration: reduced ? 0 : 0.6, ease: 'easeOut' },
        y: { duration: reduced ? 0 : 0.6, ease: 'easeOut' }
      }}
    >
      <div className="actor__inner">
        <span
          className={`actor__portrait character-portrait character-portrait--${character.spriteClass}`}
          aria-hidden="true"
        />
        <span className="actor__nameplate">{character.name}</span>
        <span className="actor__shadow" aria-hidden="true" />
      </div>
    </motion.div>
  );
}
