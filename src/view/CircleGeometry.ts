import { PitchClass } from '../model/PitchClass.ts';

export interface Point {
  x: number;
  y: number;
}

const SEGMENT = (2 * Math.PI) / PitchClass.COUNT; // 30 degrees, in radians

/**
 * Where everything goes on the pitch circles: the radius of each ring and the angle of each pitch class.
 * Pitch classes go clockwise round a clock face, C at 12 o'clock.
 *
 * Angles are in radians, clockwise from 3 o'clock (as Phaser and the canvas use, since y points down).
 *
 * Plain maths, no Phaser, so it can be tested on its own.
 */
export class CircleGeometry {
  readonly gap: number;

  /**
   * @param centre      the middle of the circles
   * @param maxRadius   the space available, from the centre to the edge
   * @param innerRadius the radius of the innermost circle
   * @param rings       how many rings (levels) to draw
   * @param gaps        how many ring widths fit between innerRadius and maxRadius (more than `rings` leaves a margin)
   */
  constructor(
    readonly centre: Point,
    maxRadius: number,
    readonly innerRadius: number,
    readonly rings = 5,
    gaps = 7,
  ) {
    this.gap = (maxRadius - innerRadius) / gaps;
  }

  /** Inner edge of ring `ring` (0 = innermost). ringInner(rings) is the outer edge of the outermost ring. */
  ringInner(ring: number): number {
    return this.innerRadius + ring * this.gap;
  }

  ringOuter(ring: number): number {
    return this.ringInner(ring + 1);
  }

  /** The middle of a ring, where its labels go. */
  ringMiddle(ring: number): number {
    return this.ringInner(ring) + this.gap / 2;
  }

  get outerRadius(): number {
    return this.ringInner(this.rings);
  }

  /** The angle of the middle of a pitch class's segment. */
  angleOf(pc: PitchClass): number {
    return pc.value * SEGMENT - Math.PI / 2;
  }

  /** The start and end angles of a pitch class's segment. */
  segmentOf(pc: PitchClass): { start: number; end: number } {
    const middle = this.angleOf(pc);
    return { start: middle - SEGMENT / 2, end: middle + SEGMENT / 2 };
  }

  pointAt(angle: number, radius: number): Point {
    return {
      x: this.centre.x + Math.cos(angle) * radius,
      y: this.centre.y + Math.sin(angle) * radius,
    };
  }
}
