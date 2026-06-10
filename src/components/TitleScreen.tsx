import { motion } from 'framer-motion';
import { ChevronRight, RotateCcw } from 'lucide-react';

type TitleScreenProps = {
  onBegin: () => void;
  onContinue: () => void;
  canContinue: boolean;
  reduced: boolean;
};

export function TitleScreen({ onBegin, onContinue, canContinue, reduced }: TitleScreenProps) {
  return (
    <section className="title-screen" data-testid="title-screen">
      <div className={`title-screen__bg ${reduced ? 'is-still' : ''}`}>
        <img src="/assets/map.webp" alt="" className="title-screen__map" aria-hidden="true" draggable={false} />
      </div>
      <div className="title-screen__wash" aria-hidden="true" />
      <div className="map-caustics" aria-hidden="true" />
      <div className="map-grain" aria-hidden="true" />

      <motion.div
        className="title-screen__content"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 1.4, ease: 'easeOut' }}
      >
        <p className="title-screen__kicker">An interactive descent</p>
        <h1 className="title-screen__title">
          <span>The Underwater City</span>
          <span className="title-screen__title-of">of</span>
          <span>Athel</span>
        </h1>
        <p className="title-screen__subtitle">
          A girl. A buried truth. A city of glass beneath a sky no one is allowed to see.
          Every choice carries Mira toward one of three endings.
        </p>

        <motion.div
          className="title-screen__actions"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 1 }}
        >
          {canContinue ? (
            <button type="button" className="title-screen__continue" onClick={onContinue}>
              <RotateCcw size={18} aria-hidden="true" />
              <span>Continue</span>
            </button>
          ) : null}
          <button type="button" className="title-screen__begin" onClick={onBegin}>
            <span>{canContinue ? 'New story' : 'Begin the Descent'}</span>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </motion.div>

        <p className="title-screen__hint">Click, or press Space, to let the story speak.</p>
      </motion.div>
    </section>
  );
}
