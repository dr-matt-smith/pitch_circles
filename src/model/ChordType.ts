/** The kind of triad a chord is. */
export enum ChordType {
  Major = 'major',
  Minor = 'minor',
  Diminished = 'diminished',
  Augmented = 'augmented',
}

export const CHORD_TYPES: readonly ChordType[] = [
  ChordType.Major,
  ChordType.Minor,
  ChordType.Diminished,
  ChordType.Augmented,
];

// Each triad's pitch classes, above its root
const TRIADS: Record<ChordType, readonly number[]> = {
  [ChordType.Major]: [0, 4, 7],
  [ChordType.Minor]: [0, 3, 7],
  [ChordType.Diminished]: [0, 3, 6],
  [ChordType.Augmented]: [0, 4, 8],
};

export function triadIntervals(type: ChordType): readonly number[] {
  return TRIADS[type];
}

/** The type of the triad with these intervals above its root (e.g. [0, 3, 7] is minor), if it is one of them. */
export function chordTypeOf(intervals: readonly number[]): ChordType | undefined {
  return CHORD_TYPES.find((type) => TRIADS[type].every((interval, i) => interval === intervals[i]));
}
