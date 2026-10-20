import * as Phaser from 'phaser';
import { Palette } from '../view/Palette.ts';

/** A clickable rectangle with a label. */
export class Button extends Phaser.GameObjects.Container {
  private readonly box: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
  ) {
    super(scene, x, y);

    this.box = scene.add.rectangle(0, 0, width, height, Palette.buttonFill)
      .setStrokeStyle(1.5, Palette.buttonStroke);
    const text = scene.add.text(0, 0, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${Math.round(height * 0.4)}px`,
      color: Palette.buttonText,
    }).setOrigin(0.5);
    this.add([this.box, text]);

    this.box.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.box.setFillStyle(Palette.buttonHover))
      .on('pointerout', () => this.box.setFillStyle(Palette.buttonFill))
      .on('pointerdown', onClick);

    scene.add.existing(this);
  }
}
