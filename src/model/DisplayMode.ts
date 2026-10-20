/** How pitch classes are labelled on the circles. */
export enum DisplayMode {
  Names = 0, // C, C#, D ...
  Alpha = 1, // 0..9, a, b
  Integers = 2, // 0..11
}

const MODE_COUNT = 3;

/** Step through the display modes, wrapping round in either direction. */
export function stepDisplayMode(mode: DisplayMode, step: number): DisplayMode {
  return (((mode + step) % MODE_COUNT) + MODE_COUNT) % MODE_COUNT as DisplayMode;
}

export function displayModeName(mode: DisplayMode): string {
  return ['names', 'alphanumeric', 'integers'][mode];
}
