import { DisplayMode } from './DisplayMode.ts';

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/**
 * One of the 12 pitch classes (0 = C, 1 = C#, ... 11 = B).
 * Immutable: transposing gives a new PitchClass.
 *
 * @example
 * ```ts
 * import { assertEquals } from '@std/assert';
 * assertEquals(new PitchClass(11).transpose(2).name, 'C#');
 * ```
 */
export class PitchClass {
  static readonly COUNT = 12;

  readonly value: number;

  constructor(value: number) {
    // wrap any integer (including negatives) into 0..11
    this.value = ((Math.trunc(value) % PitchClass.COUNT) + PitchClass.COUNT) % PitchClass.COUNT;
  }

  /** All 12 pitch classes, C to B. */
  static all(): PitchClass[] {
    return Array.from({ length: PitchClass.COUNT }, (_, i) => new PitchClass(i));
  }

  transpose(semitones: number): PitchClass {
    return new PitchClass(this.value + semitones);
  }

  equals(other: PitchClass): boolean {
    return this.value === other.value;
  }

  /** e.g. "C", "C#" */
  get name(): string {
    return NAMES[this.value];
  }

  /** 0..9 then "a", "b" */
  get alpha(): string {
    return this.value.toString(12);
  }

  label(mode: DisplayMode): string {
    switch (mode) {
      case DisplayMode.Names:
        return this.name;
      case DisplayMode.Alpha:
        return this.alpha;
      case DisplayMode.Integers:
        return String(this.value);
    }
  }

  toString(): string {
    return this.name;
  }
}
