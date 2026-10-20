import { Level } from '../model/Level.ts';

/** Each level's name, as a pitch space. */
export const SPACE_NAMES: Record<Level, string> = {
  [Level.Chromatic]: 'Chromatic space',
  [Level.Diatonic]: 'Diatonic space',
  [Level.Triadic]: 'Triadic space',
  [Level.Fifth]: 'Open fifth space',
  [Level.Root]: 'Octave space',
};

/** What a step in each level moves the chord's root to, for tooltips: "Chord root up to ..." */
export const STEPS: Record<Level, string> = {
  [Level.Chromatic]: 'the next semitone',
  [Level.Diatonic]: 'the next note of the region\'s scale',
  [Level.Triadic]: 'the next note of the region\'s tonic triad',
  [Level.Fifth]: 'the region\'s next root or fifth',
  [Level.Root]: 'the region\'s next root (octave)',
};
