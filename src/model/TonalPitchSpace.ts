import { Level } from './Level.ts';
import { PitchClass } from './PitchClass.ts';
import { PitchClassSet } from './PitchClassSet.ts';
import { CHORD_TYPES, ChordType, chordTypeOf, triadIntervals } from './ChordType.ts';
import { nextIn } from './cycle.ts';
import { REGION_TYPES, RegionType, scaleIntervals, scaleTriadIntervals, tonicTriadIntervals } from './RegionType.ts';

const CHROMATIC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const FIFTH = [0, 7];
const ROOT = [0];

export const MIDDLE_C = 60;

/** The region's root is played an octave below middle C, as a bass note under the chord. */
export const REGION_ROOT_BASE = MIDDLE_C - 12;

/**
 * The chord's root stays between C3 and D#5 (MIDI 48 to 75), so all its notes - up to 8 semitones above the root - are
 * on the keyboard (C3 to B5). Past either end it wraps round to the other, keeping its pitch class.
 */
export const CHORD_ROOT_LOWEST = 48;
export const CHORD_ROOT_HIGHEST = 75;

/** Which changed: the region (its root or type), or the chord. */
export type Change = 'region' | 'chord';

type Listener = (space: TonalPitchSpace, change: Change) => void;

/**
 * The state of the app: a region (key) and a chord within it, each with a root and a type
 * (e.g. a harmonic minor region, or a minor chord). The region's root is a pitch class; the chord's root is an
 * actual note (a MIDI note number), so the chord can move up and down octaves.
 *
 * The five levels (the rings) are all built on the region alone - its scale, its tonic triad, its root and fifth, and
 * its root - so only changing the region changes them. The chord moves through them: see stepChordIn().
 *
 * Listeners are told whenever the region or chord changes, and which one.
 */
export class TonalPitchSpace {
  private _regionRoot: PitchClass;
  private _regionType: RegionType;
  private _chordRootNote: number;
  private _chordType: ChordType;
  private _chordFollowsRegion = false;
  private readonly listeners: Listener[] = [];

  constructor(
    regionRoot = new PitchClass(0),
    chordRoot = new PitchClass(0),
    regionType = RegionType.Major,
    chordType = ChordType.Major,
  ) {
    this._regionRoot = regionRoot;
    this._chordRootNote = MIDDLE_C + chordRoot.value;
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

  /** The chord's root, as a pitch class. */
  get chordRoot(): PitchClass {
    return new PitchClass(this._chordRootNote);
  }

  /** The chord's root, as a note: a MIDI note number (60 = middle C). */
  get chordRootNote(): number {
    return this._chordRootNote;
  }

  /**
   * The chord's type. When it follows the region (see chordFollowsRegion), this is the triad on its root in the
   * region's scale - e.g. in C major, D is minor and B diminished - unless its root isn't in the scale, when it is the
   * type last chosen.
   */
  get chordType(): ChordType {
    if (!this._chordFollowsRegion) return this._chordType;
    const scale = scaleIntervals(this._regionType);
    const degree = scale.indexOf(this.chordRoot.transpose(-this._regionRoot.value).value);
    if (degree < 0) return this._chordType;
    return chordTypeOf(scaleTriadIntervals(this._regionType, degree)) ?? this._chordType;
  }

  /** Choose the chord's type (used whenever it isn't following the region). */
  set chordType(type: ChordType) {
    this._chordType = type;
    this.changed('chord');
  }

  /** Move the region root round the circle (+1 = clockwise, a semitone up). */
  stepRegion(semitones: number): void {
    this.regionRoot = this._regionRoot.transpose(semitones);
  }

  /** Move the chord root up or down a number of semitones (+1 = clockwise round the circle). */
  stepChord(semitones: number): void {
    this.moveChordRoot(this._chordRootNote + semitones);
  }

  /**
   * Move the chord's root to the next note up (direction +1) or down (-1) in one level of the region's pitch space:
   * the next semitone (chromatic), the next note of the region's scale (diatonic), the next note of the region's
   * tonic triad (triadic), the region's root or fifth (fifth), or the region's root (root, an octave apart).
   * E.g. in C major the fifth level is C and G, so from a C chord it goes to G, and from G back to C.
   */
  stepChordIn(level: Level, direction: 1 | -1): void {
    const notes = this.level(level);
    let note = this._chordRootNote;
    do note += direction; while (!notes.contains(new PitchClass(note)));
    this.moveChordRoot(note);
  }

  // Past either end of the range, the root wraps round to the other end, keeping its pitch class
  private moveChordRoot(note: number): void {
    if (note > CHORD_ROOT_HIGHEST) note = CHORD_ROOT_LOWEST + (note - CHORD_ROOT_LOWEST) % 12;
    else if (note < CHORD_ROOT_LOWEST) note = CHORD_ROOT_HIGHEST - (CHORD_ROOT_HIGHEST - note) % 12;
    this._chordRootNote = note;
    this.changed('chord');
  }

  /** Whether the chord's type follows the region: the triad on its root in the region's scale. */
  get chordFollowsRegion(): boolean {
    return this._chordFollowsRegion;
  }

  set chordFollowsRegion(follows: boolean) {
    this._chordFollowsRegion = follows;
    this.changed('chord');
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
    return `${this.chordRoot.name} ${this.chordType}`;
  }

  /** The pitch classes in one level, for the current region (the chord doesn't change them). */
  level(level: Level): PitchClassSet {
    return PitchClassSet.fromIntervals(this.shape(level)).rotate(this._regionRoot.value);
  }

  /** The chord's notes, as pitch classes (e.g. C, E, G). */
  chordPitchClasses(): PitchClass[] {
    return this.chordMidiNotes().map((note) => new PitchClass(note));
  }

  /** The MIDI note number of the region's root, in the octave below middle C (C3 to B3). */
  regionRootMidiNote(base = REGION_ROOT_BASE): number {
    return base + this._regionRoot.value;
  }

  /** MIDI note numbers for the chord, in root position from its root note. */
  chordMidiNotes(): number[] {
    return triadIntervals(this.chordType).map((interval) => this._chordRootNote + interval);
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
        return tonicTriadIntervals(this._regionType);
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
