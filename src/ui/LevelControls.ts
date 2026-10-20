import { RadioGroup, RadioOption } from './RadioGroup.ts';

export interface LevelControlsOptions<T> {
  title: string; // e.g. "Region"
  className: string; // e.g. "region": colours the root's name
  keysHint: string; // e.g. "down/up arrows", for the buttons' tooltips
  types: readonly RadioOption<T>[];
  onStep: (semitones: number) => void;
  onType: (type: T) => void;
}

/**
 * The controls for the region or the chord: "<" and ">" to move its root round the circle, its root's name, and
 * radio buttons for its type (e.g. major, minor).
 */
export class LevelControls<T> {
  private readonly root: HTMLElement;
  private readonly types: RadioGroup<T>;

  constructor(container: HTMLElement, options: LevelControlsOptions<T>) {
    const section = document.createElement('section');
    section.className = `level ${options.className}`;

    const title = document.createElement('h2');
    title.textContent = options.title;

    const back = LevelControls.button('<', `${options.title} root down a semitone (${options.keysHint})`, () =>
      options.onStep(-1));
    const forward = LevelControls.button('>', `${options.title} root up a semitone (${options.keysHint})`, () =>
      options.onStep(+1));

    this.root = document.createElement('span');
    this.root.className = 'root';

    section.append(title, back, forward, this.root);
    this.types = new RadioGroup(section, `${options.title} type`, options.types, options.onType);
    container.append(section);
  }

  update(rootName: string, type: T): void {
    this.root.textContent = rootName;
    this.types.value = type;
  }

  private static button(text: string, title: string, run: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.title = title;
    button.addEventListener('click', run);
    return button;
  }
}
