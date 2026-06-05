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
  /** Called once when the line has finished revealing. */
  onDone?: () => void;
};

/**
 * Renders a single line with a typing effect. Mount it with a `key` per line so
 * each line gets a clean instance (no in-render state resets required).
 */
export const TypewriterText = forwardRef<TypewriterHandle, TypewriterTextProps>(
  function TypewriterText({ text, speed = 24, instant = false, onDone }, ref) {
    const { displayed, isTyping, skip } = useTypewriter(text, { speed, instant });

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
