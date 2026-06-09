import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Narration } from '../hooks/useNarration';
import type { Speaker } from '../types';
import { TypewriterText, type TypewriterHandle } from './TypewriterText';

export type DialogueLineHandle = {
  skip: () => void;
};

type DialogueLineViewProps = {
  speaker: Speaker;
  text: string;
  /** Whether voices are configured + enabled. */
  voiced: boolean;
  /** Reveal instantly (reduced motion). */
  instant: boolean;
  speak: Narration['speak'];
  onDone: () => void;
  /** Reports whether the line is actively being voiced (for the speaking pulse). */
  onVoicingChange: (voicing: boolean) => void;
};

/**
 * Renders a single dialogue line. When voices are on, the text is held until
 * audio begins, then paced to the spoken duration. Mounted with a key per line,
 * so all per-line state starts fresh with no in-effect resets.
 */
export const DialogueLineView = forwardRef<DialogueLineHandle, DialogueLineViewProps>(
  function DialogueLineView({ speaker, text, voiced, instant, speak, onDone, onVoicingChange }, ref) {
    // 'pending' holds the typewriter until the voice starts (only when voiced).
    const [active, setActive] = useState(() => !(voiced && !instant));
    const [playing, setPlaying] = useState(false);
    const [durationMs, setDurationMs] = useState<number | null>(null);
    const typeRef = useRef<TypewriterHandle>(null);

    useImperativeHandle(ref, () => ({ skip: () => typeRef.current?.skip() }), []);

    useEffect(() => {
      if (!voiced) return;
      let cancelled = false;
      const fallback = window.setTimeout(() => {
        if (!cancelled) setActive(true);
      }, 1600);
      speak(speaker, text, {
        onPlay: (ms) => {
          if (cancelled) return;
          window.clearTimeout(fallback);
          setActive(true);
          setPlaying(true);
          setDurationMs(Number.isFinite(ms) && ms > 0 ? ms : null);
        },
        onEnd: () => {
          if (cancelled) return;
          setPlaying(false);
        }
      });
      return () => {
        cancelled = true;
        window.clearTimeout(fallback);
      };
    }, [speaker, text, voiced, speak]);

    useEffect(() => {
      onVoicingChange(playing);
    }, [playing, onVoicingChange]);

    return (
      <TypewriterText
        ref={typeRef}
        text={text}
        instant={instant}
        start={active}
        durationMs={playing && durationMs ? durationMs : undefined}
        onDone={onDone}
      />
    );
  }
);
