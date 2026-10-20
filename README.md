# Pitch Circles

An object-oriented TypeScript version of an older Java/Swing pitch circles app, built with [Deno](https://deno.com).
It draws on an HTML canvas and plays sound with Web Audio, so it needs no libraries.

It draws (Lerdahl's) tonal pitch space as five concentric rings, one per level, from the inside out: chromatic,
diatonic, triadic, fifth and root. A segment is coloured when its pitch class is in that level. A red dot marks
the region's tonic (diatonic ring), and a yellow dot the chord's root (root ring).

- **In Celbridge:** open `Pitch Circles.celbridge`. See `CELBRIDGE.md`.
- **Without Celbridge** (e.g. on Linux, or with VS Code): see `README_deno_tooling.md`.
- **Installing Deno** (Linux, macOS, Windows): see `README_deno_install.md`.

## The controls

Every control is on show - buttons, radio buttons, switches and sliders - so you can always see what's happening.

- **Region** and **Chord** (under the keyboard): `<` and `>` move the root round the circle a semitone at a time,
  beside the root's name, and radio buttons choose the type. A region can be major, minor (natural minor: A minor has
  the same notes as C major) or harmonic minor (the 7th raised: A harmonic minor has G#). A chord is a major or minor
  triad.
- **The arrows on the rings** move the chord by that ring's step, to the next note down (`<`) or up (`>`) in that
  level: the next semitone (chromatic ring), the next note of the region's scale (diatonic), the next note of the
  chord (triadic), the root's fifth or root (open fifth), or the root an octave away (octave, the outer ring). So
  from a C major chord on C4 in C major, `>` goes to C#4, D4, E4, G4 or C5. They sit beside the chord's root, and
  travel round with it. The chord stays on the keyboard (its root between C3 and E5), wrapping round to the other end
  if it would go off it.
- **Play Once >** plays the chord. Changing the region plays its root (an octave below middle C, C3 to B3); changing
  the chord plays the chord, in root position from its root note (it starts on C4).
- **Chord repeat** and **Region Root repeat** play the chord and/or the region's root on every beat, at the
  **Tempo** (40 to 200 beats per minute). Switching either on starts the beat; switching both off stops it. While a
  part repeats, changing it doesn't play it straight away: the next beat plays the new one.
- **Volume**, **Instrument**, and **Display** (the labels: note letters, alphanumeric 0 … 9, a, b, or integers 0 … 11).

Keys: left/right = chord root, down/up = region root, R = next region type, C = next chord type, D = next display,
space = play the chord once.

## The keyboard

The keyboard along the top (three octaves, C3 to B5) shows the region's scale as the diatonic ring does: its keys are coloured magenta, and
the tonic has a red ring round its label. The chord's actual three keys have a pink band, as in the triadic ring, and
its root key a yellow ring round its label, so you can see it move up and down octaves. The keys are labelled to match the Display setting.

While a note sounds, a disc near the top of its key shows it playing: dark purple for the region's root (in every
octave), red for the chord's three notes. Each new region root or chord replaces the old one's discs. Click the keys (or drag
across them) to play single notes, shown in blue.

## Sound

Notes are synthesised in the browser with Web Audio (no sound files), using `.synthsound` instruments: the same
format as Sound Gen's instrument editor and the Chip Sequencer, so they sound the same here as there. To add your
own, design it in Sound Gen, save the `.synthsound` in `src/audio/instruments/`, and add an import for it to
`src/audio/instruments.ts`. The instruments are built into `app.js`, so `dist/index.html` still works opened
straight from disk.

## The classes

The model and geometry don't touch the page, so they are tested on their own in `tests/`.

| File | Class | Java original |
|---|---|---|
| `src/model/PitchClass.ts` | `PitchClass`: one of the 12 pitch classes, and its labels | `PitchClass2` |
| `src/model/PitchClassSet.ts` | `PitchClassSet`, `Membership`: which pitch classes are in a level, and which is its root | `TrivaluePCList` |
| `src/model/Level.ts` | `Level`: chromatic, diatonic, triadic, fifth, root | `PSPanel`'s constants |
| `src/model/TonalPitchSpace.ts` | `TonalPitchSpace`: the region and chord (each a root and a type; the chord's root is an actual note), each level's pitch classes, the chord's notes, and stepping the chord through a level. Tells listeners when it changes | `PSPanel.levelPCsAsTrivalue()` |
| `src/model/RegionType.ts`, `src/model/ChordType.ts` | `RegionType` (major, minor, harmonic minor) and `ChordType` (major, minor), with their intervals | `PSPanel`'s unused `regionType`, `chordType` |
| `src/model/DisplayMode.ts` | `DisplayMode`: how pitch classes are labelled | `PSPanel.displayMode` |
| `src/view/CircleGeometry.ts` | `CircleGeometry`: ring radii, pitch class angles, points on circles | `CircleStuff`, `CirclePoint` |
| `src/view/PitchCirclesView.ts` | `PitchCirclesView`: draws the rings, dots and labels on a canvas, sized to fit | `PSPanel.paintComponent()` |
| `src/view/PianoKeyboard.ts`, `src/view/pianoLayout.ts` | `PianoKeyboard`: the keyboard along the top (C3 to B5), lighting the keys as they play, and playing the keys you click; `pianoKeys()` works out where each key goes | |
| `src/view/Palette.ts` | the colours | |
| `src/ui/LevelControls.ts` | `LevelControls`: the region's or chord's `<` `>` buttons, root name and type radio buttons | `PS31`'s `JButton`s |
| `src/ui/RingArrows.ts`, `src/view/ringArrowLayout.ts` | `RingArrows`: the `<` `>` buttons on each ring, laid over the canvas, which step the chord by that ring's step; `ringArrowPlacements()` works out where they go | |
| `src/ui/RadioGroup.ts`, `src/ui/Toggle.ts`, `src/ui/Slider.ts`, `src/ui/Dropdown.ts` | the radio buttons, switches, sliders and the instrument dropdown | |
| `src/ui/InfoPanel.ts` | `InfoPanel`: the line of text underneath | `PS31`'s `JLabel`s |
| `src/audio/NotePlayer.ts` | `NotePlayer` (interface), `SynthNotePlayer` (plays a `.synthsound` instrument), `SilentNotePlayer` | `MIDIPlayer` |
| `src/audio/Metronome.ts` | `Metronome`: the beat for the repeats | |
| `src/audio/voice.ts` | builds one note's Web Audio graph from a `.synthsound` instrument: a TypeScript port of `voice.js` from the Sound Gen and Chip Sequencer Celbridge packages | |
| `src/audio/instruments.ts`, `src/audio/instruments/` | the instruments to choose from: `.synthsound` presets from the Soundbanks package | |
| `src/app/PitchCirclesApp.ts` | `PitchCirclesApp`: creates everything, and wires the controls, keys, beat and window resizing to the model | `PS31` |

MIT licensed: see `LICENSE`.
