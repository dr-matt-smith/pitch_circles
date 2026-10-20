import { DisplayMode, displayModeName } from '../model/DisplayMode.ts';
import type { TonalPitchSpace } from '../model/TonalPitchSpace.ts';

/** The line of text under the circles: the chord and region, and the display mode. */
export class InfoPanel {
  private readonly chord: HTMLElement;
  private readonly region: HTMLElement;
  private readonly mode: HTMLElement;

  constructor(container: HTMLElement) {
    this.chord = InfoPanel.addSpan(container, 'chord');
    this.region = InfoPanel.addSpan(container, 'region');
    this.mode = InfoPanel.addSpan(container, 'mode');
  }

  update(space: TonalPitchSpace, mode: DisplayMode): void {
    this.chord.textContent = `Chord: ${space.chordName}`;
    this.region.textContent = `Region: ${space.regionName}`;
    this.mode.textContent = `Labels: ${displayModeName(mode)}`;
  }

  private static addSpan(container: HTMLElement, className: string): HTMLElement {
    const span = document.createElement('span');
    span.className = className;
    container.append(span);
    return span;
  }
}
