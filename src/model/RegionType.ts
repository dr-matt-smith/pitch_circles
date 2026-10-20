/** The kind of scale a region (key) uses: this is the diatonic level. */
export enum RegionType {
  Major = 'major',
  Minor = 'minor',
  HarmonicMinor = 'harmonic minor',
}

export const REGION_TYPES: readonly RegionType[] = [RegionType.Major, RegionType.Minor, RegionType.HarmonicMinor];

// Each scale's pitch classes, above its root
const SCALES: Record<RegionType, readonly number[]> = {
  [RegionType.Major]: [0, 2, 4, 5, 7, 9, 11],
  [RegionType.Minor]: [0, 2, 3, 5, 7, 8, 10], // natural minor
  [RegionType.HarmonicMinor]: [0, 2, 3, 5, 7, 8, 11], // natural minor with a raised 7th
};

export function scaleIntervals(type: RegionType): readonly number[] {
  return SCALES[type];
}

/**
 * The triad built on a scale degree, from the scale's own notes (root, 3rd and 5th: every other note of the scale),
 * as intervals above that degree. E.g. on the 2nd degree of a major scale: [0, 3, 7], a minor triad.
 * `degree` counts from 0 (the tonic).
 */
export function scaleTriadIntervals(type: RegionType, degree: number): number[] {
  const scale = SCALES[type];
  const note = (step: number) => scale[(degree + step) % scale.length];
  return [0, 2, 4].map((step) => (note(step) - note(0) + 12) % 12);
}

/** The region's tonic triad, above its root: major for a major region, minor for a minor or harmonic minor one. */
export function tonicTriadIntervals(type: RegionType): readonly number[] {
  return type === RegionType.Major ? [0, 4, 7] : [0, 3, 7];
}
