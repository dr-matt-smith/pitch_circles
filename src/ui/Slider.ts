export interface SliderOptions {
  label: string;
  title: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  format: (value: number) => string; // how the value is shown beside the slider, e.g. "90 BPM"
}

/** A labelled slider, which shows its current value. `onChange` is called as it moves. */
export class Slider {
  constructor(container: HTMLElement, options: SliderOptions, onChange: (value: number) => void) {
    const wrapper = document.createElement('label');
    wrapper.className = 'slider';
    wrapper.title = options.title;

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = options.label;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(options.min);
    input.max = String(options.max);
    input.step = String(options.step ?? 1);
    input.value = String(options.value);

    const shown = document.createElement('output');
    shown.textContent = options.format(options.value);

    input.addEventListener('input', () => {
      const value = Number(input.value);
      shown.textContent = options.format(value);
      onChange(value);
    });

    wrapper.append(name, input, shown);
    container.append(wrapper);
  }
}
