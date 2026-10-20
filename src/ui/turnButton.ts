// A clockwise arrow: an arc three-quarters of the way round, from 12 o'clock to 9 o'clock, with an arrowhead
// pointing on round (up, at 9 o'clock). Mirrored, it turns anticlockwise.
const CLOCKWISE_ARROW = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4.5 A7.5 7.5 0 1 1 4.5 12" />
    <path d="M1.5 15 L4.5 12 L7.5 15" />
  </svg>`;

/**
 * A button showing a curved arrow, which says which way it turns things round the circle: clockwise (+1, a step
 * up) or anticlockwise (-1, a step down).
 */
export function turnButton(direction: 1 | -1, title: string, run: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = direction > 0 ? 'turn clockwise' : 'turn anticlockwise';
  button.innerHTML = CLOCKWISE_ARROW;
  button.title = title;
  button.setAttribute('aria-label', title);
  button.addEventListener('click', run);
  return button;
}
