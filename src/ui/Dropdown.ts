/**
 * A labelled <select>. `onChange` is called with the chosen value; `value` can also be set from code (e.g. after
 * a key press), which doesn't call `onChange`.
 */
export class Dropdown<T extends string> {
  private readonly select: HTMLSelectElement;

  constructor(
    container: HTMLElement,
    label: string,
    title: string,
    options: readonly T[],
    onChange: (value: T) => void,
  ) {
    const wrapper = document.createElement('label');
    wrapper.textContent = `${label} `;
    wrapper.title = title;

    this.select = document.createElement('select');
    for (const option of options) {
      this.select.add(new Option(option[0].toUpperCase() + option.slice(1), option));
    }
    this.select.addEventListener('change', () => onChange(this.select.value as T));

    wrapper.append(this.select);
    container.append(wrapper);
  }

  set value(value: T) {
    this.select.value = value;
  }
}
