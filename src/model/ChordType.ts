/** The kind of triad a chord is: this is the triadic level. */
export enum ChordType {
  Major = 'major',
  Minor = 'minor',
}

export const CHORD_TYPES: readonly ChordType[] = [ChordType.Major, ChordType.Minor];

// Each triad's pitch classes, above its root
const TRIADS: Record<ChordType, readonly number[]> = {
  [ChordType.Major]: [0, 4, 7],
  [ChordType.Minor]: [0, 3, 7],
};

export function triadIntervals(type: ChordType): readonly number[] {
  return TRIADS[type];
}
