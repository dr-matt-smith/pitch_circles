/** The item after `current` in `items`, wrapping round to the first. */
export function nextIn<T>(items: readonly T[], current: T): T {
  return items[(items.indexOf(current) + 1) % items.length];
}
