import type { ExperienceMode, ProvenanceKind } from './types';

export interface ModeDefinition {
  label: string;
  description: string;
}

export const modeDefinitions: Record<ExperienceMode, ModeDefinition> = {
  literal: {
    label: 'Literal',
    description: 'Concrete visual detail, without invented meaning.',
  },
  spatial: {
    label: 'Spatial',
    description: 'Composition and relationships mapped across the frame.',
  },
  poetic: {
    label: 'Poetic',
    description: 'An imaginative encounter, clearly distinct from fact.',
  },
  story: {
    label: 'Story',
    description: 'A narrative inspired by the work, not its history.',
  },
  curatorial: {
    label: 'Curatorial',
    description: 'Verified context alongside careful interpretation.',
  },
};

/* The light in the room, held here rather than only in CSS so Motion can
   crossfade one mode's atmosphere into the next. */
export interface ModeAtmosphere {
  glow: string;
  floor: string;
}

export const modeAtmospheres: Record<ExperienceMode, ModeAtmosphere> = {
  literal: { glow: 'rgb(224 198 150 / 9%)', floor: 'rgb(23 27 41 / 55%)' },
  spatial: { glow: 'rgb(159 220 235 / 8%)', floor: 'rgb(20 33 42 / 55%)' },
  poetic: { glow: 'rgb(236 176 209 / 9%)', floor: 'rgb(34 26 46 / 55%)' },
  story: { glow: 'rgb(242 183 116 / 11%)', floor: 'rgb(37 26 16 / 55%)' },
  curatorial: { glow: 'rgb(163 213 179 / 8%)', floor: 'rgb(18 32 28 / 55%)' },
};

export const provenanceDefinitions: Record<ProvenanceKind, ModeDefinition> = {
  observed: {
    label: 'Observed',
    description: 'Checked against the image itself.',
  },
  known: {
    label: 'Known',
    description: 'Taken from the museum record, with a source.',
  },
  interpreted: {
    label: 'Interpreted',
    description: 'A reading of the work, attributed rather than asserted.',
  },
  imagined: {
    label: 'Imagined',
    description: 'Invention. Never presented as fact about the work.',
  },
};
