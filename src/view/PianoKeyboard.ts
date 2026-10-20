import { DisplayMode } from '../model/DisplayMode.ts';
import { PitchClass } from '../model/PitchClass.ts';
import type { PitchClassSet } from '../model/PitchClassSet.ts';
import { pianoKeys, whiteKeyCount } from './pianoLayout.ts';

/** Why a key is lit: it is the region's root, a note of the chord, or a key that was clicked. Used as a CSS class. */
export type KeyRole = 'region' | 'chord' | 'played';

const ROLES: readonly KeyRole[] = ['region', 'chord', 'played'];

const BLACK_KEY_WIDTH = 0.6; // as a fraction of a white key's width

/**
 * A piano keyboard drawn with HTML elements, which lights up the keys being played.
 * Each key stays lit for as long as its note sounds, so overlapping notes can be lit at once.
 *
 * Each key is labelled with its pitch class, in the same style as the circles (see setLabels()), and the keys in
 * the region's scale are outlined in the region colour, the tonic more thickly (see setScale()).
 *
 * Clicking a key calls `onPress` with its note. Dragging across the keys with the button held plays each one.
 */
export class PianoKeyboard {
  private readonly keys = new Map<number, HTMLElement>();
  private readonly timers = new Map<number, number>();
  private readonly labels = new Map<number, HTMLElement>();

  constructor(container: HTMLElement, onPress: (note: number) => void, low = 60, high = 83) {
    const layout = pianoKeys(low, high);
    const whiteWidth = 100 / whiteKeyCount(layout);

    for (const key of layout) {
      const element = document.createElement('div');
      element.className = key.isBlack ? 'key black' : 'key white';
      element.title = key.name;
      if (key.isBlack) {
        const width = whiteWidth * BLACK_KEY_WIDTH;
        element.style.left = `${(key.whiteIndex + 1) * whiteWidth - width / 2}%`;
        element.style.width = `${width}%`;
      } else {
        element.style.left = `${key.whiteIndex * whiteWidth}%`;
        element.style.width = `${whiteWidth}%`;
      }
      const label = document.createElement('span');
      label.className = 'label';
      element.append(label);
      this.labels.set(key.note, label);

      element.addEventListener('pointerdown', (event) => {
        event.preventDefault(); // don't start selecting text, or take the focus from the page
        onPress(key.note);
      });
      element.addEventListener('pointerenter', (event) => {
        if (event.buttons === 1) onPress(key.note); // dragging across the keys
      });
      container.append(element);
      this.keys.set(key.note, element);
    }
  }

  /** Label the keys as the circles are labelled: e.g. "A#", "a" or "10". Hovering over a key shows its full name. */
  setLabels(mode: DisplayMode): void {
    for (const [note, label] of this.labels) {
      label.textContent = new PitchClass(note).label(mode);
    }
  }

  /**
   * Outline the keys whose pitch class is in `scale` (e.g. the diatonic level, for the current region), with a
   * thicker outline for its root (the tonic).
   */
  setScale(scale: PitchClassSet): void {
    for (const [note, key] of this.keys) {
      const pc = new PitchClass(note);
      key.classList.toggle('in-scale', scale.contains(pc));
      key.classList.toggle('tonic', scale.isRoot(pc));
    }
  }

  /** Light up `notes` for `seconds`. Notes outside the keyboard are ignored. */
  show(notes: readonly number[], role: KeyRole, seconds: number): void {
    for (const note of notes) {
      const key = this.keys.get(note);
      if (!key) continue;
      clearTimeout(this.timers.get(note));
      key.classList.remove(...ROLES);
      key.classList.add('lit', role);
      this.timers.set(note, setTimeout(() => key.classList.remove('lit', ...ROLES), seconds * 1000));
    }
  }
}
