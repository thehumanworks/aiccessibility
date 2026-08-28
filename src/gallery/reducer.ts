import { artworks } from '../collection/artworks';
import { isArtworkId } from '../collection/repository';
import { getVisibleRegion, idleRegionAnalysis } from './regions';
import type {
  ArtworkId,
  ExperienceMode,
  GalleryState,
  ArtworkRegion,
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

export type GalleryAction =
  | { type: 'navigate'; artworkId: string }
  | { type: 'set-mode'; mode: string }
  | { type: 'focus-region'; regionId: string }
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
    }
  | {
      type: 'region-analysis-failed';
      artworkId: ArtworkId;
      message: string;
      error: string;
    }
  | { type: 'render-interpretation'; interpretation: RenderedInterpretation }
  | { type: 'clear-interpretation' };

export function isExperienceMode(value: string): value is ExperienceMode {
  return experienceModes.some((mode) => mode === value);
}

export function createInitialGalleryState(
  artworkId: ArtworkId = defaultArtworkId,
): GalleryState {
  return {
    artworkId,
    mode: 'literal',
    focusedRegionId: null,
    interpretation: null,
    acceptedModelRegions: {},
    regionAnalysis: Object.fromEntries(
      artworks.map((artwork) => [artwork.id, { ...idleRegionAnalysis }]),
    ) as GalleryState['regionAnalysis'],
    revision: 0,
  };
}

function incrementRevision(state: GalleryState): number {
  return state.revision + 1;
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

      return {
        ...state,
        artworkId: action.artworkId,
        focusedRegionId: null,
        interpretation: null,
        revision: incrementRevision(state),
      };
    }

    case 'set-mode':
      if (!isExperienceMode(action.mode) || action.mode === state.mode) {
        return state;
      }

      return {
        ...state,
        mode: action.mode,
        revision: incrementRevision(state),
      };

    case 'focus-region': {
      const region = getVisibleRegion(state, action.regionId as RegionId);
      if (!region || region.id === state.focusedRegionId) {
        return state;
      }

      return {
        ...state,
        focusedRegionId: region.id,
        revision: incrementRevision(state),
      };
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
      return {
        ...state,
        regionAnalysis: { ...state.regionAnalysis, [action.artworkId]: next },
        revision: incrementRevision(state),
      };
    }

    case 'region-analysis-complete':
      if (!isArtworkId(action.artworkId)) {
        return state;
      }
      return {
        ...state,
        acceptedModelRegions: {
          ...state.acceptedModelRegions,
          [action.artworkId]: action.regions,
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
        revision: incrementRevision(state),
      };

    case 'region-analysis-failed':
      if (!isArtworkId(action.artworkId)) {
        return state;
      }
      return {
        ...state,
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
        revision: incrementRevision(state),
      };
    case 'clear-focus':
      if (state.focusedRegionId === null) {
        return state;
      }

      return {
        ...state,
        focusedRegionId: null,
        revision: incrementRevision(state),
      };

    case 'render-interpretation':
      if (!isExperienceMode(action.interpretation.mode)) {
        return state;
      }

      return {
        ...state,
        mode: action.interpretation.mode,
        interpretation: action.interpretation,
        revision: incrementRevision(state),
      };

    case 'clear-interpretation':
      if (state.interpretation === null) {
        return state;
      }

      return {
        ...state,
        interpretation: null,
        revision: incrementRevision(state),
      };
  }
}
