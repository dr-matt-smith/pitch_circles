import { assertEquals } from '@std/assert';
import { Level, LEVELS } from '../src/model/Level.ts';
import { ringOf } from '../src/view/ringOrder.ts';

Deno.test('normally chromatic is the innermost ring, and root (octave) the outermost', () => {
  assertEquals(LEVELS.map((level) => ringOf(level, false)), [0, 1, 2, 3, 4]);
});

Deno.test('reversed, chromatic is the outermost ring, and root (octave) the innermost', () => {
  assertEquals(ringOf(Level.Chromatic, true), 4);
  assertEquals(ringOf(Level.Root, true), 0);
  assertEquals(ringOf(Level.Triadic, true), 2);
});
