import { Level } from '../model/Level.ts';

// The original Java colours (java.awt.Color constants). The page's colours (buttons, keyboard, info line) are in
// public/style.css.
export const Palette = {
  off: '#c0c0c0', // lightGray: a pitch class not in the level
  line: '#0000ff', // blue: circles, dividers and labels
  regionRootDot: '#ff0000', // red: the region's root (tonic), in the diatonic ring
  chordRootDot: '#ffff00', // yellow: the chord's root, in the root ring
  dotOutline: '#222222',
} as const;

/** The colour of a pitch class that is in a level. */
export function levelColour(level: Level): string {
  switch (level) {
    case Level.Chromatic:
      return '#ffffff'; // white
    case Level.Diatonic:
      return '#ff00ff'; // magenta
    default:
      return '#ffafaf'; // pink
  }
}
