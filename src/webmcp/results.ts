import { getArtwork, getRegion, listArtworks } from '../collection/repository';
import type { GalleryState } from '../gallery/types';

export type GalleryToolAction =
  | 'get_gallery_state'
  | 'list_artworks'
  | 'navigate_to_artwork'
  | 'set_experience_mode';

export function buildGalleryState(state: GalleryState) {
  const artwork = getArtwork(state.artworkId);
  const focusedRegion = state.focusedRegionId
    ? getRegion(state.artworkId, state.focusedRegionId)
    : undefined;

  return {
    artwork: {
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      year: artwork.yearLabel,
    },
    mode: state.mode,
    focusedRegion: focusedRegion
      ? { id: focusedRegion.id, label: focusedRegion.label }
      : null,
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
