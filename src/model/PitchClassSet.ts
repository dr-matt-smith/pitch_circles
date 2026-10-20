import { PitchClass } from './PitchClass.ts';

/** Whether a pitch class is in a level, and if so whether it is that level's root (tonic). */
export enum Membership {
  Off = 0,
  Member = 1,
  Root = 2,
}

/**
 * A membership value for each of the 12 pitch classes (the Java version's TrivaluePCList).
 * Immutable: rotate() returns a new set.
 */
export class PitchClassSet {
  private readonly values: readonly Membership[];

  private constructor(values: readonly Membership[]) {
    this.values = values;
  }

  /** Build a set from intervals above C, marking `rootInterval` as the root. */
  static fromIntervals(intervals: readonly number[], rootInterval = 0): PitchClassSet {
    const values = new Array<Membership>(PitchClass.COUNT).fill(Membership.Off);
    for (const i of intervals) values[new PitchClass(i).value] = Membership.Member;
    values[new PitchClass(rootInterval).value] = Membership.Root;
    return new PitchClassSet(values);
  }

  /** Transpose every member up by `semitones`. */
  rotate(semitones: number): PitchClassSet {
    const values = new Array<Membership>(PitchClass.COUNT);
    for (let pc = 0; pc < PitchClass.COUNT; pc++) {
      values[new PitchClass(pc + semitones).value] = this.values[pc];
    }
    return new PitchClassSet(values);
  }

  membership(pc: PitchClass): Membership {
    return this.values[pc.value];
  }

  contains(pc: PitchClass): boolean {
    return this.membership(pc) !== Membership.Off;
  }

  isRoot(pc: PitchClass): boolean {
    return this.membership(pc) === Membership.Root;
  }

  /** The members, in order from C. */
  members(): PitchClass[] {
    return PitchClass.all().filter((pc) => this.contains(pc));
  }

  root(): PitchClass | undefined {
    return PitchClass.all().find((pc) => this.isRoot(pc));
  }
}
