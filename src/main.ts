import { PitchCirclesApp } from './app/PitchCirclesApp.ts';

document.addEventListener('DOMContentLoaded', () => {
  const element = (id: string) => document.getElementById(id)!;
  new PitchCirclesApp({
    piano: element('piano'),
    levels: element('levels'),
    play: element('play'),
    stage: element('stage'),
    canvas: element('circles') as HTMLCanvasElement,
    spaces: element('spaces'),
    settings: element('settings'),
    info: element('info'),
  });
});
