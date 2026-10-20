import { pianoKeys, whiteKeyCount } from './pianoLayout.ts';

/** Why a key is lit: it is the region's root, or a note of the chord. Used as a CSS class. */
export type KeyRole = 'region' | 'chord';

const BLACK_KEY_WIDTH = 0.6; // as a fraction of a white key's width

/**
 * A piano keyboard drawn with HTML elements, which lights up the keys being played.
 * Each key stays lit for as long as its note sounds, so overlapping notes can be lit at once.
 */
export class PianoKeyboard {
  private readonly keys = new Map<number, HTMLElement>();
  private readonly timers = new Map<number, number>();

  constructor(container: HTMLElement, low = 60, high = 83) {
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
        if (key.name.startsWith('C')) element.textContent = key.name; // label each C, to show the octaves
      }
      container.append(element);
      this.keys.set(key.note, element);
    }
  }

  /** Light up `notes` for `seconds`. Notes outside the keyboard are ignored. */
  show(notes: readonly number[], role: KeyRole, seconds: number): void {
    for (const note of notes) {
      const key = this.keys.get(note);
      if (!key) continue;
      clearTimeout(this.timers.get(note));
      key.classList.remove('region', 'chord');
      key.classList.add('lit', role);
      this.timers.set(note, setTimeout(() => key.classList.remove('lit', 'region', 'chord'), seconds * 1000));
    }
  }
}
