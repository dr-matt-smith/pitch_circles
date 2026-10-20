import { assertEquals } from '@std/assert';
import { ChordType } from '../src/model/ChordType.ts';
import { Level } from '../src/model/Level.ts';
import { RegionType } from '../src/model/RegionType.ts';
import { PitchClass } from '../src/model/PitchClass.ts';
import { TonalPitchSpace } from '../src/model/TonalPitchSpace.ts';

const names = (pcs: PitchClass[]) => pcs.map((pc) => pc.name);

Deno.test('C major: each level of the pitch space', () => {
  const space = new TonalPitchSpace();
  assertEquals(space.level(Level.Chromatic).members().length, 12);
  assertEquals(names(space.level(Level.Diatonic).members()), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  assertEquals(names(space.level(Level.Triadic).members()), ['C', 'E', 'G']);
  assertEquals(names(space.level(Level.Fifth).members()), ['C', 'G']);
  assertEquals(names(space.level(Level.Root).members()), ['C']);
});

Deno.test('the region moves the diatonic level, the chord moves the triad levels', () => {
  const space = new TonalPitchSpace();
  space.stepRegion(7); // G major
  space.stepChord(2); // D major chord
  assertEquals(names(space.level(Level.Diatonic).members()), ['C', 'D', 'E', 'F#', 'G', 'A', 'B']);
  assertEquals(space.level(Level.Diatonic).root()?.name, 'G');
  assertEquals(names(space.level(Level.Triadic).members()), ['D', 'F#', 'A']);
  assertEquals(space.level(Level.Root).root()?.name, 'D');
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
  space.nextChordType();
  assertEquals(space.chordType, ChordType.Minor);
  space.nextChordType();
  assertEquals(space.chordType, ChordType.Major);
});

Deno.test('a minor chord has a minor third', () => {
  const space = new TonalPitchSpace();
  space.chordType = ChordType.Minor;
  assertEquals(space.chordName, 'C minor');
  assertEquals(names(space.level(Level.Triadic).members()), ['C', 'D#', 'G']);
  assertEquals(names(space.level(Level.Fifth).members()), ['C', 'G']);
  assertEquals(space.chordMidiNotes(), [60, 63, 67]);
});

Deno.test('chord notes are in root position above middle C', () => {
  const space = new TonalPitchSpace();
  assertEquals(space.chordMidiNotes(), [60, 64, 67]);
  space.stepChord(-1); // B
  assertEquals(space.chordMidiNotes(), [71, 75, 78]);
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
