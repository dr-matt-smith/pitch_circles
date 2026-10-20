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

export const DISPLAY_MODES: readonly DisplayMode[] = [DisplayMode.Names, DisplayMode.Alpha, DisplayMode.Integers];

/** A description of a display mode, for its radio button. */
export function displayModeLabel(mode: DisplayMode): string {
  return ['Note letters (C, C#, D …)', 'Alphanumeric (0 … 9, a, b)', 'Integers (0 … 11)'][mode];
}
