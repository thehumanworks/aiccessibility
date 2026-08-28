import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

import type { Artwork } from './types';

type ImageState = 'loading' | 'ready' | 'error';

interface ArtworkStageProps {
  artwork: Artwork;
  positionLabel: string;
  /* 1 when moving forward through the collection, -1 when moving back. */
  direction: number;
}

export function ArtworkStage({
  artwork,
  positionLabel,
  direction,
}: ArtworkStageProps) {
  const [imageState, setImageState] = useState<ImageState>('loading');
  const reduceMotion = useReducedMotion();
  const firstObservation = artwork.observed[0]?.text;
  const orientation =
    artwork.image.width >= artwork.image.height ? 'landscape' : 'portrait';
  const titleId = `artwork-title-${artwork.id}`;

  /* One encounter moves as one thing: frame, painting, and wall label
     together, resolving from the blurred edge of the carousel into the
     crisp centre of the room. */
  const travel = reduceMotion ? 0 : 140;
  const enter = {
    opacity: 0,
    x: direction >= 0 ? travel : -travel,
    scale: reduceMotion ? 1 : 0.94,
    filter: reduceMotion ? 'blur(0px)' : 'blur(9px)',
  };
  const leave = {
    opacity: 0,
    x: direction >= 0 ? -travel : travel,
    scale: reduceMotion ? 1 : 0.94,
    filter: reduceMotion ? 'blur(0px)' : 'blur(9px)',
  };

  return (
    <motion.figure
      className="artwork-figure"
      data-orientation={orientation}
      data-image-state={imageState}
      data-motion={reduceMotion ? 'reduced' : 'full'}
      aria-labelledby={titleId}
      initial={enter}
      animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
      exit={leave}
      transition={
        reduceMotion
          ? { duration: 0.12 }
          : { duration: 0.52, ease: [0.32, 0.08, 0.24, 1] }
      }
    >
      <div className="artwork-plate">
        {imageState === 'error' ? (
          <div
            className="artwork-fallback"
            role="img"
            aria-label={`Image unavailable: ${artwork.title} by ${artwork.artist}.`}
          >
            <p className="artwork-fallback-title">
              The image could not be displayed.
            </p>
            <p>
              The artwork record is still available.{' '}
              {firstObservation ?? 'No visual observation is available.'}
            </p>
          </div>
        ) : (
          <img
            className="artwork-image"
            src={artwork.image.src}
            width={artwork.image.width}
            height={artwork.image.height}
            alt={artwork.image.alt}
            loading="eager"
            fetchPriority="high"
            onLoad={() => setImageState('ready')}
            onError={() => setImageState('error')}
          />
        )}
      </div>

      <figcaption className="artwork-label">
        <h2 id={titleId}>{artwork.title}</h2>
        <p className="artwork-byline">
          {artwork.artist}
          <span aria-hidden="true"> · </span>
          <span className="artwork-year">{artwork.yearLabel}</span>
        </p>
        <p className="artwork-fineprint">
          <span>
            {artwork.medium}
            <span aria-hidden="true"> · </span>
            {artwork.dimensionsLabel}
          </span>
          {/* Repeats the live status region, which already announces it. */}
          <span className="artwork-position" aria-hidden="true">
            {positionLabel}
          </span>
        </p>
      </figcaption>
    </motion.figure>
  );
}
