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

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasOnlyKeys(
  input: Record<string, unknown>,
  allowedKeys: readonly string[],
): boolean {
  return Object.keys(input).every((key) => allowedKeys.includes(key));
}
