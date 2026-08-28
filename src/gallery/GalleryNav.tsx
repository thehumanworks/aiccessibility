import type { GalleryController } from './controller';
import { getUiCopy } from './i18n';
import type { Artwork, GalleryLanguage } from './types';

interface GalleryNavProps {
  artworks: readonly Artwork[];
  currentIndex: number;
  controller: GalleryController;
  language: GalleryLanguage;
}

export function GalleryNav({
  artworks,
  currentIndex,
  controller,
  language,
}: GalleryNavProps) {
  const copy = getUiCopy(language);
  const previousArtwork =
    artworks[(currentIndex - 1 + artworks.length) % artworks.length];
  const nextArtwork = artworks[(currentIndex + 1) % artworks.length];

  return (
    <nav className="gallery-nav" aria-label={copy.artworkNavigation}>
      <button
        type="button"
        className="nav-arrow nav-arrow-previous"
        aria-label={`${copy.previousArtwork}: ${previousArtwork?.title ?? ''}`}
        onClick={controller.goPrevious}
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        className="nav-arrow nav-arrow-next"
        aria-label={`${copy.nextArtwork}: ${nextArtwork?.title ?? ''}`}
        onClick={controller.goNext}
      >
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}
