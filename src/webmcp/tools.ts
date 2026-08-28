import { getArtwork, isArtworkId, listArtworks } from '../collection/repository';
import type { GalleryController } from '../gallery/controller';
import {
  experienceModes,
  isExperienceMode,
} from '../gallery/reducer';
import { buildError, buildSuccess, type GalleryToolAction } from './results';
import {
  artworkIds,
  emptyInputSchema,
  hasOnlyKeys,
  isRecord,
  listArtworksInputSchema,
  navigateToArtworkInputSchema,
  setExperienceModeInputSchema,
} from './schemas';

function invalidInput(
  controller: GalleryController,
  action: GalleryToolAction,
  message: string,
  expected: string,
) {
  return buildError(action, controller.getState(), 'INVALID_INPUT', message, {
    expected,
  });
}

function cancelled(controller: GalleryController, action: GalleryToolAction) {
  return buildError(
    action,
    controller.getState(),
    'EXECUTION_CANCELLED',
    'The request was cancelled before the gallery changed.',
    { retry: `Call ${action} again if the visitor still wants this action.` },
  );
}

export function createGalleryTools(
  controller: GalleryController,
): readonly WebMCP.ModelContextTool[] {
  return [
    {
      name: 'get_gallery_state',
      title: 'Get gallery state',
      description:
        'Read the artwork, experience mode, focused region, interpretation status, collection size, and revision currently shown in the gallery.',
      inputSchema: emptyInputSchema,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        if (!isRecord(input) || !hasOnlyKeys(input, [])) {
          return invalidInput(
            controller,
            'get_gallery_state',
            'get_gallery_state accepts no properties.',
            '{}',
          );
        }

        return buildSuccess(
          'get_gallery_state',
          controller.getState(),
          'Returned the current live gallery state.',
        );
      },
    },
    {
      name: 'list_artworks',
      title: 'List artworks',
      description:
        'List the curated artworks and their mood, theme, palette, and subject cues so you can choose a work that fits the visitor’s intent.',
      inputSchema: listArtworksInputSchema,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['excludeCurrent']) ||
          (input.excludeCurrent !== undefined &&
            typeof input.excludeCurrent !== 'boolean')
        ) {
          return invalidInput(
            controller,
            'list_artworks',
            'excludeCurrent must be a boolean when provided, with no other properties.',
            '{ excludeCurrent?: boolean }',
          );
        }

        const state = controller.getState();
        const candidates = listArtworks().filter(
          ({ id }) => input.excludeCurrent !== true || id !== state.artworkId,
        );

        return buildSuccess(
          'list_artworks',
          state,
          `Returned ${candidates.length} curated artwork${candidates.length === 1 ? '' : 's'}.`,
          {
            artworks: candidates.map((artwork) => ({
              id: artwork.id,
              title: artwork.title,
              artist: artwork.artist,
              year: artwork.yearLabel,
              moods: artwork.discovery.moods,
              themes: artwork.discovery.themes,
              palette: artwork.discovery.palette,
              subjects: artwork.discovery.subjects,
            })),
          },
        );
      },
    },
    {
      name: 'navigate_to_artwork',
      title: 'Navigate to artwork',
      description:
        'Show one artwork from the curated collection on the current gallery page. This clears region focus and rendered interpretation while preserving the active mode.',
      inputSchema: navigateToArtworkInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['artworkId']) ||
          typeof input.artworkId !== 'string'
        ) {
          return invalidInput(
            controller,
            'navigate_to_artwork',
            'artworkId must be one exact gallery artwork id, with no other properties.',
            '{ artworkId: string }',
          );
        }
        if (!isArtworkId(input.artworkId)) {
          return buildError(
            'navigate_to_artwork',
            controller.getState(),
            'UNKNOWN_ARTWORK',
            `No artwork has the id “${input.artworkId}”.`,
            {
              validArtworks: artworkIds.map((id) => ({
                id,
                title: getArtwork(id).title,
              })),
            },
          );
        }
        if (options?.signal?.aborted) {
          return cancelled(controller, 'navigate_to_artwork');
        }

        const previousArtworkId = controller.getState().artworkId;
        const state = controller.navigateToArtwork(input.artworkId);
        return buildSuccess(
          'navigate_to_artwork',
          state,
          previousArtworkId === state.artworkId
            ? `${getArtwork(state.artworkId).title} was already the current artwork.`
            : `Now showing ${getArtwork(state.artworkId).title}.`,
        );
      },
    },
    {
      name: 'set_experience_mode',
      title: 'Set experience mode',
      description:
        'Set the interpretive lens for the current artwork to literal, spatial, poetic, story, or curatorial while preserving the artwork and focused region.',
      inputSchema: setExperienceModeInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['mode']) ||
          typeof input.mode !== 'string'
        ) {
          return invalidInput(
            controller,
            'set_experience_mode',
            'mode must be one exact experience mode, with no other properties.',
            '{ mode: string }',
          );
        }
        if (!isExperienceMode(input.mode)) {
          return buildError(
            'set_experience_mode',
            controller.getState(),
            'UNKNOWN_MODE',
            `“${input.mode}” is not an available experience mode.`,
            { validModes: experienceModes },
          );
        }
        if (options?.signal?.aborted) {
          return cancelled(controller, 'set_experience_mode');
        }

        const state = controller.setExperienceMode(input.mode);
        return buildSuccess(
          'set_experience_mode',
          state,
          `The gallery is now in ${state.mode} mode.`,
        );
      },
    },
  ];
}
