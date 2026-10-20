import * as Phaser from 'phaser';
import { DisplayMode, displayModeName } from '../model/DisplayMode.ts';
import type { TonalPitchSpace } from '../model/TonalPitchSpace.ts';
import { Palette } from '../view/Palette.ts';

/** The line of text under the circles: the chord and region roots, and the display mode. */
export class InfoPanel {
  private readonly chord: Phaser.GameObjects.Text;
  private readonly region: Phaser.GameObjects.Text;
  private readonly mode: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    const style = { fontFamily: 'Times New Roman, serif', fontSize: '22px' };
    this.chord = scene.add.text(x + width * 0.2, y, '', { ...style, color: Palette.chordText }).setOrigin(0.5);
    this.region = scene.add.text(x + width * 0.5, y, '', { ...style, color: Palette.regionText }).setOrigin(0.5);
    this.mode = scene.add.text(x + width * 0.8, y, '', { ...style, color: Palette.infoText }).setOrigin(0.5);
  }

  update(space: TonalPitchSpace, mode: DisplayMode): void {
    this.chord.setText(`Chord root: ${space.chordRoot.name}`);
    this.region.setText(`Region root: ${space.regionRoot.name}`);
    this.mode.setText(`Labels: ${displayModeName(mode)}`);
  }
}
