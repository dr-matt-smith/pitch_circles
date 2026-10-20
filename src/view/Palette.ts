import { Level } from '../model/Level.ts';

// The circles' colours, starting from the original Java ones (java.awt.Color constants). The page's colours (buttons,
// keyboard, info line) are in public/style.css, and match these.
export const Palette = {
  off: '#c0c0c0', // lightGray: a pitch class not in the level
  line: '#0000ff', // blue: circles, dividers and labels
  chordSlice: '#000000', // black: the thick outline round each of the chord's notes' slices
  regionRootDot: '#ff0000', // red: the region's root (tonic), in the diatonic ring
  chordRootDot: '#ffff00', // yellow: the chord's root, in the outermost ring
  dotOutline: '#222222',
} as const;

/** The colour of a pitch class that is in a level: each level (ring) has its own. */
export function levelColour(level: Level): string {
  switch (level) {
    case Level.Chromatic:
      return '#cfe3ff'; // pale blue
    case Level.Diatonic:
      return '#ff00ff'; // magenta: the region's colour, as on the keyboard
    case Level.Triadic:
      return '#ffa64d'; // orange: the chord's notes, as on the keyboard
    case Level.Fifth:
      return '#7fd37f'; // green
    case Level.Root:
      return '#4dd9e6'; // cyan
  }
}
