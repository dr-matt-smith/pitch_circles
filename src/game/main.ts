import * as Phaser from 'phaser';
import { Palette } from '../view/Palette.ts';
import { PitchCirclesScene } from './scenes/PitchCirclesScene.ts';

const config: Phaser.Types.Core.GameConfig = {
  autoFocus: false,
  type: Phaser.AUTO,
  width: 800,
  height: 900,
  backgroundColor: Palette.background,
  antialias: true,
  scene: [PitchCirclesScene],
};

const StartGame = (parent: string) => {
  const game = new Phaser.Game({ ...config, parent });

  // Celbridge previews the page in an iframe, so clicking the app must give it keyboard focus
  const container = document.getElementById(parent)!;
  container.tabIndex = 0;
  container.style.outline = 'none';
  container.addEventListener('pointerdown', () => container.focus({ preventScroll: true }));
  return game;
};

export default StartGame;
