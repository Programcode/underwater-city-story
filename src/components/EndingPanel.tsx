import type { Ending, TraitKey } from '../types';

type EndingPanelProps = {
  ending: Ending;
  traits: Record<TraitKey, number>;
  onRestart: () => void;
};

const traitLabels: Record<TraitKey, string> = {
  evidence: 'Evidence gathered',
  trust: 'Allies trusted',
  risk: 'Reckless pressure',
  collective: 'Public support'
};

function endingReason(traits: Record<TraitKey, number>) {
  if (traits.evidence >= 3 && traits.trust >= 2 && traits.collective >= 2 && traits.risk <= 2) {
    return 'Mira had enough proof, enough allies, and enough control to reveal the truth without losing the Tank to panic.';
  }

  if (traits.evidence >= 2 && traits.collective >= 2) {
    return 'The truth spread widely, but it moved faster than Mira could organize people around it.';
  }

  return 'Mira was forced into an isolated escape before she could build public proof or a trusted network.';
}

export function EndingPanel({ ending, traits, onRestart }: EndingPanelProps) {
  return (
    <article className={`ending-panel ending-panel--${ending.id}`}>
      <p className="ending-panel__tone">{ending.tone}</p>
      <h2>{ending.title}</h2>
      <p className="ending-panel__summary">{ending.summary}</p>

      <div className="ending-panel__copy">
        {ending.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className="ending-panel__why" aria-label="Why this ending happened">
        <h3>Why this happened</h3>
        <p>{endingReason(traits)}</p>
        <dl>
          {(Object.entries(traits) as Array<[TraitKey, number]>).map(([trait, value]) => (
            <div key={trait}>
              <dt>{traitLabels[trait]}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <button type="button" className="restart-button" onClick={onRestart}>
        Restart story
      </button>
    </article>
  );
}
