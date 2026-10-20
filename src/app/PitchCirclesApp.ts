import { INSTRUMENTS, instrumentNamed } from '../audio/instruments.ts';
import { NotePlayer, SilentNotePlayer, SynthNotePlayer } from '../audio/NotePlayer.ts';
import { CHORD_TYPES, ChordType } from '../model/ChordType.ts';
import { DisplayMode, stepDisplayMode } from '../model/DisplayMode.ts';
import { REGION_TYPES, RegionType } from '../model/RegionType.ts';
import { TonalPitchSpace } from '../model/TonalPitchSpace.ts';
import { ButtonBar } from '../ui/ButtonBar.ts';
import { Dropdown } from '../ui/Dropdown.ts';
import { InfoPanel } from '../ui/InfoPanel.ts';
import { KeyRole, PianoKeyboard } from '../view/PianoKeyboard.ts';
import { PitchCirclesView } from '../view/PitchCirclesView.ts';

/** The page elements the app uses. */
export interface AppElements {
  piano: HTMLElement;
  buttons: HTMLElement;
  canvas: HTMLCanvasElement;
  info: HTMLElement;
}

/**
 * The app. It owns the model (TonalPitchSpace), and wires the buttons and keys to it.
 * Whenever the model changes, the circles and info panel are redrawn. Changing the region plays its root note;
 * changing the chord plays the chord's three notes. The keyboard along the top shows the notes as they play,
 * and clicking its keys plays them.
 *
 * Keys: left/right = chord root, down/up = region root, R = next region type, C = next chord type, D = display mode.
 */
export class PitchCirclesApp {
  private readonly space = new TonalPitchSpace();
  private displayMode = DisplayMode.Names;
  private readonly circles: PitchCirclesView;
  private readonly info: InfoPanel;
  private readonly player: NotePlayer;
  private readonly piano: PianoKeyboard;
  private readonly regionType: Dropdown<RegionType>;
  private readonly chordType: Dropdown<ChordType>;

  constructor(elements: AppElements) {
    this.player = 'AudioContext' in globalThis ? new SynthNotePlayer() : new SilentNotePlayer();
    this.piano = new PianoKeyboard(elements.piano, (note) => this.play([note], 'played'));
    this.circles = new PitchCirclesView(elements.canvas);
    this.info = new InfoPanel(elements.info);

    new ButtonBar(elements.buttons, [
      { label: '< Chord', title: 'Chord root down a semitone (left arrow)', run: () => this.space.stepChord(-1) },
      { label: 'Chord >', title: 'Chord root up a semitone (right arrow)', run: () => this.space.stepChord(+1) },
      { label: '< Region', title: 'Region root down a semitone (down arrow)', run: () => this.space.stepRegion(-1) },
      { label: 'Region >', title: 'Region root up a semitone (up arrow)', run: () => this.space.stepRegion(+1) },
      { label: '< Display', title: 'Previous labels', run: () => this.stepDisplay(-1) },
      { label: 'Display >', title: 'Next labels (D)', run: () => this.stepDisplay(+1) },
    ]);
    this.regionType = new Dropdown(
      elements.buttons,
      'Region',
      'The region\'s scale (R)',
      REGION_TYPES,
      (type) => this.space.regionType = type,
    );
    this.chordType = new Dropdown(
      elements.buttons,
      'Chord',
      'The chord\'s type (C)',
      CHORD_TYPES,
      (type) => this.space.chordType = type,
    );
    this.createInstrumentDropdown(elements.buttons);

    this.space.onChange((space, change) => {
      this.refresh();
      if (change === 'region') this.play([space.regionRootMidiNote()], 'region');
      else this.play(space.chordMidiNotes(), 'chord');
    });
    document.addEventListener('keydown', (event) => this.onKey(event));
    new ResizeObserver(() => {
      this.circles.fitToParent();
      this.refresh();
    }).observe(elements.canvas.parentElement!);

    this.refresh();
  }

  private createInstrumentDropdown(container: HTMLElement): void {
    const player = this.player;
    if (!(player instanceof SynthNotePlayer)) return;
    new Dropdown(
      container,
      'Instrument',
      'The sound the notes are played with',
      INSTRUMENTS.map((sound) => sound.name),
      (name) => {
        player.instrument = instrumentNamed(name) ?? player.instrument;
        this.play(this.space.chordMidiNotes(), 'chord'); // let the new sound be heard
      },
    );
  }

  /** Play notes, and show them on the keyboard. */
  private play(notes: readonly number[], role: KeyRole): void {
    this.player.play(notes);
    this.piano.show(notes, role, this.player.soundingSeconds);
  }

  private onKey(event: KeyboardEvent): void {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => this.space.stepChord(-1),
      ArrowRight: () => this.space.stepChord(+1),
      ArrowDown: () => this.space.stepRegion(-1),
      ArrowUp: () => this.space.stepRegion(+1),
      c: () => this.space.nextChordType(),
      r: () => this.space.nextRegionType(),
      d: () => this.stepDisplay(+1),
    };
    if (event.ctrlKey || event.metaKey || event.altKey) return; // leave browser shortcuts alone
    if (event.target instanceof HTMLSelectElement) return; // arrow keys move through a dropdown's options
    const action = actions[event.key.length === 1 ? event.key.toLowerCase() : event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  private stepDisplay(step: number): void {
    this.displayMode = stepDisplayMode(this.displayMode, step);
    this.refresh();
  }

  private refresh(): void {
    this.circles.redraw(this.space, this.displayMode);
    this.info.update(this.space, this.displayMode);
    this.regionType.value = this.space.regionType;
    this.chordType.value = this.space.chordType;
  }
}
