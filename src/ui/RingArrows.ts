import { Level, LEVELS } from '../model/Level.ts';
import type { TonalPitchSpace } from '../model/TonalPitchSpace.ts';
import type { CircleGeometry } from '../view/CircleGeometry.ts';
import { arrowSize, ringArrowPlacements } from '../view/ringArrowLayout.ts';

/**
 * A "<" and ">" button on every ring of the circles, beside the ring's root, to move it round: on the chromatic and
 * diatonic rings they move the region, on the triadic, fifth and root rings the chord. They are HTML buttons laid
 * over the canvas, and move round with the root.
 */
export class RingArrows {
  private readonly buttons: { level: Level; back: HTMLButtonElement; forward: HTMLButtonElement }[];

  constructor(container: HTMLElement, onStepRegion: (semitones: number) => void, onStepChord: (semitones: number) => void) {
    this.buttons = LEVELS.map((level) => {
      const isRegion = RingArrows.isRegionLevel(level);
      const step = isRegion ? onStepRegion : onStepChord;
      const what = isRegion ? 'Region' : 'Chord';
      return {
        level,
        back: RingArrows.button(container, '<', `${what} root anticlockwise, down a semitone`, () => step(-1)),
        forward: RingArrows.button(container, '>', `${what} root clockwise, up a semitone`, () => step(+1)),
      };
    });
  }

  /** Put the buttons beside each ring's root. */
  update(geometry: CircleGeometry, space: TonalPitchSpace): void {
    const size = arrowSize(geometry);
    for (const { level, back, forward } of this.buttons) {
      const root = RingArrows.isRegionLevel(level) ? space.regionRoot : space.chordRoot;
      const places = ringArrowPlacements(geometry, level, root);
      for (const [button, place] of [[back, places.back], [forward, places.forward]] as const) {
        button.style.width = button.style.height = `${size}px`;
        button.style.fontSize = `${Math.round(size * 0.6)}px`;
        button.style.left = `${place.centre.x - size / 2}px`;
        button.style.top = `${place.centre.y - size / 2}px`;
        button.style.transform = `rotate(${place.rotation}rad)`;
      }
    }
  }

  private static isRegionLevel(level: Level): boolean {
    return level <= Level.Diatonic;
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
