import { Level } from './Level.ts';
import { PitchClass } from './PitchClass.ts';
import { PitchClassSet } from './PitchClassSet.ts';
import { CHORD_TYPES, ChordType, triadIntervals } from './ChordType.ts';
import { nextIn } from './cycle.ts';
import { REGION_TYPES, RegionType, scaleIntervals } from './RegionType.ts';

const CHROMATIC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const FIFTH = [0, 7];
const ROOT = [0];

export const MIDDLE_C = 60;

/** Which changed: the region (its root or type), or the chord. */
export type Change = 'region' | 'chord';

type Listener = (space: TonalPitchSpace, change: Change) => void;

/**
 * The state of the app: a region (key) and a chord within it, each with a root and a type
 * (e.g. a harmonic minor region, or a minor chord).
 * The chromatic and diatonic levels are built on the region, the triadic, fifth and root levels on the chord.
 *
 * Listeners are told whenever the region or chord changes, and which one.
 */
export class TonalPitchSpace {
  private _regionRoot: PitchClass;
  private _regionType: RegionType;
  private _chordRoot: PitchClass;
  private _chordType: ChordType;
  private readonly listeners: Listener[] = [];

  constructor(
    regionRoot = new PitchClass(0),
    chordRoot = new PitchClass(0),
    regionType = RegionType.Major,
    chordType = ChordType.Major,
  ) {
    this._regionRoot = regionRoot;
    this._chordRoot = chordRoot;
    this._regionType = regionType;
    this._chordType = chordType;
  }

  get regionRoot(): PitchClass {
    return this._regionRoot;
  }

  set regionRoot(pc: PitchClass) {
    this._regionRoot = pc;
    this.changed('region');
  }

  get regionType(): RegionType {
    return this._regionType;
  }

  set regionType(type: RegionType) {
    this._regionType = type;
    this.changed('region');
  }

  get chordRoot(): PitchClass {
    return this._chordRoot;
  }

  set chordRoot(pc: PitchClass) {
    this._chordRoot = pc;
    this.changed('chord');
  }

  get chordType(): ChordType {
    return this._chordType;
  }

  set chordType(type: ChordType) {
    this._chordType = type;
    this.changed('chord');
  }

  /** Move the region root round the circle (+1 = clockwise, a semitone up). */
  stepRegion(semitones: number): void {
    this.regionRoot = this._regionRoot.transpose(semitones);
  }

  /** Move the chord root round the circle (+1 = clockwise, a semitone up). */
  stepChord(semitones: number): void {
    this.chordRoot = this._chordRoot.transpose(semitones);
  }

  /** Change the region to the next type: major, minor, harmonic minor, major... */
  nextRegionType(): void {
    this.regionType = nextIn(REGION_TYPES, this._regionType);
  }

  /** Change the chord to the next type: major, minor, major... */
  nextChordType(): void {
    this.chordType = nextIn(CHORD_TYPES, this._chordType);
  }

  /** e.g. "A harmonic minor" */
  get regionName(): string {
    return `${this._regionRoot.name} ${this._regionType}`;
  }

  /** e.g. "C major" */
  get chordName(): string {
    return `${this._chordRoot.name} ${this._chordType}`;
  }

  /** The pitch classes in one level, for the current region and chord. */
  level(level: Level): PitchClassSet {
    const root = level <= Level.Diatonic ? this._regionRoot : this._chordRoot;
    return PitchClassSet.fromIntervals(this.shape(level)).rotate(root.value);
  }

  /** The MIDI note number of the region's root, in the octave of middle C. */
  regionRootMidiNote(base = MIDDLE_C): number {
    return base + this._regionRoot.value;
  }

  /** MIDI note numbers for the chord in root position, starting from the octave of middle C. */
  chordMidiNotes(base = MIDDLE_C): number[] {
    const root = this._chordRoot.value;
    return triadIntervals(this._chordType).map((interval) => base + root + interval);
  }

  onChange(listener: Listener): void {
    this.listeners.push(listener);
  }

  // A level's pitch classes above its root. Each level contains the ones outside it.
  private shape(level: Level): readonly number[] {
    switch (level) {
      case Level.Chromatic:
        return CHROMATIC;
      case Level.Diatonic:
        return scaleIntervals(this._regionType);
      case Level.Triadic:
        return triadIntervals(this._chordType);
      case Level.Fifth:
        return FIFTH;
      case Level.Root:
        return ROOT;
    }
  }

  private changed(change: Change): void {
    for (const listener of this.listeners) listener(this, change);
  }
}
