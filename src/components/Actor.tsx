import { motion } from 'framer-motion';
import type { Character } from '../types';

type ActorProps = {
  character: Character;
  x: number;
  y: number;
  /** Camera zoom, used to counter-scale the actor so its size stays constant. */
  zoom: number;
  speaking: boolean;
  /** Whether anyone is speaking; non-speakers dim while another actor talks. */
  someoneSpeaking: boolean;
  reduced: boolean;
};

export function Actor({ character, x, y, zoom, speaking, someoneSpeaking, reduced }: ActorProps) {
  const dimmed = someoneSpeaking && !speaking;

  return (
    <motion.div
      className={`actor actor--${character.spriteClass} ${speaking ? 'actor--speaking' : ''} ${
        dimmed ? 'actor--dim' : ''
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        // Negate the camera zoom so the portrait keeps a controlled size while
        // its feet stay locked to the map coordinate.
        ['--inv' as string]: 1 / zoom,
        ['--accent' as string]: character.accent
      }}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: dimmed ? 0.55 : 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: 'easeOut' }}
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
