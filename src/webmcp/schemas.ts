import { artworks } from '../collection/artworks';
import { experienceModes } from '../gallery/reducer';
import {
  colorThemes,
  contrastLevels,
  fontFamilies,
  fontSizes,
  galleryLanguages,
} from '../gallery/personalization';

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

export const setFontFamilyInputSchema = {
  type: 'object',
  properties: {
    fontFamily: {
      type: 'string',
      enum: fontFamilies,
      description: 'Bundled font family to use throughout the gallery.',
    },
  },
  required: ['fontFamily'],
  additionalProperties: false,
} as const;

export const setFontSizeInputSchema = {
  type: 'object',
  properties: {
    fontSize: {
      type: 'string',
      enum: fontSizes,
      description: 'Text-size preset to apply throughout the gallery.',
    },
  },
  required: ['fontSize'],
  additionalProperties: false,
} as const;

export const setContrastInputSchema = {
  type: 'object',
  properties: {
    contrast: {
      type: 'string',
      enum: contrastLevels,
      description: 'Bounded contrast level for gallery text and controls.',
    },
  },
  required: ['contrast'],
  additionalProperties: false,
} as const;

export const setColorThemeInputSchema = {
  type: 'object',
  properties: {
    theme: {
      type: 'string',
      enum: colorThemes,
      description: 'Light or dark color theme.',
    },
  },
  required: ['theme'],
  additionalProperties: false,
} as const;

export const setContentLanguageInputSchema = {
  type: 'object',
  properties: {
    language: {
      type: 'string',
      enum: galleryLanguages,
      description: 'Bundled content language: English, Spanish, or French.',
    },
  },
  required: ['language'],
  additionalProperties: false,
} as const;

export const regionIdInputSchema = {
  type: 'object',
  properties: {
    regionId: {
      type: 'string',
      minLength: 1,
      description:
        'Stable id of an authored, agent-grounded, or accepted local-model region returned by list_regions.',
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

export const zoomToArtworkDetailInputSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      minLength: 2,
      maxLength: 160,
      description:
        'A natural-language description of the visible subject or detail to find and zoom into, such as "the boats beneath the wave".',
    },
  },
  required: ['query'],
  additionalProperties: false,
} as const;

export const focusArtworkAreaInputSchema = {
  type: 'object',
  properties: {
    label: {
      type: 'string',
      minLength: 2,
      maxLength: 80,
      description: 'Concise name for the visible detail being focused.',
    },
    description: {
      type: 'string',
      minLength: 2,
      maxLength: 240,
      description:
        'Optional visual description. Do not present agent interpretation as museum fact.',
    },
    bounds: {
      type: 'object',
      properties: {
        x: { type: 'number', minimum: 0, maximum: 1 },
        y: { type: 'number', minimum: 0, maximum: 1 },
        width: { type: 'number', exclusiveMinimum: 0, maximum: 1 },
        height: { type: 'number', exclusiveMinimum: 0, maximum: 1 },
      },
      required: ['x', 'y', 'width', 'height'],
      additionalProperties: false,
      description:
        'Bounds normalized to the unzoomed source artwork: x/y are the top-left corner and width/height are extents from 0 to 1.',
    },
  },
  required: ['label', 'bounds'],
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
