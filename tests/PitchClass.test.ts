import { assertEquals } from '@std/assert';
import { DisplayMode, stepDisplayMode } from '../src/model/DisplayMode.ts';
import { PitchClass } from '../src/model/PitchClass.ts';

Deno.test('PitchClass wraps values into 0..11', () => {
  assertEquals(new PitchClass(12).value, 0);
  assertEquals(new PitchClass(-1).value, 11);
  assertEquals(new PitchClass(25).value, 1);
});

Deno.test('PitchClass transposes round the circle', () => {
  assertEquals(new PitchClass(0).transpose(-1).name, 'B');
  assertEquals(new PitchClass(7).transpose(7).name, 'D');
});

Deno.test('PitchClass labels in each display mode', () => {
  const asharp = new PitchClass(10);
  assertEquals(asharp.label(DisplayMode.Names), 'A#');
  assertEquals(asharp.label(DisplayMode.Alpha), 'a');
  assertEquals(asharp.label(DisplayMode.Integers), '10');
  assertEquals(new PitchClass(11).alpha, 'b');
});

Deno.test('display mode steps wrap both ways', () => {
  assertEquals(stepDisplayMode(DisplayMode.Integers, +1), DisplayMode.Names);
  assertEquals(stepDisplayMode(DisplayMode.Names, -1), DisplayMode.Integers);
});
