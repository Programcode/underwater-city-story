import { AnimatePresence, motion } from 'framer-motion';
import type { StoryChoice } from '../types';

type ChoiceLayerProps = {
  choices: StoryChoice[];
  discoveredHotspotIds: string[];
  visible: boolean;
  onChoose: (choiceId: string) => void;
  reduced: boolean;
};

export function ChoiceLayer({
  choices,
  discoveredHotspotIds,
  visible,
  onChoose,
  reduced
}: ChoiceLayerProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="choice-layer"
          aria-label="Story choices"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4 }}
        >
          <p className="choice-layer__prompt">What does Mira do?</p>
          <div className="choice-layer__cards">
            {choices.map((choice, index) => {
              const locked =
                Boolean(choice.requiresDiscoveredHotspot) &&
                !discoveredHotspotIds.includes(choice.requiresDiscoveredHotspot as string);

              return (
                <motion.button
                  key={choice.id}
                  type="button"
                  className="choice-card"
                  data-role="choice"
                  disabled={locked}
                  onClick={() => onChoose(choice.id)}
                  initial={reduced ? false : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.45,
                    delay: reduced ? 0 : 0.12 + index * 0.09,
                    ease: 'easeOut'
                  }}
                >
                  <span className="choice-card__label">{choice.label}</span>
                  <span className="choice-card__description">{choice.description}</span>
                  {choice.collectibleIds?.length ? (
                    <span className="choice-card__reward">Adds to the atlas</span>
                  ) : null}
                  {locked ? (
                    <span className="choice-card__lock">Discover the linked place first</span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
