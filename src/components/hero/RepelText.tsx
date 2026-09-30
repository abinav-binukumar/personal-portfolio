import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.span`
  display: inline-block;
  /* Each letter below is its own inline-block span (needed for the
     per-letter repel transform), which otherwise lets the browser wrap
     the line between any two letters - splitting words mid-way. */
  white-space: nowrap;
`;

const Letter = styled.span<{ $dx: number; $dy: number; $color: string }>`
  display: inline-block;
  white-space: pre;
  color: ${(p) => p.$color};
  transform: translate(${(p) => p.$dx}px, ${(p) => p.$dy}px);
  transition: transform 0.15s ease-out;
  will-change: transform;
`;

interface RepelTextProps {
  text: string;
  className?: string;
  radius?: number;
  strength?: number;
  /** Hex colors the text lerps across, letter by letter (e.g. a gradient effect that survives per-letter transforms). */
  gradient?: [string, string];
}

const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const lerpColor = (from: string, to: string, t: number): string => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
};

// Splits text into per-letter spans that spring away from the cursor,
// then ease back into place once the cursor moves on. Colors are
// interpolated per letter (rather than a CSS background-clip gradient)
// since the transform on each letter would otherwise break that trick.
const RepelText: React.FC<RepelTextProps> = ({
  text,
  className,
  radius = 60,
  strength = 22,
  gradient = ['#d9a441', '#f4f0e6'],
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [offsets, setOffsets] = useState<{ dx: number; dy: number }[]>(
    () => text.split('').map(() => ({ dx: 0, dy: 0 }))
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const letters = containerRef.current?.querySelectorAll('span[data-letter]');
      if (!letters) return;

      const next = Array.from(letters).map((el) => {
        const rect = el.getBoundingClientRect();
        const letterX = rect.left + rect.width / 2;
        const letterY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - letterX, e.clientY - letterY);

        if (dist > radius) return { dx: 0, dy: 0 };

        const push = (1 - dist / radius) * strength;
        const angle = Math.atan2(letterY - e.clientY, letterX - e.clientX);
        return { dx: Math.cos(angle) * push, dy: Math.sin(angle) * push };
      });

      setOffsets(next);
    },
    [radius, strength]
  );

  const handleMouseLeave = useCallback(() => {
    setOffsets(text.split('').map(() => ({ dx: 0, dy: 0 })));
  }, [text]);

  const chars = text.split('');
  const denominator = Math.max(chars.length - 1, 1);

  return (
    <Wrapper
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {chars.map((char, i) => (
        <Letter
          key={i}
          data-letter
          $dx={offsets[i]?.dx ?? 0}
          $dy={offsets[i]?.dy ?? 0}
          $color={lerpColor(gradient[0], gradient[1], i / denominator)}
        >
          {char === ' ' ? ' ' : char}
        </Letter>
      ))}
    </Wrapper>
  );
};

export default RepelText;
