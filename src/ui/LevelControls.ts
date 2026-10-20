import { RadioGroup, RadioOption } from './RadioGroup.ts';
import { turnButton } from './turnButton.ts';

export interface LevelControlsOptions<T> {
  title: string; // e.g. "Region"
  className: string; // e.g. "region": colours the root's name
  keysHint: string; // e.g. "down/up arrows", for the buttons' tooltips
  types: readonly RadioOption<T>[];
  onStep: (semitones: number) => void;
  onType: (type: T) => void;
}

/**
 * The controls for the region or the chord: clockwise and anticlockwise arrows to move its root round the circle, its root's name, and
 * radio buttons for its type (e.g. major, minor).
 */
export class LevelControls<T> {
  private readonly root: HTMLElement;
  private readonly types: RadioGroup<T>;
  /** The controls' box, for adding more controls to (e.g. a switch). */
  readonly element: HTMLElement;

  constructor(container: HTMLElement, options: LevelControlsOptions<T>) {
    const section = this.element = document.createElement('section');
    section.className = `level ${options.className}`;

    const title = document.createElement('h2');
    title.textContent = options.title;

    const back = turnButton(-1, `${options.title} root anticlockwise, down a semitone (${options.keysHint})`, () =>
      options.onStep(-1));
    const forward = turnButton(+1, `${options.title} root clockwise, up a semitone (${options.keysHint})`, () =>
      options.onStep(+1));

    this.root = document.createElement('span');
    this.root.className = 'root';

    // Clockwise first, as on the space buttons
    section.append(title, forward, back, this.root);
    this.types = new RadioGroup(section, `${options.title} type`, options.types, options.onType);
    container.append(section);
  }

  /** Show the root's name and the type; `typeChoosable` false greys the type's radio buttons out. */
  update(rootName: string, type: T, typeChoosable = true): void {
    this.root.textContent = rootName;
    this.types.value = type;
    this.types.enabled = typeChoosable;
  }
}
