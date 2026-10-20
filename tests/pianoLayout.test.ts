import { assertEquals } from '@std/assert';
import { noteName, pianoKeys, whiteKeyCount } from '../src/view/pianoLayout.ts';

Deno.test('note names include the octave, with middle C as C4', () => {
  assertEquals(noteName(60), 'C4');
  assertEquals(noteName(78), 'F#5');
  assertEquals(noteName(59), 'B3');
});

Deno.test('two octaves from C4 have 14 white keys and 10 black', () => {
  const keys = pianoKeys(60, 83);
  assertEquals(keys.length, 24);
  assertEquals(whiteKeyCount(keys), 14);
  assertEquals(keys.at(-1)?.name, 'B5');
});

Deno.test('black keys sit on the edge of the white key before them', () => {
  const keys = pianoKeys(60, 71);
  const key = (name: string) => keys.find((k) => k.name === name)!;
  assertEquals(key('C4').whiteIndex, 0);
  assertEquals(key('C#4'), { note: 61, name: 'C#4', isBlack: true, whiteIndex: 0 });
  assertEquals(key('F4').whiteIndex, 3);
  assertEquals(key('F#4').whiteIndex, 3);
  assertEquals(key('B4').whiteIndex, 6);
});
