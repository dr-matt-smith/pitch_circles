export interface RadioOption<T> {
  value: T;
  label: string;
}

let groups = 0; // gives each group's radio buttons their own name

/**
 * A set of radio buttons, all visible at once. `onChange` is called with the chosen value; `value` can also be set
 * from code (e.g. after a key press), which doesn't call `onChange`.
 */
export class RadioGroup<T> {
  private readonly inputs = new Map<T, HTMLInputElement>();

  constructor(container: HTMLElement, title: string, options: readonly RadioOption<T>[], onChange: (value: T) => void) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'radio-group';
    const legend = document.createElement('legend');
    legend.textContent = title;
    fieldset.append(legend);

    const name = `radio-group-${++groups}`;
    for (const option of options) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.addEventListener('change', () => {
        if (input.checked) onChange(option.value);
      });
      label.append(input, option.label);
      fieldset.append(label);
      this.inputs.set(option.value, input);
    }
    container.append(fieldset);
  }

  set value(value: T) {
    const input = this.inputs.get(value);
    if (input) input.checked = true;
  }
}
