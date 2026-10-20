import { assertAlmostEquals, assertEquals } from '@std/assert';
import { PitchClass } from '../src/model/PitchClass.ts';
import { CircleGeometry } from '../src/view/CircleGeometry.ts';
import { ringArrowPlacements } from '../src/view/ringArrowLayout.ts';

const geo = new CircleGeometry({ x: 100, y: 100 }, 100, 30); // gap = 10

Deno.test('ring arrows sit either side of the root, back to the left at the top', () => {
  const { back, forward } = ringArrowPlacements(geo, 2, new PitchClass(0)); // C, at the top
  assertAlmostEquals(back.centre.y, forward.centre.y);
  assertEquals(back.centre.x < 100 && forward.centre.x > 100, true);
  assertAlmostEquals((back.centre.x + forward.centre.x) / 2, 100);
  assertAlmostEquals(back.rotation, 0); // upright at the top
});

Deno.test('ring arrows turn to point along the ring', () => {
  const { back, forward } = ringArrowPlacements(geo, 2, new PitchClass(6)); // F#, at the bottom
  assertAlmostEquals(back.rotation, Math.PI); // upside down: ">" points left, which is clockwise down there
  assertEquals(back.centre.x > 100 && forward.centre.x < 100, true);
});

Deno.test('ring arrows are the same distance from the label on every ring', () => {
  const distance = (ring: number) => {
    const { back, forward } = ringArrowPlacements(geo, ring, new PitchClass(0));
    return Math.hypot(back.centre.x - forward.centre.x, back.centre.y - forward.centre.y);
  };
  assertAlmostEquals(distance(0), distance(4), 0.5);
});
