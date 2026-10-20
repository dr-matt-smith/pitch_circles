import type { PitchClass } from '../model/PitchClass.ts';
import type { CircleGeometry, Point } from './CircleGeometry.ts';

/** Where one of a ring's arrow buttons goes. */
export interface ArrowPlacement {
  centre: Point;
}

const SEGMENT = (2 * Math.PI) / 12;
const ARROW_ANGLE = SEGMENT * 0.36; // how far either side of the root's label: just inside its segment's edges

/**
 * The size of a ring's arrows, in pixels: in proportion to the ring, so they are smaller on the inner rings, where
 * the segments are smaller.
 */
export function arrowSize(geometry: CircleGeometry, ring: number): number {
  const segmentWidth = geometry.ringMiddle(ring) * SEGMENT; // the length of the segment's arc
  return Math.round(Math.max(10, Math.min(geometry.gap * 0.5, segmentWidth * 0.28)));
}

/**
 * Where a ring's anticlockwise and clockwise arrows go: either side of the label of the root, near the edges of its
 * segment, in the middle of the ring - the anticlockwise one on the anticlockwise side.
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
  return {
    back: { centre: geometry.pointAt(angle - ARROW_ANGLE, radius) },
    forward: { centre: geometry.pointAt(angle + ARROW_ANGLE, radius) },
  };
}
