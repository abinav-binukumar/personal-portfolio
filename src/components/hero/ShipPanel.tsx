import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import spaceship from '../../assets/spaceship/webp/spaceship.webp';
import { pixel, fontPixelDisplay } from '../../styles/retro';

const Panel = styled.div`
  width: 100%;
  height: 100%;
  min-height: 50vh;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid ${pixel.cyan};
    outline-offset: -2px;
  }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const Spaceship = styled.img`
  width: 80%;
  z-index: 1;
  animation: ${floatAnimation} 3s infinite;
  /* The source image has a purple "B" baked into its pixels. hue-rotate
     alone couldn't reach gold here (its color matrix zeroed the blue
     channel at every angle tried); sepia+saturate+brightness landed
     almost exactly on the target gold (#d9a441) instead, while the white
     "A" stays clean white (the same math clips it back to full brightness). */
  filter: sepia(1) saturate(3) brightness(1.3) drop-shadow(0 0 18px rgba(217, 164, 65, 0.45));
  transition: transform 0.2s ease;

  @media (min-width: 768px) {
    width: 50%;
  }

  ${Panel}:hover & {
    transform: scale(1.04);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const shrinkAndMove = (left: number, top: number, containerWidth: number, containerHeight: number) => keyframes`
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(${containerWidth / 2 - left}px, ${containerHeight / 2 - top}px) scale(0);
    opacity: 0;
  }
`;

const Circle = styled.div<{
  $left: number;
  $top: number;
  $size: number;
  $containerWidth: number;
  $containerHeight: number;
  $color: string;
}>`
  position: absolute;
  background-color: ${({ $color }) => $color};
  border-radius: 50%;
  opacity: 0.8;

  ${({ $left, $top, $size, $containerWidth, $containerHeight }) => css`
    width: ${$size}px;
    height: ${$size}px;
    left: ${$left}px;
    top: ${$top}px;
    animation: ${shrinkAndMove($left, $top, $containerWidth, $containerHeight)} 2s linear forwards;
  `}

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const PlayHint = styled.div`
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: ${fontPixelDisplay};
  font-size: 0.55em;
  color: ${pixel.brightGold};
  opacity: 0.85;
  z-index: 2;
  pointer-events: none;
  text-shadow: 0 0 6px rgba(242, 193, 78, 0.6);
`;

// Mostly muted gold and cream, with a few darker amber ones mixed in.
const PARTICLE_COLORS = [pixel.gold, pixel.cream, pixel.brightGold, pixel.goldDark];

interface CircleProps {
  id: number;
  left: number;
  top: number;
  size: number;
  containerWidth: number;
  containerHeight: number;
  color: string;
}

interface ShipPanelProps {
  onActivate: () => void;
  /** Whether this side of the flip card is currently facing the user. */
  active?: boolean;
}

const ShipPanel: React.FC<ShipPanelProps> = ({ onActivate, active = true }) => {
  const [circles, setCircles] = useState<CircleProps[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip the whole animation while the game side is showing instead - this
    // was running (and re-rendering) forever in the background even when
    // nobody could see it, alongside the game's own animation loop.
    if (!active) return;

    const interval = setInterval(() => {
      const container = containerRef.current;
      if (!container) return;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const newCircles: CircleProps[] = Array.from({ length: 7 }).map(() => {
        const isVerticalEdge = Math.random() > 0.5;
        const left = isVerticalEdge
          ? (Math.random() > 0.5 ? 0 : containerWidth - 10)
          : Math.random() * containerWidth;
        const top = !isVerticalEdge
          ? (Math.random() > 0.5 ? 0 : containerHeight - 10)
          : Math.random() * containerHeight;

        return {
          id: Date.now() + Math.random(),
          left,
          top,
          size: Math.random() * 20 + 10,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          containerWidth,
          containerHeight,
        };
      });

      setCircles((prev) => [...prev, ...newCircles]);
      setTimeout(() => {
        setCircles((prev) => prev.filter((circle) => !newCircles.some((nc) => nc.id === circle.id)));
      }, 2000);
    }, 333);

    return () => clearInterval(interval);
  }, [active]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <Panel
      ref={containerRef}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Play the contact form game"
    >
      <Spaceship src={spaceship} alt="Abinav's spaceship" />
      {circles.map((circle) => (
        <Circle
          key={circle.id}
          $left={circle.left}
          $top={circle.top}
          $size={circle.size}
          $containerWidth={circle.containerWidth}
          $containerHeight={circle.containerHeight}
          $color={circle.color}
        />
      ))}
      <PlayHint>Click the ship to play &amp; say hello</PlayHint>
    </Panel>
  );
};

export default ShipPanel;
