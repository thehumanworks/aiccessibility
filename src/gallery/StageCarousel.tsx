import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { ArtworkStage } from './ArtworkStage';
import type { Artwork } from './types';

interface StageCarouselProps {
  artworks: readonly Artwork[];
  currentIndex: number;
  positionLabel: string;
  /* 1 when moving forward through the collection, -1 when moving back. */
  direction: number;
}

interface CarouselPeekProps {
  artwork: Artwork | undefined;
  side: 'previous' | 'next';
  direction: number;
  reduceMotion: boolean;
}

/* A cropped sliver of the neighbouring work, so the room reads as a wall of
   paintings rather than a single slide. Never announced, never focusable:
   the wall label and the live status stay the only names on the stage. */
function CarouselPeek({
  artwork,
  side,
  direction,
  reduceMotion,
}: CarouselPeekProps) {
  if (!artwork) {
    return null;
  }

  const travel = reduceMotion ? 0 : 34;
  const away = direction >= 0 ? -travel : travel;

  return (
    <div className="carousel-peek" data-side={side} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.img
          key={artwork.id}
          className="carousel-peek-image"
          src={artwork.image.src}
          alt=""
          aria-hidden="true"
          decoding="async"
          initial={{ opacity: 0, x: -away }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: away }}
          transition={
            reduceMotion
              ? { duration: 0.12 }
              : { duration: 0.46, ease: [0.32, 0.08, 0.24, 1] }
          }
        />
      </AnimatePresence>
    </div>
  );
}

/* Six fine bars, one per work. A place in the collection, not a timer:
   nothing here advances on its own. */
function CarouselProgress({
  artworks,
  currentIndex,
  reduceMotion,
}: {
  artworks: readonly Artwork[];
  currentIndex: number;
  reduceMotion: boolean;
}) {
  return (
    <div className="carousel-progress" aria-hidden="true">
      {artworks.map((artwork, index) => (
        <span
          key={artwork.id}
          className="carousel-progress-bar"
          data-active={index === currentIndex}
        >
          {index === currentIndex ? (
            <motion.span
              layoutId="carousel-progress-fill"
              className="carousel-progress-fill"
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 460, damping: 44, mass: 0.9 }
              }
            />
          ) : null}
        </span>
      ))}
    </div>
  );
}

export function StageCarousel({
  artworks,
  currentIndex,
  positionLabel,
  direction,
}: StageCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const count = artworks.length;
  const artwork = artworks[currentIndex];
  const previousArtwork = artworks[(currentIndex - 1 + count) % count];
  const nextArtwork = artworks[(currentIndex + 1) % count];

  if (!artwork) {
    return null;
  }

  return (
    <>
      <div
        id="artwork-stage"
        className="stage-carousel"
        data-motion={reduceMotion ? 'reduced' : 'full'}
        tabIndex={-1}
      >
        <CarouselPeek
          artwork={previousArtwork}
          side="previous"
          direction={direction}
          reduceMotion={reduceMotion}
        />
        <AnimatePresence initial={false} custom={direction}>
          <ArtworkStage
            key={artwork.id}
            artwork={artwork}
            positionLabel={positionLabel}
            direction={direction}
          />
        </AnimatePresence>
        <CarouselPeek
          artwork={nextArtwork}
          side="next"
          direction={direction}
          reduceMotion={reduceMotion}
        />
      </div>

      <CarouselProgress
        artworks={artworks}
        currentIndex={currentIndex}
        reduceMotion={reduceMotion}
      />
    </>
  );
}
