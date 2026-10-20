import { DisplayMode } from '../model/DisplayMode.ts';
import { PitchClass } from '../model/PitchClass.ts';
import type { PitchClassSet } from '../model/PitchClassSet.ts';
import { pianoKeys, whiteKeyCount } from './pianoLayout.ts';

/** Why a key is lit: it is the region's root, a note of the chord, or a key that was clicked. Used as a CSS class. */
export type KeyRole = 'region' | 'chord' | 'played';

const ROLES: readonly KeyRole[] = ['region', 'chord', 'played'];

const BLACK_KEY_WIDTH = 0.6; // as a fraction of a white key's width

/**
 * A piano keyboard drawn with HTML elements, which shows the keys being played with a coloured disc near the top
 * of each key, leaving the key's own colours visible. A disc stays for as long as its note sounds, so overlapping
 * notes can show at once.
 *
 * Each key is labelled with its pitch class, in the same style as the circles (see setLabels()), and the keys in
 * the region's scale are coloured in the region colour (see setScale()), and the chord's notes have a band in the
 * chord colour (see setChord()). As in the circles' dots, the region's root has a red ring round its label, and the
 * chord's root a yellow one.
 *
 * Clicking a key calls `onPress` with its note. Dragging across the keys with the button held plays each one.
 */
export class PianoKeyboard {
  private readonly keys = new Map<number, HTMLElement>();
  private readonly timers = new Map<number, number>();
  private readonly labels = new Map<number, HTMLElement>();

  constructor(container: HTMLElement, onPress: (note: number) => void, low = 48, high = 83) {
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
      // The label, which has a red ring round it on the region's root (tonic) and a yellow one on the chord's root
      const label = document.createElement('span');
      label.className = 'label';
      // The disc shown in the top third of the key while its note sounds (see show())
      const marker = document.createElement('span');
      marker.className = 'marker';
      element.append(label, marker);
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
   * Colour the keys whose pitch class is in `scale` (e.g. the diatonic level, for the current region), and mark
   * its root (the tonic) with a red ring round its label.
   */
  setScale(scale: PitchClassSet): void {
    for (const [note, key] of this.keys) {
      const pc = new PitchClass(note);
      key.classList.toggle('in-scale', scale.contains(pc));
      key.classList.toggle('tonic', scale.isRoot(pc));
    }
  }

  /** Mark the chord's actual keys (`notes`, as MIDI note numbers), and its root key with a yellow ring round its label. */
  setChord(notes: readonly number[], root: number): void {
    for (const [note, key] of this.keys) {
      key.classList.toggle('chord-tone', notes.includes(note));
      key.classList.toggle('chord-root', note === root);
    }
  }

  /**
   * Show `notes` as playing (a disc in the role's colour) for `seconds`. Notes outside the keyboard are ignored.
   * With `allOctaves`, every key with the same pitch class lights up too: e.g. every C, for a C.
   *
   * Any notes still showing in the same role are hidden first, even if they are still sounding: a new chord
   * replaces the old chord's discs, a new region root the old one's, and a clicked key the last clicked key's.
   */
  show(notes: readonly number[], role: KeyRole, seconds: number, allOctaves = false): void {
    this.hide(role);

    const pitchClasses = new Set(notes.map((note) => new PitchClass(note).value));
    const lit = allOctaves ? [...this.keys.keys()].filter((note) => pitchClasses.has(new PitchClass(note).value)) : notes;

    for (const note of lit) {
      const key = this.keys.get(note);
      if (!key) continue;
      clearTimeout(this.timers.get(note));
      key.classList.remove(...ROLES);
      key.classList.add('lit', role);
      this.timers.set(note, setTimeout(() => key.classList.remove('lit', ...ROLES), seconds * 1000));
    }
  }

  /** Hide the discs of every note showing in `role`. */
  private hide(role: KeyRole): void {
    for (const [note, key] of this.keys) {
      if (!key.classList.contains(role)) continue;
      clearTimeout(this.timers.get(note));
      key.classList.remove('lit', role);
    }
  }
}
