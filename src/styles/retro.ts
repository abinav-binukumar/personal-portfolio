// Shared pixel-arcade design tokens for styled-components files.
// (Mirrors src/styles/_retro.scss for plain .scss files.)
//
// Palette: near-black + warm gold + cream, instead of the earlier
// purple/cyan neon scheme. purple/purpleDark/cyan/white are kept as
// aliases so every component that already references them (most of the
// site) picks up the new colors for free.

export const pixel = {
  bg: '#090909',
  bgAlt: '#121212',
  bgCard: '#121212',
  gold: '#d9a441',
  goldDark: '#a6792f',
  brightGold: '#f2c14e',
  cream: '#f4f0e6',
  muted: '#8c877d',
  black: '#090909',
  // Aliases - old names, new values.
  purple: '#d9a441',
  purpleDark: '#a6792f',
  cyan: '#f2c14e',
  white: '#f4f0e6',
};

export const fontPixelDisplay = "'Press Start 2P', 'RobotoMono', monospace";
export const fontPixelBody = "'RobotoMono', monospace";

// Stair-stepped "pixel" corners instead of rounded ones.
export const pixelCorners = (size = 8): string => `polygon(
  0 ${size}px, ${size}px ${size}px, ${size}px 0,
  calc(100% - ${size}px) 0, calc(100% - ${size}px) ${size}px, 100% ${size}px,
  100% calc(100% - ${size}px), calc(100% - ${size}px) calc(100% - ${size}px), calc(100% - ${size}px) 100%,
  ${size}px 100%, ${size}px calc(100% - ${size}px), 0 calc(100% - ${size}px)
)`;
