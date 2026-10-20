import type { PitchClass } from '../model/PitchClass.ts';
import type { CircleGeometry, Point } from './CircleGeometry.ts';

/** Where one of a ring's arrow buttons goes. */
export interface ArrowPlacement {
  centre: Point;
  rotation: number; // radians: turns the arrow to point along the ring (0 at 12 o'clock)
}

/** The size of a ring's arrow buttons, in pixels. */
export function arrowSize(geometry: CircleGeometry): number {
  return Math.max(16, Math.round(geometry.gap * 0.4));
}

/**
 * Where a ring's "<" (anticlockwise) and ">" (clockwise) buttons go: either side of the label of the ring's root,
 * in the middle of the ring, turned to point along it.
 *
 * Plain maths, no drawing, so it can be tested on its own.
 */
export function ringArrowPlacements(
  geometry: CircleGeometry,
  ring: number,
  root: PitchClass,
): { back: ArrowPlacement; forward: ArrowPlacement } {
  const angle = geometry.angleOf(root);
  const radius = geometry.ringMiddle(ring);
  // the same distance from the label on every ring, so the arrows sit just clear of it
  const offset = (geometry.gap * 0.5) / radius;
  const rotation = angle + Math.PI / 2;
  return {
    back: { centre: geometry.pointAt(angle - offset, radius), rotation },
    forward: { centre: geometry.pointAt(angle + offset, radius), rotation },
  };
}
