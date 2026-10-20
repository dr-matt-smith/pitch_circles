import type { SynthSound } from './voice.ts';

import airyPad from './instruments/airy-pad.synthsound' with { type: 'text' };
import brightChipLead from './instruments/bright-chip-lead.synthsound' with { type: 'text' };
import glassBell from './instruments/glass-bell.synthsound' with { type: 'text' };
import hollowOrgan from './instruments/hollow-organ.synthsound' with { type: 'text' };
import nylonPluck from './instruments/nylon-pluck.synthsound' with { type: 'text' };
import sawBass from './instruments/saw-bass.synthsound' with { type: 'text' };
import squareLead from './instruments/square-lead.synthsound' with { type: 'text' };
import subBass from './instruments/sub-bass.synthsound' with { type: 'text' };
import warmPad from './instruments/warm-pad.synthsound' with { type: 'text' };

/**
 * The instruments to choose from: the pitched presets from the Soundbanks package's soundbank-synth. They are
 * built into app.js (imported as text, which needs deno.json's "raw-imports"), so the page still works opened straight from disk.
 *
 * To add one, design it in Sound Gen's instrument editor, save the .synthsound in src/audio/instruments/, and
 * import it here.
 */
export const INSTRUMENTS: readonly SynthSound[] = [
  glassBell,
  nylonPluck,
  hollowOrgan,
  warmPad,
  airyPad,
  squareLead,
  brightChipLead,
  sawBass,
  subBass,
].map((text) => JSON.parse(text) as SynthSound);

export const DEFAULT_INSTRUMENT = INSTRUMENTS[0];

export function instrumentNamed(name: string): SynthSound | undefined {
  return INSTRUMENTS.find((sound) => sound.name === name);
}
