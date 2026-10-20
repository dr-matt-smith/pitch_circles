/**
 * The five levels of (Lerdahl's) tonal pitch space, drawn as concentric rings.
 * Chromatic is the innermost ring, Root the outermost.
 */
export enum Level {
  Chromatic = 0,
  Diatonic = 1,
  Triadic = 2,
  Fifth = 3,
  Root = 4,
}

export const LEVELS: readonly Level[] = [Level.Chromatic, Level.Diatonic, Level.Triadic, Level.Fifth, Level.Root];
