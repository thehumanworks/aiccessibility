import { artworks } from '../collection/artworks';
import { getRegion, isArtworkId } from '../collection/repository';
import type {
  ArtworkId,
  ExperienceMode,
  GalleryState,
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
      const region = getRegion(state.artworkId, action.regionId as RegionId);
      if (!region || region.id === state.focusedRegionId) {
        return state;
      }

      return {
        ...state,
        focusedRegionId: region.id,
        revision: incrementRevision(state),
      };
    }

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
