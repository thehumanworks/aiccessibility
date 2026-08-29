import {
  getArtwork,
  getSource,
  isArtworkId,
  listArtworks,
} from '../collection/repository';
import type {
  ConfigurePresentationInput,
  GalleryController,
  GalleryResponseSegmentInput,
  PublishGalleryResponseInput,
} from '../gallery/controller';
import { localizeArtwork, localizeRegion } from '../gallery/i18n';
import type { GalleryLanguage } from '../gallery/types';
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
import {
  isColorTheme,
  isContrastLevel,
  isFontFamily,
  isFontSize,
  isGalleryLanguage,
} from '../gallery/personalization';
import { buildError, buildSuccess, type GalleryToolAction } from './results';
import {
  artworkIds,
  analyzeArtworkRegionsInputSchema,
  configurePresentationInputSchema,
  emptyInputSchema,
  focusArtworkAreaInputSchema,
  getArtworkContextInputSchema,
  hasOnlyKeys,
  isRecord,
  listArtworksInputSchema,
  navigateToArtworkInputSchema,
  publishGalleryResponseInputSchema,
  regionIdInputSchema,
  revisionGuardedEmptyInputSchema,
  setExperienceModeInputSchema,
  zoomToArtworkDetailInputSchema,
} from './schemas';

function compactRegion(
  region: ReturnType<typeof getVisibleRegions>[number],
  language: GalleryLanguage = 'en',
) {
  const localized = localizeRegion(region, language);
  const provenance = localized.provenance ?? 'authored';
  return {
    id: localized.id,
    label: localized.label,
    bounds: localized.bounds,
    ...(provenance === 'agent-grounded'
      ? {}
      : { confidence: localized.confidence ?? 1 }),
    provenance,
    verification:
      localized.verification ??
      (provenance === 'authored' ? 'authored' : 'unverified'),
    ...(localized.model ? { model: localized.model } : {}),
    ...(localized.mask ? { mask: localized.mask } : {}),
  };
}

function isValidExpectedRevision(value: unknown): value is number | undefined {
  return (
    value === undefined ||
    (typeof value === 'number' && Number.isInteger(value) && value >= 0)
  );
}

function staleRevision(
  controller: GalleryController,
  action: GalleryToolAction,
  expectedRevision: number,
) {
  const state = controller.getState();
  return buildError(
    action,
    state,
    'STALE_GALLERY_STATE',
    `Expected revision ${expectedRevision}, but the live gallery is at revision ${state.revision}.`,
    {
      currentRevision: state.revision,
      retry: `Read get_gallery_state, then retry ${action} with the current revision.`,
    },
  );
}

function hasFreshRevision(
  controller: GalleryController,
  action: GalleryToolAction,
  expectedRevision: number | undefined,
) {
  return expectedRevision !== undefined &&
    !controller.expectedRevisionMatches(expectedRevision)
    ? staleRevision(controller, action, expectedRevision)
    : undefined;
}

function presentationSnapshot(controller: GalleryController) {
  const state = controller.getState();
  return { mode: state.mode, ...state.personalization };
}

function validAgentBounds(value: unknown): value is {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (!isRecord(value) || !hasOnlyKeys(value, ['x', 'y', 'width', 'height'])) {
    return false;
  }
  const coordinates = [value.x, value.y, value.width, value.height];
  if (
    !coordinates.every(
      (coordinate) =>
        typeof coordinate === 'number' && Number.isFinite(coordinate),
    )
  ) {
    return false;
  }
  const { x, y, width, height } = value as Record<
    'x' | 'y' | 'width' | 'height',
    number
  >;
  return (
    x >= 0 &&
    y >= 0 &&
    width > 0 &&
    height > 0 &&
    x + width <= 1 &&
    y + height <= 1
  );
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
        'Read live artwork, style, presentation, focus, response status, and revision so you can branch correctly. For a current-view request: if focusedRegion exists, call describe_region; otherwise call get_artwork_context before explaining the whole work. speakingStyle governs gallery content, not your host persona.',
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
        'Use when the visitor asks what artworks are available or requests a work by mood, theme, palette, or subject. List the curated choices and their selection cues. If the visitor asks to show the chosen work, immediately follow with navigate_to_artwork using its returned id.',
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
        const candidates = listArtworks()
          .filter(
            ({ id }) => input.excludeCurrent !== true || id !== state.artworkId,
          )
          .map((artwork) =>
            localizeArtwork(artwork, state.personalization.language),
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
      name: 'get_artwork_context',
      title: 'Get trusted artwork context',
      description:
        'Use for “tell me more” or a whole-artwork description. Return bounded authored observations, sourced facts, attributed interpretations, rights, sources, and regions for the current or named work. Use its statement ids when publishing Observed or Known segments. Source statements remain canonical when no translation exists.',
      inputSchema: getArtworkContextInputSchema,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['artworkId']) ||
          (input.artworkId !== undefined &&
            typeof input.artworkId !== 'string')
        ) {
          return invalidInput(
            controller,
            'get_artwork_context',
            'artworkId must be one exact gallery id when provided.',
            '{ artworkId?: string }',
          );
        }
        if (
          typeof input.artworkId === 'string' &&
          !isArtworkId(input.artworkId)
        ) {
          return buildError(
            'get_artwork_context',
            controller.getState(),
            'UNKNOWN_ARTWORK',
            `No artwork has the id “${input.artworkId}”.`,
            { validArtworkIds: artworkIds },
          );
        }

        const state = controller.getState();
        const artworkId =
          typeof input.artworkId === 'string'
            ? input.artworkId
            : state.artworkId;
        const canonical = controller.getArtworkContext(artworkId);
        const artwork = localizeArtwork(
          canonical,
          state.personalization.language,
        );
        const sourceIds = new Set(
          [...canonical.known, ...canonical.interpreted].flatMap(
            ({ sourceIds: ids }) => ids,
          ),
        );
        const sourceRecords = [...sourceIds]
          .map((id) => getSource(id))
          .filter((source): source is NonNullable<typeof source> => !!source);
        return buildSuccess(
          'get_artwork_context',
          state,
          `Returned trusted context for ${artwork.title}.`,
          {
            context: {
              artwork: {
                id: artwork.id,
                title: artwork.title,
                artist: artwork.artist,
                year: artwork.yearLabel,
                medium: artwork.medium,
                dimensions: artwork.dimensionsLabel,
                image: artwork.image,
              },
              observed: canonical.observed.map(({ id, text }) => ({ id, text })),
              known: canonical.known.map(({ id, text, sourceIds: ids }) => ({
                id,
                text,
                sourceIds: [...ids],
              })),
              interpreted: canonical.interpreted.map(
                ({ id, text, sourceIds: ids }) => ({
                  id,
                  text,
                  sourceIds: [...ids],
                }),
              ),
              sources: sourceRecords,
              rights: canonical.rights,
              regions: canonical.regions.map((region) => {
                const localized = localizeRegion(
                  { ...region, provenance: 'authored', verification: 'authored' },
                  state.personalization.language,
                );
                return {
                  id: localized.id,
                  label: localized.label,
                  description: localized.description,
                  bounds: localized.bounds,
                  provenance: 'authored' as const,
                  verification: 'authored' as const,
                };
              }),
            },
          },
        );
      },
    },
    {
      name: 'navigate_to_artwork',
      title: 'Navigate to artwork',
      description:
        'Show one exact gallery artwork. Call list_artworks first when its id is unknown. Navigation clears focus and the published response while preserving style. When recent state supplies a revision, pass it as expectedRevision.',
      inputSchema: navigateToArtworkInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['artworkId', 'expectedRevision']) ||
          typeof input.artworkId !== 'string' ||
          !isValidExpectedRevision(input.expectedRevision)
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
        const stale = hasFreshRevision(
          controller,
          'navigate_to_artwork',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'navigate_to_artwork');
        }

        const previousArtworkId = controller.getState().artworkId;
        const state = controller.navigateToArtwork(input.artworkId, 'agent');
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
        'Use for a style-only change: literal, spatial, poetic, story, or curatorial. Preserve artwork and focus. If content is also requested, follow the current-view branch through get_gallery_state. If “lighter” could mean theme or tone, clarify first. Pass a supplied state revision as expectedRevision.',
      inputSchema: setExperienceModeInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['mode', 'expectedRevision']) ||
          typeof input.mode !== 'string' ||
          !isValidExpectedRevision(input.expectedRevision)
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
        const stale = hasFreshRevision(
          controller,
          'set_experience_mode',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'set_experience_mode');
        }

        const state = controller.setExperienceMode(input.mode, 'agent');
        return buildSuccess(
          'set_experience_mode',
          state,
          `The gallery is now in ${state.mode} mode.`,
        );
      },
    },
    {
      name: 'configure_presentation',
      title: 'Configure gallery presentation',
      description:
        'Atomically adapt multiple settings, or one non-mode setting: typeface, text size, contrast, theme, language, and optionally style. Use set_experience_mode for mode alone. “Larger text” means large; reserve extra-large for explicit maximum requests. If “lighter” could mean theme or tone, clarify first. Returns one-revision diff; supports expectedRevision.',
      inputSchema: configurePresentationInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        const allowed = [
          'mode',
          'fontFamily',
          'fontSize',
          'contrast',
          'theme',
          'language',
          'expectedRevision',
        ] as const;
        if (!isRecord(input) || !hasOnlyKeys(input, allowed)) {
          return invalidInput(
            controller,
            'configure_presentation',
            'Use only supported presentation properties.',
            '{ mode?, fontFamily?, fontSize?, contrast?, theme?, language?, expectedRevision? }',
          );
        }
        const hasSetting = allowed
          .filter((key) => key !== 'expectedRevision')
          .some((key) => input[key] !== undefined);
        if (
          !hasSetting ||
          (input.mode !== undefined &&
            (typeof input.mode !== 'string' || !isExperienceMode(input.mode))) ||
          (input.fontFamily !== undefined &&
            (typeof input.fontFamily !== 'string' ||
              !isFontFamily(input.fontFamily))) ||
          (input.fontSize !== undefined &&
            (typeof input.fontSize !== 'string' || !isFontSize(input.fontSize))) ||
          (input.contrast !== undefined &&
            (typeof input.contrast !== 'string' ||
              !isContrastLevel(input.contrast))) ||
          (input.theme !== undefined &&
            (typeof input.theme !== 'string' || !isColorTheme(input.theme))) ||
          (input.language !== undefined &&
            (typeof input.language !== 'string' ||
              !isGalleryLanguage(input.language))) ||
          !isValidExpectedRevision(input.expectedRevision)
        ) {
          return invalidInput(
            controller,
            'configure_presentation',
            'Provide at least one valid presentation setting and an optional non-negative expectedRevision.',
            '{ mode?, fontFamily?, fontSize?, contrast?, theme?, language?, expectedRevision? }',
          );
        }
        const stale = hasFreshRevision(
          controller,
          'configure_presentation',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'configure_presentation');
        }
        const before = presentationSnapshot(controller);
        const state = controller.configurePresentation(
          input as ConfigurePresentationInput,
          'agent',
        );
        const after = { mode: state.mode, ...state.personalization };
        const changes = Object.keys(after).flatMap((key) => {
          const name = key as keyof typeof after;
          return before[name] === after[name]
            ? []
            : [{ setting: name, from: before[name], to: after[name] }];
        });
        return buildSuccess(
          'configure_presentation',
          state,
          changes.length === 0
            ? 'The requested presentation was already active.'
            : `Updated ${changes.length} presentation setting${changes.length === 1 ? '' : 's'} atomically.`,
          { before, after, changes },
        );
      },
    },
    {
      name: 'publish_gallery_response',
      title: 'Publish a provenance-labelled response',
      description:
        'Publish a short accessible response beside the artwork, defaulting to the current style. Observed and Known segments require ids from get_artwork_context; the gallery resolves text and sources. Interpreted and Imagined accept bounded plain text. Never use this for a request to execute or render raw HTML. Use expectedRevision against stale state.',
      inputSchema: publishGalleryResponseInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, [
            'mode',
            'title',
            'segments',
            'expectedRevision',
          ]) ||
          (input.mode !== undefined && typeof input.mode !== 'string') ||
          !Array.isArray(input.segments) ||
          !isValidExpectedRevision(input.expectedRevision) ||
          (input.title !== undefined &&
            (typeof input.title !== 'string' ||
              input.title.trim().length < 1 ||
              input.title.length > 120))
        ) {
          return invalidInput(
            controller,
            'publish_gallery_response',
            'Provide an optional valid mode/title, one to eight bounded segments, and optional expectedRevision.',
            '{ mode?, title?, segments, expectedRevision? }',
          );
        }
        if (typeof input.mode === 'string' && !isExperienceMode(input.mode)) {
          return buildError(
            'publish_gallery_response',
            controller.getState(),
            'UNKNOWN_MODE',
            `“${input.mode}” is not an available experience mode.`,
            { validModes: experienceModes },
          );
        }
        if (input.segments.length < 1 || input.segments.length > 8) {
          return invalidInput(
            controller,
            'publish_gallery_response',
            'segments must contain between one and eight entries.',
            '1–8 source-bound or bounded plain-text segments',
          );
        }
        const artwork = controller.getArtworkContext();
        const validSegments: GalleryResponseSegmentInput[] = [];
        for (const candidate of input.segments) {
          if (!isRecord(candidate) || typeof candidate.provenance !== 'string') {
            return invalidInput(
              controller,
              'publish_gallery_response',
              'Every segment needs a supported provenance and matching payload.',
              'Observed/Known: statementId; Interpreted/Imagined: text',
            );
          }
          if (
            candidate.provenance === 'observed' ||
            candidate.provenance === 'known'
          ) {
            if (
              !hasOnlyKeys(candidate, ['provenance', 'statementId']) ||
              typeof candidate.statementId !== 'string'
            ) {
              return invalidInput(
                controller,
                'publish_gallery_response',
                'Observed and Known segments must use only a statementId.',
                '{ provenance: observed|known, statementId }',
              );
            }
            const collection =
              candidate.provenance === 'observed'
                ? artwork.observed
                : artwork.known;
            if (!collection.some(({ id }) => id === candidate.statementId)) {
              return buildError(
                'publish_gallery_response',
                controller.getState(),
                'UNKNOWN_OR_MISLABELLED_STATEMENT',
                `“${candidate.statementId}” is not a ${candidate.provenance} statement for the current artwork.`,
                {
                  validStatementIds: collection.map(({ id }) => id),
                  artworkId: artwork.id,
                },
              );
            }
            validSegments.push({
              provenance: candidate.provenance,
              statementId: candidate.statementId,
            });
            continue;
          }
          if (
            candidate.provenance !== 'interpreted' &&
            candidate.provenance !== 'imagined'
          ) {
            return invalidInput(
              controller,
              'publish_gallery_response',
              'Segment provenance must be observed, known, interpreted, or imagined.',
              'A supported provenance category',
            );
          }
          if (
            !hasOnlyKeys(candidate, ['provenance', 'text']) ||
            typeof candidate.text !== 'string' ||
            candidate.text.trim().length < 1 ||
            candidate.text.length > 600
          ) {
            return invalidInput(
              controller,
              'publish_gallery_response',
              'Interpreted and Imagined segments require 1–600 characters of plain text.',
              '{ provenance: interpreted|imagined, text }',
            );
          }
          validSegments.push({
            provenance: candidate.provenance,
            text: candidate.text,
          });
        }
        const stale = hasFreshRevision(
          controller,
          'publish_gallery_response',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'publish_gallery_response');
        }
        const state = controller.publishGalleryResponse(
          {
            ...(typeof input.mode === 'string' ? { mode: input.mode } : {}),
            ...(typeof input.title === 'string' ? { title: input.title } : {}),
            segments: validSegments,
            ...(input.expectedRevision !== undefined
              ? { expectedRevision: input.expectedRevision }
              : {}),
          } as PublishGalleryResponseInput,
          'agent',
        );
        return buildSuccess(
          'publish_gallery_response',
          state,
          `Published ${validSegments.length} provenance-labelled segment${validSegments.length === 1 ? '' : 's'}.`,
        );
      },
    },
    {
      name: 'clear_gallery_response',
      title: 'Clear the published gallery response',
      description:
        'Remove the published provenance-labelled response while preserving the artwork, focus, speaking style, and presentation. Use expectedRevision when coordinating with a recent state read.',
      inputSchema: revisionGuardedEmptyInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['expectedRevision']) ||
          !isValidExpectedRevision(input.expectedRevision)
        ) {
          return invalidInput(
            controller,
            'clear_gallery_response',
            'Only an optional non-negative expectedRevision is accepted.',
            '{ expectedRevision?: integer }',
          );
        }
        const stale = hasFreshRevision(
          controller,
          'clear_gallery_response',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'clear_gallery_response');
        }
        const state = controller.clearGalleryResponse(
          'agent',
          input.expectedRevision,
        );
        return buildSuccess(
          'clear_gallery_response',
          state,
          state.interpretation
            ? 'The gallery response remains visible.'
            : 'Cleared the published gallery response.',
        );
      },
    },
    {
      name: 'get_session_activity',
      title: 'Get session activity',
      description:
        'Read the bounded in-memory receipt of recent human and agent gallery changes. Entries contain only controlled action summaries and revision transitions; raw prompts and generated response text are never included. Use canUndo to decide whether undo_last_change is available.',
      inputSchema: emptyInputSchema,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        if (!isRecord(input) || !hasOnlyKeys(input, [])) {
          return invalidInput(
            controller,
            'get_session_activity',
            'get_session_activity accepts no properties.',
            '{}',
          );
        }
        const state = controller.getState();
        return buildSuccess(
          'get_session_activity',
          state,
          `Returned ${state.activity.length} recent change${state.activity.length === 1 ? '' : 's'}.`,
          {
            activity: controller.getSessionActivity().map((entry) => ({
              ...entry,
            })),
            canUndo: state.undoSnapshot !== null,
          },
        );
      },
    },
    {
      name: 'undo_last_change',
      title: 'Undo the last gallery change',
      description:
        'Undo the most recent reversible gallery change and record the undo in the session receipt. This is one-step recovery and does not recurse. Pass expectedRevision when coordinating with a recent state read.',
      inputSchema: revisionGuardedEmptyInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['expectedRevision']) ||
          !isValidExpectedRevision(input.expectedRevision)
        ) {
          return invalidInput(
            controller,
            'undo_last_change',
            'Only an optional non-negative expectedRevision is accepted.',
            '{ expectedRevision?: integer }',
          );
        }
        const stale = hasFreshRevision(
          controller,
          'undo_last_change',
          input.expectedRevision,
        );
        if (stale) return stale;
        const before = controller.getState();
        if (!before.undoSnapshot) {
          return buildError(
            'undo_last_change',
            before,
            'NOTHING_TO_UNDO',
            'There is no reversible gallery change to undo.',
            { retry: 'Make a gallery change before requesting undo.' },
          );
        }
        if (options?.signal?.aborted) {
          return cancelled(controller, 'undo_last_change');
        }
        const state = controller.undoLastChange('agent', input.expectedRevision);
        return buildSuccess(
          'undo_last_change',
          state,
          'Undid the most recent reversible gallery change.',
        );
      },
    },
    {
      name: 'list_regions',
      title: 'List artwork regions',
      description:
        'Use when the visitor asks what areas, subjects, or details of the visible artwork can be explored. List the authored, agent-grounded, and accepted local-model regions currently available; authored regions are ready before any model download. Check this before creating another region, then pass a returned id to focus_region or describe_region.',
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
          {
            regions: regions.map((region) =>
              compactRegion(region, state.personalization.language),
            ),
          },
        );
      },
    },
    {
      name: 'focus_artwork_area',
      title: 'Focus an artwork area by visual bounds',
      description:
        'Use when you can inspect and ground a detail. Submit a label and normalized bounds to focus an unverified agent proposal without local models; this suits text and signatures. Never guess bounds: otherwise use list_regions, focus_region, or zoom_to_artwork_detail. Pass a supplied state revision as expectedRevision.',
      inputSchema: focusArtworkAreaInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        const validLabel =
          typeof input.label === 'string' &&
          input.label.trim().length >= 2 &&
          input.label.length <= 80;
        const validDescription =
          input.description === undefined ||
          (typeof input.description === 'string' &&
            input.description.trim().length >= 2 &&
            input.description.length <= 240);
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, [
            'label',
            'description',
            'bounds',
            'expectedRevision',
          ]) ||
          !validLabel ||
          !validDescription ||
          !validAgentBounds(input.bounds) ||
          !isValidExpectedRevision(input.expectedRevision)
        ) {
          return invalidInput(
            controller,
            'focus_artwork_area',
            'label must be 2–80 characters, description must be 2–240 characters when provided, and normalized bounds must stay entirely within the source artwork.',
            '{ label: string, description?: string, bounds: { x: number, y: number, width: number, height: number } }',
          );
        }
        const stale = hasFreshRevision(
          controller,
          'focus_artwork_area',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'focus_artwork_area');
        }
        const label = (input.label as string).trim();
        const description =
          typeof input.description === 'string'
            ? input.description.trim()
            : undefined;
        const state = controller.focusArtworkArea(
          {
            label,
            ...(description ? { description } : {}),
            bounds: input.bounds,
          },
          'agent',
        );
        const region = state.focusedRegionId
          ? getVisibleRegion(state, state.focusedRegionId)
          : undefined;
        return buildSuccess(
          'focus_artwork_area',
          state,
          `Focused the agent-grounded area “${label}”.`,
          {
            region: compactRegion(region!, state.personalization.language),
            verification: 'agent-grounded-visual-selection',
          },
        );
      },
    },
    {
      name: 'analyze_artwork_regions',
      title: 'Analyze artwork regions locally',
      description:
        'Use for broad discovery of multiple candidate subjects; use zoom_to_artwork_detail for one target. Lazily run browser-local Grounding DINO Tiny and SlimSAM. Suggestions remain unverified navigation cues, never museum fact, and authored regions survive failure. Use returned ids with focus_region or describe_region. Pass a supplied state revision as expectedRevision.',
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
          !hasOnlyKeys(input, [
            'labels',
            'threshold',
            'maxRegions',
            'expectedRevision',
          ]) ||
          !validLabels ||
          (input.threshold !== undefined &&
            (typeof input.threshold !== 'number' ||
              input.threshold < 0.05 ||
              input.threshold > 0.9)) ||
          (input.maxRegions !== undefined &&
            (!Number.isInteger(input.maxRegions) ||
              (input.maxRegions as number) < 1 ||
              (input.maxRegions as number) > 12)) ||
          !isValidExpectedRevision(input.expectedRevision)
        ) {
          return invalidInput(
            controller,
            'analyze_artwork_regions',
            'labels must contain 1–12 short phrases, threshold must be 0.05–0.9, and maxRegions must be 1–12.',
            '{ labels?: string[], threshold?: number, maxRegions?: integer }',
          );
        }
        const stale = hasFreshRevision(
          controller,
          'analyze_artwork_regions',
          input.expectedRevision,
        );
        if (stale) return stale;
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
          origin: 'agent',
        });
        if (options?.signal?.aborted) {
          return cancelled(controller, 'analyze_artwork_regions');
        }
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
            regions: getVisibleRegions(state).map((region) =>
              compactRegion(region, state.personalization.language),
            ),
          },
        );
      },
    },
    {
      name: 'zoom_to_artwork_detail',
      title: 'Find and zoom to an artwork detail',
      description:
        'Use for one named detail when you cannot ground bounds. The gallery checks authored aliases, then may run local detection and focus its strongest unverified proposal. Prefer focus_artwork_area for inspectable text or signatures. If description is requested, follow with describe_region. Pass a supplied state revision as expectedRevision.',
      inputSchema: zoomToArtworkDetailInputSchema,
      annotations: { readOnlyHint: false },
      execute: async (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['query', 'expectedRevision']) ||
          typeof input.query !== 'string' ||
          input.query.trim().length < 2 ||
          input.query.length > 160 ||
          !isValidExpectedRevision(input.expectedRevision)
        ) {
          return invalidInput(
            controller,
            'zoom_to_artwork_detail',
            'query must be a natural-language visual target between 2 and 160 characters, with no other properties.',
            '{ query: string }',
          );
        }
        const stale = hasFreshRevision(
          controller,
          'zoom_to_artwork_detail',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'zoom_to_artwork_detail');
        }

        const query = input.query.trim();
        const state = await controller.zoomToArtworkDetail(query, {
          ...(options?.signal ? { signal: options.signal } : {}),
          origin: 'agent',
        });
        if (options?.signal?.aborted) {
          return cancelled(controller, 'zoom_to_artwork_detail');
        }
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
            region: compactRegion(region, state.personalization.language),
            analysis,
            verification:
              region.provenance === 'model-detected'
                ? 'unverified-model-suggestion'
                : region.provenance === 'agent-grounded'
                  ? 'agent-grounded-visual-selection'
                  : 'gallery-authored-region',
          },
        );
      },
    },
    {
      name: 'focus_region',
      title: 'Focus artwork region',
      description:
        'Focus one exact visible region id already returned by another tool. For a natural-language target without an id, use zoom_to_artwork_detail. If description is also requested, follow with describe_region. Pass a supplied state revision as expectedRevision.',
      inputSchema: regionIdInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['regionId', 'expectedRevision']) ||
          typeof input.regionId !== 'string' ||
          input.regionId.length === 0 ||
          !isValidExpectedRevision(input.expectedRevision)
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
        const stale = hasFreshRevision(
          controller,
          'focus_region',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'focus_region');
        }
        const state = controller.focusRegion(region.id, 'agent');
        return buildSuccess('focus_region', state, `Focused on ${region.label}.`, {
          region: compactRegion(region, state.personalization.language),
        });
      },
    },
    {
      name: 'describe_region',
      title: 'Describe artwork region',
      description:
        'Use when a focused-region visitor asks what they see, or for any visible region id. Return observed, known, interpreted, and imagined material in clearly labelled mode-specific segments. The currently selected speaking style governs gallery content and tone while your host persona remains your own.',
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
            region: compactRegion(region, state.personalization.language),
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
      description:
        'Use when the visitor asks to zoom out, show the whole artwork, or leave a detail. Clear only shared focus; preserve artwork and style. Pass a supplied state revision as expectedRevision.',
      inputSchema: revisionGuardedEmptyInputSchema,
      annotations: { readOnlyHint: false },
      execute: (input, options) => {
        if (
          !isRecord(input) ||
          !hasOnlyKeys(input, ['expectedRevision']) ||
          !isValidExpectedRevision(input.expectedRevision)
        ) {
          return invalidInput(
            controller,
            'clear_region_focus',
            'clear_region_focus accepts no properties.',
            '{}',
          );
        }
        const stale = hasFreshRevision(
          controller,
          'clear_region_focus',
          input.expectedRevision,
        );
        if (stale) return stale;
        if (options?.signal?.aborted) {
          return cancelled(controller, 'clear_region_focus');
        }
        const state = controller.clearRegionFocus('agent');
        return buildSuccess(
          'clear_region_focus',
          state,
          'Showing the whole artwork.',
        );
      },
    },
  ];
}
