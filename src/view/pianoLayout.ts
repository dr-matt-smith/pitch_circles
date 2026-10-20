import { PitchClass } from '../model/PitchClass.ts';

const BLACK_KEYS = new Set([1, 3, 6, 8, 10]); // C#, D#, F#, G#, A#

/** One key of a piano keyboard. */
export interface PianoKey {
  note: number; // MIDI note number
  name: string; // e.g. "C4", "F#5"
  isBlack: boolean;
  // White keys: which white key this is, counting from 0 at the left.
  // Black keys: the white key whose right-hand edge it sits on.
  whiteIndex: number;
}

/** The name of a MIDI note, with its octave (60 = C4, middle C). */
export function noteName(note: number): string {
  return `${new PitchClass(note).name}${Math.floor(note / 12) - 1}`;
}

/**
 * The keys from `low` to `high` (MIDI note numbers, inclusive), in order. `low` should be a white key.
 *
 * Plain maths, no drawing, so it can be tested on its own.
 */
export function pianoKeys(low: number, high: number): PianoKey[] {
  const keys: PianoKey[] = [];
  let whites = 0;
  for (let note = low; note <= high; note++) {
    const isBlack = BLACK_KEYS.has(new PitchClass(note).value);
    keys.push({ note, name: noteName(note), isBlack, whiteIndex: isBlack ? whites - 1 : whites });
    if (!isBlack) whites++;
  }
  return keys;
}

export function whiteKeyCount(keys: readonly PianoKey[]): number {
  return keys.filter((key) => !key.isBlack).length;
}
