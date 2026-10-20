import { Level, LEVELS } from '../model/Level.ts';
import type { TonalPitchSpace } from '../model/TonalPitchSpace.ts';
import type { CircleGeometry } from '../view/CircleGeometry.ts';
import { arrowSize, ringArrowPlacements } from '../view/ringArrowLayout.ts';

// What each ring's arrows move the chord's root to, for their tooltips
const STEPS: Record<Level, string> = {
  [Level.Chromatic]: 'the next semitone',
  [Level.Diatonic]: 'the next note of the region\'s scale',
  [Level.Triadic]: 'the next note of the region\'s tonic triad',
  [Level.Fifth]: 'the region\'s next root or fifth',
  [Level.Root]: 'the region\'s next root (octave)',
};

/**
 * A "<" and ">" arrow on every ring of the circles, near the edges of the chord's root's segment, to move the chord by that ring's step:
 * to the next note down or up in that level of the pitch space (see TonalPitchSpace.stepChordIn()). They are HTML
 * buttons laid over the canvas, and move round with the chord's root.
 */
export class RingArrows {
  private readonly buttons: { level: Level; back: HTMLButtonElement; forward: HTMLButtonElement }[];

  constructor(container: HTMLElement, onStep: (level: Level, direction: 1 | -1) => void) {
    this.buttons = LEVELS.map((level) => ({
      level,
      back: RingArrows.button(container, '<', `Chord root down to ${STEPS[level]}`, () => onStep(level, -1)),
      forward: RingArrows.button(container, '>', `Chord root up to ${STEPS[level]}`, () => onStep(level, +1)),
    }));
  }

  /** Put the buttons beside the chord's root, on each level's ring (`ringOf` says which ring that is). */
  update(geometry: CircleGeometry, space: TonalPitchSpace, ringOf: (level: Level) => number): void {
    for (const { level, back, forward } of this.buttons) {
      const ring = ringOf(level);
      const size = arrowSize(geometry, ring);
      const places = ringArrowPlacements(geometry, ring, space.chordRoot);
      for (const [button, place] of [[back, places.back], [forward, places.forward]] as const) {
        button.style.width = button.style.height = `${size}px`;
        button.style.fontSize = `${size}px`;
        button.style.left = `${place.centre.x - size / 2}px`;
        button.style.top = `${place.centre.y - size / 2}px`;
        button.style.transform = `rotate(${place.rotation}rad)`;
      }
    }
  }

  private static button(container: HTMLElement, text: string, title: string, run: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ring-arrow';
    button.textContent = text;
    button.title = title;
    button.addEventListener('click', run);
    container.append(button);
    return button;
  }
}
