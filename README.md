# Pitch Circles

An object-oriented TypeScript version of an older Java/Swing pitch circles app, built with [Deno](https://deno.com).
It draws on an HTML canvas and plays sound with Web Audio, so it needs no libraries.

It draws (Lerdahl's) tonal pitch space as five concentric rings, one per level, from the inside out: chromatic,
diatonic, triadic, fifth and root. A segment is coloured when its pitch class is in that level. The yellow and red
dots mark the region's tonic (diatonic ring) and the chord's root (root ring). Changing the region plays its root note,
and changing the chord plays its three notes in root position, both starting in the octave of middle C.

- **In Celbridge:** open `Pitch Circles.celbridge`. See `CELBRIDGE.md`.
- **Without Celbridge** (e.g. on Linux, or with VS Code): see `README_deno_tooling.md`.
- **Installing Deno** (Linux, macOS, Windows): see `README_deno_install.md`.

Buttons: `< Chord` / `Chord >`, `< Region` / `Region >`, `< Display` / `Display >`. Dropdowns: the region's type
(major, minor, harmonic minor), the chord's type (major, minor), and the instrument.
Keys: left/right = chord root, down/up = region root, R = next region type, C = next chord type,
D = labels (names, alphanumeric, integers).

A minor region uses the natural minor scale (A minor has the same notes as C major), and a harmonic minor region
raises its 7th (A harmonic minor has G#). A minor chord is a minor triad.

## Sound

Notes are synthesised in the browser with Web Audio (no sound files), using `.synthsound` instruments: the same
format as Sound Gen's instrument editor and the Chip Sequencer, so they sound the same here as there. Pick one from
the Instrument dropdown. The keyboard along the top shows the region's scale as the diatonic ring does: its keys
are coloured magenta, and the tonic has the same yellow and red dots. The chord's notes have a pink band, as in the
triadic ring. It lights up each note while it sounds: the
region's root in dark purple, the chord's notes in red. Click its keys (or drag across them) to play single notes,
lit in blue. The keys are labelled to match the Display setting. To add your own, design it in Sound Gen, save the `.synthsound` in `src/audio/instruments/`,
and add an import for it to `src/audio/instruments.ts`. The instruments are built into `app.js`, so
`dist/index.html` still works opened straight from disk.

## The classes

The model and geometry don't touch the page, so they are tested on their own in `tests/`.

| File | Class | Java original |
|---|---|---|
| `src/model/PitchClass.ts` | `PitchClass`: one of the 12 pitch classes, and its labels | `PitchClass2` |
| `src/model/PitchClassSet.ts` | `PitchClassSet`, `Membership`: which pitch classes are in a level, and which is its root | `TrivaluePCList` |
| `src/model/Level.ts` | `Level`: chromatic, diatonic, triadic, fifth, root | `PSPanel`'s constants |
| `src/model/TonalPitchSpace.ts` | `TonalPitchSpace`: the region and chord (each a root and a type), each level's pitch classes, and the chord's notes. Tells listeners when it changes | `PSPanel.levelPCsAsTrivalue()` |
| `src/model/RegionType.ts`, `src/model/ChordType.ts` | `RegionType` (major, minor, harmonic minor) and `ChordType` (major, minor), with their intervals | `PSPanel`'s unused `regionType`, `chordType` |
| `src/model/DisplayMode.ts` | `DisplayMode`: how pitch classes are labelled | `PSPanel.displayMode` |
| `src/view/CircleGeometry.ts` | `CircleGeometry`: ring radii, pitch class angles, points on circles | `CircleStuff`, `CirclePoint` |
| `src/view/PitchCirclesView.ts` | `PitchCirclesView`: draws the rings, dots and labels on a canvas, sized to fit | `PSPanel.paintComponent()` |
| `src/view/PianoKeyboard.ts`, `src/view/pianoLayout.ts` | `PianoKeyboard`: the keyboard along the top (C4 to B5), lighting the keys as they play, and playing the keys you click; `pianoKeys()` works out where each key goes | |
| `src/view/Palette.ts` | the colours | |
| `src/ui/ButtonBar.ts`, `src/ui/Dropdown.ts`, `src/ui/InfoPanel.ts` | `ButtonBar`, `Dropdown`, `InfoPanel`: the buttons, the type dropdowns, and the line of text underneath | `PS31`'s `JButton`s and `JLabel`s |
| `src/audio/NotePlayer.ts` | `NotePlayer` (interface), `SynthNotePlayer` (plays a `.synthsound` instrument), `SilentNotePlayer` | `MIDIPlayer` |
| `src/audio/voice.ts` | builds one note's Web Audio graph from a `.synthsound` instrument: a TypeScript port of `voice.js` from the Sound Gen and Chip Sequencer Celbridge packages | |
| `src/audio/instruments.ts`, `src/audio/instruments/` | the instruments to choose from: `.synthsound` presets from the Soundbanks package | |
| `src/app/PitchCirclesApp.ts` | `PitchCirclesApp`: creates everything, and wires the buttons, keys and window resizing to the model | `PS31` |

MIT licensed: see `LICENSE`.
