import { assertAlmostEquals, assertEquals } from '@std/assert';
import { PitchClass } from '../src/model/PitchClass.ts';
import { midiToFrequency } from '../src/audio/ChordPlayer.ts';
import { CircleGeometry } from '../src/view/CircleGeometry.ts';

const geo = new CircleGeometry({ x: 100, y: 100 }, 100, 30); // gap = 10

Deno.test('rings are evenly spaced out from the inner radius', () => {
  assertEquals(geo.gap, 10);
  assertEquals(geo.ringInner(0), 30);
  assertEquals(geo.ringOuter(4), 80);
  assertEquals(geo.outerRadius, 80);
  assertEquals(geo.ringMiddle(1), 45);
});

Deno.test('C is at 12 o\'clock, F# at 6 o\'clock, D# at 3 o\'clock', () => {
  const at = (pc: number) => geo.pointAt(geo.angleOf(new PitchClass(pc)), 50);
  assertAlmostEquals(at(0).x, 100);
  assertAlmostEquals(at(0).y, 50);
  assertAlmostEquals(at(6).y, 150);
  assertAlmostEquals(at(3).x, 150);
});

Deno.test('each segment is 30 degrees, centred on its pitch class', () => {
  const { start, end } = geo.segmentOf(new PitchClass(4));
  assertAlmostEquals(end - start, Math.PI / 6);
  assertAlmostEquals((start + end) / 2, geo.angleOf(new PitchClass(4)));
});

Deno.test('MIDI note frequencies', () => {
  assertEquals(midiToFrequency(69), 440);
  assertAlmostEquals(midiToFrequency(60), 261.63, 0.01);
});
