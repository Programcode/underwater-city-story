import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

export type TypewriterHandle = {
  /** Reveal the whole line immediately. */
  skip: () => void;
};

type TypewriterTextProps = {
  text: string;
  speed?: number;
  instant?: boolean;
  /** When false, hold until voice playback begins. */
  start?: boolean;
  /** Pace the reveal to a spoken duration (ms). */
  durationMs?: number;
  /** Called once when the line has finished revealing. */
  onDone?: () => void;
};

/**
 * Renders a single line with a typing effect. Mount it with a `key` per line so
 * each line gets a clean instance (no in-render state resets required).
 */
export const TypewriterText = forwardRef<TypewriterHandle, TypewriterTextProps>(
  function TypewriterText({ text, speed = 24, instant = false, start = true, durationMs, onDone }, ref) {
    const { displayed, isTyping, skip } = useTypewriter(text, { speed, instant, start, durationMs });

    useImperativeHandle(ref, () => ({ skip }), [skip]);

    const onDoneRef = useRef(onDone);
    useEffect(() => {
      onDoneRef.current = onDone;
    });

    useEffect(() => {
      if (!isTyping) {
        onDoneRef.current?.();
      }
    }, [isTyping]);

    return (
      <>
        {displayed}
        {isTyping ? <span className="dialogue__caret" aria-hidden="true" /> : null}
      </>
    );
  }
);
