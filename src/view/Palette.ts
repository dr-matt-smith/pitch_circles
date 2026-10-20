import { Level } from '../model/Level.ts';

// The original Java colours (java.awt.Color constants)
export const Palette = {
  background: 0xffffff,
  off: 0xc0c0c0, // lightGray: a pitch class not in the level
  line: 0x0000ff, // blue: circles, dividers and labels
  rootDotLeft: 0xffff00, // yellow
  rootDotRight: 0xff0000, // red
  chordText: '#ff0000',
  regionText: '#ff00ff',
  infoText: '#333333',
  buttonFill: 0xe8e8ee,
  buttonHover: 0xd0d0e0,
  buttonStroke: 0x666688,
  buttonText: '#000033',
} as const;

/** The colour of a pitch class that is in a level. */
export function levelColour(level: Level): number {
  switch (level) {
    case Level.Chromatic:
      return 0xffffff; // white
    case Level.Diatonic:
      return 0xff00ff; // magenta
    default:
      return 0xffafaf; // pink
  }
}
