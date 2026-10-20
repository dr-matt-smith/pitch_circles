import { assert, assertEquals } from '@std/assert';
import { DEFAULT_INSTRUMENT, INSTRUMENTS, instrumentNamed } from '../src/audio/instruments.ts';
import { INSTRUMENT_DEFAULTS, readInstrument } from '../src/audio/voice.ts';

Deno.test('readInstrument fills in missing fields with the defaults', () => {
  assertEquals(readInstrument({}), INSTRUMENT_DEFAULTS);
  assertEquals(readInstrument(null), INSTRUMENT_DEFAULTS);
  assertEquals(readInstrument({ wave: 'triangle' }).wave, 'triangle');
  assertEquals(readInstrument({ adsr: { a: 0.5 } }).adsr, { ...INSTRUMENT_DEFAULTS.adsr, a: 0.5 });
});

Deno.test('readInstrument rejects bad values and clamps out-of-range ones', () => {
  const inst = readInstrument({ wave: 'kazoo', volume: 3, pulseWidth: 0, filter: { type: 'notch', q: 100 } });
  assertEquals(inst.wave, 'square');
  assertEquals(inst.volume, 1);
  assertEquals(inst.pulseWidth, 0.05);
  assertEquals(inst.filter.type, 'lowpass');
  assertEquals(inst.filter.q, 20);
});

Deno.test('the built-in instruments are all pitched, with different names', () => {
  assert(INSTRUMENTS.length > 0);
  for (const sound of INSTRUMENTS) {
    assertEquals(sound.format, 'synthsound');
    assert(readInstrument(sound.instrument).wave !== 'noise', `${sound.name} has no pitch`);
  }
  assertEquals(new Set(INSTRUMENTS.map((s) => s.name)).size, INSTRUMENTS.length);
});

Deno.test('instruments can be found by name', () => {
  assertEquals(DEFAULT_INSTRUMENT.name, 'Glass Bell');
  assertEquals(instrumentNamed('Warm Pad')?.name, 'Warm Pad');
  assertEquals(instrumentNamed('Kazoo'), undefined);
});
