import { getArtwork } from '../collection/repository';
import type {
  ArtworkId,
  ArtworkRegion,
  GalleryState,
  RegionAnalysisState,
} from './types';

export const idleRegionAnalysis: RegionAnalysisState = {
  phase: 'idle',
  progress: 0,
  message: 'Authored regions are ready. Local model analysis has not been started.',
  backend: 'authored',
  error: null,
};

export function getVisibleRegions(
  state: GalleryState,
  artworkId: ArtworkId = state.artworkId,
): readonly ArtworkRegion[] {
  return [
    ...getArtwork(artworkId).regions.map((region) => ({
      ...region,
      confidence: 1,
      provenance: 'authored' as const,
    })),
    ...(state.acceptedModelRegions[artworkId] ?? []),
  ];
}

export function getVisibleRegion(
  state: GalleryState,
  regionId: string,
): ArtworkRegion | undefined {
  return getVisibleRegions(state).find((region) => region.id === regionId);
}

export function getCurrentRegionAnalysis(state: GalleryState) {
  return state.regionAnalysis[state.artworkId] ?? idleRegionAnalysis;
}
