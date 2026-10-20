import { DEFAULT_INSTRUMENT } from './instruments.ts';
import { buildVoice, readInstrument, type SynthSound } from './voice.ts';

/** Something that can sound notes: one note, or several at once (a chord). */
export interface NotePlayer {
  play(midiNotes: readonly number[]): void;
  /** Roughly how long a note sounds for, in seconds, from when it's played to the end of its release. */
  readonly soundingSeconds: number;
}

/** Frequency in Hz of a MIDI note number (69 = A4 = 440 Hz). */
export function midiToFrequency(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

/**
 * Plays notes on a .synthsound instrument (see voice.ts), with the Web Audio API.
 *
 * Browsers only allow sound after the user has clicked or pressed a key, so the AudioContext is made the first
 * time anything is played (which is always in response to a click or key press).
 */
export class SynthNotePlayer implements NotePlayer {
  instrument: SynthSound = DEFAULT_INSTRUMENT;
  private context?: AudioContext;
  private output?: AudioNode;

  private _volume: number;
  private gain?: GainNode;

  constructor(
    private readonly noteSeconds = 0.8,
    volume = 0.6,
  ) {
    this._volume = volume;
  }

  /** The master volume, 0..1. */
  get volume(): number {
    return this._volume;
  }

  set volume(volume: number) {
    this._volume = Math.max(0, Math.min(1, volume));
    if (this.gain) this.gain.gain.value = this._volume;
  }

  get soundingSeconds(): number {
    const { a, d, r } = readInstrument(this.instrument.instrument).adsr;
    return Math.max(a + d, this.noteSeconds) + r; // as buildVoice() schedules it
  }

  play(midiNotes: readonly number[]): void {
    const ctx = this.context ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const output = this.output ??= this.createOutput(ctx);

    // Quieter per note in a chord, so a chord isn't three times as loud as a single note
    const velocity = 1 / Math.sqrt(midiNotes.length);
    for (const note of midiNotes) {
      buildVoice(ctx, output, {
        instrument: this.instrument.instrument,
        frequency: midiToFrequency(note),
        startTime: ctx.currentTime,
        noteSeconds: this.noteSeconds,
        velocity,
      });
    }
  }

  // Master volume, then a compressor so overlapping notes (e.g. clicking quickly) never clip
  private createOutput(ctx: AudioContext): AudioNode {
    const gain = this.gain = ctx.createGain();
    gain.gain.value = this._volume;
    const compressor = ctx.createDynamicsCompressor();
    gain.connect(compressor).connect(ctx.destination);
    return gain;
  }
}

/** Used when the browser has no Web Audio. */
export class SilentNotePlayer implements NotePlayer {
  readonly soundingSeconds = 1;
  play(_midiNotes: readonly number[]): void {}
}
