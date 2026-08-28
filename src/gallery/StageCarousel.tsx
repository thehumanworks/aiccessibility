import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  type KeyboardEvent,
  type PointerEvent,
  useRef,
} from 'react';

import { ArtworkStage } from './ArtworkStage';
import type { Artwork } from './types';

interface StageCarouselProps {
  artworks: readonly Artwork[];
  currentIndex: number;
  positionLabel: string;
  /* 1 when moving forward through the collection, -1 when moving back. */
  direction: number;
  navigationLabel: string;
  onPrevious: () => unknown;
  onNext: () => unknown;
  onNavigate: (artworkId: string) => unknown;
}

interface SwipeStart {
  pointerId: number;
  x: number;
  y: number;
  startedAt: number;
}

const interactiveSelector =
  'a, button, input, select, textarea, [contenteditable], [data-no-gallery-swipe]';

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
          draggable={false}
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
  navigationLabel,
  onNavigate,
}: {
  artworks: readonly Artwork[];
  currentIndex: number;
  reduceMotion: boolean;
  navigationLabel: string;
  onNavigate: (artworkId: string) => unknown;
}) {
  return (
    <div
      className="carousel-progress"
      role="group"
      aria-label={navigationLabel}
    >
      {artworks.map((artwork, index) => (
        <button
          type="button"
          key={artwork.id}
          className="carousel-progress-bar"
          data-active={index === currentIndex}
          aria-label={`${String(index + 1).padStart(2, '0')} / ${String(artworks.length).padStart(2, '0')} · ${artwork.title}`}
          aria-current={index === currentIndex ? 'true' : undefined}
          onClick={() => onNavigate(artwork.id)}
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
        </button>
      ))}
    </div>
  );
}

export function StageCarousel({
  artworks,
  currentIndex,
  positionLabel,
  direction,
  navigationLabel,
  onPrevious,
  onNext,
  onNavigate,
}: StageCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const swipeStart = useRef<SwipeStart | null>(null);
  const swipeLocked = useRef(false);
  const count = artworks.length;
  const artwork = artworks[currentIndex];
  const previousArtwork = artworks[(currentIndex - 1 + count) % count];
  const nextArtwork = artworks[(currentIndex + 1) % count];

  if (!artwork) {
    return null;
  }

  const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (
      swipeLocked.current ||
      !event.isPrimary ||
      (event.pointerType !== 'touch' && event.pointerType !== 'pen') ||
      target.closest(interactiveSelector)
    ) {
      return;
    }

    swipeStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startedAt: event.timeStamp,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const cancelSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeStart.current?.pointerId === event.pointerId) {
      swipeStart.current = null;
    }
  };

  const finishSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    swipeStart.current = null;
    const horizontalTravel = event.clientX - start.x;
    const verticalTravel = event.clientY - start.y;
    const horizontalDistance = Math.abs(horizontalTravel);
    const elapsed = Math.max(1, event.timeStamp - start.startedAt);
    const requiredDistance = Math.min(
      96,
      Math.max(48, event.currentTarget.clientWidth * 0.14),
    );
    const isHorizontal =
      horizontalDistance >= Math.abs(verticalTravel) * 1.25;
    const isFastFlick =
      horizontalDistance >= 32 && horizontalDistance / elapsed >= 0.5;

    if (!isHorizontal || (horizontalDistance < requiredDistance && !isFastFlick)) {
      return;
    }

    swipeLocked.current = true;
    if (horizontalTravel < 0) {
      onNext();
    } else {
      onPrevious();
    }
  };

  const handleKeyboardNavigation = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onPrevious();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNext();
    }
  };

  return (
    <>
      <div
        id="artwork-stage"
        className="stage-carousel"
        data-motion={reduceMotion ? 'reduced' : 'full'}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${navigationLabel}: ${artwork.title}`}
        aria-keyshortcuts="ArrowLeft ArrowRight"
        tabIndex={0}
        onKeyDown={handleKeyboardNavigation}
        onPointerDown={startSwipe}
        onPointerCancel={cancelSwipe}
        onLostPointerCapture={cancelSwipe}
        onPointerUp={finishSwipe}
      >
        <CarouselPeek
          artwork={previousArtwork}
          side="previous"
          direction={direction}
          reduceMotion={reduceMotion}
        />
        <AnimatePresence
          initial={false}
          custom={direction}
          onExitComplete={() => {
            swipeLocked.current = false;
          }}
        >
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
        navigationLabel={navigationLabel}
        onNavigate={onNavigate}
      />
    </>
  );
}
