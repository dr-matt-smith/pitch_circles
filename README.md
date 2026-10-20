# Pitch Circles

A TypeScript + [Phaser 4](https://phaser.io) version of an older Java/Swing pitch circles app,
built with [Deno](https://deno.com).

It draws (Lerdahl's) tonal pitch space as five concentric rings, one per level, from the inside out: chromatic,
diatonic, triadic, fifth and root. A segment is coloured when its pitch class is in that level. The yellow and red
dots mark the region's tonic (diatonic ring) and the chord's root (root ring). Changing the chord or region plays the
chord, in root position above middle C.

- **In Celbridge:** open `Pitch Circles.celbridge`. See `CELBRIDGE.md`.
- **Without Celbridge** (e.g. on Linux, or with VS Code): see `README_deno_tooling.md`.
- **Installing Deno** (Linux, macOS, Windows): see `README_deno_install.md`.

Buttons: `< Chord` / `Chord >`, `< Region` / `Region >`, `< Display` / `Display >`.
Keys: left/right = chord root, down/up = region root, D = labels (names, alphanumeric, integers).

## The classes

The model doesn't use Phaser, so it is tested on its own in `tests/`.

| File | Class | Java original |
|---|---|---|
| `src/model/PitchClass.ts` | `PitchClass`: one of the 12 pitch classes, and its labels | `PitchClass2` |
| `src/model/PitchClassSet.ts` | `PitchClassSet`, `Membership`: which pitch classes are in a level, and which is its root | `TrivaluePCList` |
| `src/model/Level.ts` | `Level`: chromatic, diatonic, triadic, fifth, root | `PSPanel`'s constants |
| `src/model/TonalPitchSpace.ts` | `TonalPitchSpace`: the region and chord roots, each level's pitch classes, and the chord's notes. Tells listeners when it changes | `PSPanel.levelPCsAsTrivalue()` |
| `src/model/DisplayMode.ts` | `DisplayMode`: how pitch classes are labelled | `PSPanel.displayMode` |
| `src/view/CircleGeometry.ts` | `CircleGeometry`: ring radii, pitch class angles, points on circles | `CircleStuff`, `CirclePoint` |
| `src/view/PitchCirclesView.ts` | `PitchCirclesView`: draws the rings, dots and labels | `PSPanel.paintComponent()` |
| `src/view/Palette.ts` | the colours | |
| `src/ui/Button.ts`, `src/ui/InfoPanel.ts` | `Button`, `InfoPanel`: the buttons and the line of text underneath | `PS31`'s `JButton`s and `JLabel`s |
| `src/audio/ChordPlayer.ts` | `ChordPlayer` (interface), `WebAudioChordPlayer`, `SilentChordPlayer` | `MIDIPlayer` |
| `src/game/scenes/PitchCirclesScene.ts` | `PitchCirclesScene`: creates everything, and wires the buttons and keys to the model | `PS31` |

Started from the [Phaser Vite TypeScript template](https://github.com/phaserjs/template-vite-ts).

MIT licensed: see `LICENSE`, which also keeps the template's notice.
