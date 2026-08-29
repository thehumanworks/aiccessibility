import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
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
  axis: 'pending' | 'horizontal' | 'vertical';
  lastAt: number;
  lastX: number;
  pointerId: number;
  recentVelocityX: number;
  x: number;
  y: number;
  startedAt: number;
}

const interactiveSelector =
  'a, button, input, select, textarea, [contenteditable], [data-no-gallery-swipe]';
const directionSlop = 6;

function setDragFeedback(
  stage: HTMLDivElement,
  offset: number,
  dragging: boolean,
) {
  stage.dataset.dragging = dragging ? 'true' : 'false';
  stage.style.setProperty('--carousel-drag-x', `${offset}px`);
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
  const stageRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<SwipeStart | null>(null);
  const swipeLocked = useRef(false);
  const count = artworks.length;
  const artwork = artworks[currentIndex];
  const previousArtwork = artworks[(currentIndex - 1 + count) % count];
  const nextArtwork = artworks[(currentIndex + 1) % count];

  useEffect(() => {
    swipeStart.current = null;
    const stage = stageRef.current;
    if (stage) {
      setDragFeedback(stage, 0, false);
    }
  }, [currentIndex]);

  if (!artwork) {
    return null;
  }

  const startSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (
      swipeLocked.current ||
      count <= 1 ||
      !event.isPrimary ||
      (event.pointerType === 'mouse' && event.button !== 0) ||
      target.closest(interactiveSelector)
    ) {
      return;
    }

    swipeStart.current = {
      axis: 'pending',
      lastAt: event.timeStamp,
      lastX: event.clientX,
      pointerId: event.pointerId,
      recentVelocityX: 0,
      x: event.clientX,
      y: event.clientY,
      startedAt: event.timeStamp,
    };
    setDragFeedback(event.currentTarget, 0, true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const trackSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    const horizontalTravel = event.clientX - start.x;
    const verticalTravel = event.clientY - start.y;
    const horizontalDistance = Math.abs(horizontalTravel);
    const verticalDistance = Math.abs(verticalTravel);

    if (
      start.axis === 'pending' &&
      Math.max(horizontalDistance, verticalDistance) >= directionSlop
    ) {
      if (horizontalDistance >= verticalDistance * 1.1) {
        start.axis = 'horizontal';
      } else if (verticalDistance >= horizontalDistance * 1.1) {
        start.axis = 'vertical';
      }
    }

    const elapsed = Math.max(1, event.timeStamp - start.lastAt);
    const instantaneousVelocity = (event.clientX - start.lastX) / elapsed;
    start.recentVelocityX =
      start.recentVelocityX === 0
        ? instantaneousVelocity
        : start.recentVelocityX * 0.35 + instantaneousVelocity * 0.65;
    start.lastX = event.clientX;
    start.lastAt = event.timeStamp;

    if (start.axis === 'vertical') {
      setDragFeedback(event.currentTarget, 0, false);
      return;
    }

    if (start.axis !== 'horizontal') {
      return;
    }

    event.preventDefault();
    const maximumPreview = Math.min(
      260,
      Math.max(80, event.currentTarget.clientWidth * 0.32),
    );
    const previewOffset = Math.min(
      maximumPreview,
      Math.max(-maximumPreview, horizontalTravel),
    );
    setDragFeedback(event.currentTarget, previewOffset, true);
  };

  const cancelSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeStart.current?.pointerId === event.pointerId) {
      swipeStart.current = null;
      setDragFeedback(event.currentTarget, 0, false);
    }
  };

  const finishSwipe = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    if (!start || start.pointerId !== event.pointerId) {
      return;
    }

    swipeStart.current = null;
    setDragFeedback(event.currentTarget, 0, false);
    const horizontalTravel = event.clientX - start.x;
    const verticalTravel = event.clientY - start.y;
    const horizontalDistance = Math.abs(horizontalTravel);
    const elapsed = Math.max(1, event.timeStamp - start.startedAt);
    const requiredDistance = Math.min(
      56,
      Math.max(28, event.currentTarget.clientWidth * 0.055),
    );
    const isHorizontal =
      start.axis !== 'vertical' &&
      horizontalDistance >= Math.abs(verticalTravel) * 1.1;
    const recentVelocity =
      event.timeStamp - start.lastAt <= 120
        ? Math.abs(start.recentVelocityX)
        : 0;
    const releaseVelocity = Math.max(
      recentVelocity,
      horizontalDistance / elapsed,
    );
    const isFastFlick =
      horizontalDistance >= 18 && releaseVelocity >= 0.35;

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
        ref={stageRef}
        id="artwork-stage"
        className="stage-carousel"
        data-motion={reduceMotion ? 'reduced' : 'full'}
        data-dragging="false"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${navigationLabel}: ${artwork.title}`}
        aria-keyshortcuts="ArrowLeft ArrowRight"
        tabIndex={0}
        onKeyDown={handleKeyboardNavigation}
        onPointerDown={startSwipe}
        onPointerMove={trackSwipe}
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
