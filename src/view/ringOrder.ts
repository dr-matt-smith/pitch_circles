import { Level, LEVELS } from '../model/Level.ts';

/**
 * Which ring a level is drawn on, counting out from the innermost (0). Normally the chromatic level is innermost and
 * the root (octave) level outermost; `reversed` turns that round, so chromatic is outermost.
 */
export function ringOf(level: Level, reversed: boolean): number {
  return reversed ? LEVELS.length - 1 - level : level;
}
