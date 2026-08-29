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
      default: false,
      description: 'Omit the artwork currently shown on the page.',
    },
  },
  additionalProperties: false,
} as const;

const expectedRevisionProperty = {
  type: 'integer',
  minimum: 0,
  description: 'Apply only if the live gallery still has this revision.',
} as const;

export const getArtworkContextInputSchema = {
  type: 'object',
  properties: {
    artworkId: {
      type: 'string',
      enum: artworkIds,
      description: 'Exact artwork id. Omit it to inspect the current artwork.',
    },
  },
  additionalProperties: false,
} as const;

export const configurePresentationInputSchema = {
  type: 'object',
  properties: {
    mode: {
      type: 'string',
      enum: experienceModes,
      description: 'Speaking style for interpreting the artwork.',
    },
    fontFamily: {
      type: 'string',
      enum: fontFamilies,
      description: 'Bundled gallery typeface.',
    },
    fontSize: {
      type: 'string',
      enum: fontSizes,
      description: 'Text-size preset; generic “larger” maps to large, explicit maximum to extra-large.',
    },
    contrast: {
      type: 'string',
      enum: contrastLevels,
      description: 'Bounded gallery contrast preset.',
    },
    theme: {
      type: 'string',
      enum: colorThemes,
      description: 'Light or dark gallery theme.',
    },
    language: {
      type: 'string',
      enum: galleryLanguages,
      description: 'Bundled interface language.',
    },
    expectedRevision: expectedRevisionProperty,
  },
  anyOf: [
    { required: ['mode'] },
    { required: ['fontFamily'] },
    { required: ['fontSize'] },
    { required: ['contrast'] },
    { required: ['theme'] },
    { required: ['language'] },
  ],
  additionalProperties: false,
} as const;

export const publishGalleryResponseInputSchema = {
  type: 'object',
  properties: {
    mode: {
      type: 'string',
      enum: experienceModes,
      description: 'Optional speaking style; defaults to the current style.',
    },
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 120,
      description: 'Optional short response heading.',
    },
    segments: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      description: 'One to eight explicitly labelled response segments.',
      items: {
        oneOf: [
          {
            type: 'object',
            properties: {
              provenance: { type: 'string', enum: ['observed', 'known'] },
              statementId: {
                type: 'string',
                minLength: 1,
                maxLength: 120,
                description: 'Statement id returned by get_artwork_context.',
              },
            },
            required: ['provenance', 'statementId'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              provenance: {
                type: 'string',
                enum: ['interpreted', 'imagined'],
              },
              text: {
                type: 'string',
                minLength: 1,
                maxLength: 600,
                description: 'Plain text. Markup is displayed literally.',
              },
            },
            required: ['provenance', 'text'],
            additionalProperties: false,
          },
        ],
      },
    },
    expectedRevision: expectedRevisionProperty,
  },
  required: ['segments'],
  additionalProperties: false,
} as const;

export const revisionGuardedEmptyInputSchema = {
  type: 'object',
  properties: { expectedRevision: expectedRevisionProperty },
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
    expectedRevision: expectedRevisionProperty,
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
    expectedRevision: expectedRevisionProperty,
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
    expectedRevision: expectedRevisionProperty,
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
    expectedRevision: expectedRevisionProperty,
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
    expectedRevision: expectedRevisionProperty,
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
    expectedRevision: expectedRevisionProperty,
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
