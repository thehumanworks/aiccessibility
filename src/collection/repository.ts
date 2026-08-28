import type { Artwork, ArtworkId, RegionId } from '../gallery/types';
import { artworks } from './artworks';
import { sourceList } from './sources';

const byId = new Map<ArtworkId, Artwork>(
  artworks.map((artwork) => [artwork.id, artwork]),
);

export function listArtworks(): readonly Artwork[] {
  return artworks;
}

export function getArtwork(artworkId: ArtworkId): Artwork {
  const artwork = byId.get(artworkId);
  if (!artwork) {
    throw new Error(`Unknown artwork: ${artworkId}`);
  }
  return artwork;
}

export function isArtworkId(value: string): value is ArtworkId {
  return byId.has(value as ArtworkId);
}

export function getRegion(artworkId: ArtworkId, regionId: RegionId) {
  return getArtwork(artworkId).regions.find((region) => region.id === regionId);
}

export function getSource(sourceId: string) {
  return sourceList.find((source) => source.id === sourceId);
}
