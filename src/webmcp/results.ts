import { getArtwork, listArtworks } from '../collection/repository';
import { modeDefinitions } from '../gallery/modes';
import {
  getCurrentRegionAnalysis,
  getVisibleRegion,
  getVisibleRegions,
} from '../gallery/regions';
import type { GalleryState } from '../gallery/types';

export type GalleryToolAction =
  | 'get_gallery_state'
  | 'list_artworks'
  | 'navigate_to_artwork'
  | 'set_experience_mode'
  | 'list_regions'
  | 'analyze_artwork_regions'
  | 'zoom_to_artwork_detail'
  | 'focus_region'
  | 'describe_region'
  | 'clear_region_focus';

export function buildGalleryState(state: GalleryState) {
  const artwork = getArtwork(state.artworkId);
  const speakingStyle = modeDefinitions[state.mode];
  const visibleRegions = getVisibleRegions(state);
  const focusedRegion = state.focusedRegionId
    ? getVisibleRegion(state, state.focusedRegionId)
    : undefined;
  const regionAnalysis = getCurrentRegionAnalysis(state);

  return {
    artwork: {
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      year: artwork.yearLabel,
    },
    mode: state.mode,
    speakingStyle: {
      label: speakingStyle.label,
      instruction: speakingStyle.description,
    },
    focusedRegion: focusedRegion
      ? {
          id: focusedRegion.id,
          label: focusedRegion.label,
          provenance: focusedRegion.provenance ?? 'authored',
        }
      : null,
    availableRegionCount: visibleRegions.length,
    regionAnalysis: {
      phase: regionAnalysis.phase,
      progress: regionAnalysis.progress,
      backend: regionAnalysis.backend,
      message: regionAnalysis.message,
      ...(regionAnalysis.error ? { error: regionAnalysis.error } : {}),
    },
    hasInterpretation: state.interpretation !== null,
    collectionSize: listArtworks().length,
    revision: state.revision,
  };
}

export function buildSuccess<T extends Record<string, unknown>>(
  action: GalleryToolAction,
  state: GalleryState,
  message: string,
  data?: T,
) {
  return {
    ok: true as const,
    action,
    message,
    ...(data ?? ({} as T)),
    state: buildGalleryState(state),
  };
}

export function buildError(
  action: GalleryToolAction,
  state: GalleryState,
  code: string,
  message: string,
  recovery: Record<string, unknown>,
) {
  return {
    ok: false as const,
    action,
    error: {
      code,
      message,
      recovery,
    },
    state: buildGalleryState(state),
  };
}
