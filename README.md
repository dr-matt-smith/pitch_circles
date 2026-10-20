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

Buttons: `< Chord` / `Chord >`, `< Region` / `Region >`, `< Display` / `Display >`.
Keys: left/right = chord root, down/up = region root, D = labels (names, alphanumeric, integers).

## The classes

The model and geometry don't touch the page, so they are tested on their own in `tests/`.

| File | Class | Java original |
|---|---|---|
| `src/model/PitchClass.ts` | `PitchClass`: one of the 12 pitch classes, and its labels | `PitchClass2` |
| `src/model/PitchClassSet.ts` | `PitchClassSet`, `Membership`: which pitch classes are in a level, and which is its root | `TrivaluePCList` |
| `src/model/Level.ts` | `Level`: chromatic, diatonic, triadic, fifth, root | `PSPanel`'s constants |
| `src/model/TonalPitchSpace.ts` | `TonalPitchSpace`: the region and chord roots, each level's pitch classes, and the chord's notes. Tells listeners when it changes | `PSPanel.levelPCsAsTrivalue()` |
| `src/model/DisplayMode.ts` | `DisplayMode`: how pitch classes are labelled | `PSPanel.displayMode` |
| `src/view/CircleGeometry.ts` | `CircleGeometry`: ring radii, pitch class angles, points on circles | `CircleStuff`, `CirclePoint` |
| `src/view/PitchCirclesView.ts` | `PitchCirclesView`: draws the rings, dots and labels on a canvas, sized to fit | `PSPanel.paintComponent()` |
| `src/view/Palette.ts` | the colours | |
| `src/ui/ButtonBar.ts`, `src/ui/InfoPanel.ts` | `ButtonBar`, `InfoPanel`: the buttons, and the line of text underneath | `PS31`'s `JButton`s and `JLabel`s |
| `src/audio/NotePlayer.ts` | `NotePlayer` (interface), `WebAudioNotePlayer`, `SilentNotePlayer` | `MIDIPlayer` |
| `src/app/PitchCirclesApp.ts` | `PitchCirclesApp`: creates everything, and wires the buttons, keys and window resizing to the model | `PS31` |

MIT licensed: see `LICENSE`.
