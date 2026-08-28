import { listArtworks } from '../collection/repository';
import { pushArtworkToHistory } from './history';
import type { GalleryAction } from './reducer';
import type { GalleryState } from './types';

interface GalleryControllerDependencies {
  getState: () => GalleryState;
  applyAction: (action: GalleryAction) => GalleryState;
}

export interface GalleryController {
  getState: () => GalleryState;
  navigateToArtwork: (artworkId: string) => GalleryState;
  navigateFromHistory: (artworkId: string) => GalleryState;
  goPrevious: () => GalleryState;
  goNext: () => GalleryState;
  setExperienceMode: (mode: string) => GalleryState;
  focusRegion: (regionId: string) => GalleryState;
  clearRegionFocus: () => GalleryState;
}

export function createGalleryController({
  getState,
  applyAction,
}: GalleryControllerDependencies): GalleryController {
  const navigate = (artworkId: string, writeHistory: boolean) => {
    const previousState = getState();
    const nextState = applyAction({ type: 'navigate', artworkId });

    if (
      writeHistory &&
      nextState.artworkId !== previousState.artworkId
    ) {
      pushArtworkToHistory(nextState.artworkId);
    }

    return nextState;
  };

  const goBy = (offset: number) => {
    const collection = listArtworks();
    const currentIndex = collection.findIndex(
      ({ id }) => id === getState().artworkId,
    );
    const nextIndex = (currentIndex + offset + collection.length) % collection.length;
    const artwork = collection[nextIndex];

    return artwork ? navigate(artwork.id, true) : getState();
  };

  return {
    getState,
    navigateToArtwork: (artworkId) => navigate(artworkId, true),
    navigateFromHistory: (artworkId) => navigate(artworkId, false),
    goPrevious: () => goBy(-1),
    goNext: () => goBy(1),
    setExperienceMode: (mode) => applyAction({ type: 'set-mode', mode }),
    focusRegion: (regionId) =>
      applyAction({ type: 'focus-region', regionId }),
    clearRegionFocus: () => applyAction({ type: 'clear-focus' }),
  };
}
