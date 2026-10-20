import * as Phaser from 'phaser';
import { ChordPlayer, SilentChordPlayer, WebAudioChordPlayer } from '../../audio/ChordPlayer.ts';
import { DisplayMode, stepDisplayMode } from '../../model/DisplayMode.ts';
import { TonalPitchSpace } from '../../model/TonalPitchSpace.ts';
import { Button } from '../../ui/Button.ts';
import { InfoPanel } from '../../ui/InfoPanel.ts';
import { CircleGeometry } from '../../view/CircleGeometry.ts';
import { PitchCirclesView } from '../../view/PitchCirclesView.ts';

const BUTTON_BAR_HEIGHT = 70;
const INFO_HEIGHT = 60;

/**
 * The app's one scene. It owns the model (TonalPitchSpace), and wires the buttons and keys to it.
 * Whenever the model changes, the circles and info panel are redrawn and the chord is played.
 *
 * Keys: left/right = chord root, down/up = region root, D = display mode.
 */
export class PitchCirclesScene extends Phaser.Scene {
  private space: TonalPitchSpace;
  private displayMode = DisplayMode.Names;
  private circles: PitchCirclesView;
  private info: InfoPanel;
  private player: ChordPlayer;

  constructor() {
    super('PitchCircles');
  }

  create(): void {
    const { width, height } = this.scale;
    this.space = new TonalPitchSpace();
    this.player = this.createPlayer();

    this.createButtons(width);

    const circleArea = height - BUTTON_BAR_HEIGHT - INFO_HEIGHT;
    const geometry = new CircleGeometry(
      { x: width / 2, y: BUTTON_BAR_HEIGHT + circleArea / 2 },
      Math.min(width, circleArea) / 2,
      circleArea * 0.08,
      5, // rings: one per level
      5.6, // ring widths from the inner circle to the edge (a little more than 5, for a margin)
    );
    this.circles = new PitchCirclesView(this, geometry);
    this.info = new InfoPanel(this, 0, height - INFO_HEIGHT / 2, width);

    this.space.onChange(() => {
      this.refresh();
      this.player.play(this.space.chordMidiNotes());
    });
    this.createKeys();
    this.refresh();
  }

  private createButtons(width: number): void {
    const actions: [string, () => void][] = [
      ['< Chord', () => this.space.stepChord(-1)],
      ['Chord >', () => this.space.stepChord(+1)],
      ['< Region', () => this.space.stepRegion(-1)],
      ['Region >', () => this.space.stepRegion(+1)],
      ['< Display', () => this.stepDisplay(-1)],
      ['Display >', () => this.stepDisplay(+1)],
    ];
    const margin = 10;
    const slot = (width - margin) / actions.length;
    actions.forEach(([label, action], i) => {
      new Button(this, margin + slot * i + (slot - margin) / 2, BUTTON_BAR_HEIGHT / 2, slot - margin, 44, label, action);
    });
  }

  private createKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    keyboard.on('keydown-LEFT', () => this.space.stepChord(-1));
    keyboard.on('keydown-RIGHT', () => this.space.stepChord(+1));
    keyboard.on('keydown-DOWN', () => this.space.stepRegion(-1));
    keyboard.on('keydown-UP', () => this.space.stepRegion(+1));
    keyboard.on('keydown-D', () => this.stepDisplay(+1));
  }

  private createPlayer(): ChordPlayer {
    // Share Phaser's audio context: Phaser unlocks it on the first click or key press
    const sound = this.sound;
    return sound instanceof Phaser.Sound.WebAudioSoundManager
      ? new WebAudioChordPlayer(sound.context)
      : new SilentChordPlayer();
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
