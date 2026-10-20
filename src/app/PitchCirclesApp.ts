import { NotePlayer, SilentNotePlayer, WebAudioNotePlayer } from '../audio/NotePlayer.ts';
import { DisplayMode, stepDisplayMode } from '../model/DisplayMode.ts';
import { TonalPitchSpace } from '../model/TonalPitchSpace.ts';
import { ButtonBar } from '../ui/ButtonBar.ts';
import { InfoPanel } from '../ui/InfoPanel.ts';
import { PitchCirclesView } from '../view/PitchCirclesView.ts';

/** The page elements the app uses. */
export interface AppElements {
  buttons: HTMLElement;
  canvas: HTMLCanvasElement;
  info: HTMLElement;
}

/**
 * The app. It owns the model (TonalPitchSpace), and wires the buttons and keys to it.
 * Whenever the model changes, the circles and info panel are redrawn. Changing the region plays its root note;
 * changing the chord plays the chord's three notes.
 *
 * Keys: left/right = chord root, down/up = region root, D = display mode.
 */
export class PitchCirclesApp {
  private readonly space = new TonalPitchSpace();
  private displayMode = DisplayMode.Names;
  private readonly circles: PitchCirclesView;
  private readonly info: InfoPanel;
  private readonly player: NotePlayer;

  constructor(elements: AppElements) {
    this.player = 'AudioContext' in globalThis ? new WebAudioNotePlayer() : new SilentNotePlayer();
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

    this.space.onChange((space, change) => {
      this.refresh();
      this.player.play(change === 'region' ? [space.regionRootMidiNote()] : space.chordMidiNotes());
    });
    document.addEventListener('keydown', (event) => this.onKey(event));
    new ResizeObserver(() => {
      this.circles.fitToParent();
      this.refresh();
    }).observe(elements.canvas.parentElement!);

    this.refresh();
  }

  private onKey(event: KeyboardEvent): void {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => this.space.stepChord(-1),
      ArrowRight: () => this.space.stepChord(+1),
      ArrowDown: () => this.space.stepRegion(-1),
      ArrowUp: () => this.space.stepRegion(+1),
      d: () => this.stepDisplay(+1),
      D: () => this.stepDisplay(+1),
    };
    const action = actions[event.key];
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
  }
}
