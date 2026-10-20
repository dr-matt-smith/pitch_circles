import { assertAlmostEquals, assertEquals } from '@std/assert';
import { PitchClass } from '../src/model/PitchClass.ts';
import { CircleGeometry } from '../src/view/CircleGeometry.ts';
import { arrowSize, ringArrowPlacements } from '../src/view/ringArrowLayout.ts';

const geo = new CircleGeometry({ x: 100, y: 100 }, 100, 30); // gap = 10

Deno.test('ring arrows sit either side of the root, back to the left at the top', () => {
  const { back, forward } = ringArrowPlacements(geo, 2, new PitchClass(0)); // C, at the top
  assertAlmostEquals(back.centre.y, forward.centre.y);
  assertEquals(back.centre.x < 100 && forward.centre.x > 100, true);
  assertAlmostEquals((back.centre.x + forward.centre.x) / 2, 100);
});

Deno.test('the anticlockwise arrow is on the anticlockwise side, wherever the root is', () => {
  const { back, forward } = ringArrowPlacements(geo, 2, new PitchClass(6)); // F#, at the bottom
  assertEquals(back.centre.x > 100 && forward.centre.x < 100, true); // at the bottom, anticlockwise is to the right
});

Deno.test('ring arrows sit inside the root\'s segment, and are smaller on the inner rings', () => {
  const { start, end } = geo.segmentOf(new PitchClass(0));
  for (let ring = 0; ring < 5; ring++) {
    const { back, forward } = ringArrowPlacements(geo, ring, new PitchClass(0));
    for (const { centre } of [back, forward]) {
      const angle = Math.atan2(centre.y - 100, centre.x - 100);
      assertEquals(angle > start && angle < end, true);
    }
  }
  const big = new CircleGeometry({ x: 400, y: 400 }, 400, 64);
  assertEquals(arrowSize(big, 0) < arrowSize(big, 4), true);
});
