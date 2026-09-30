import React from 'react';
import { pixel } from '../../styles/retro';

// A small original pixel-art illustration (document + chat bubble) standing
// in for a real screenshot until AvidReader has a demo to show. Deliberately
// stylized/iconic rather than a mockup, so it never reads as an actual screen.

const DOCUMENT_ROWS = [
  '.KKKKKK.',
  '.KWWWWK.',
  '.KWPPWK.',
  '.KWWWWK.',
  '.KWPPWK.',
  '.KWWWWK.',
  '.KWPPWK.',
  '.KWWWWK.',
  '.KWPWWK.',
  '.KWWWWK.',
  '.KKKKKK.',
];

const BUBBLE_ROWS = [
  '.KKKKKKK.',
  'KCCCCCCCK',
  'KCWCWCWCK',
  'KCCCCCCCK',
  '.KKKKKKK.',
  '...KK....',
];

const COLORS: Record<string, string> = {
  K: pixel.black,
  W: pixel.white,
  P: pixel.purple,
  C: pixel.cyan,
};

const buildPixels = (rows: string[], offsetX: number, offsetY: number) => {
  const pixels: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    row.split('').forEach((cell, x) => {
      if (cell === '.') return;
      pixels.push(
        <rect
          key={`${offsetX}-${offsetY}-${x}-${y}`}
          x={offsetX + x}
          y={offsetY + y}
          width={1}
          height={1}
          fill={COLORS[cell]}
        />
      );
    });
  });
  return pixels;
};

interface PixelAvidReaderArtProps {
  size?: number;
  className?: string;
}

const COLS = 18;
const ROWS = 11;

const PixelAvidReaderArt: React.FC<PixelAvidReaderArtProps> = ({ size = 160, className }) => {
  const pixels = [
    ...buildPixels(DOCUMENT_ROWS, 0, 0),
    ...buildPixels(BUBBLE_ROWS, 9, 0),
  ];

  return (
    <svg
      className={className}
      width={size}
      height={(size * ROWS) / COLS}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Stylized illustration of a document and an AI chat bubble"
    >
      {pixels}
    </svg>
  );
};

export default PixelAvidReaderArt;
