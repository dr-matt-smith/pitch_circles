/** The time between beats, in seconds, at `bpm` beats per minute. */
export function secondsPerBeat(bpm: number): number {
  return 60 / bpm;
}

/**
 * Calls `onTick` once per beat while it is running, starting straight away. The tempo can be changed while it runs.
 *
 * Each beat is timed from the one before it rather than from when the last timer happened to fire, so the beat
 * doesn't drift. If the page was hidden (when browsers slow timers down), it carries on from now rather than
 * playing all the missed beats at once.
 */
export class Metronome {
  private timer?: number;
  private nextBeat = 0; // when the next beat is due, in performance.now() milliseconds

  constructor(
    private readonly onTick: () => void,
    public bpm = 90,
  ) {}

  get running(): boolean {
    return this.timer !== undefined;
  }

  start(): void {
    if (this.running) return;
    this.nextBeat = performance.now();
    this.beat();
  }

  stop(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  private beat(): void {
    this.onTick();
    const beatMs = secondsPerBeat(this.bpm) * 1000;
    const now = performance.now();
    this.nextBeat = Math.max(this.nextBeat + beatMs, now); // never try to catch up on missed beats
    this.timer = setTimeout(() => this.beat(), this.nextBeat - now);
  }
}
