import { Level, LEVELS } from '../model/Level.ts';
import { levelColour } from '../view/Palette.ts';
import { SPACE_NAMES, STEPS } from './levelSteps.ts';
import { turnButton } from './turnButton.ts';

/**
 * A fixed panel of buttons, one per pitch space, coloured like its ring, which step the chord to the next note in that
 * space, as the arrows on the rings do, but stay put: the left end turns clockwise (a step up), the right end
 * anticlockwise (a step down). They are listed in the same order as the rings, outermost first.
 */
export class SpaceButtons {
  private readonly rows = new Map<Level, HTMLElement>();

  constructor(private readonly container: HTMLElement, onStep: (level: Level, direction: 1 | -1) => void) {
    container.classList.add('space-buttons');
    for (const level of LEVELS) {
      const row = document.createElement('div');
      row.className = 'space';
      row.style.background = levelColour(level);

      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = SPACE_NAMES[level];

      row.append(
        turnButton(+1, `Chord root clockwise, up to ${STEPS[level]}`, () => onStep(level, +1)),
        name,
        turnButton(-1, `Chord root anticlockwise, down to ${STEPS[level]}`, () => onStep(level, -1)),
      );
      this.rows.set(level, row);
    }
  }

  /** List the spaces in the rings' order, outermost first (`ringOf` gives each level's ring, 0 = innermost). */
  update(ringOf: (level: Level) => number): void {
    const outsideIn = [...LEVELS].sort((a, b) => ringOf(b) - ringOf(a));
    this.container.replaceChildren(...outsideIn.map((level) => this.rows.get(level)!));
  }
}
