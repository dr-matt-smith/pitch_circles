import { Level } from '../model/Level.ts';

// The original Java colours (java.awt.Color constants)
export const Palette = {
  off: '#c0c0c0', // lightGray: a pitch class not in the level
  line: '#0000ff', // blue: circles, dividers and labels
  rootDotLeft: '#ffff00', // yellow
  rootDotRight: '#ff0000', // red
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
