import { INSTRUMENTS, instrumentNamed } from '../audio/instruments.ts';
import { Metronome } from '../audio/Metronome.ts';
import { NotePlayer, SilentNotePlayer, SynthNotePlayer } from '../audio/NotePlayer.ts';
import { CHORD_TYPES, ChordType } from '../model/ChordType.ts';
import { DISPLAY_MODES, DisplayMode, displayModeLabel, stepDisplayMode } from '../model/DisplayMode.ts';
import { Level } from '../model/Level.ts';
import { REGION_TYPES, RegionType } from '../model/RegionType.ts';
import { TonalPitchSpace } from '../model/TonalPitchSpace.ts';
import { Dropdown } from '../ui/Dropdown.ts';
import { InfoPanel } from '../ui/InfoPanel.ts';
import { LevelControls } from '../ui/LevelControls.ts';
import { RadioGroup } from '../ui/RadioGroup.ts';
import { RingArrows } from '../ui/RingArrows.ts';
import { Slider } from '../ui/Slider.ts';
import { Toggle } from '../ui/Toggle.ts';
import { KeyRole, PianoKeyboard } from '../view/PianoKeyboard.ts';
import { PitchCirclesView } from '../view/PitchCirclesView.ts';

/** The page elements the app uses. */
export interface AppElements {
  piano: HTMLElement;
  levels: HTMLElement; // the region and chord controls, under the keyboard
  play: HTMLElement; // play once, repeats, tempo and volume
  stage: HTMLElement; // holds the canvas, and the ring arrows over it
  canvas: HTMLCanvasElement;
  settings: HTMLElement; // instrument and display
  info: HTMLElement;
}

const capitalise = (text: string) => text[0].toUpperCase() + text.slice(1);

/**
 * The app. It owns the model (TonalPitchSpace), and wires the controls and keys to it. Every control is on show
 * (buttons, radio buttons, switches and sliders), and changes take effect straight away.
 *
 * Whenever the model changes, everything is redrawn. Changing the region plays its root (an octave below middle C);
 * changing the chord plays the chord - unless that part is repeating, when the next beat plays it instead.
 * The repeat switches play the chord and/or the region's root on every beat, at the Tempo slider's speed.
 *
 * Keys: left/right = chord root, down/up = region root, R = next region type, C = next chord type,
 * D = next display mode, space = play the chord once.
 */
export class PitchCirclesApp {
  private readonly space = new TonalPitchSpace();
  private displayMode = DisplayMode.Names;
  private readonly player: NotePlayer;
  private readonly metronome = new Metronome(() => this.onBeat());
  private readonly piano: PianoKeyboard;
  private readonly circles: PitchCirclesView;
  private readonly ringArrows: RingArrows;
  private readonly info: InfoPanel;
  private readonly region: LevelControls<RegionType>;
  private readonly chord: LevelControls<ChordType>;
  private readonly display: RadioGroup<DisplayMode>;
  private readonly chordRepeat: Toggle;
  private readonly regionRepeat: Toggle;

  constructor(elements: AppElements) {
    this.player = 'AudioContext' in globalThis ? new SynthNotePlayer() : new SilentNotePlayer();
    this.piano = new PianoKeyboard(elements.piano, (note) => this.play([note], 'played'));

    this.region = new LevelControls(elements.levels, {
      title: 'Region',
      className: 'region',
      keysHint: 'down/up arrows',
      types: REGION_TYPES.map((type) => ({ value: type, label: capitalise(type) })),
      onStep: (semitones) => this.space.stepRegion(semitones),
      onType: (type) => this.space.regionType = type,
    });
    this.chord = new LevelControls(elements.levels, {
      title: 'Chord',
      className: 'chord',
      keysHint: 'left/right arrows',
      types: CHORD_TYPES.map((type) => ({ value: type, label: capitalise(type) })),
      onStep: (semitones) => this.space.stepChord(semitones),
      onType: (type) => this.space.chordType = type,
    });

    this.circles = new PitchCirclesView(elements.canvas);
    this.ringArrows = new RingArrows(
      elements.stage,
      (semitones) => this.space.stepRegion(semitones),
      (semitones) => this.space.stepChord(semitones),
    );

    // Play once, the repeats, tempo and volume
    const playOnce = document.createElement('button');
    playOnce.type = 'button';
    playOnce.className = 'play-once';
    playOnce.textContent = 'Play Once >';
    playOnce.title = 'Play the chord (space)';
    playOnce.addEventListener('click', () => this.playChord());
    elements.play.append(playOnce);
    this.chordRepeat = new Toggle(elements.play, 'Chord repeat', 'Play the chord on every beat', () =>
      this.updateMetronome());
    this.regionRepeat = new Toggle(
      elements.play,
      'Region Root repeat',
      'Play the region\'s root (an octave lower) on every beat',
      () => this.updateMetronome(),
    );
    new Slider(elements.play, {
      label: 'Tempo',
      title: 'Beats per minute, for the repeats',
      min: 40,
      max: 200,
      value: this.metronome.bpm,
      format: (bpm) => `${bpm} BPM`,
    }, (bpm) => this.metronome.bpm = bpm);
    if (this.player instanceof SynthNotePlayer) {
      const player = this.player;
      new Slider(elements.play, {
        label: 'Volume',
        title: 'How loud everything plays',
        min: 0,
        max: 100,
        value: Math.round(player.volume * 100),
        format: (percent) => `${percent}%`,
      }, (percent) => player.volume = percent / 100);
    }

    // Instrument and display
    this.createInstrumentDropdown(elements.settings);
    this.display = new RadioGroup(
      elements.settings,
      'Display',
      DISPLAY_MODES.map((mode) => ({ value: mode, label: displayModeLabel(mode) })),
      (mode) => this.setDisplay(mode),
    );

    this.info = new InfoPanel(elements.info);

    this.space.onChange((_space, change) => {
      this.refresh();
      // A repeating part plays on the next beat instead, so it isn't heard twice
      if (change === 'region' && !this.regionRepeat.on) this.playRegionRoot();
      if (change === 'chord' && !this.chordRepeat.on) this.playChord();
    });
    document.addEventListener('keydown', (event) => this.onKey(event));
    new ResizeObserver(() => {
      this.circles.fitToParent();
      this.refresh();
    }).observe(elements.stage);

    this.refresh();
  }

  private createInstrumentDropdown(container: HTMLElement): void {
    const player = this.player;
    if (!(player instanceof SynthNotePlayer)) return;
    new Dropdown(
      container,
      'Instrument',
      'The sound the notes are played with',
      INSTRUMENTS.map((sound) => sound.name),
      (name) => {
        player.instrument = instrumentNamed(name) ?? player.instrument;
        this.playChord(); // let the new sound be heard
      },
    );
  }

  /** Start the beat if either repeat is on, and stop it if neither is. */
  private updateMetronome(): void {
    if (this.chordRepeat.on || this.regionRepeat.on) this.metronome.start();
    else this.metronome.stop();
  }

  private onBeat(): void {
    if (this.regionRepeat.on) this.playRegionRoot();
    if (this.chordRepeat.on) this.playChord();
  }

  private playRegionRoot(): void {
    this.play([this.space.regionRootMidiNote()], 'region');
  }

  private playChord(): void {
    this.play(this.space.chordMidiNotes(), 'chord');
  }

  /** Play notes, and show them on the keyboard. */
  private play(notes: readonly number[], role: KeyRole): void {
    this.player.play(notes);
    // The region's root and the chord light every octave of their notes; a clicked key lights just that key
    this.piano.show(notes, role, this.player.soundingSeconds, role !== 'played');
  }

  private onKey(event: KeyboardEvent): void {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => this.space.stepChord(-1),
      ArrowRight: () => this.space.stepChord(+1),
      ArrowDown: () => this.space.stepRegion(-1),
      ArrowUp: () => this.space.stepRegion(+1),
      c: () => this.space.nextChordType(),
      r: () => this.space.nextRegionType(),
      d: () => this.setDisplay(stepDisplayMode(this.displayMode, +1)),
      ' ': () => this.playChord(),
    };
    if (event.ctrlKey || event.metaKey || event.altKey) return; // leave browser shortcuts alone
    // Leave form controls their own keys: arrows move through radio buttons and sliders, space presses a button
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) return;
    if (target instanceof HTMLButtonElement && (event.key === ' ' || event.key === 'Enter')) return;

    const action = actions[event.key.length === 1 ? event.key.toLowerCase() : event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  private setDisplay(mode: DisplayMode): void {
    this.displayMode = mode;
    this.refresh();
  }

  private refresh(): void {
    const space = this.space;
    this.circles.redraw(space, this.displayMode);
    this.ringArrows.update(this.circles.layout, space);
    this.region.update(space.regionRoot.label(this.displayMode), space.regionType);
    this.chord.update(space.chordRoot.label(this.displayMode), space.chordType);
    this.display.value = this.displayMode;
    this.info.update(space);
    this.piano.setLabels(this.displayMode);
    this.piano.setScale(space.level(Level.Diatonic));
    this.piano.setChord(space.level(Level.Triadic));
  }
}
