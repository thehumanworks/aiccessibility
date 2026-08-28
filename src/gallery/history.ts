import { isArtworkId } from '../collection/repository';
import { defaultArtworkId } from './reducer';
import type { ArtworkId } from './types';

const artworkQueryParameter = 'artwork';

export function readArtworkIdFromLocation(
  location: Pick<Location, 'search'> = window.location,
): ArtworkId {
  const requestedArtwork = new URLSearchParams(location.search).get(
    artworkQueryParameter,
  );

  return requestedArtwork && isArtworkId(requestedArtwork)
    ? requestedArtwork
    : defaultArtworkId;
}

export function pushArtworkToHistory(artworkId: ArtworkId): void {
  const url = new URL(window.location.href);
  url.searchParams.set(artworkQueryParameter, artworkId);
  window.history.pushState(null, '', url);
}
