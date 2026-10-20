// One note's Web Audio node graph, built from a .synthsound instrument block.
//
// A TypeScript port of voice.js from the Sound Gen and Chip Sequencer Celbridge packages (by Matt Smith), so
// instruments designed in Sound Gen's instrument editor sound the same here. Keep it in step with that file.
//
// Every optional field's default is the no-op value, so a v1 instrument (or a partial one) sounds as it always did.

export type Wave = 'square' | 'sawtooth' | 'triangle' | 'noise';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass';

/** A complete instrument: what readInstrument() returns. */
export interface Instrument {
  wave: Wave;
  pulseWidth: number; // square wave duty cycle, 0.05..0.95
  detune: number; // cents between two detuned oscillators, -50..50 (0 = one oscillator)
  adsr: { a: number; d: number; s: number; r: number }; // seconds, except s (sustain level, 0..1)
  filter: { type: FilterType; freq: number; q: number };
  filterEnv: { amount: number; a: number; d: number }; // amount in octaves, -4..4
  vibrato: { depth: number; rate: number; delay: number }; // depth in cents, rate in Hz, delay in seconds
  volume: number; // 0..1
}

/** The "instrument" block of a .synthsound file: any field may be missing, or out of range. */
export type InstrumentData = Record<string, unknown>;

/** A .synthsound file. */
export interface SynthSound {
  format: 'synthsound';
  version: number;
  name: string;
  category?: string;
  instrument: InstrumentData;
}

export const INSTRUMENT_DEFAULTS: Instrument = {
  wave: 'square',
  pulseWidth: 0.5,
  detune: 0,
  adsr: { a: 0.01, d: 0.1, s: 0.6, r: 0.2 },
  filter: { type: 'lowpass', freq: 2400, q: 1 },
  filterEnv: { amount: 0, a: 0.005, d: 0.2 },
  vibrato: { depth: 0, rate: 5, delay: 0 },
  volume: 0.8,
};

const WAVES: readonly Wave[] = ['square', 'sawtooth', 'triangle', 'noise'];
const FILTER_TYPES: readonly FilterType[] = ['lowpass', 'highpass', 'bandpass'];
const PULSE_HARMONICS = 64;

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function block(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function oneOf<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return options.includes(value as T) ? value as T : fallback;
}

/**
 * Normalizes any v1, v2 or partial instrument into a complete one. Missing fields take the no-op default, so
 * callers never need to probe for a field's presence.
 */
export function readInstrument(instrument: unknown): Instrument {
  const inst = block(instrument);
  const d = INSTRUMENT_DEFAULTS;
  const adsr = block(inst.adsr);
  const filter = block(inst.filter);
  const filterEnv = block(inst.filterEnv);
  const vibrato = block(inst.vibrato);
  return {
    wave: oneOf(WAVES, inst.wave, d.wave),
    pulseWidth: clamp(num(inst.pulseWidth, d.pulseWidth), 0.05, 0.95),
    detune: clamp(num(inst.detune, d.detune), -50, 50),
    adsr: {
      a: Math.max(0, num(adsr.a, d.adsr.a)),
      d: Math.max(0, num(adsr.d, d.adsr.d)),
      s: clamp(num(adsr.s, d.adsr.s), 0, 1),
      r: Math.max(0, num(adsr.r, d.adsr.r)),
    },
    filter: {
      type: oneOf(FILTER_TYPES, filter.type, d.filter.type),
      freq: num(filter.freq, d.filter.freq),
      q: clamp(num(filter.q, d.filter.q), 0.1, 20),
    },
    filterEnv: {
      amount: clamp(num(filterEnv.amount, d.filterEnv.amount), -4, 4),
      a: clamp(num(filterEnv.a, d.filterEnv.a), 0, 0.5),
      d: clamp(num(filterEnv.d, d.filterEnv.d), 0, 1),
    },
    vibrato: {
      depth: clamp(num(vibrato.depth, d.vibrato.depth), 0, 100),
      rate: clamp(num(vibrato.rate, d.vibrato.rate), 0.1, 12),
      delay: clamp(num(vibrato.delay, d.vibrato.delay), 0, 1),
    },
    volume: clamp(num(inst.volume, d.volume), 0, 1),
  };
}

export function createNoiseBuffer(context: BaseAudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// A square wave of arbitrary duty cycle, as Fourier coefficients. For f(t) = +1 on [0, duty) and -1 on
// [duty, 1): a(n) = 2·sin(2πn·duty)/(πn), b(n) = 2·(1 − cos(2πn·duty))/(πn). At duty 0.5 the cosine terms vanish
// and the sine terms collapse to the classic 4/(πn) odd-harmonic square, so 0.5 is a true no-op.
const pulseWaveCache = new WeakMap<BaseAudioContext, Map<number, PeriodicWave>>();

function pulseWave(context: BaseAudioContext, duty: number): PeriodicWave {
  let byDuty = pulseWaveCache.get(context);
  if (!byDuty) {
    byDuty = new Map();
    pulseWaveCache.set(context, byDuty);
  }
  const key = Math.round(duty * 100) / 100;
  let wave = byDuty.get(key);
  if (!wave) {
    const real = new Float32Array(PULSE_HARMONICS + 1);
    const imag = new Float32Array(PULSE_HARMONICS + 1);
    for (let n = 1; n <= PULSE_HARMONICS; n++) {
      real[n] = (2 * Math.sin(2 * Math.PI * n * key)) / (Math.PI * n);
      imag[n] = (2 * (1 - Math.cos(2 * Math.PI * n * key))) / (Math.PI * n);
    }
    wave = context.createPeriodicWave(real, imag);
    byDuty.set(key, wave);
  }
  return wave;
}

function clampFilterFreq(context: BaseAudioContext, freq: number): number {
  return clamp(freq, 20, Math.min(20000, context.sampleRate / 2 - 1));
}

export interface VoiceOptions {
  instrument: unknown; // any instrument block: it is read with readInstrument()
  frequency: number;
  noiseBuffer?: AudioBuffer; // needed for the 'noise' wave
  filterFreqOverride?: number;
  startTime: number;
  noteSeconds: number; // how long the note is held before its release starts
  velocity?: number; // 0..1
}

export interface Voice {
  sources: AudioScheduledSourceNode[]; // every node that needs stopping
  primary: AudioScheduledSourceNode;
  releaseEnd: number; // the time the note finishes releasing
}

/**
 * Builds and schedules one note. Returns every node that needs stopping plus the time the note finishes
 * releasing, so the caller can do voice-stealing and cleanup without knowing the graph's shape.
 */
export function buildVoice(context: BaseAudioContext, destination: AudioNode, opts: VoiceOptions): Voice {
  const inst = readInstrument(opts.instrument);
  const t = opts.startTime;
  const velocity = opts.velocity ?? 1;
  const isNoise = inst.wave === 'noise';

  const gainNode = context.createGain();
  const filterNode = context.createBiquadFilter();
  filterNode.type = inst.filter.type;
  filterNode.Q.value = inst.filter.q;

  const baseFreq = clampFilterFreq(context, opts.filterFreqOverride ?? inst.filter.freq);
  filterNode.frequency.value = baseFreq;

  gainNode.connect(filterNode);
  filterNode.connect(destination);

  // --- Tone sources ---

  const toneSources: (AudioBufferSourceNode | OscillatorNode)[] = [];
  if (isNoise) {
    const source = context.createBufferSource();
    source.buffer = opts.noiseBuffer ?? createNoiseBuffer(context);
    source.loop = true;
    source.connect(gainNode);
    toneSources.push(source);
  } else {
    const periodic = inst.wave === 'square' && Math.abs(inst.pulseWidth - 0.5) > 0.001
      ? pulseWave(context, inst.pulseWidth)
      : null;
    // A non-zero detune splits into two oscillators straddling the pitch; zero detune stays a single oscillator
    // so v1 instruments keep their exact level.
    const offsets = inst.detune !== 0 ? [-inst.detune / 2, inst.detune / 2] : [0];
    for (const cents of offsets) {
      const osc = context.createOscillator();
      if (periodic) osc.setPeriodicWave(periodic);
      else osc.type = inst.wave as OscillatorType;
      osc.frequency.value = opts.frequency;
      osc.detune.value = cents;
      osc.connect(gainNode);
      toneSources.push(osc);
    }
  }

  // --- Amplitude envelope ---

  const peak = Math.max(0.0001, velocity * inst.volume) / toneSources.length;
  const { a, d, s, r } = inst.adsr;
  const sustainLevel = peak * s;
  const attackEnd = t + Math.max(a, 0.001);
  const decayEnd = attackEnd + d;
  const releaseStart = Math.max(decayEnd, t + opts.noteSeconds);
  const releaseEnd = releaseStart + Math.max(r, 0.001);

  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(peak, attackEnd);
  gainNode.gain.linearRampToValueAtTime(sustainLevel, decayEnd);
  gainNode.gain.setValueAtTime(sustainLevel, releaseStart);
  gainNode.gain.linearRampToValueAtTime(0, releaseEnd);

  // --- Filter envelope (skipped entirely at amount 0) ---

  if (inst.filterEnv.amount !== 0) {
    const peakFreq = clampFilterFreq(context, baseFreq * Math.pow(2, inst.filterEnv.amount));
    const envAttackEnd = t + Math.max(inst.filterEnv.a, 0.001);
    const envDecayEnd = envAttackEnd + Math.max(inst.filterEnv.d, 0.001);
    filterNode.frequency.setValueAtTime(baseFreq, t);
    filterNode.frequency.linearRampToValueAtTime(peakFreq, envAttackEnd);
    filterNode.frequency.linearRampToValueAtTime(baseFreq, envDecayEnd);
  }

  // --- Vibrato (skipped entirely at depth 0; noise has no pitch to bend) ---

  const sources: AudioScheduledSourceNode[] = toneSources.slice();
  if (inst.vibrato.depth > 0 && !isNoise) {
    const lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = inst.vibrato.rate;

    const lfoGain = context.createGain();
    if (inst.vibrato.delay > 0) {
      lfoGain.gain.setValueAtTime(0, t);
      lfoGain.gain.linearRampToValueAtTime(inst.vibrato.depth, t + inst.vibrato.delay);
    } else {
      lfoGain.gain.value = inst.vibrato.depth;
    }

    lfo.connect(lfoGain);
    for (const source of toneSources) lfoGain.connect(source.detune);
    lfo.start(t);
    lfo.stop(releaseEnd + 0.02);
    sources.push(lfo);
  }

  for (const source of toneSources) {
    source.start(t);
    source.stop(releaseEnd + 0.02);
  }

  return { sources, primary: toneSources[0], releaseEnd };
}
