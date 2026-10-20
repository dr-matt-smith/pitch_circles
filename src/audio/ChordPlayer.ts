/** Something that can sound a chord. */
export interface ChordPlayer {
  play(midiNotes: readonly number[]): void;
}

/** Frequency in Hz of a MIDI note number (69 = A4 = 440 Hz). */
export function midiToFrequency(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

/**
 * Plays chords with the Web Audio API: one soft triangle-wave voice per note, fading out.
 * (Replaces the Java version's javax.sound.midi synthesizer.)
 */
export class WebAudioChordPlayer implements ChordPlayer {
  constructor(
    private readonly context: AudioContext,
    private readonly duration = 1.2,
    private readonly volume = 0.15,
  ) {}

  play(midiNotes: readonly number[]): void {
    const ctx = this.context;
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;

    for (const note of midiNotes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = midiToFrequency(note);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + this.duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + this.duration);
    }
  }
}

/** Used when the browser has no Web Audio. */
export class SilentChordPlayer implements ChordPlayer {
  play(_midiNotes: readonly number[]): void {}
}
