import { artworks } from '../collection/artworks';
import { getArtwork, isArtworkId } from '../collection/repository';
import { getVisibleRegion, idleRegionAnalysis } from './regions';
import {
  defaultPersonalization,
  isColorTheme,
  isContrastLevel,
  isFontFamily,
  isFontSize,
  isGalleryLanguage,
} from './personalization';
import type {
  ArtworkId,
  ChangeOrigin,
  ExperienceMode,
  GalleryActivityAction,
  GallerySnapshot,
  GalleryState,
  ArtworkRegion,
  PersonalizationPreferences,
  RegionId,
  RenderedInterpretation,
} from './types';

export const experienceModes = [
  'literal',
  'spatial',
  'poetic',
  'story',
  'curatorial',
] as const satisfies readonly ExperienceMode[];

export const defaultArtworkId: ArtworkId = artworks[0].id;

type GalleryActionPayload =
  | { type: 'navigate'; artworkId: string }
  | { type: 'set-mode'; mode: string }
  | {
      type: 'configure-presentation';
      presentation: Partial<PersonalizationPreferences> & { mode?: ExperienceMode };
    }
  | { type: 'set-font-family'; fontFamily: string }
  | { type: 'set-font-size'; fontSize: string }
  | { type: 'set-contrast'; contrast: string }
  | { type: 'set-theme'; theme: string }
  | { type: 'set-language'; language: string }
  | { type: 'focus-region'; regionId: string }
  | {
      type: 'focus-agent-region';
      artworkId: ArtworkId;
      region: ArtworkRegion;
    }
  | { type: 'confirm-region'; regionId: string }
  | { type: 'dismiss-region'; regionId: string }
  | { type: 'clear-focus' }
  | {
      type: 'region-analysis-progress';
      artworkId: ArtworkId;
      phase: 'loading' | 'analyzing';
      progress: number;
      message: string;
      backend?: 'webgpu' | 'wasm';
    }
  | {
      type: 'region-analysis-complete';
      artworkId: ArtworkId;
      regions: readonly ArtworkRegion[];
      message: string;
      backend: 'webgpu' | 'wasm';
      focusedRegionId?: RegionId;
    }
  | {
      type: 'region-analysis-failed';
      artworkId: ArtworkId;
      message: string;
      error: string;
    }
  | { type: 'render-interpretation'; interpretation: RenderedInterpretation }
  | { type: 'clear-interpretation' }
  | { type: 'undo' };

export type GalleryAction = GalleryActionPayload & {
  origin?: ChangeOrigin | undefined;
};

export function isExperienceMode(value: string): value is ExperienceMode {
  return experienceModes.some((mode) => mode === value);
}

export function createInitialGalleryState(
  artworkId: ArtworkId = defaultArtworkId,
): GalleryState {
  return {
    artworkId,
    mode: 'literal',
    personalization: { ...defaultPersonalization },
    focusedRegionId: null,
    interpretation: null,
    agentGroundedRegions: {},
    acceptedModelRegions: {},
    regionAnalysis: Object.fromEntries(
      artworks.map((artwork) => [artwork.id, { ...idleRegionAnalysis }]),
    ) as GalleryState['regionAnalysis'],
    revision: 0,
    activity: [],
    activitySequence: 0,
    undoSnapshot: null,
  };
}

function incrementRevision(state: GalleryState): number {
  return state.revision + 1;
}

function createSnapshot(state: GalleryState): GallerySnapshot {
  return {
    artworkId: state.artworkId,
    mode: state.mode,
    personalization: state.personalization,
    focusedRegionId: state.focusedRegionId,
    interpretation: state.interpretation,
    agentGroundedRegions: state.agentGroundedRegions,
    acceptedModelRegions: state.acceptedModelRegions,
    regionAnalysis: state.regionAnalysis,
  };
}

function recordChange(
  state: GalleryState,
  changes: Partial<GallerySnapshot>,
  action: GalleryActivityAction,
  summary: string,
  origin: ChangeOrigin = 'human',
): GalleryState {
  const toRevision = incrementRevision(state);
  const sequence = state.activitySequence + 1;
  return {
    ...state,
    ...changes,
    revision: toRevision,
    activitySequence: sequence,
    activity: [
      ...state.activity,
      {
        sequence,
        origin,
        action,
        fromRevision: state.revision,
        toRevision,
        summary,
      },
    ].slice(-20),
    undoSnapshot: createSnapshot(state),
  };
}

function updateWithoutActivity(
  state: GalleryState,
  changes: Partial<GallerySnapshot>,
): GalleryState {
  return { ...state, ...changes };
}

function recordNonUndoableChange(
  state: GalleryState,
  changes: Partial<GallerySnapshot>,
  action: GalleryActivityAction,
  summary: string,
  origin: ChangeOrigin = 'human',
): GalleryState {
  const toRevision = incrementRevision(state);
  const sequence = state.activitySequence + 1;
  return {
    ...state,
    ...changes,
    revision: toRevision,
    activitySequence: sequence,
    activity: [
      ...state.activity,
      {
        sequence,
        origin,
        action,
        fromRevision: state.revision,
        toRevision,
        summary,
      },
    ].slice(-20),
    undoSnapshot: null,
  };
}

function isValidInterpretation(
  state: GalleryState,
  interpretation: RenderedInterpretation,
): boolean {
  if (
    !isExperienceMode(interpretation.mode) ||
    interpretation.artworkId !== state.artworkId ||
    interpretation.focusedRegionId !== state.focusedRegionId ||
    interpretation.language !== state.personalization.language ||
    interpretation.segments.length < 1 ||
    interpretation.segments.length > 8 ||
    (interpretation.title !== undefined &&
      (interpretation.title.trim().length < 1 ||
        interpretation.title.length > 120))
  ) {
    return false;
  }
  const artwork = getArtwork(state.artworkId);
  return interpretation.segments.every((segment) => {
    if (segment.text.trim().length < 1 || segment.text.length > 600) {
      return false;
    }
    if (segment.provenance === 'observed') {
      const statement = artwork.observed.find(
        ({ id }) => id === segment.statementId,
      );
      return statement?.text === segment.text && segment.sourceIds === undefined;
    }
    if (segment.provenance === 'known') {
      const statement = artwork.known.find(({ id }) => id === segment.statementId);
      return (
        statement?.text === segment.text &&
        statement.sourceIds.length === segment.sourceIds?.length &&
        statement.sourceIds.every((id, index) => segment.sourceIds?.[index] === id)
      );
    }
    return (
      (segment.provenance === 'interpreted' ||
        segment.provenance === 'imagined') &&
      segment.statementId === undefined &&
      segment.sourceIds === undefined
    );
  });
}

export function galleryReducer(
  state: GalleryState,
  action: GalleryAction,
): GalleryState {
  switch (action.type) {
    case 'navigate': {
      if (!isArtworkId(action.artworkId)) {
        return state;
      }

      const alreadyReset =
        action.artworkId === state.artworkId &&
        state.focusedRegionId === null &&
        state.interpretation === null;

      if (alreadyReset) {
        return state;
      }

      return recordChange(
        state,
        {
        artworkId: action.artworkId,
        focusedRegionId: null,
        interpretation: null,
        },
        'navigate',
        'Changed the current artwork.',
        action.origin,
      );
    }

    case 'set-mode':
      if (!isExperienceMode(action.mode) || action.mode === state.mode) {
        return state;
      }

      return recordChange(
        state,
        {
          mode: action.mode,
          interpretation:
            state.interpretation?.mode === action.mode
              ? state.interpretation
              : null,
        },
        'set-mode',
        `Changed the speaking style to ${action.mode}.`,
        action.origin,
      );

    case 'configure-presentation': {
      const { mode, fontFamily, fontSize, contrast, theme, language } =
        action.presentation;
      if (
        (mode !== undefined && !isExperienceMode(mode)) ||
        (fontFamily !== undefined && !isFontFamily(fontFamily)) ||
        (fontSize !== undefined && !isFontSize(fontSize)) ||
        (contrast !== undefined && !isContrastLevel(contrast)) ||
        (theme !== undefined && !isColorTheme(theme)) ||
        (language !== undefined && !isGalleryLanguage(language))
      ) {
        return state;
      }
      const personalization = {
        ...state.personalization,
        ...(fontFamily !== undefined ? { fontFamily } : {}),
        ...(fontSize !== undefined ? { fontSize } : {}),
        ...(contrast !== undefined ? { contrast } : {}),
        ...(theme !== undefined ? { theme } : {}),
        ...(language !== undefined ? { language } : {}),
      };
      const changed =
        (mode !== undefined && mode !== state.mode) ||
        Object.entries(personalization).some(
          ([key, value]) =>
            state.personalization[key as keyof PersonalizationPreferences] !==
            value,
        );
      if (!changed) return state;
      const changedCount = [
        mode !== undefined && mode !== state.mode,
        fontFamily !== undefined && fontFamily !== state.personalization.fontFamily,
        fontSize !== undefined && fontSize !== state.personalization.fontSize,
        contrast !== undefined && contrast !== state.personalization.contrast,
        theme !== undefined && theme !== state.personalization.theme,
        language !== undefined && language !== state.personalization.language,
      ].filter(Boolean).length;
      return recordChange(
        state,
        {
          ...(mode !== undefined ? { mode } : {}),
          ...(mode !== undefined && state.interpretation?.mode !== mode
            ? { interpretation: null }
            : {}),
          ...(language !== undefined &&
          state.interpretation?.language !== language
            ? { interpretation: null }
            : {}),
          personalization,
        },
        'configure-presentation',
        `Updated ${changedCount} presentation setting${changedCount === 1 ? '' : 's'}.`,
        action.origin,
      );
    }

    case 'set-font-family':
      if (
        !isFontFamily(action.fontFamily) ||
        action.fontFamily === state.personalization.fontFamily
      ) {
        return state;
      }
      return recordChange(
        state,
        { personalization: {
          ...state.personalization,
          fontFamily: action.fontFamily,
        } },
        'set-font-family',
        'Changed the gallery typeface.',
        action.origin,
      );

    case 'set-font-size':
      if (
        !isFontSize(action.fontSize) ||
        action.fontSize === state.personalization.fontSize
      ) {
        return state;
      }
      return recordChange(
        state,
        { personalization: {
          ...state.personalization,
          fontSize: action.fontSize,
        } },
        'set-font-size',
        'Changed the gallery text size.',
        action.origin,
      );

    case 'set-contrast':
      if (
        !isContrastLevel(action.contrast) ||
        action.contrast === state.personalization.contrast
      ) {
        return state;
      }
      return recordChange(
        state,
        { personalization: {
          ...state.personalization,
          contrast: action.contrast,
        } },
        'set-contrast',
        'Changed the gallery contrast.',
        action.origin,
      );

    case 'set-theme':
      if (
        !isColorTheme(action.theme) ||
        action.theme === state.personalization.theme
      ) {
        return state;
      }
      return recordChange(
        state,
        { personalization: {
          ...state.personalization,
          theme: action.theme,
        } },
        'set-theme',
        'Changed the gallery colour theme.',
        action.origin,
      );

    case 'set-language':
      if (
        !isGalleryLanguage(action.language) ||
        action.language === state.personalization.language
      ) {
        return state;
      }
      return recordChange(
        state,
        {
          personalization: {
            ...state.personalization,
            language: action.language,
          },
          interpretation: null,
        },
        'set-language',
        'Changed the gallery language.',
        action.origin,
      );

    case 'focus-region': {
      const region = getVisibleRegion(state, action.regionId as RegionId);
      if (!region || region.id === state.focusedRegionId) {
        return state;
      }

      return recordChange(
        state,
        {
          focusedRegionId: region.id,
          interpretation:
            state.interpretation?.focusedRegionId === region.id
              ? state.interpretation
              : null,
        },
        'focus-region',
        'Focused an artwork region.',
        action.origin,
      );
    }

    case 'focus-agent-region': {
      if (
        action.artworkId !== state.artworkId ||
        action.region.provenance !== 'agent-grounded'
      ) {
        return state;
      }
      const existing = state.agentGroundedRegions[action.artworkId] ?? [];
      const region = {
        ...action.region,
        verification: action.region.verification ?? ('unverified' as const),
      };
      const regions = [
        ...existing.filter(({ id }) => id !== action.region.id),
        region,
      ].slice(-12);
      return recordChange(
        state,
        {
          focusedRegionId: action.region.id,
          interpretation:
            state.interpretation?.focusedRegionId === action.region.id
              ? state.interpretation
              : null,
          agentGroundedRegions: {
            ...state.agentGroundedRegions,
            [action.artworkId]: regions,
          },
        },
        'focus-agent-region',
        'Added and focused an unverified agent-grounded region.',
        action.origin,
      );
    }

    case 'confirm-region': {
      const artworkId = state.artworkId;
      const agentRegions = state.agentGroundedRegions[artworkId] ?? [];
      const modelRegions = state.acceptedModelRegions[artworkId] ?? [];
      const isAgent = agentRegions.some(({ id }) => id === action.regionId);
      const isModel = modelRegions.some(({ id }) => id === action.regionId);
      if (!isAgent && !isModel) return state;
      const confirm = (regions: readonly ArtworkRegion[]) =>
        regions.map((region) =>
          region.id === action.regionId
            ? { ...region, verification: 'human-confirmed' as const }
            : region,
        );
      const current = [...agentRegions, ...modelRegions].find(
        ({ id }) => id === action.regionId,
      );
      if (current?.verification === 'human-confirmed') return state;
      return recordChange(
        state,
        {
          agentGroundedRegions: isAgent
            ? { ...state.agentGroundedRegions, [artworkId]: confirm(agentRegions) }
            : state.agentGroundedRegions,
          acceptedModelRegions: isModel
            ? { ...state.acceptedModelRegions, [artworkId]: confirm(modelRegions) }
            : state.acceptedModelRegions,
        },
        'confirm-region',
        'Human-confirmed a proposed artwork region.',
        action.origin,
      );
    }

    case 'dismiss-region': {
      const artworkId = state.artworkId;
      const agentRegions = state.agentGroundedRegions[artworkId] ?? [];
      const modelRegions = state.acceptedModelRegions[artworkId] ?? [];
      const isAgent = agentRegions.some(({ id }) => id === action.regionId);
      const isModel = modelRegions.some(({ id }) => id === action.regionId);
      if (!isAgent && !isModel) return state;
      return recordChange(
        state,
        {
          focusedRegionId:
            state.focusedRegionId === action.regionId
              ? null
              : state.focusedRegionId,
          interpretation:
            state.interpretation?.focusedRegionId === action.regionId
              ? null
              : state.interpretation,
          agentGroundedRegions: isAgent
            ? {
                ...state.agentGroundedRegions,
                [artworkId]: agentRegions.filter(({ id }) => id !== action.regionId),
              }
            : state.agentGroundedRegions,
          acceptedModelRegions: isModel
            ? {
                ...state.acceptedModelRegions,
                [artworkId]: modelRegions.filter(({ id }) => id !== action.regionId),
              }
            : state.acceptedModelRegions,
        },
        'dismiss-region',
        'Dismissed a proposed artwork region.',
        action.origin,
      );
    }

    case 'region-analysis-progress': {
      if (!isArtworkId(action.artworkId)) {
        return state;
      }
      const previous = state.regionAnalysis[action.artworkId];
      const next = {
        phase: action.phase,
        progress: Math.max(0, Math.min(1, action.progress)),
        message: action.message,
        backend: action.backend ?? previous?.backend ?? 'authored',
        error: null,
      } as const;
      return updateWithoutActivity(state, {
        regionAnalysis: { ...state.regionAnalysis, [action.artworkId]: next },
      });
    }

    case 'region-analysis-complete':
      if (!isArtworkId(action.artworkId)) {
        return state;
      }
      const analysisIsForCurrentArtwork = action.artworkId === state.artworkId;
      const requestedFocus = action.focusedRegionId
        ? action.regions.find(({ id }) => id === action.focusedRegionId)?.id
        : undefined;
      const existingFocusStillExists = state.focusedRegionId
        ? getVisibleRegion(
            {
              ...state,
              acceptedModelRegions: {
                ...state.acceptedModelRegions,
                [action.artworkId]: action.regions,
              },
            },
            state.focusedRegionId,
          )?.id
        : null;
      const nextFocusedRegionId = analysisIsForCurrentArtwork
        ? requestedFocus ?? existingFocusStillExists ?? null
        : state.focusedRegionId;
      return recordNonUndoableChange(
        state,
        {
        focusedRegionId: nextFocusedRegionId,
        interpretation:
          state.interpretation?.focusedRegionId === nextFocusedRegionId
            ? state.interpretation
            : null,
        acceptedModelRegions: {
          ...state.acceptedModelRegions,
          [action.artworkId]: action.regions.map((region) => ({
            ...region,
            verification: region.verification ?? ('unverified' as const),
          })),
        },
        regionAnalysis: {
          ...state.regionAnalysis,
          [action.artworkId]: {
            phase: 'complete',
            progress: 1,
            message: action.message,
            backend: action.backend,
            error: null,
          },
        },
        },
        'analyze-regions',
        `Completed local analysis with ${action.regions.length} proposed region${action.regions.length === 1 ? '' : 's'}.`,
        action.origin,
      );

    case 'region-analysis-failed':
      if (!isArtworkId(action.artworkId)) {
        return state;
      }
      return recordNonUndoableChange(
        state,
        {
        acceptedModelRegions: {
          ...state.acceptedModelRegions,
          [action.artworkId]: [],
        },
        regionAnalysis: {
          ...state.regionAnalysis,
          [action.artworkId]: {
            phase: 'failed',
            progress: 0,
            message: action.message,
            backend: 'authored',
            error: action.error,
          },
        },
        },
        'analyze-regions',
        'Local artwork-region analysis failed.',
        action.origin,
      );
    case 'clear-focus':
      if (state.focusedRegionId === null) {
        return state;
      }

      return recordChange(
        state,
        {
          focusedRegionId: null,
          interpretation:
            state.interpretation?.focusedRegionId === null
              ? state.interpretation
              : null,
        },
        'clear-focus',
        'Returned to the whole artwork.',
        action.origin,
      );

    case 'render-interpretation':
      if (!isValidInterpretation(state, action.interpretation)) {
        return state;
      }

      return recordChange(
        state,
        {
          mode: action.interpretation.mode,
          interpretation: action.interpretation,
        },
        'publish-gallery-response',
        `Published a ${action.interpretation.segments.length}-segment gallery response.`,
        action.origin,
      );

    case 'clear-interpretation':
      if (state.interpretation === null) {
        return state;
      }

      return recordChange(
        state,
        { interpretation: null },
        'clear-gallery-response',
        'Cleared the published gallery response.',
        action.origin,
      );

    case 'undo': {
      if (!state.undoSnapshot) return state;
      const toRevision = incrementRevision(state);
      const sequence = state.activitySequence + 1;
      return {
        ...state,
        ...state.undoSnapshot,
        revision: toRevision,
        activitySequence: sequence,
        activity: [
          ...state.activity,
          {
            sequence,
            origin: action.origin ?? 'human',
            action: 'undo' as const,
            fromRevision: state.revision,
            toRevision,
            summary: 'Undid the most recent reversible gallery change.',
          },
        ].slice(-20),
        undoSnapshot: null,
      };
    }
  }
}
