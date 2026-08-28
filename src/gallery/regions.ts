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

function normalizeQuery(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function findAuthoredRegionForQuery(
  artworkId: ArtworkId,
  query: string,
): ArtworkRegion | undefined {
  const normalizedQuery = ` ${normalizeQuery(query)} `;
  if (normalizedQuery.trim().length === 0) return undefined;

  return getArtwork(artworkId).regions
    .flatMap((region) =>
      (region.queryAliases ?? []).flatMap((alias) => {
        const normalizedAlias = normalizeQuery(alias);
        return normalizedAlias &&
          normalizedQuery.includes(` ${normalizedAlias} `)
          ? [{ region, specificity: normalizedAlias.length }]
          : [];
      }),
    )
    .sort((a, b) => b.specificity - a.specificity)[0]?.region;
}

export function getCurrentRegionAnalysis(state: GalleryState) {
  return state.regionAnalysis[state.artworkId] ?? idleRegionAnalysis;
}
