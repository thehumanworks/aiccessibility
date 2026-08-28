import { artworks } from '../collection/artworks';
import { experienceModes } from '../gallery/reducer';

export const artworkIds = artworks.map(({ id }) => id);

export const emptyInputSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const;

export const listArtworksInputSchema = {
  type: 'object',
  properties: {
    excludeCurrent: {
      type: 'boolean',
      description: 'Omit the artwork currently shown on the page.',
    },
  },
  additionalProperties: false,
} as const;

export const navigateToArtworkInputSchema = {
  type: 'object',
  properties: {
    artworkId: {
      type: 'string',
      enum: artworkIds,
      description: 'Exact id of an artwork returned by list_artworks.',
    },
  },
  required: ['artworkId'],
  additionalProperties: false,
} as const;

export const setExperienceModeInputSchema = {
  type: 'object',
  properties: {
    mode: {
      type: 'string',
      enum: experienceModes,
      description: 'The interpretive lens to show for the current artwork.',
    },
  },
  required: ['mode'],
  additionalProperties: false,
} as const;

export const regionIdInputSchema = {
  type: 'object',
  properties: {
    regionId: {
      type: 'string',
      minLength: 1,
      description: 'Stable id of an authored or accepted region returned by list_regions.',
    },
  },
  required: ['regionId'],
  additionalProperties: false,
} as const;

export const analyzeArtworkRegionsInputSchema = {
  type: 'object',
  properties: {
    labels: {
      type: 'array',
      minItems: 1,
      maxItems: 12,
      items: { type: 'string', minLength: 1, maxLength: 80 },
      description: 'Optional concrete subjects to look for locally in the current artwork.',
    },
    threshold: {
      type: 'number',
      minimum: 0.05,
      maximum: 0.9,
      description: 'Minimum detector confidence. Defaults to 0.2.',
    },
    maxRegions: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
      description: 'Maximum accepted model suggestions. Defaults to 8.',
    },
  },
  additionalProperties: false,
} as const;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasOnlyKeys(
  input: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  return Object.keys(input).every((key) => allowedKeys.includes(key));
}
