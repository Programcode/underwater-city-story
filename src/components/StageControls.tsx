import { BookOpen, Map as MapIcon, Volume2, VolumeX } from 'lucide-react';
import type { Narration } from '../hooks/useNarration';

type StageControlsProps = {
  onOpenMap: () => void;
  onOpenAtlas: () => void;
  narration: Narration;
};

export function StageControls({ onOpenMap, onOpenAtlas, narration }: StageControlsProps) {
  const voiceOn = narration.configured && narration.enabled;

  return (
    <div className="stage-controls">
      <button
        type="button"
        className={`chrome-button chrome-button--icon ${voiceOn ? 'is-on' : ''}`}
        onClick={narration.toggle}
        aria-pressed={voiceOn}
        aria-label={voiceOn ? 'Turn voices off' : 'Turn voices on'}
        title={
          narration.configured
            ? voiceOn
              ? 'Voices on'
              : 'Voices off'
            : 'Add an ElevenLabs API key to enable voices'
        }
      >
        {voiceOn ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
        <span className="chrome-button__text">Voices</span>
      </button>

      <button type="button" className="chrome-button" onClick={onOpenMap} aria-label="Open the world map">
        <MapIcon size={18} aria-hidden="true" strokeWidth={1.6} />
        <span className="chrome-button__text">Map</span>
      </button>

      <button type="button" className="chrome-button" onClick={onOpenAtlas} aria-label="Open the atlas">
        <BookOpen size={18} aria-hidden="true" strokeWidth={1.6} />
        <span className="chrome-button__text">Atlas</span>
      </button>
    </div>
  );
}
