/** A button's label, and what happens when it's clicked. */
export interface ButtonAction {
  label: string;
  title: string;
  run: () => void;
}

/** A row of HTML buttons, one per action. */
export class ButtonBar {
  constructor(container: HTMLElement, actions: readonly ButtonAction[]) {
    for (const action of actions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      button.title = action.title;
      button.addEventListener('click', action.run);
      container.append(button);
    }
  }
}
