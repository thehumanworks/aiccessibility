import type { GalleryController } from './controller';
import type { Artwork } from './types';

interface GalleryNavProps {
  artworks: readonly Artwork[];
  currentIndex: number;
  controller: GalleryController;
}

export function GalleryNav({
  artworks,
  currentIndex,
  controller,
}: GalleryNavProps) {
  const previousArtwork =
    artworks[(currentIndex - 1 + artworks.length) % artworks.length];
  const nextArtwork = artworks[(currentIndex + 1) % artworks.length];

  return (
    <nav className="gallery-nav" aria-label="Artwork navigation">
      <button
        type="button"
        className="nav-arrow nav-arrow-previous"
        aria-label={`Previous artwork: ${previousArtwork?.title ?? 'previous'}`}
        onClick={controller.goPrevious}
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        className="nav-arrow nav-arrow-next"
        aria-label={`Next artwork: ${nextArtwork?.title ?? 'next'}`}
        onClick={controller.goNext}
      >
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}
