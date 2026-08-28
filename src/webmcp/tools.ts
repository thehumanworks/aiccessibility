import { getArtwork, isArtworkId, listArtworks } from '../collection/repository';
import type { GalleryController } from '../gallery/controller';
import { describeRegionForMode } from '../gallery/regionDescriptions';
import {
  getCurrentRegionAnalysis,
  getVisibleRegion,
  getVisibleRegions,
} from '../gallery/regions';
import {
  experienceModes,
  isExperienceMode,
} from '../gallery/reducer';
import { buildError, buildSuccess, type GalleryToolAction } from './results';
import {
  artworkIds,
  analyzeArtworkRegionsInputSchema,
  emptyInputSchema,
  hasOnlyKeys,
  isRecord,
  listArtworksInputSchema,
  navigateToArtworkInputSchema,
  regionIdInputSchema,
  setExperienceModeInputSchema,
  zoomToArtworkDetailInputSchema,
} from './schemas';

function compactRegion(region: ReturnType<typeof getVisibleRegions>[number]) {
  return {
    id: region.id,
    label: region.label,
    bounds: region.bounds,
    confidence: region.confidence ?? 1,
    provenance: region.provenance ?? 'authored',
    ...(region.model ? { model: region.model } : {}),
    ...(region.mask ? { mask: region.mask } : {}),
  };
}

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
        'Read the artwork, selected speaking style, focused region, interpretation status, collection size, and revision currently shown in the gallery. Call this before answering any request to describe, explain, interpret, or tell the visitor about the current artwork, then shape the response in the returned speaking style rather than giving a generic description.',
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
    {
      name: 'list_regions',
      title: 'List artwork regions',
      description:
        'List the authored and accepted local-model regions currently available for the visible artwork. Authored regions are available before any model download.',
      inputSchema: emptyInputSchema,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        if (!isRecord(input) || !hasOnlyKeys(input, [])) {
          return invalidInput(
            controller,
            'list_regions',
            'list_regions accepts no properties.',
            '{}',
          );
        }
        const state = controller.getState();
        const regions = getVisibleRegions(state);
        return buildSuccess(
          'list_regions',
          state,
          `Returned ${regions.length} visible, accepted region${regions.length === 1 ? '' : 's'}.`,
          { regions: regions.map(compactRegion) },
        );
      },
    },
    {
      name: 'analyze_artwork_regions',
      title: 'Analyze artwork regions locally',
      description:
        'With the visitor’s request, lazily download and run browser-local Grounding DINO Tiny and SlimSAM analysis for the current artwork. Candidate labels and model suggestions are navigation aids, not verified museum facts; authored regions remain available on failure.',
      inputSchema: analyzeArtworkRegionsInputSchema,
      annotations: { readOnlyHint: false },
      execute: async (input, options) => {
        const validLabels =
          isRecord(input) &&
          (input.labels === undefined ||
            (Array.isArray(input.labels) &&
              input.labels.length >= 1 &&
              input.labels.length <= 12 &&
              input.labels.every(
                (label) =>
                  typeof label === 'string' &&
                  label.trim().length >= 1 &&
                  label.length <= 80,
              )));
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['labels', 'threshold', 'maxRegions']) ||
          !validLabels ||
          (input.threshold !== undefined &&
            (typeof input.threshold !== 'number' ||
              input.threshold < 0.05 ||
              input.threshold > 0.9)) ||
          (input.maxRegions !== undefined &&
            (!Number.isInteger(input.maxRegions) ||
              (input.maxRegions as number) < 1 ||
              (input.maxRegions as number) > 12))
        ) {
          return invalidInput(
            controller,
            'analyze_artwork_regions',
            'labels must contain 1–12 short phrases, threshold must be 0.05–0.9, and maxRegions must be 1–12.',
            '{ labels?: string[], threshold?: number, maxRegions?: integer }',
          );
        }
        if (options?.signal?.aborted) {
          return cancelled(controller, 'analyze_artwork_regions');
        }

        const state = await controller.analyzeArtworkRegions({
          ...(input.labels ? { labels: input.labels as string[] } : {}),
          ...(input.threshold !== undefined
            ? { threshold: input.threshold as number }
            : {}),
          ...(input.maxRegions !== undefined
            ? { maxRegions: input.maxRegions as number }
            : {}),
          ...(options?.signal ? { signal: options.signal } : {}),
        });
        const analysis = getCurrentRegionAnalysis(state);
        if (analysis.phase === 'failed') {
          return buildError(
            'analyze_artwork_regions',
            state,
            'LOCAL_ANALYSIS_FAILED',
            analysis.message,
            {
              authoredRegionsAvailable: getArtwork(state.artworkId).regions.length,
              retry: 'Try again later or continue with list_regions and the authored regions.',
            },
          );
        }
        return buildSuccess(
          'analyze_artwork_regions',
          state,
          analysis.message,
          {
            analysis,
            regions: getVisibleRegions(state).map(compactRegion),
          },
        );
      },
    },
    {
      name: 'zoom_to_artwork_detail',
      title: 'Find and zoom to an artwork detail',
      description:
        'Use this whenever the visitor asks to find, locate, inspect, look closely at, or zoom into a specific visible subject or section of the current painting. Pass the visitor’s natural-language target. The gallery first resolves matching authored detail aliases; otherwise it runs browser-local Grounding DINO Tiny detection on demand with WebGPU when available, refines the best matches with SlimSAM, and immediately zooms the shared page to the strongest accepted match. Model results are visual navigation suggestions, not verified museum facts.',
      inputSchema: zoomToArtworkDetailInputSchema,
      annotations: { readOnlyHint: false },
      execute: async (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['query']) ||
          typeof input.query !== 'string' ||
          input.query.trim().length < 2 ||
          input.query.length > 160
        ) {
          return invalidInput(
            controller,
            'zoom_to_artwork_detail',
            'query must be a natural-language visual target between 2 and 160 characters, with no other properties.',
            '{ query: string }',
          );
        }
        if (options?.signal?.aborted) {
          return cancelled(controller, 'zoom_to_artwork_detail');
        }

        const query = input.query.trim();
        const state = await controller.zoomToArtworkDetail(query, {
          ...(options?.signal ? { signal: options.signal } : {}),
        });
        const analysis = getCurrentRegionAnalysis(state);
        if (analysis.phase === 'failed') {
          return buildError(
            'zoom_to_artwork_detail',
            state,
            'LOCAL_ANALYSIS_FAILED',
            analysis.message,
            {
              query,
              retry: 'Try a shorter, concrete visual subject or try again when local model execution is available.',
            },
          );
        }

        const region = state.focusedRegionId
          ? getVisibleRegion(state, state.focusedRegionId)
          : undefined;
        if (!region) {
          return buildError(
            'zoom_to_artwork_detail',
            state,
            'DETAIL_NOT_FOUND',
            `No accepted visual match was found for “${query}”.`,
            {
              query,
              retry:
                'Try a shorter, concrete noun phrase describing something visibly present in the painting.',
            },
          );
        }

        return buildSuccess(
          'zoom_to_artwork_detail',
          state,
          `Found and zoomed to ${region.label}.`,
          {
            query,
            region: compactRegion(region),
            analysis,
            verification:
              region.provenance === 'model-detected'
                ? 'unverified-model-suggestion'
                : 'gallery-authored-region',
          },
        );
      },
    },
    {
      name: 'focus_region',
      title: 'Focus artwork region',
      description:
        'Atomically focus one visible authored or accepted region in the page’s shared zoom, highlight, and semantic gallery state.',
      inputSchema: regionIdInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['regionId']) ||
          typeof input.regionId !== 'string' ||
          input.regionId.length === 0
        ) {
          return invalidInput(
            controller,
            'focus_region',
            'regionId must be one exact id returned by list_regions.',
            '{ regionId: string }',
          );
        }
        const before = controller.getState();
        const region = getVisibleRegion(before, input.regionId);
        if (!region) {
          return buildError(
            'focus_region',
            before,
            'UNKNOWN_OR_STALE_REGION',
            `“${input.regionId}” is not a visible accepted region for the current artwork.`,
            { validRegionIds: getVisibleRegions(before).map(({ id }) => id) },
          );
        }
        if (options?.signal?.aborted) {
          return cancelled(controller, 'focus_region');
        }
        const state = controller.focusRegion(region.id);
        return buildSuccess('focus_region', state, `Focused on ${region.label}.`, {
          region: compactRegion(region),
        });
      },
    },
    {
      name: 'describe_region',
      title: 'Describe artwork region',
      description:
        'Describe one visible region using the currently selected speaking style, with observed, known, interpreted, and imagined material clearly labelled.',
      inputSchema: regionIdInputSchema,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['regionId']) ||
          typeof input.regionId !== 'string' ||
          input.regionId.length === 0
        ) {
          return invalidInput(
            controller,
            'describe_region',
            'regionId must be one exact id returned by list_regions.',
            '{ regionId: string }',
          );
        }
        const state = controller.getState();
        const region = getVisibleRegion(state, input.regionId);
        if (!region) {
          return buildError(
            'describe_region',
            state,
            'UNKNOWN_OR_STALE_REGION',
            `“${input.regionId}” is not a visible accepted region for the current artwork.`,
            { validRegionIds: getVisibleRegions(state).map(({ id }) => id) },
          );
        }
        return buildSuccess(
          'describe_region',
          state,
          `Described ${region.label} in ${state.mode} style.`,
          {
            region: compactRegion(region),
            description: {
              mode: state.mode,
              segments: describeRegionForMode(state.artworkId, region, state.mode),
            },
          },
        );
      },
    },
    {
      name: 'clear_region_focus',
      title: 'Show whole artwork',
      description: 'Clear the shared region focus and restore the whole-artwork view.',
      inputSchema: emptyInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (!isRecord(input) || !hasOnlyKeys(input, [])) {
          return invalidInput(
            controller,
            'clear_region_focus',
            'clear_region_focus accepts no properties.',
            '{}',
          );
        }
        if (options?.signal?.aborted) {
          return cancelled(controller, 'clear_region_focus');
        }
        const state = controller.clearRegionFocus();
        return buildSuccess(
          'clear_region_focus',
          state,
          'Showing the whole artwork.',
        );
      },
    },
  ];
}
