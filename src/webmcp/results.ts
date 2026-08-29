import { getArtwork, listArtworks } from '../collection/repository';
import {
  getModeDefinition,
  localizeArtwork,
  localizeRegion,
} from '../gallery/i18n';
import {
  getCurrentRegionAnalysis,
  getVisibleRegion,
  getVisibleRegions,
} from '../gallery/regions';
import type { GalleryState } from '../gallery/types';

export type GalleryToolAction =
  | 'get_gallery_state'
  | 'list_artworks'
  | 'get_artwork_context'
  | 'navigate_to_artwork'
  | 'set_experience_mode'
  | 'set_font_family'
  | 'set_font_size'
  | 'set_contrast'
  | 'set_color_theme'
  | 'set_content_language'
  | 'configure_presentation'
  | 'publish_gallery_response'
  | 'clear_gallery_response'
  | 'get_session_activity'
  | 'undo_last_change'
  | 'list_regions'
  | 'analyze_artwork_regions'
  | 'focus_artwork_area'
  | 'zoom_to_artwork_detail'
  | 'focus_region'
  | 'describe_region'
  | 'clear_region_focus';

export function buildGalleryState(state: GalleryState) {
  const language = state.personalization.language;
  const artwork = localizeArtwork(getArtwork(state.artworkId), language);
  const speakingStyle = getModeDefinition(state.mode, language);
  const visibleRegions = getVisibleRegions(state);
  const focusedRegion = state.focusedRegionId
    ? localizeRegion(getVisibleRegion(state, state.focusedRegionId)!, language)
    : undefined;
  const regionAnalysis = getCurrentRegionAnalysis(state);

  return {
    artwork: {
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      year: artwork.yearLabel,
      image: {
        src: artwork.image.src,
        width: artwork.image.width,
        height: artwork.image.height,
        alt: artwork.image.alt,
      },
    },
    mode: state.mode,
    speakingStyle: {
      label: speakingStyle.label,
      instruction: speakingStyle.description,
    },
    personalization: { ...state.personalization },
    focusedRegion: focusedRegion
      ? {
          id: focusedRegion.id,
          label: focusedRegion.label,
          provenance: focusedRegion.provenance ?? 'authored',
          verification: focusedRegion.verification ?? 'authored',
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
    interpretation: state.interpretation
      ? {
          ...state.interpretation,
          segments: state.interpretation.segments.map((segment) => ({
            ...segment,
            ...(segment.sourceIds
              ? { sourceIds: [...segment.sourceIds] }
              : {}),
          })),
        }
      : null,
    canUndo: state.undoSnapshot !== null,
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
