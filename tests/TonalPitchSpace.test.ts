import { assertEquals } from '@std/assert';
import { Level } from '../src/model/Level.ts';
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

Deno.test('chord notes are in root position above middle C', () => {
  const space = new TonalPitchSpace();
  assertEquals(space.chordMidiNotes(), [60, 64, 67]);
  space.stepChord(-1); // B
  assertEquals(space.chordMidiNotes(), [71, 75, 78]);
});

Deno.test('listeners hear about every change', () => {
  const space = new TonalPitchSpace();
  let changes = 0;
  space.onChange(() => changes++);
  space.stepChord(1);
  space.stepRegion(-1);
  assertEquals(changes, 2);
  assertEquals(space.regionRoot.name, 'B');
});
