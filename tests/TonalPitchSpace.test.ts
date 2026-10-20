import { assertEquals } from '@std/assert';
import { ChordType } from '../src/model/ChordType.ts';
import { Level } from '../src/model/Level.ts';
import { RegionType } from '../src/model/RegionType.ts';
import { PitchClass } from '../src/model/PitchClass.ts';
import { CHORD_ROOT_LOWEST, TonalPitchSpace } from '../src/model/TonalPitchSpace.ts';

const names = (pcs: PitchClass[]) => pcs.map((pc) => pc.name);

Deno.test('C major: each level of the pitch space', () => {
  const space = new TonalPitchSpace();
  assertEquals(space.level(Level.Chromatic).members().length, 12);
  assertEquals(names(space.level(Level.Diatonic).members()), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  assertEquals(names(space.level(Level.Triadic).members()), ['C', 'E', 'G']);
  assertEquals(names(space.level(Level.Fifth).members()), ['C', 'G']);
  assertEquals(names(space.level(Level.Root).members()), ['C']);
});

Deno.test('only the region changes the levels: the chord moves through them', () => {
  const space = new TonalPitchSpace();
  space.stepRegion(7); // G major
  space.stepChord(2); // D major chord
  assertEquals(names(space.level(Level.Diatonic).members()), ['C', 'D', 'E', 'F#', 'G', 'A', 'B']);
  assertEquals(space.level(Level.Diatonic).root()?.name, 'G');
  assertEquals(names(space.level(Level.Triadic).members()), ['D', 'G', 'B']); // G major's tonic triad
  assertEquals(names(space.level(Level.Fifth).members()), ['D', 'G']);
  assertEquals(space.level(Level.Root).root()?.name, 'G');
  assertEquals(names(space.chordPitchClasses()), ['D', 'F#', 'A']); // the chord itself
});

Deno.test('a minor region\'s triadic level is its minor tonic triad', () => {
  const space = new TonalPitchSpace(new PitchClass(9)); // A
  space.regionType = RegionType.HarmonicMinor;
  assertEquals(names(space.level(Level.Triadic).members()), ['C', 'E', 'A']);
});

Deno.test('a minor region uses the natural minor scale', () => {
  const space = new TonalPitchSpace(new PitchClass(9)); // A
  space.regionType = RegionType.Minor;
  assertEquals(space.regionName, 'A minor');
  assertEquals(names(space.level(Level.Diatonic).members()), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  assertEquals(space.level(Level.Diatonic).root()?.name, 'A');
});

Deno.test('a harmonic minor region raises the 7th', () => {
  const space = new TonalPitchSpace(new PitchClass(9)); // A
  space.regionType = RegionType.HarmonicMinor;
  assertEquals(space.regionName, 'A harmonic minor');
  assertEquals(names(space.level(Level.Diatonic).members()), ['C', 'D', 'E', 'F', 'G#', 'A', 'B']);
});

Deno.test('region and chord types cycle round', () => {
  const space = new TonalPitchSpace();
  space.nextRegionType();
  space.nextRegionType();
  assertEquals(space.regionType, RegionType.HarmonicMinor);
  space.nextRegionType();
  assertEquals(space.regionType, RegionType.Major);
  const chordTypes: ChordType[] = [];
  for (let i = 0; i < 4; i++) {
    space.nextChordType();
    chordTypes.push(space.chordType);
  }
  assertEquals(chordTypes, [ChordType.Minor, ChordType.Diminished, ChordType.Augmented, ChordType.Major]);
});

Deno.test('a chord following the region takes the triad on its root in the scale', () => {
  const space = new TonalPitchSpace(); // C major region, C chord
  space.chordFollowsRegion = true;
  const types: string[] = [];
  for (let i = 0; i < 7; i++) {
    types.push(space.chordName);
    space.stepChordIn(Level.Diatonic, +1);
  }
  assertEquals(types, [
    'C major',
    'D minor',
    'E minor',
    'F major',
    'G major',
    'A minor',
    'B diminished',
  ]);
  assertEquals(space.chordMidiNotes(), [72, 76, 79]); // back to C, a C major triad
});

Deno.test('harmonic minor gives an augmented III and a major V', () => {
  const space = new TonalPitchSpace(new PitchClass(9), new PitchClass(0)); // A region, C chord
  space.regionType = RegionType.HarmonicMinor;
  space.chordFollowsRegion = true;
  assertEquals(space.chordName, 'C augmented');
  space.stepChord(4); // E
  assertEquals(space.chordName, 'E major');
  space.stepChord(4); // G#
  assertEquals(space.chordName, 'G# diminished');
});

Deno.test('following the region, a root outside the scale keeps the chosen type', () => {
  const space = new TonalPitchSpace(); // C major
  space.chordType = ChordType.Minor;
  space.chordFollowsRegion = true;
  space.stepChord(1); // C#: not in C major
  assertEquals(space.chordName, 'C# minor');
  space.chordFollowsRegion = false;
  space.stepChord(1); // D, not following: the chosen type
  assertEquals(space.chordName, 'D minor');
  space.chordType = ChordType.Major;
  assertEquals(space.chordName, 'D major');
});

Deno.test('a minor chord has a minor third', () => {
  const space = new TonalPitchSpace();
  space.chordType = ChordType.Minor;
  assertEquals(space.chordName, 'C minor');
  assertEquals(names(space.chordPitchClasses()), ['C', 'D#', 'G']);
  assertEquals(space.chordMidiNotes(), [60, 63, 67]);
  assertEquals(names(space.level(Level.Triadic).members()), ['C', 'E', 'G']); // still C major's tonic triad
});

Deno.test('chord notes are in root position, from the chord\'s root note', () => {
  const space = new TonalPitchSpace();
  assertEquals(space.chordMidiNotes(), [60, 64, 67]);
  space.stepChord(-1); // down to B3
  assertEquals(space.chordRootNote, 59);
  assertEquals(space.chordMidiNotes(), [59, 63, 66]);
});

Deno.test('each level steps the chord to its next note: C major chord, C major region, from C4', () => {
  const step = (level: Level, direction: 1 | -1) => {
    const space = new TonalPitchSpace();
    space.stepChordIn(level, direction);
    return space.chordRootNote;
  };
  assertEquals(step(Level.Chromatic, +1), 61); // C#4
  assertEquals(step(Level.Diatonic, +1), 62); // D4
  assertEquals(step(Level.Triadic, +1), 64); // E4
  assertEquals(step(Level.Fifth, +1), 67); // G4
  assertEquals(step(Level.Root, +1), 72); // C5
  assertEquals(step(Level.Chromatic, -1), 59); // B3
  assertEquals(step(Level.Diatonic, -1), 59); // B3
  assertEquals(step(Level.Triadic, -1), 55); // G3
  assertEquals(step(Level.Fifth, -1), 55); // G3
  assertEquals(step(Level.Root, -1), 48); // C3
});

Deno.test('the levels stay put as the chord moves: C major, the fifth level is C and G', () => {
  const space = new TonalPitchSpace(); // C major region, C major chord on C4
  space.stepChordIn(Level.Fifth, +1);
  assertEquals([space.chordName, space.chordRootNote], ['G major', 67]);
  assertEquals(names(space.level(Level.Fifth).members()), ['C', 'G']); // unchanged
  space.stepChordIn(Level.Fifth, +1);
  assertEquals([space.chordName, space.chordRootNote], ['C major', 72]); // up to C5
  space.stepChordIn(Level.Fifth, -1);
  space.stepChordIn(Level.Fifth, -1);
  assertEquals(space.chordRootNote, 60); // down: G4, then C4
});

Deno.test('the triadic level walks through the region\'s tonic triad', () => {
  const space = new TonalPitchSpace(); // C major: C E G
  const roots: string[] = [];
  for (let i = 0; i < 3; i++) {
    space.stepChordIn(Level.Triadic, +1);
    roots.push(space.chordRoot.name);
  }
  assertEquals(roots, ['E', 'G', 'C']);
  assertEquals(space.chordType, ChordType.Major); // the chord keeps its own type
});

Deno.test('the diatonic step follows the region\'s scale, from a root outside it', () => {
  const space = new TonalPitchSpace(new PitchClass(9), new PitchClass(1)); // A region, C# chord
  space.regionType = RegionType.HarmonicMinor; // A B C D E F G#
  space.stepChordIn(Level.Diatonic, +1);
  assertEquals(space.chordRoot.name, 'D');
  space.stepChordIn(Level.Diatonic, -1);
  space.stepChordIn(Level.Diatonic, -1);
  assertEquals(space.chordRoot.name, 'B');
  space.stepChordIn(Level.Triadic, +1); // A minor's tonic triad: A C E
  assertEquals(space.chordRoot.name, 'C');
  space.stepChordIn(Level.Root, +1); // the region's root
  assertEquals(space.chordRoot.name, 'A');
});

Deno.test('the chord wraps round at the ends of the keyboard, keeping its pitch class', () => {
  const space = new TonalPitchSpace(); // C4
  space.stepChordIn(Level.Root, +1);
  assertEquals(space.chordRootNote, CHORD_ROOT_LOWEST + 24); // C5
  space.stepChordIn(Level.Root, +1);
  assertEquals(space.chordRootNote, CHORD_ROOT_LOWEST); // C6 is too high: back to C3
  space.stepChordIn(Level.Root, -1);
  assertEquals(space.chordRootNote, 72); // C2 is too low: up to C5
  for (const note of space.chordMidiNotes()) assertEquals(note <= 83, true);
});

Deno.test('the region root note is in the octave below middle C', () => {
  const space = new TonalPitchSpace();
  assertEquals(space.regionRootMidiNote(), 48);
  space.stepRegion(7); // G
  assertEquals(space.regionRootMidiNote(), 55);
});

Deno.test('listeners hear about every change, and which root changed', () => {
  const space = new TonalPitchSpace();
  const changes: string[] = [];
  space.onChange((_space, change) => changes.push(change));
  space.stepChord(1);
  space.stepRegion(-1);
  space.nextChordType();
  space.regionType = RegionType.HarmonicMinor;
  assertEquals(changes, ['chord', 'region', 'chord', 'region']);
  assertEquals(space.regionRoot.name, 'B');
});
