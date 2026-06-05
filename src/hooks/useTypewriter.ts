import { useEffect, useRef, useState } from 'react';

type TypewriterOptions = {
  /** Milliseconds per character. */
  speed?: number;
  /** When true, the full text is shown immediately (no animation). */
  instant?: boolean;
};

type TypewriterResult = {
  /** The portion of text revealed so far. */
  displayed: string;
  /** Whether characters are still being revealed. */
  isTyping: boolean;
  /** Reveal the entire string immediately. */
  skip: () => void;
};

/**
 * Reveals `text` one character at a time, like a film subtitle being typed.
 *
 * The hook does not reset itself when `text` changes — mount it with a `key`
 * tied to the text (see `TypewriterText`) so a new line gets a fresh instance.
 */
export function useTypewriter(text: string, options: TypewriterOptions = {}): TypewriterResult {
  const { speed = 26, instant = false } = options;
  const [count, setCount] = useState(instant ? text.length : 0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (instant) {
      return;
    }

    let lastTick = 0;
    const step = (timestamp: number) => {
      if (!lastTick) {
        lastTick = timestamp;
      }
      const elapsed = timestamp - lastTick;
      if (elapsed >= speed) {
        const advance = Math.max(1, Math.floor(elapsed / speed));
        lastTick = timestamp;
        setCount((current) => Math.min(text.length, current + advance));
      }
      frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [text, speed, instant]);

  // Stop the animation loop once the full string is revealed.
  useEffect(() => {
    if (count >= text.length && frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, [count, text.length]);

  const skip = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    setCount(text.length);
  };

  return {
    displayed: text.slice(0, count),
    isTyping: count < text.length,
    skip
  };
}
