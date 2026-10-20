import type { TonalPitchSpace } from '../model/TonalPitchSpace.ts';

/**
 * The line along the bottom: the region and the chord in full (e.g. "A harmonic minor"), with room for controls in
 * between (`middle`).
 */
export class InfoPanel {
  private readonly region: HTMLElement;
  readonly middle: HTMLElement;
  private readonly chord: HTMLElement;

  constructor(container: HTMLElement) {
    this.region = InfoPanel.addSpan(container, 'region');
    this.middle = InfoPanel.addSpan(container, 'middle');
    this.chord = InfoPanel.addSpan(container, 'chord');
  }

  update(space: TonalPitchSpace): void {
    this.region.textContent = `Region: ${space.regionName}`;
    this.chord.textContent = `Chord: ${space.chordName}`;
  }

  private static addSpan(container: HTMLElement, className: string): HTMLElement {
    const span = document.createElement('span');
    span.className = className;
    container.append(span);
    return span;
  }
}
