/** An on/off switch with a label (a checkbox, styled as a switch). `onChange` is called when it is clicked. */
export class Toggle {
  private readonly input: HTMLInputElement;

  constructor(container: HTMLElement, label: string, title: string, onChange: (on: boolean) => void) {
    const wrapper = document.createElement('label');
    wrapper.className = 'toggle';
    wrapper.title = title;
    this.input = document.createElement('input');
    this.input.type = 'checkbox';
    this.input.setAttribute('role', 'switch');
    this.input.addEventListener('change', () => onChange(this.input.checked));
    wrapper.append(this.input, label);
    container.append(wrapper);
  }

  get on(): boolean {
    return this.input.checked;
  }

  /** Switch it on or off from code (e.g. after a key press), which doesn't call `onChange`. */
  set on(on: boolean) {
    this.input.checked = on;
  }
}
