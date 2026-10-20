import { Level } from './Level.ts';
import { PitchClass } from './PitchClass.ts';
import { PitchClassSet } from './PitchClassSet.ts';

// Each level's pitch classes above its root. Each level contains the ones outside it.
const SHAPES: Record<Level, readonly number[]> = {
  [Level.Chromatic]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [Level.Diatonic]: [0, 2, 4, 5, 7, 9, 11], // major scale
  [Level.Triadic]: [0, 4, 7], // major triad
  [Level.Fifth]: [0, 7],
  [Level.Root]: [0],
};

export const MIDDLE_C = 60;

type Listener = (space: TonalPitchSpace) => void;

/**
 * The state of the app: a region (key) and a chord within it. The chromatic and diatonic levels are built on the
 * region's root, the triadic, fifth and root levels on the chord's root.
 *
 * Listeners are told whenever either root changes.
 */
export class TonalPitchSpace {
  private _regionRoot: PitchClass;
  private _chordRoot: PitchClass;
  private readonly listeners: Listener[] = [];

  constructor(regionRoot = new PitchClass(0), chordRoot = new PitchClass(0)) {
    this._regionRoot = regionRoot;
    this._chordRoot = chordRoot;
  }

  get regionRoot(): PitchClass {
    return this._regionRoot;
  }

  set regionRoot(pc: PitchClass) {
    this._regionRoot = pc;
    this.changed();
  }

  get chordRoot(): PitchClass {
    return this._chordRoot;
  }

  set chordRoot(pc: PitchClass) {
    this._chordRoot = pc;
    this.changed();
  }

  /** Move the region root round the circle (+1 = clockwise, a semitone up). */
  stepRegion(semitones: number): void {
    this.regionRoot = this._regionRoot.transpose(semitones);
  }

  /** Move the chord root round the circle (+1 = clockwise, a semitone up). */
  stepChord(semitones: number): void {
    this.chordRoot = this._chordRoot.transpose(semitones);
  }

  /** The pitch classes in one level, for the current region and chord. */
  level(level: Level): PitchClassSet {
    const root = level <= Level.Diatonic ? this._regionRoot : this._chordRoot;
    return PitchClassSet.fromIntervals(SHAPES[level]).rotate(root.value);
  }

  /** MIDI note numbers for the chord in root position, starting from the octave of middle C. */
  chordMidiNotes(base = MIDDLE_C): number[] {
    const root = this._chordRoot.value;
    return SHAPES[Level.Triadic].map((interval) => base + root + interval);
  }

  onChange(listener: Listener): void {
    this.listeners.push(listener);
  }

  private changed(): void {
    for (const listener of this.listeners) listener(this);
  }
}
