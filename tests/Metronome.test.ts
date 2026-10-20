import { assertEquals } from '@std/assert';
import { secondsPerBeat } from '../src/audio/Metronome.ts';

Deno.test('beats are evenly spaced at the tempo', () => {
  assertEquals(secondsPerBeat(60), 1);
  assertEquals(secondsPerBeat(120), 0.5);
  assertEquals(secondsPerBeat(90), 2 / 3);
});
