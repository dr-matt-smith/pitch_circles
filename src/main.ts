import { PitchCirclesApp } from './app/PitchCirclesApp.ts';

document.addEventListener('DOMContentLoaded', () => {
  new PitchCirclesApp({
    buttons: document.getElementById('buttons')!,
    canvas: document.getElementById('circles') as HTMLCanvasElement,
    info: document.getElementById('info')!,
  });
});
